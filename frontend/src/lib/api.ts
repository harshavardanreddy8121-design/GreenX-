/**
 * Typed API client using fetch against the Java Spring Boot backend.
 * All endpoints match the controllers created in the Java backend.
 * Token is read from localStorage (`greenx_token`) and sent automatically.
 */

import { API_BASE_URL } from './backend';

// Remove trailing slashes for consistent URL construction
const BASE = API_BASE_URL.replace(/\/+$/, '');

// Always log the base URL so it is visible in production DevTools.
console.log('[GreenX] api.ts — BASE URL:', BASE);

const TOKEN_KEY = 'greenx_token';
const COOKIE_NAME = 'greenx_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function setCookieValue(value: string) {
    if (typeof document === 'undefined') return;
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=None; Secure`; 
}

function clearCookieValue() {
    if (typeof document === 'undefined') return;
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=None; Secure`;
}

export function getToken(): string | null {
    const fromStorage = localStorage.getItem(TOKEN_KEY);
    if (fromStorage) return fromStorage;

    if (typeof document === 'undefined') return null;
    const cookieMatch = document.cookie.split('; ').find((cookie) => cookie.startsWith(`${COOKIE_NAME}=`));
    if (!cookieMatch) return null;
    return decodeURIComponent(cookieMatch.split('=')[1] || '');
}

export function setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    setCookieValue(token);
    // Sync with javaApi client token so both clients are authenticated
    localStorage.setItem('javaApiToken', token);
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    clearCookieValue();
    localStorage.removeItem('javaApiToken');
}

// Track whether a token refresh is already in progress to avoid loops
let _refreshing = false;
// Debounce guard: prevent multiple simultaneous session-expiry redirects
let _redirecting = false;

