/**
 * Typed API client using fetch against the Java Spring Boot backend.
 * All endpoints match the controllers created in the Java backend.
 * Token is read from localStorage (`greenx_token`) and sent automatically.
 */

// In production (Lovable/Vercel), VITE_API_URL may not be set;
// fall back to the Railway backend URL.
const BACKEND_URL = import.meta.env.VITE_API_URL
    || 'https://spring-boot-backend-production-13e6.up.railway.app';
const BASE = BACKEND_URL + '/api';
const TOKEN_KEY = 'greenx_token';

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    // Sync with javaApi client token so both clients are authenticated
    localStorage.setItem('javaApiToken', token);
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('javaApiToken');
}

async function request<T>(
    path: string,
    method = 'GET',
    body?: unknown,
    isFormData = false
): Promise<T> {
    const headers: Record<string, string> = {};
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData && body) headers['Content-Type'] = 'application/json';

    const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401 || res.status === 403) {
        clearToken();
        window.location.href = '/login';
        throw new Error(res.status === 401 ? 'Session expired' : 'Access denied — please log in again');
    }

    const text = await res.text();
    const json = text ? JSON.parse(text) : {};

    if (!res.ok) {
        throw new Error(json.error || json.message || `HTTP ${res.status}`);
    }

    // Backend wraps everything in { success, data, error }
    if (json && typeof json === 'object' && 'success' in json) {
        if (!json.success) throw new Error(json.error || 'Request failed');
        return json.data as T;
    }

    return json as T;
}

// ─── AUTH ───────────────────────────────────────────────────────────────────

export interface AuthUser {
    id: string;
    uid?: string;
    email: string;
    name: string;
    role: string;
    clusterId?: string;
    isActive?: boolean;
}

export interface LoginResponse {
    token: string;
    user: AuthUser;
}

export const health = {
    check: () => request<{ status: string; timestamp: string; service: string; version: string }>('/health'),
};

export const auth = {
    login: (email: string, password: string) =>
        request<LoginResponse>('/auth/login', 'POST', { email, password }),

    register: (email: string, password: string, name: string, role: string) =>
        request<LoginResponse>('/auth/register', 'POST', { email, password, name, role }),

    me: () => request<AuthUser>('/auth/me'),

    logout: () => request('/auth/logout', 'POST'),
};

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

export interface GxNotification {
    id: string;
    toUserId: string;
    fromRole?: string;
    title: string;
    message: string;
    type: string;
    relatedFarmId?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    isread: boolean;
    readAt?: string;
    createdAt: string;
}

function notifEndpoint(role: string) {
    const map: Record<string, string> = {
        CLUSTER_ADMIN: '/admin',
        EXPERT: '/expert',
        FIELD_MANAGER: '/fieldmanager',
        LAND_OWNER: '/landowner',
    };
    return map[role] ?? '/admin';
}

export const notifications = {
    getAll: (role: string) =>
        request<GxNotification[]>(`${notifEndpoint(role)}/notifications`),
    markRead: (role: string, id: string) =>
        request<GxNotification>(`${notifEndpoint(role)}/notifications/${id}/read`, 'PUT'),
    unreadCount: (role: string) =>
        request<number>(`${notifEndpoint(role)}/notifications/unread-count`),
};

// ─── CLUSTER ADMIN ───────────────────────────────────────────────────────────

export const admin = {
    getStats: () => request<Record<string, number>>('/admin/stats'),

    getFarms: (status?: string) =>
        request<Farm[]>(`/admin/farms${status ? `?status=${status}` : ''}`),

    getUnassignedFarms: () => request<Farm[]>('/admin/farms/unassigned'),

    assignManager: (farmId: string, managerId: string) =>
        request<Farm>('/admin/farms/assign-manager', 'POST', { farmId, managerId }),

    assignExpert: (farmId: string, expertId: string) =>
        request<Farm>('/admin/farms/assign-expert', 'POST', { farmId, expertId }),

    getAvailableManagers: () => request<User[]>('/admin/managers/available'),

    getExperts: () => request<User[]>('/admin/experts'),

    receiveSoilSample: (data: {
        farmId: string;
        collectedBy: string;
        assignedExpertId: string;
        numPoints?: number;
        priority?: string;
    }) => request<SoilSample>('/admin/samples/receive', 'POST', data),

    getPendingSamples: () => request<SoilSample[]>('/admin/samples/pending'),

    getAllAlerts: () => request<PestAlert[]>('/admin/alerts'),

    getUsers: () => request<User[]>('/admin/users'),

    deleteUser: (userId: string) => request<void>('/data/users/' + userId, 'DELETE'),

    deleteFarm: (farmId: string) => request<void>('/data/farms/' + farmId, 'DELETE'),

    registerFarm: (data: FormData) =>
        request<{ farmId: string; farmCode: string; ownerId: string; ownerUid?: string; ownerEmail: string; tempPassword: string }>('/admin/farms/register', 'POST', data, true),
};

