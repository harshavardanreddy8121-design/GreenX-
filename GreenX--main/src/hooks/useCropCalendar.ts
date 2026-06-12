import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { javaApi } from '@/integrations/java-api/client';
import { toast } from 'sonner';
import type { CalendarTask, TaskStatus, CropCalendarDetail } from '@/types/cropCalendar';
import { buildPhasesFromDates } from '@/types/cropCalendar';
import { emitWorkflowTrigger } from '@/utils/workflowNotifications';

// ─── Fetch helpers ─────────────────────────────────────────────────────────────

export function useCalendars() {
    return useQuery({
        queryKey: ['expert-calendars'],
        queryFn: async () => {
            const res = await javaApi.call<any[]>('/expert/calendars', 'GET');
            return res.success && res.data ? (res.data as any[]) : [];
        },
    });
}

export function useCalendarPhases(calendarId: string | null) {
    return useQuery({
        queryKey: ['calendar-phases', calendarId],
        enabled: !!calendarId,
        queryFn: async () => {
            const res = await javaApi.call<any[]>(
                `/expert/calendars/${calendarId}/phases`,
                'GET'
            );
            return res.success && res.data ? (res.data as any[]) : [];
        },
    });
}

export function useCalendarTasks(calendarId: string | null) {
    return useQuery({
        queryKey: ['calendar-tasks', calendarId],
        enabled: !!calendarId,
        queryFn: async () => {
            const res = await javaApi.call<CalendarTask[]>(
                `/expert/calendars/${calendarId}/tasks`,
                'GET'
            );
            return res.success && res.data ? (res.data as CalendarTask[]) : [];
        },
    });
}

// ─── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateCalendarWithPhases() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: {
            farmId: string;
            cropName: string;
            season: string | null;
            sowingDate: string;
            harvestDate: string;
            suggestionId?: string | null;
        }) => {
            // 1. Create the calendar
            const calRes = await javaApi.call<any>('/expert/calendars', 'POST', {
                farmId: payload.farmId,
                cropName: payload.cropName,
                season: payload.season,
                sowingDate: payload.sowingDate,
                harvestDate: payload.harvestDate,
                suggestionId: payload.suggestionId ?? null,
            });
            if (!calRes.success) throw new Error(calRes.error || 'Failed to create calendar');

            const calendarId: string = calRes.data?.id ?? crypto.randomUUID();

            // 2. Build phases + tasks locally
            const phases = buildPhasesFromDates(
                calendarId,
                payload.sowingDate,
                payload.harvestDate
            );

            // 3. Persist phases
            for (const phase of phases) {
                const phaseRes = await javaApi.call(
                    `/expert/calendars/${calendarId}/phases`,
                    'POST',
                    {
                        phaseType: phase.phaseType,
                        label: phase.label,
                        startDate: phase.startDate,
                        endDate: phase.endDate,
                    }
                );
                // Best-effort — continue even if phase endpoint not yet implemented
                const phaseId = (phaseRes as any)?.data?.id ?? null;

                // 4. Persist tasks for this phase
                for (const task of phase.tasks) {
                    await javaApi.call(
                        `/expert/calendars/${calendarId}/tasks`,
                        'POST',
                        {
                            phaseId,
                            phaseType: task.phaseType,
                            taskType: task.taskType,
                            name: task.name,
                            description: task.description,
                            scheduledDate: task.scheduledDate,
                            assignedTo: task.assignedTo,
                            status: task.status,
                            priority: task.priority,
                            resourcesNeeded: task.resourcesNeeded,
                            expectedDurationHours: task.expectedDurationHours,
                        }
                    );
                }
            }

            // 5. Publish
            await javaApi.call(`/expert/calendars/${calendarId}/publish`, 'POST');

            // 6. Workflow notification
            await emitWorkflowTrigger({
                farmId: payload.farmId,
                eventKey: 'crop_calendar_published',
                triggeredBy: 'expert',
                note: 'Expert published comprehensive crop calendar with all phases and tasks.',
            });

            return { calendarId, phases };
        },
        onSuccess: () => {
            toast.success('Crop calendar created and published with all phases');
            queryClient.invalidateQueries({ queryKey: ['expert-calendars'] });
        },
        onError: (err: any) => toast.error(err.message || 'Failed to create calendar'),
    });
}

export function useAddTask(calendarId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (task: Omit<CalendarTask, 'id' | 'calendarId'>) => {
            const res = await javaApi.call<CalendarTask>(
                `/expert/calendars/${calendarId}/tasks`,
                'POST',
                { ...task, calendarId }
            );
            if (!res.success) throw new Error(res.error || 'Failed to add task');
            return res.data;
        },
        onSuccess: () => {
            toast.success('Task added');
            queryClient.invalidateQueries({ queryKey: ['calendar-tasks', calendarId] });
        },
        onError: (err: any) => toast.error(err.message || 'Failed to add task'),
    });
}

export function useUpdateTask(calendarId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            taskId,
            updates,
        }: {
            taskId: string;
            updates: Partial<CalendarTask>;
        }) => {
            const res = await javaApi.call(
                `/expert/calendars/${calendarId}/tasks/${taskId}`,
                'PUT',
                updates
            );
            if (!res.success) throw new Error(res.error || 'Failed to update task');
            return res.data;
        },
        onSuccess: () => {
            toast.success('Task updated');
            queryClient.invalidateQueries({ queryKey: ['calendar-tasks', calendarId] });
        },
        onError: (err: any) => toast.error(err.message || 'Failed to update task'),
    });
}

export function useUpdateTaskStatus(calendarId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            taskId,
            status,
        }: {
            taskId: string;
            status: TaskStatus;
        }) => {
            const res = await javaApi.call(
                `/expert/calendars/${calendarId}/tasks/${taskId}/status`,
                'PATCH',
                { status }
            );
            if (!res.success) throw new Error(res.error || 'Failed to update status');
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar-tasks', calendarId] });
        },
        onError: (err: any) => toast.error(err.message || 'Failed to update status'),
    });
}

// ─── Local state helper: merge API tasks into phases ──────────────────────────

export function mergeTasksIntoCalendar(
    calendar: any,
    apiTasks: CalendarTask[]
): CropCalendarDetail {
    const sowingDate = calendar.sowingDate ?? calendar.sowingdate ?? calendar.sowing_date ?? '';
    const harvestDate = calendar.harvestDate ?? calendar.harvestdate ?? calendar.harvest_date ?? '';

    let phases = sowingDate && harvestDate
        ? buildPhasesFromDates(calendar.id, sowingDate, harvestDate)
        : [];

    if (apiTasks.length > 0) {
        // Replace generated tasks with real API tasks
        phases = phases.map((phase) => ({
            ...phase,
            tasks: apiTasks.filter((t) => t.phaseType === phase.phaseType),
        }));
    }

    return {
        id: calendar.id,
        farmId: calendar.farmId ?? calendar.farmid ?? calendar.farm_id ?? '',
        farmName: calendar.farmName ?? calendar.farm_name ?? undefined,
        cropName: calendar.cropName ?? calendar.cropname ?? calendar.crop_name ?? '',
        season: calendar.season ?? null,
        sowingDate: sowingDate || null,
        harvestDate: harvestDate || null,
        status: calendar.status ?? 'DRAFT',
        phases,
        createdAt: calendar.createdAt ?? calendar.created_at ?? undefined,
    };
}
