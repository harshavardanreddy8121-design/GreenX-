-- Add admin user: harshavardanreddy7730@gmail.com (password: harsha@2004, role: admin)
-- Uses a PL/SQL block to generate a proper UUID and also populate USER_ROLES and PROFILES.
DECLARE
    v_count   NUMBER;
    v_raw     RAW(16);
    v_user_id VARCHAR2(36);
    v_role_id VARCHAR2(36);
BEGIN
    SELECT COUNT(*) INTO v_count FROM USERS WHERE EMAIL = 'harshavardanreddy7730@gmail.com';

    IF v_count = 0 THEN
        -- Generate UUID for user
        v_raw := SYS_GUID();
        v_user_id := LOWER(
            SUBSTR(RAWTOHEX(v_raw),  1, 8) || '-' ||
            SUBSTR(RAWTOHEX(v_raw),  9, 4) || '-' ||
            SUBSTR(RAWTOHEX(v_raw), 13, 4) || '-' ||
            SUBSTR(RAWTOHEX(v_raw), 17, 4) || '-' ||
            SUBSTR(RAWTOHEX(v_raw), 21)
        );

        INSERT INTO USERS (ID, EMAIL, PASSWORD_HASH, ROLE, NAME, CREATED_AT, UPDATED_AT)
        VALUES (v_user_id,
                'harshavardanreddy7730@gmail.com',
                '$2a$10$Z859Kr9xQshF.3CA7YOgWecrhKijsbdXeKDAcEy5VlBb8ieUB9AgG',
                'admin',
                'Harsha Vardhan Reddy',
                SYSDATE, SYSDATE);

        -- Generate UUID for user_roles row
        v_raw := SYS_GUID();
        v_role_id := LOWER(
            SUBSTR(RAWTOHEX(v_raw),  1, 8) || '-' ||
            SUBSTR(RAWTOHEX(v_raw),  9, 4) || '-' ||
            SUBSTR(RAWTOHEX(v_raw), 13, 4) || '-' ||
            SUBSTR(RAWTOHEX(v_raw), 17, 4) || '-' ||
            SUBSTR(RAWTOHEX(v_raw), 21)
        );

        INSERT INTO USER_ROLES (ID, USER_ID, ROLE)
        VALUES (v_role_id, v_user_id, 'admin');

        INSERT INTO PROFILES (ID, FULL_NAME)
        VALUES (v_user_id, 'Harsha Vardhan Reddy');

        COMMIT;
    END IF;
END;
/
