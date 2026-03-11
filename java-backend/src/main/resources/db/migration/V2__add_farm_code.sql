-- Add FARM_CODE column to FARMS table for unique 10-digit reference ID
ALTER TABLE FARMS ADD COLUMN IF NOT EXISTS FARM_CODE VARCHAR(10) UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS IDX_FARMS_FARM_CODE ON FARMS(FARM_CODE);

-- Add comment for documentation
COMMENT ON COLUMN FARMS.FARM_CODE IS 'Unique 10-digit numeric identifier for easy reference';
