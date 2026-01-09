-- Create enum type for task status
CREATE TYPE plan_task_status AS ENUM ('queued', 'in_progress', 'success', 'error');

-- Create plan_tasks table
CREATE TABLE IF NOT EXISTS plan_tasks (
    id SERIAL PRIMARY KEY,
    trip_plan_id VARCHAR(50) NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    status plan_task_status NOT NULL,
    input_data JSONB NOT NULL,
    output_data JSONB,
    error_message VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on trip_plan_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_plan_tasks_trip_plan_id ON plan_tasks(trip_plan_id);

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_plan_tasks_status ON plan_tasks(status);

-- Create trigger to automatically update updated_at timestamp
-- Using unique function name to avoid conflict with Prisma's updatedAt function
CREATE OR REPLACE FUNCTION update_updated_at_column_snake_case()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop old trigger if exists (cleanup)
DROP TRIGGER IF EXISTS update_plan_tasks_updated_at ON plan_tasks;

CREATE TRIGGER update_plan_tasks_updated_at
    BEFORE UPDATE ON plan_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column_snake_case();