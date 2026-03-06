-- Add admin user: harshavardanreddy7730@gmail.com
INSERT INTO USERS (ID, EMAIL, PASSWORD_HASH, ROLE, NAME, CREATED_AT, UPDATED_AT)
SELECT SYS_GUID(),
       'harshavardanreddy7730@gmail.com',
       '$2b$10$Z859Kr9xQshF.3CA7YOgWecrhKijsbdXeKDAcEy5VlBb8ieUB9AgG',
       'admin',
       'Harsha Vardhan Reddy',
       SYSDATE,
       SYSDATE
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM USERS WHERE EMAIL = 'harshavardanreddy7730@gmail.com'
);

