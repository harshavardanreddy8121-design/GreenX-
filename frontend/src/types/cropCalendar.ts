// ─── Crop Calendar Domain Types ───────────────────────────────────────────────

export type PhaseType = 'pre-sowing' | 'sowing' | 'growth' | 'harvesting';

export type TaskType =
    | 'preparation'
    | 'sowing'
    | 'monitoring'
    | 'fertilization'
    | 'irrigation'
    | 'pest-control'
    | 'weed-control'
    | 'harvesting'
    | 'post-harvest';

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'skipped';

export type TaskPriority = 'high' | 'medium' | 'low';

export type AssignedRole = 'expert' | 'field_manager' | 'worker';

export interface CalendarTask {
    id: string;
    calendarId: string;
    phaseType: PhaseType;
    taskType: TaskType;
    name: string;
    description: string;
    scheduledDate: string;          // ISO date string YYYY-MM-DD
    assignedTo: AssignedRole;
    status: TaskStatus;
    priority: TaskPriority;
    resourcesNeeded: string;
    expectedDurationHours: number;
    completedAt?: string | null;
    notes?: string | null;
}

export interface CalendarPhase {
    phaseType: PhaseType;
    label: string;
    startDate: string;
    endDate: string;
    tasks: CalendarTask[];
}

export interface CropCalendarDetail {
    id: string;
    farmId: string;
    farmName?: string;
    cropName: string;
    season: string | null;
    sowingDate: string | null;
    harvestDate: string | null;
    status: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED';
    phases: CalendarPhase[];
    createdAt?: string;
}

// ─── Default task templates per phase ─────────────────────────────────────────

export interface TaskTemplate {
    name: string;
    description: string;
    taskType: TaskType;
    assignedTo: AssignedRole;
    priority: TaskPriority;
    resourcesNeeded: string;
    expectedDurationHours: number;
    /** Days offset from sowing date (negative = before sowing) */
    dayOffset: number;
}

export const PRE_SOWING_TEMPLATES: TaskTemplate[] = [
    {
        name: 'Land Preparation',
        description: 'Plough, level, and prepare the field for sowing. Remove crop residues and weeds.',
        taskType: 'preparation',
        assignedTo: 'field_manager',
        priority: 'high',
        resourcesNeeded: 'Tractor, plough, leveller',
        expectedDurationHours: 8,
        dayOffset: -35,
    },
    {
        name: 'Soil Testing',
        description: 'Collect soil samples and send to lab for NPK, pH, and micronutrient analysis.',
        taskType: 'preparation',
        assignedTo: 'expert',
        priority: 'high',
        resourcesNeeded: 'Soil sampling kit, lab submission forms',
        expectedDurationHours: 3,
        dayOffset: -30,
    },
    {
        name: 'Seed Procurement',
        description: 'Source certified seeds from approved supplier. Verify seed quality and germination rate.',
        taskType: 'preparation',
        assignedTo: 'field_manager',
        priority: 'high',
        resourcesNeeded: 'Seed procurement budget, supplier contact',
        expectedDurationHours: 4,
        dayOffset: -25,
    },
    {
        name: 'Equipment Preparation',
        description: 'Service and calibrate sowing equipment, irrigation pumps, and sprayers.',
        taskType: 'preparation',
        assignedTo: 'field_manager',
        priority: 'medium',
        resourcesNeeded: 'Maintenance tools, spare parts',
        expectedDurationHours: 6,
        dayOffset: -20,
    },
    {
        name: 'Irrigation Setup',
        description: 'Inspect and repair irrigation channels, drip lines, or sprinkler systems.',
        taskType: 'irrigation',
        assignedTo: 'worker',
        priority: 'medium',
        resourcesNeeded: 'Pipes, fittings, pump',
        expectedDurationHours: 5,
        dayOffset: -15,
    },
    {
        name: 'Fertilizer Procurement',
        description: 'Purchase basal fertilizers (DAP, Urea, MOP) as per soil test recommendations.',
        taskType: 'preparation',
        assignedTo: 'field_manager',
        priority: 'medium',
        resourcesNeeded: 'Fertilizer budget, storage space',
        expectedDurationHours: 3,
        dayOffset: -10,
    },
];

