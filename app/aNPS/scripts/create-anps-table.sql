-- Create the aNPS data table
CREATE TABLE IF NOT EXISTS anps_data (
    id SERIAL PRIMARY KEY,
    state VARCHAR(50) NOT NULL,
    agent_name VARCHAR(100) NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    week_of_year INTEGER,
    month INTEGER,
    year INTEGER
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_anps_state ON anps_data(state);
CREATE INDEX IF NOT EXISTS idx_anps_score ON anps_data(score);
CREATE INDEX IF NOT EXISTS idx_anps_date ON anps_data(created_at);
CREATE INDEX IF NOT EXISTS idx_anps_week ON anps_data(week_of_year, year);

-- Insert sample data
INSERT INTO anps_data (state, agent_name, score, comment, week_of_year, month, year) VALUES
('California', 'John Smith', 9, 'Excellent service, very responsive', 1, 1, 2024),
('California', 'Sarah Johnson', 8, 'Good communication throughout', 1, 1, 2024),
('California', 'Mike Davis', 10, 'Outstanding experience', 2, 1, 2024),
('Texas', 'Mike Wilson', 7, 'Process was smooth but took longer than expected', 1, 1, 2024),
('Texas', 'Lisa Brown', 6, 'Some communication delays', 1, 1, 2024),
('Texas', 'Robert Garcia', 8, 'Professional and knowledgeable', 2, 1, 2024),
('Florida', 'David Lee', 9, 'Outstanding experience, highly recommend', 1, 1, 2024),
('Florida', 'Jennifer Martinez', 10, 'Perfect transaction', 2, 1, 2024),
('New York', 'Emily Davis', 5, 'Average service, room for improvement', 1, 1, 2024),
('New York', 'Christopher Taylor', 7, 'Decent service overall', 2, 1, 2024),
('Illinois', 'Amanda Rodriguez', 8, 'Very helpful and professional', 1, 1, 2024),
('Pennsylvania', 'James Anderson', 9, 'Exceeded expectations', 1, 1, 2024),
('Ohio', 'Maria Gonzalez', 7, 'Good service with minor issues', 1, 1, 2024),
('Georgia', 'William Thompson', 8, 'Smooth process, great communication', 1, 1, 2024),
('North Carolina', 'Jessica White', 9, 'Highly professional and efficient', 1, 1, 2024),
('Michigan', 'Daniel Harris', 6, 'Service was okay, could be better', 1, 1, 2024);
