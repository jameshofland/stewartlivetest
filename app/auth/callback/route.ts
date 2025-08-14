import { createServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Authentication failed')}`)
  }

  // 👇 Create Supabase client with request + response context
  const response = NextResponse.redirect(`${origin}${next}`)
  const supabase = createServerClient({ request, response })

  try {
    // 👇 Exchange the auth code for a session
    const { data: { user, session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !user || !session) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error?.message || 'Auth error')}`)
    }

    // 👮 Domain restriction
    if (!user.email?.endsWith('@exprealty.net')) {
      await supabase.auth.signOut()
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Unauthorized domain. Please use your @exprealty.net email.')}`)
    }

    // 🛠️ Save session cookies to the browser
    await supabase.auth.setSession(session, { response })

    // 🔁 Call edge function to assign roles
    try {
      const { error: functionError } = await supabase.functions.invoke('assign-role-on-login', {
        body: { user }
      })

      if (functionError) {
        console.error('Edge function error:', functionError)
        // Don’t block login
      }
    } catch (functionErr) {
      console.error('Failed to call assign-role-on-login function:', functionErr)
    }

    // ✅ Return response with session cookie set
    return response

  } catch (err) {
    console.error('Unexpected auth error:', err)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('An unexpected error occurred')}`)
  }
}