export const SOWING_TEMPLATES: TaskTemplate[] = [
    {
        name: 'Seed Treatment',
        description: 'Treat seeds with fungicide and bio-inoculants to prevent seed-borne diseases.',
        taskType: 'sowing',
        assignedTo: 'expert',
        priority: 'high',
        resourcesNeeded: 'Fungicide, bio-inoculant, mixing container',
        expectedDurationHours: 2,
        dayOffset: -2,
    },
    {
        name: 'Basal Fertilizer Application',
        description: 'Apply recommended basal dose of fertilizers before sowing.',
        taskType: 'fertilization',
        assignedTo: 'worker',
        priority: 'high',
        resourcesNeeded: 'DAP, MOP, spreader',
        expectedDurationHours: 4,
        dayOffset: -1,
    },
    {
        name: 'Sowing',
        description: 'Sow seeds at recommended depth and spacing using calibrated seed drill.',
        taskType: 'sowing',
        assignedTo: 'field_manager',
        priority: 'high',
        resourcesNeeded: 'Seed drill, tractor, seeds',
        expectedDurationHours: 8,
        dayOffset: 0,
    },
    {
        name: 'Initial Irrigation',
        description: 'Provide light irrigation immediately after sowing to ensure germination.',
        taskType: 'irrigation',
        assignedTo: 'worker',
        priority: 'high',
        resourcesNeeded: 'Irrigation pump, water source',
        expectedDurationHours: 3,
        dayOffset: 1,
    },
    {
        name: 'Pest Monitoring Setup',
        description: 'Install pheromone traps and sticky traps. Record baseline pest population.',
        taskType: 'monitoring',
        assignedTo: 'expert',
        priority: 'medium',
        resourcesNeeded: 'Pheromone traps, sticky traps, record sheets',
        expectedDurationHours: 2,
        dayOffset: 3,
    },
    {
        name: 'Germination Check',
        description: 'Inspect germination percentage. Re-sow gaps if germination < 70%.',
        taskType: 'monitoring',
        assignedTo: 'field_manager',
        priority: 'high',
        resourcesNeeded: 'Field notebook, extra seeds',
        expectedDurationHours: 2,
        dayOffset: 7,
    },
];

