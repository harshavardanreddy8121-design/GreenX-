export interface OfflineAction {
  id: string;
  type: string;
  payload: Record<string, any>;
  createdAt: string;
}

const OFFLINE_QUEUE_KEY = 'greenx.offline.actions.v1';

export function getOfflineActions(): OfflineAction[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as OfflineAction[]) : [];
  } catch {
    return [];
  }
}

export function enqueueOfflineAction(type: string, payload: Record<string, any>): void {
  const current = getOfflineActions();
  const next: OfflineAction = {
    id: crypto.randomUUID(),
    type,
    payload,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify([...current, next]));
}

export function removeOfflineAction(actionId: string): void {
  const current = getOfflineActions();
  const filtered = current.filter((action) => action.id !== actionId);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
}

export async function flushOfflineActions(
  handlers: Record<string, (payload: Record<string, any>) => Promise<void>>
): Promise<number> {
  const actions = getOfflineActions();
  let flushedCount = 0;

  for (const action of actions) {
    const handler = handlers[action.type];
    if (!handler) continue;

    try {
      await handler(action.payload);
      removeOfflineAction(action.id);
      flushedCount += 1;
    } catch {
      // Leave failed actions in queue for retry.
    }
  }

  return flushedCount;
}
