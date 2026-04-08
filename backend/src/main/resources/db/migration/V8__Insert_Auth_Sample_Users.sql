-- Sample users for RBAC authentication system
-- All passwords are BCrypt hash of "password123"
INSERT INTO auth_users (name, email, password, role, created_at, updated_at) VALUES
('Admin User', 'admin@greenx.com', '$2a$10$slYQmyNdGzin7olVN3p5Be7DlH.PKZbv5H8KnzzVgXXbVxzy2QIDM', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Expert User', 'expert@greenx.com', '$2a$10$slYQmyNdGzin7olVN3p5Be7DlH.PKZbv5H8KnzzVgXXbVxzy2QIDM', 'EXPERT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Field Manager', 'fieldmanager@greenx.com', '$2a$10$slYQmyNdGzin7olVN3p5Be7DlH.PKZbv5H8KnzzVgXXbVxzy2QIDM', 'FIELD_MANAGER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Worker User', 'worker@greenx.com', '$2a$10$slYQmyNdGzin7olVN3p5Be7DlH.PKZbv5H8KnzzVgXXbVxzy2QIDM', 'WORKER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Landowner User', 'landowner@greenx.com', '$2a$10$slYQmyNdGzin7olVN3p5Be7DlH.PKZbv5H8KnzzVgXXbVxzy2QIDM', 'LANDOWNER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;