// ─── EXPERT ──────────────────────────────────────────────────────────────────

export const expert = {
    getPendingSamples: () => request<SoilSample[]>('/expert/samples/pending'),

    getAssignedFarms: () => request<Farm[]>('/expert/farms'),

    submitSoilReport: (report: Partial<SoilReport>) =>
        request<SoilReport>('/expert/soil-reports', 'POST', report),

    getMyReports: () => request<SoilReport[]>('/expert/soil-reports'),

    getFarmReports: (farmId: string) =>
        request<SoilReport[]>(`/expert/farms/${farmId}/reports`),

    saveCropSuggestions: (suggestions: Partial<CropSuggestion>[]) =>
        request<CropSuggestion[]>('/expert/crop-suggestions', 'POST', suggestions),

    getMySuggestions: () => request<CropSuggestion[]>('/expert/crop-suggestions'),

    getFarmsAwaitingSuggestions: () => request<Farm[]>('/expert/farms-awaiting-suggestions'),

    createCalendar: (data: unknown) =>
        request<CropCalendar>('/expert/calendars', 'POST', data),

    publishCalendar: (id: string) =>
        request<CropCalendar>(`/expert/calendars/${id}/publish`, 'POST'),

    getPestAlerts: () => request<PestAlert[]>('/expert/pest-alerts'),

    issuePrescription: (p: Partial<Prescription>) =>
        request<Prescription>('/expert/prescriptions', 'POST', p),

    getMyPrescriptions: () => request<Prescription[]>('/expert/prescriptions'),

    getStats: () => request<Record<string, number>>('/expert/stats'),
};

// ─── FIELD MANAGER ───────────────────────────────────────────────────────────

export const fieldManager = {
    getAssignedFarms: () => request<Farm[]>('/fieldmanager/farms'),

    getTodayTasks: () => request<CalendarTask[]>('/fieldmanager/tasks/today'),

    getTasks: (farmId?: string, status?: string) => {
        const params = new URLSearchParams();
        if (farmId) params.set('farmId', farmId);
        if (status) params.set('status', status);
        return request<CalendarTask[]>(`/fieldmanager/tasks?${params}`);
    },

    updateTaskStatus: (id: string, status: string, notes?: string) =>
        request<CalendarTask>(`/fieldmanager/tasks/${id}/status`, 'PUT', { status, notes }),

    logOperation: (data: FormData) =>
        request<FieldOperation>('/fieldmanager/operations', 'POST', data, true),

    logOperationJson: (op: Partial<FieldOperation>) =>
        request<FieldOperation>('/fieldmanager/operations', 'POST', op),

    getOperations: (farmId?: string) =>
        request<FieldOperation[]>(`/fieldmanager/operations${farmId ? `?farmId=${farmId}` : ''}`),

    logSampleCollection: (data: FormData) =>
        request<SoilSample>('/fieldmanager/samples', 'POST', data, true),

    getSamples: () => request<SoilSample[]>('/fieldmanager/samples'),

    reportPest: (data: FormData | Partial<PestAlert>) =>
        data instanceof FormData
            ? request<PestAlert>('/fieldmanager/pest-alerts', 'POST', data, true)
            : request<PestAlert>('/fieldmanager/pest-alerts', 'POST', data),

    getPrescriptions: () => request<Prescription[]>('/fieldmanager/prescriptions'),

    acknowledgePrescription: (id: string) =>
        request<Prescription>(`/fieldmanager/prescriptions/${id}/acknowledge`, 'PUT'),

    getStats: () => request<Record<string, number>>('/fieldmanager/stats'),
};

// ─── LAND OWNER ──────────────────────────────────────────────────────────────

export const landOwner = {
    getFarms: () => request<Farm[]>('/landowner/farms'),

    getSoilReports: () => request<SoilReport[]>('/landowner/soil-reports'),

    getCropSuggestions: () => request<CropSuggestion[]>('/landowner/crop-suggestions'),

    selectCrop: (id: string) =>
        request<CropSuggestion>(`/landowner/crop-suggestions/${id}/select`, 'POST'),

    getCalendars: () => request<CropCalendar[]>('/landowner/calendars'),

    getCalendarTasks: () => request<CalendarTask[]>('/landowner/calendar-tasks'),

    getOperationsFeed: () => request<FieldOperation[]>('/landowner/operations'),

    getSamples: () => request<SoilSample[]>('/landowner/samples'),

    getFinanceSummary: () => request<FinanceSummary>('/landowner/finance/summary'),

    getStats: () => request<Record<string, number | object>>('/landowner/stats'),
};

// ─── FILE UPLOAD ─────────────────────────────────────────────────────────────

