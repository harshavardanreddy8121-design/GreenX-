-- Add 4-digit UID to users for admin search and identity lookup.
-- Tolerant to partial/previous runs via IF NOT EXISTS.
ALTER TABLE USERS ADD COLUMN IF NOT EXISTS UID VARCHAR(4);

-- Backfill null UID values only.
UPDATE USERS
SET UID = LPAD(CAST(rn AS TEXT), 4, '0')
FROM (
    SELECT ID,
           ROW_NUMBER() OVER (ORDER BY CREATED_AT, ID) AS rn
    FROM USERS
    WHERE UID IS NULL
) t
WHERE USERS.ID = t.ID;
