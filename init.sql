CREATE DATABASE IF NOT EXISTS dnd;
USE dnd;

-- Grant privileges
GRANT ALL PRIVILEGES ON dnd.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- Add any additional initialization SQL here 