export const files = {
    upload: async (
        file: File,
        category: string,
        farmId?: string
    ): Promise<{ path: string; url: string }> => {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('category', category);
        if (farmId) fd.append('farmId', farmId);
        return request('/files/upload', 'POST', fd, true);
    },
};

// ─── SHARED TYPES ────────────────────────────────────────────────────────────

export interface User {
    id: string;
    uid?: string;
    email: string;
    name: string;
    role: string;
    phone?: string;
    clusterId?: string;
    isActive?: boolean;
}

export interface Farm {
    id: string;
    farmCode: string;
    ownerId: string;
    fieldManagerId?: string;
    clusterId?: string;
    name?: string;
    totalLand?: number;
    village?: string;
    district?: string;
    state?: string;
    pincode?: string;
    soilType?: string;
    waterSource?: string;
    currentCrop?: string;
    currentStage?: string;
    status: string;
    cropHealthScore?: number;
    expectedRevenue?: number;
    profitShare?: number;
    createdAt?: string;
}

export interface SoilSample {
    id: string;
    sampleCode: string;
    farmId: string;
    collectedBy: string;
    assignedExpertId?: string;
    collectionDate?: string;
    numPoints?: number;
    samplingMethod?: string;
    depthCm?: number;
    soilTexture?: string;
    gpsCoordinates?: string;
    collectionNotes?: string;
    status: string;
    priority: string;
    collectorName?: string;
    createdAt?: string;
}

export interface SoilReport {
    id: string;
    sampleId?: string;
    farmId: string;
    expertId: string;
    phLevel?: number;
    nitrogenKgHa?: number;
    phosphorusKgHa?: number;
    potassiumKgHa?: number;
    organicMatterPct?: number;
    moisturePct?: number;
    ecDsM?: number;
    zincPpm?: number;
    boronPpm?: number;
    sulphurPpm?: number;
    ironPpm?: number;
    expertRemarks?: string;
    overallRating?: string;
    reportDate?: string;
    shareLandowner?: boolean;
    shareCluster?: boolean;
    shareFieldmgr?: boolean;
    createdAt?: string;
}

export interface CropSuggestion {
    id: string;
    reportId?: string;
    farmId: string;
    expertId: string;
    cropName: string;
    cropVariety?: string;
    season?: string;
    expectedYieldMin?: number;
    expectedYieldMax?: number;
    yieldUnit?: string;
    profitPerAcre?: number;
    inputCostEstimate?: number;
    durationDays?: number;
    suitabilityScore?: number;
    expertNotes?: string;
    isselected?: boolean;
    selectedAt?: string;
    createdAt?: string;
}

export interface CropCalendar {
    id: string;
    farmId: string;
    expertId: string;
    suggestionId?: string;
    cropName: string;
    season?: string;
    sowingDate?: string;
    harvestDate?: string;
    totalDurationDays?: number;
    status: string;
    publishedAt?: string;
    createdAt?: string;
}

export interface CalendarTask {
    id: string;
    calendarId: string;
    farmId?: string;
    taskType: string;
    taskTitle: string;
    taskDescription?: string;
    scheduledDate: string;
    weekNumber?: number;
    productRecommended?: string;
    doseRecommended?: string;
    areaToCover?: string;
    estimatedCost?: number;
    status: string;
    priority: string;
    startedAt?: string;
    completedAt?: string;
    completionNotes?: string;
    createdAt?: string;
}

export interface FieldOperation {
    id: string;
    farmId: string;
    fieldManagerId: string;
    taskId?: string;
    operationType: string;
    operationDate: string;
    productUsed?: string;
    quantityUsed?: string;
    unit?: string;
    areaCoveredAcres?: number;
    workersDeployed?: number;
    costIncurred?: number;
    weatherCondition?: string;
    temperatureC?: number;
    observations?: string;
    photos?: string;
    createdAt?: string;
}

export interface PestAlert {
    id: string;
    farmId: string;
    reportedBy: string;
    pestName: string;
    pestType?: string;
    severity: string;
    affectedAreaPct?: number;
    fieldLocation?: string;
    description?: string;
    status: string;
    photos?: string;
    resolvedAt?: string;
    createdAt?: string;
}

export interface Prescription {
    id: string;
    alertId: string;
    expertId: string;
    chemicalName: string;
    chemicalType?: string;
    dose: string;
    dilutionRatio?: string;
    applicationMethod: string;
    applicationTiming?: string;
    preHarvestInterval?: string;
    safetyPrecautions?: string;
    fmInstructions?: string;
    isacknowledged?: boolean;
    acknowledgedAt?: string;
    createdAt?: string;
}

export interface FinanceSummary {
    totalCosts: number;
    costByType: Record<string, number>;
    landOwnerShare70: number;
    farmCount: number;
}
