import { javaApi } from '@/integrations/java-api/client';
import { upsertWorkflowEvent } from '@/utils/workflowEvents';

type TriggerRule = {
  title: string;
  notifyRoles: string[];
  status: 'pending' | 'in-progress' | 'completed';
};

const triggerRules: Record<string, TriggerRule> = {
  land_submitted: {
    title: 'Land submitted',
    notifyRoles: ['cluster_admin'],
    status: 'completed',
  },
  field_manager_assigned: {
    title: 'Field manager assigned',
    notifyRoles: ['landowner', 'fieldmanager'],
    status: 'completed',
  },
  soil_samples_collected: {
    title: 'Soil samples collected',
    notifyRoles: ['landowner', 'cluster_admin'],
    status: 'completed',
  },
  sample_received_at_lab: {
    title: 'Sample received at lab',
    notifyRoles: ['expert'],
    status: 'completed',
  },
  soil_report_uploaded: {
    title: 'Soil report uploaded',
    notifyRoles: ['landowner', 'cluster_admin', 'fieldmanager'],
    status: 'completed',
  },
  crop_suggestions_sent: {
    title: 'Crop suggestions sent',
    notifyRoles: ['landowner'],
    status: 'completed',
  },
  landowner_selected_crop: {
    title: 'Landowner selected crop',
    notifyRoles: ['expert', 'fieldmanager'],
    status: 'completed',
  },
  crop_calendar_published: {
    title: 'Crop calendar published',
    notifyRoles: ['fieldmanager', 'landowner'],
    status: 'completed',
  },
  field_operation_logged: {
    title: 'Field operation logged',
    notifyRoles: ['landowner', 'cluster_admin'],
    status: 'completed',
  },
  pest_flagged: {
    title: 'Pest/disease flagged',
    notifyRoles: ['expert', 'landowner', 'cluster_admin'],
    status: 'completed',
  },
  prescription_issued: {
    title: 'Prescription issued',
    notifyRoles: ['fieldmanager', 'landowner', 'cluster_admin'],
    status: 'completed',
  },
  harvest_logged: {
    title: 'Harvest logged',
    notifyRoles: ['cluster_admin', 'landowner'],
    status: 'completed',
  },
  sale_completed: {
    title: 'Sale completed',
    notifyRoles: ['landowner'],
    status: 'completed',
  },
};

interface EmitWorkflowTriggerInput {
  farmId?: string | null;
  eventKey: string;
  triggeredBy?: string;
  note?: string;
}

// Best-effort workflow broadcaster; failures should not block primary user actions.
export async function emitWorkflowTrigger(input: EmitWorkflowTriggerInput): Promise<void> {
  const farmId = input.farmId ? String(input.farmId) : '';
  if (!farmId) return;

  const rule = triggerRules[input.eventKey] || {
    title: input.eventKey,
    notifyRoles: ['cluster_admin'],
    status: 'completed' as const,
  };

  await upsertWorkflowEvent({
    farmId,
    eventKey: input.eventKey,
    status: rule.status,
    doneBy: input.triggeredBy || 'system',
    note: input.note || `${rule.title}. Notifies: ${rule.notifyRoles.join(', ')}`,
  });

  try {
    const now = new Date().toISOString();

    await javaApi.insert('farm_timeline', {
      id: crypto.randomUUID(),
      farm_id: farmId,
      event_type: input.eventKey,
      event_title: rule.title,
      event_description: input.note || `${rule.title}.`,
      user_role: 'system',
      created_at: now,
    });

    await Promise.all(
      rule.notifyRoles.map((role) =>
        javaApi.insert('farm_timeline', {
          id: crypto.randomUUID(),
          farm_id: farmId,
          event_type: 'notification',
          event_title: `Notification -> ${role}`,
          event_description: `${rule.title} (${role} notified)`,
          user_role: 'system',
          created_at: now,
        })
      )
    );
  } catch {
    // Ignore notification insert errors; workflow state is already persisted.
  }
}