async function request<T>(
    path: string,
    method = 'GET',
    body?: unknown,
    isFormData = false,
    _isRetry = false
): Promise<T> {
    const headers: Record<string, string> = {};
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData && body) headers['Content-Type'] = 'application/json';

    const fullUrl = `${BASE}${path}`;
    console.log(`[GreenX] ${method} ${fullUrl}`);

    let res: Response;
    try {
        res = await fetch(fullUrl, {
            method,
            headers,
            body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
        });
    } catch (networkErr) {
        const errMsg =
            networkErr instanceof Error ? networkErr.message : String(networkErr);

        // A TypeError with "Failed to fetch" almost always means a CORS
        // preflight rejection or the server being unreachable.
        const isCors =
            networkErr instanceof TypeError &&
            (errMsg.includes('Failed to fetch') ||
                errMsg.includes('NetworkError') ||
                errMsg.includes('CORS'));

        console.error(
            `[GreenX] ${isCors ? 'CORS/Network' : 'Network'} error on ${method} ${fullUrl}:`,
            errMsg,
            networkErr
        );

        if (isCors) {
            throw new Error(
                `Network error — CORS or connectivity issue reaching ${fullUrl}. ` +
                `Check that the backend allows this origin and is reachable. (${errMsg})`
            );
        }

        throw new Error(
            errMsg
                ? `Network error — ${errMsg}`
                : 'Network error — unable to reach the server. Please check your connection.'
        );
    }

    if (res.status === 401) {
        // Attempt a single token refresh before giving up
        if (!_isRetry && !_refreshing && path !== '/auth/login' && path !== '/auth/refresh') {
            _refreshing = true;
            try {
                const refreshRes = await fetch(`${BASE}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (refreshRes.ok) {
                    const refreshText = await refreshRes.text();
                    const refreshJson = refreshText ? JSON.parse(refreshText) : {};
                    const newToken: string | undefined =
                        refreshJson?.token ?? refreshJson?.data?.token;
                    if (newToken) {
                        setToken(newToken);
                        _refreshing = false;
                        return request<T>(path, method, body, isFormData, true);
                    }
                }
            } catch {
                // Refresh failed — fall through to clear and redirect
            } finally {
                _refreshing = false;
            }
        }
        clearToken();
        if (!_redirecting) {
            _redirecting = true;
            setTimeout(() => {
                window.location.href = '/login';
                _redirecting = false;
            }, 100);
        }
        throw new Error('Session expired — please log in again');
    }

    if (res.status === 403) {
        throw new Error('Access denied — you do not have permission to perform this action');
    }

    const text = await res.text();
    let json: unknown;
    try {
        json = text ? JSON.parse(text) : {};
    } catch {
        throw new Error(`Invalid response from server (HTTP ${res.status})`);
    }

    if (!res.ok) {
        const errJson = json as Record<string, unknown>;
        throw new Error(
            (errJson?.error as string) ||
            (errJson?.message as string) ||
            `HTTP ${res.status}`
        );
    }

    // Backend wraps everything in { success, data, error }
    if (json && typeof json === 'object' && 'success' in (json as object)) {
        const wrapped = json as { success: boolean; data?: T; error?: string };
        if (!wrapped.success) throw new Error(wrapped.error || 'Request failed');
        return wrapped.data as T;
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

    getLandRegistrations: (status?: string, phone?: string, location?: string) => {
        const params = new URLSearchParams();
        if (status)   params.set('status', status);
        if (phone)    params.set('phone', phone);
        if (location) params.set('location', location);
        const qs = params.toString();
        return request<LandRegistrationSubmission[]>(`/admin/land-registrations${qs ? `?${qs}` : ''}`);
    },

    getLandRegistration: (id: string) =>
        request<LandRegistrationSubmission>(`/admin/land-registrations/${id}`),

    updateSubmissionStatus: (id: string, status: string) =>
        request<LandRegistrationSubmission>(`/admin/land-registrations/${id}/status`, 'PUT', { status }),

    addSubmissionNotes: (id: string, notes: string) =>
        request<LandRegistrationSubmission>(`/admin/land-registrations/${id}/notes`, 'PUT', { notes }),

    deleteSubmission: (id: string) =>
        request<string>(`/admin/land-registrations/${id}`, 'DELETE'),
};

// ─── LAND REGISTRATION (public) ──────────────────────────────────────────────

export const landRegistration = {
    submit: (data: {
        fullName: string;
        phone: string;
        location: string;
        landSize: string;
        message?: string;
    }) => request<LandRegistrationSubmission>('/land-registration/submit', 'POST', data),
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

    // ── Dashboard module APIs ──────────────────────────────────────────────

    getDashboardOverview: () =>
        request<DashboardOverview>('/landowner/dashboard/overview'),

    getDashboardSoilSamples: (farmId: string) =>
        request<DashboardSoilSamples>(`/landowner/dashboard/farms/${farmId}/soil-samples`),

    getDashboardSoilReports: (farmId: string) =>
        request<DashboardSoilReport[]>(`/landowner/dashboard/farms/${farmId}/soil-reports`),

    getDashboardCropSuggestions: (farmId: string) =>
        request<DashboardCropSuggestion[]>(`/landowner/dashboard/farms/${farmId}/crop-suggestions`),

    getDashboardSoilTimeline: (farmId: string) =>
        request<DashboardSoilTimeline>(`/landowner/dashboard/farms/${farmId}/soil-sample-timeline`),

    getDashboardFinanceSummary: (farmId: string) =>
        request<DashboardFinanceSummary>(`/landowner/dashboard/farms/${farmId}/finance-summary`),
};

// ─── AI ──────────────────────────────────────────────────────────────────────

export const ai = {
    /** POST /api/ai/ask — conversational AI query */
    ask: (question: string, sessionId?: string, userId?: string, farmId?: string) =>
        request<{ answer: string; sessionId: string; modelUsed: string }>(
            '/ai/ask', 'POST', { question, sessionId, userId, farmId }
        ),

    /** POST /api/ai/analyze-farm — comprehensive farm analysis */
    analyzeFarm: (farmData: Record<string, unknown>) =>
        request<Record<string, unknown>>('/ai/analyze-farm', 'POST', farmData),

    /** POST /api/ai/analyze — AI agent analysis (crop health, alerts, recommendations) */
    analyze: (farmData: Record<string, unknown>) =>
        request<Record<string, unknown>>('/ai/analyze', 'POST', farmData),

    /** POST /api/ai/crop-recommendation — crop suggestions */
    cropRecommendation: (input: Record<string, unknown>) =>
        request<Record<string, unknown>>('/ai/crop-recommendation', 'POST', input),

    /** POST /api/ai/pest-prediction — pest and disease risk */
    pestPrediction: (input: Record<string, unknown>) =>
        request<Record<string, unknown>>('/ai/pest-prediction', 'POST', input),

    /** POST /api/ai/resource-optimization — water/fertilizer/labor optimization */
    resourceOptimization: (input: Record<string, unknown>) =>
        request<Record<string, unknown>>('/ai/resource-optimization', 'POST', input),

    /** GET /api/ai/insights — active AI insights for a farm or user */
    getInsights: (farmId?: string, userId?: string) => {
        const params = new URLSearchParams();
        if (farmId) params.set('farmId', farmId);
        if (userId) params.set('userId', userId);
        const qs = params.toString();
        return request<Record<string, unknown>[]>(`/ai/insights${qs ? `?${qs}` : ''}`);
    },

    /** POST /api/ai/generate-report — comprehensive farm management report */
    generateReport: (farmData: Record<string, unknown>) =>
        request<Record<string, unknown>>('/ai/generate-report', 'POST', farmData),

    /** GET /api/ai/conversation/:sessionId — conversation history */
    getConversation: (sessionId: string) =>
        request<Record<string, unknown>[]>(`/ai/conversation/${sessionId}`),

    /** GET /api/ai/status — AI service status (public, no auth required) */
    getStatus: () =>
        request<Record<string, unknown>>('/ai/status'),
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
    landOwnerShare80: number;
    farmCount: number;
}

export interface LandRegistrationSubmission {
    id: string;
    fullName: string;
    phone: string;
    location: string;
    landSize: string;
    message?: string;
    status: string;
    submittedAt?: string;
    notes?: string;
    createdAt?: string;
}

// ─── DASHBOARD MODULE TYPES ───────────────────────────────────────────────────

export interface DashboardOverview {
    totalLandArea: number;
    totalInputCosts: number;
    totalSoilSamples: number;
    farmsCount: number;
    activeStatus: string;
    lastUpdate: string;
}

export interface DashboardSoilSampleItem {
    id: string;
    sampleCode: string;
    collectionDate?: string;
    status: string;
    collectedBy?: string;
    reportId?: string;
}

export interface DashboardSoilSamples {
    totalSamples: number;
    samples: DashboardSoilSampleItem[];
}

export interface DashboardSoilReport {
    id: string;
    submittedDate?: string;
    expertName?: string;
    ph?: number;
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
    organicMatter?: number;
    moisture?: number;
    ecDsM?: number;
    zincPpm?: number;
    boronPpm?: number;
    sulphurPpm?: number;
    ironPpm?: number;
    notes?: string;
    overallRating?: string;
    status: string;
    farmId: string;
}

export interface DashboardCropSuggestion {
    id: string;
    cropName: string;
    variety?: string;
    expectedYieldMin?: number;
    expectedYieldMax?: number;
    yieldUnit?: string;
    profitPerAcre?: number;
    inputCostEstimate?: number;
    durationDays?: number;
    suitabilityScore?: number;
    reasoning?: string;
    expertName?: string;
    submittedDate?: string;
    selected: boolean;
    season?: string;
    farmId: string;
}

export interface DashboardTimelineStage {
    stage: string;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
    date?: string;
    description: string;
}

export interface DashboardSoilTimeline {
    timeline: DashboardTimelineStage[];
    currentStage: string;
}

export interface DashboardFinanceSummary {
    totalInvestment: number;
    expenses: Record<string, number>;
    revenue: number;
    profitLoss: number;
    profitMargin: number;
    budgetUsed: number;
    budgetLimit: number;
    lastUpdated: string;
}
