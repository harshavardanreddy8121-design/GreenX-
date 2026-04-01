-- Workflow events table for explicit farm lifecycle tracking
CREATE TABLE IF NOT EXISTS workflow_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL,
  event_key TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed')),
  done_by TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_workflow_events_farm_event
  ON workflow_events (farm_id, event_key);

CREATE INDEX IF NOT EXISTS idx_workflow_events_farm_id
  ON workflow_events (farm_id);

CREATE INDEX IF NOT EXISTS idx_workflow_events_status
  ON workflow_events (status);