export const GROWTH_TEMPLATES: TaskTemplate[] = [
    {
        name: 'First Irrigation',
        description: 'Irrigate at critical crop growth stage. Monitor soil moisture.',
        taskType: 'irrigation',
        assignedTo: 'worker',
        priority: 'high',
        resourcesNeeded: 'Irrigation pump, water source',
        expectedDurationHours: 4,
        dayOffset: 15,
    },
    {
        name: 'Top Dressing — Nitrogen',
        description: 'Apply first split dose of nitrogen fertilizer (Urea) for vegetative growth.',
        taskType: 'fertilization',
        assignedTo: 'worker',
        priority: 'high',
        resourcesNeeded: 'Urea, spreader',
        expectedDurationHours: 4,
        dayOffset: 21,
    },
    {
        name: 'Weed Control',
        description: 'Manual or chemical weeding. Apply pre/post-emergent herbicide as needed.',
        taskType: 'weed-control',
        assignedTo: 'worker',
        priority: 'high',
        resourcesNeeded: 'Herbicide, sprayer, protective gear',
        expectedDurationHours: 6,
        dayOffset: 25,
    },
    {
        name: 'Pest & Disease Monitoring',
        description: 'Scout field for pest damage, disease symptoms. Update trap counts.',
        taskType: 'monitoring',
        assignedTo: 'expert',
        priority: 'medium',
        resourcesNeeded: 'Field notebook, magnifying glass',
        expectedDurationHours: 3,
        dayOffset: 30,
    },
    {
        name: 'Second Irrigation',
        description: 'Irrigate at flowering/panicle initiation stage.',
        taskType: 'irrigation',
        assignedTo: 'worker',
        priority: 'high',
        resourcesNeeded: 'Irrigation pump, water source',
        expectedDurationHours: 4,
        dayOffset: 40,
    },
    {
        name: 'Micronutrient Spray',
        description: 'Foliar spray of zinc sulphate and boron to correct deficiencies.',
        taskType: 'fertilization',
        assignedTo: 'worker',
        priority: 'medium',
        resourcesNeeded: 'Zinc sulphate, boron, sprayer',
        expectedDurationHours: 3,
        dayOffset: 45,
    },
    {
        name: 'Disease Management',
        description: 'Apply fungicide if disease incidence exceeds economic threshold.',
        taskType: 'pest-control',
        assignedTo: 'expert',
        priority: 'high',
        resourcesNeeded: 'Fungicide, sprayer, protective gear',
        expectedDurationHours: 4,
        dayOffset: 50,
    },
    {
        name: 'Third Irrigation',
        description: 'Irrigate at grain filling / pod development stage.',
        taskType: 'irrigation',
        assignedTo: 'worker',
        priority: 'high',
        resourcesNeeded: 'Irrigation pump, water source',
        expectedDurationHours: 4,
        dayOffset: 60,
    },
    {
        name: 'Final Pest Monitoring',
        description: 'Final scouting before harvest. Assess crop health and yield potential.',
        taskType: 'monitoring',
        assignedTo: 'expert',
        priority: 'medium',
        resourcesNeeded: 'Field notebook, camera',
        expectedDurationHours: 2,
        dayOffset: 75,
    },
];

