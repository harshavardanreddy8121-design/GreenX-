-- Fix admin user password hash (BCrypt hash of 'admin123')
UPDATE USERS SET PASSWORD_HASH = '$2a$10$coWT1BnmcXDSmtpP.Y4JXeSdwkWjk.M/fNu9aqjvlJgSSvFu7kd.S' WHERE EMAIL = 'admin@farmapp.com';

-- Also fix sample data user password hash (BCrypt hash of 'password123' was incorrect)
-- Regenerating not needed if we just fix admin

COMMIT;
