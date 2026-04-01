-- Add 4-digit UID to users for admin search and identity lookup.
-- Keep this migration tolerant to partial/previous runs so Railway can start.
BEGIN
  EXECUTE IMMEDIATE 'ALTER TABLE USERS ADD UID VARCHAR2(4)';
EXCEPTION
  WHEN OTHERS THEN
    -- ORA-01430: column being added already exists
    IF SQLCODE != -1430 THEN
      RAISE;
    END IF;
END;
/

-- Backfill null UID values only. We intentionally avoid strict NOT NULL/UNIQUE
-- constraints here to prevent deployment failures in mixed data states.
MERGE INTO USERS u
USING (
  SELECT ID,
         SUBSTR(LPAD(TO_CHAR(ROW_NUMBER() OVER (ORDER BY CREATED_AT, ID)), 4, '0'), -4) AS GEN_UID
  FROM USERS
) t
ON (u.ID = t.ID)
WHEN MATCHED THEN
  UPDATE SET u.UID = t.GEN_UID
  WHERE u.UID IS NULL;
