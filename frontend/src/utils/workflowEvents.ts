import { javaApi } from '@/integrations/java-api/client';

export type WorkflowEventStatus = 'pending' | 'in-progress' | 'completed';

interface UpsertWorkflowEventInput {
  farmId?: string | null;
  eventKey: string;
  status: WorkflowEventStatus;
  doneBy?: string;
  note?: string;
}

// Best-effort logger: failures should never block user workflows.
export async function upsertWorkflowEvent(input: UpsertWorkflowEventInput): Promise<void> {
  const farmId = input.farmId ? String(input.farmId) : '';
  if (!farmId) return;

  const now = new Date().toISOString();

  try {
    const findResponse = await javaApi.select('workflow_events', {
      eq: { farm_id: farmId, event_key: input.eventKey },
    });

    const rows = findResponse.success && findResponse.data ? (findResponse.data as any[]) : [];
    const existing = rows.length > 0 ? rows[0] : null;

    const payload = {
      farm_id: farmId,
      event_key: input.eventKey,
      status: input.status,
      done_by: input.doneBy || null,
      note: input.note || null,
      updated_at: now,
    };

    if (existing && (existing.id || existing.ID)) {
      await javaApi.update('workflow_events', String(existing.id || existing.ID), payload);
      return;
    }

    await javaApi.insert('workflow_events', {
      id: crypto.randomUUID(),
      ...payload,
      created_at: now,
    });
  } catch {
    // Intentionally swallow errors to avoid breaking primary flow actions.
  }
}
