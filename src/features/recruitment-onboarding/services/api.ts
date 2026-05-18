import axios from 'axios';

const API_BASE_URL = 'https://api-hris.slarenasitsolutions.com/public/api';


// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    };
};

export const applicantAPI = {
    // Get all applicants
    getAll: () => axios.get(`${API_BASE_URL}/applicants`, { headers: getAuthHeaders() }),

    // Get applicant by ID
    getById: (id: string) => axios.get(`${API_BASE_URL}/applicants/${id}`, { headers: getAuthHeaders() }),

    // Move applicant to different stage
    moveStage: (id: string, stage: string) =>
        axios.post(`${API_BASE_URL}/applicants/${id}/move`, { stage }, { headers: getAuthHeaders() }),

    // Hire applicant
    hire: (id: string) => axios.post(`${API_BASE_URL}/applicants/${id}/hire`, {}, { headers: getAuthHeaders() }),

    // Get hired applicants
    getHired: () => axios.get(`${API_BASE_URL}/hired`, { headers: getAuthHeaders() }),

};

export const trainingAPI = {
    // Get all lessons
    getLessons: () => axios.get(`${API_BASE_URL}/training/lessons`, { headers: getAuthHeaders() }),

    // Get assessment tracking data
    getAssessmentTracking: () => axios.get(`${API_BASE_URL}/assessments/tracking`, { headers: getAuthHeaders() }),

    // Get a full lesson
    getFullLesson: (id: number) => axios.get(`${API_BASE_URL}/training/lessons/${id}`, { headers: getAuthHeaders() }),

    // Update a full lesson
    updateFullLesson: (id: number, data: any) => axios.post(`${API_BASE_URL}/training/update/full-lesson/${id}`, data, { headers: getAuthHeaders() }),

    // Get lesson structure
    getLessonStructure: (id: number) => axios.get(`${API_BASE_URL}/training/lessons/${id}/structure`, { headers: getAuthHeaders() }),
};


export const interviewAPI = {
    // Schedule a new interview
    schedule: (applicantId: string, data: any) =>
        axios.post(`${API_BASE_URL}/applicants/${applicantId}/schedule-interview`, data, { headers: getAuthHeaders() }),

    // Get all interviews
    getAll: () =>
        axios.get(`${API_BASE_URL}/interviews`, { headers: getAuthHeaders() }),

    // Get interviews for a specific applicant
    getForApplicant: (applicantId: string) =>
        axios.get(`${API_BASE_URL}/applicants/${applicantId}/interviews`, { headers: getAuthHeaders() }),

    // Submit feedback for an interview
    submitFeedback: (id: string, data: any) =>
        axios.post(`${API_BASE_URL}/interviews/${id}/feedback`, data, { headers: getAuthHeaders() }),

    // Update an interview
    update: (id: string, data: any) =>
        axios.post(`${API_BASE_URL}/interviews/${id}/update`, data, { headers: getAuthHeaders() }),

    // Cancel an interview
    cancel: (id: string) =>
        axios.post(`${API_BASE_URL}/interviews/${id}/cancel`, {}, { headers: getAuthHeaders() }),

    // Mark interview as no-show
    noshow: (id: string) =>
        axios.post(`${API_BASE_URL}/interviews/${id}/noshow`, {}, { headers: getAuthHeaders() }),
};