export const HARVESTING_TEMPLATES: TaskTemplate[] = [
    {
        name: 'Harvest Readiness Assessment',
        description: 'Check crop maturity indicators (moisture content, colour, grain hardness).',
        taskType: 'monitoring',
        assignedTo: 'expert',
        priority: 'high',
        resourcesNeeded: 'Moisture meter, field notebook',
        expectedDurationHours: 2,
        dayOffset: -7,
    },
    {
        name: 'Harvest Equipment Preparation',
        description: 'Service combine harvester or manual harvesting tools. Arrange labour.',
        taskType: 'preparation',
        assignedTo: 'field_manager',
        priority: 'high',
        resourcesNeeded: 'Combine harvester / sickles, labour',
        expectedDurationHours: 4,
        dayOffset: -5,
    },
    {
        name: 'Stop Irrigation',
        description: 'Withhold irrigation 7–10 days before harvest to allow field drying.',
        taskType: 'irrigation',
        assignedTo: 'worker',
        priority: 'medium',
        resourcesNeeded: 'Field notebook',
        expectedDurationHours: 1,
        dayOffset: -7,
    },
    {
        name: 'Harvesting',
        description: 'Harvest crop at optimal maturity. Minimise field losses.',
        taskType: 'harvesting',
        assignedTo: 'field_manager',
        priority: 'high',
        resourcesNeeded: 'Combine harvester / labour, transport',
        expectedDurationHours: 10,
        dayOffset: 0,
    },
    {
        name: 'Threshing & Cleaning',
        description: 'Thresh, clean, and grade harvested produce.',
        taskType: 'post-harvest',
        assignedTo: 'worker',
        priority: 'high',
        resourcesNeeded: 'Thresher, winnower, bags',
        expectedDurationHours: 6,
        dayOffset: 1,
    },
    {
        name: 'Weighing & Storage',
        description: 'Weigh produce, record yield, and store in clean dry storage facility.',
        taskType: 'post-harvest',
        assignedTo: 'field_manager',
        priority: 'high',
        resourcesNeeded: 'Weighing scale, storage bags, warehouse',
        expectedDurationHours: 4,
        dayOffset: 2,
    },
    {
        name: 'Yield Recording',
        description: 'Record final yield data and compare with predicted yield.',
        taskType: 'post-harvest',
        assignedTo: 'expert',
        priority: 'medium',
        resourcesNeeded: 'Field notebook, calculator',
        expectedDurationHours: 2,
        dayOffset: 3,
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

export function phaseLabel(phase: PhaseType): string {
    const labels: Record<PhaseType, string> = {
        'pre-sowing': 'Pre-Sowing',
        sowing: 'Sowing',
        growth: 'Growth Monitoring',
        harvesting: 'Harvesting',
    };
    return labels[phase];
}

export function phaseColor(phase: PhaseType): string {
    const colors: Record<PhaseType, string> = {
        'pre-sowing': 'amber',
        sowing: 'green',
        growth: 'blue',
        harvesting: 'orange',
    };
    return colors[phase];
}

export function statusColor(status: TaskStatus): string {
    const colors: Record<TaskStatus, string> = {
        pending: 'bg-amber-100 text-amber-800 border-amber-200',
        'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
        completed: 'bg-green-100 text-green-800 border-green-200',
        skipped: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return colors[status];
}

export function priorityColor(priority: TaskPriority): string {
    const colors: Record<TaskPriority, string> = {
        high: 'bg-red-100 text-red-800 border-red-200',
        medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        low: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return colors[priority];
}

export function roleLabel(role: AssignedRole): string {
    const labels: Record<AssignedRole, string> = {
        expert: 'Expert',
        field_manager: 'Field Manager',
        worker: 'Worker',
    };
    return labels[role];
}

/** Build all phases with generated tasks from sowing + harvest dates */
export function buildPhasesFromDates(
    calendarId: string,
    sowingDate: string,
    harvestDate: string
): CalendarPhase[] {
    const makeTask = (
        phase: PhaseType,
        tpl: TaskTemplate,
        baseDate: string,
        isHarvestPhase = false
    ): CalendarTask => ({
        id: crypto.randomUUID(),
        calendarId,
        phaseType: phase,
        taskType: tpl.taskType,
        name: tpl.name,
        description: tpl.description,
        scheduledDate: addDays(baseDate, isHarvestPhase ? tpl.dayOffset : tpl.dayOffset),
        assignedTo: tpl.assignedTo,
        status: 'pending',
        priority: tpl.priority,
        resourcesNeeded: tpl.resourcesNeeded,
        expectedDurationHours: tpl.expectedDurationHours,
        completedAt: null,
        notes: null,
    });

    const preSowingTasks = PRE_SOWING_TEMPLATES.map((t) =>
        makeTask('pre-sowing', t, sowingDate)
    );
    const sowingTasks = SOWING_TEMPLATES.map((t) =>
        makeTask('sowing', t, sowingDate)
    );
    const growthTasks = GROWTH_TEMPLATES.map((t) =>
        makeTask('growth', t, sowingDate)
    );
    const harvestingTasks = HARVESTING_TEMPLATES.map((t) =>
        makeTask('harvesting', t, harvestDate, true)
    );

    return [
        {
            phaseType: 'pre-sowing',
            label: 'Pre-Sowing',
            startDate: addDays(sowingDate, -45),
            endDate: addDays(sowingDate, -1),
            tasks: preSowingTasks,
        },
        {
            phaseType: 'sowing',
            label: 'Sowing',
            startDate: addDays(sowingDate, -2),
            endDate: addDays(sowingDate, 7),
            tasks: sowingTasks,
        },
        {
            phaseType: 'growth',
            label: 'Growth Monitoring',
            startDate: addDays(sowingDate, 8),
            endDate: addDays(harvestDate, -8),
            tasks: growthTasks,
        },
        {
            phaseType: 'harvesting',
            label: 'Harvesting',
            startDate: addDays(harvestDate, -7),
            endDate: addDays(harvestDate, 7),
            tasks: harvestingTasks,
        },
    ];
}
