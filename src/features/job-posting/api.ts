import axios from 'axios';

const API_BASE_URL = 'https://api-hris.slarenasitsolutions.com/public/api';



export interface JobPosting {
    id: string;
    title: string;
    department_id: string;
    department?: {
        id: string;
        department_name: string;
        description?: string;
    };
    location: string;
    work_type: string;
    employment_type: string;
    salary_range: string;
    description: string;
    status: 'draft' | 'active' | 'closed';
    posted_date: string;
    deadline_date: string;
    is_archived: boolean;
    created_at?: string;
    updated_at?: string;
    applications_count?: number;
}

export interface CreateJobPostingRequest {
    title: string;
    department_id: string;
    work_type: string;
    employment_type: string;
    location?: string;
    salary_range?: string;
    description?: string;
    status?: 'draft' | 'active' | 'closed';
    posted_date?: string;
    deadline_date?: string;
}

export interface UpdateJobPostingRequest extends Partial<CreateJobPostingRequest> { }

export interface JobPostingResponse {
    isSuccess: boolean;
    message: string;
    data?: JobPosting;
    job_postings?: JobPosting[];
    pagination?: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
}

export interface JobPostingFilters {
    search?: string;
    department_id?: string;
    status?: string;
    per_page?: number;
    page?: number;
}

// Job Posting API
export const jobPostingAPI = {
    // Get all job postings with optional filters
    getAll: (params?: JobPostingFilters) =>
        axios.get<JobPostingResponse>(`${API_BASE_URL}/job-postings`, { params }),

    // Create a new job posting
    create: (data: CreateJobPostingRequest) =>
        axios.post<JobPostingResponse>(`${API_BASE_URL}/create/job-postings`, data),

    // Update a job posting
    update: (id: string, data: UpdateJobPostingRequest) =>
        axios.post<JobPostingResponse>(`${API_BASE_URL}/update/job-postings/${id}`, data),

    // Archive a job posting
    archive: (id: string) =>
        axios.post<JobPostingResponse>(`${API_BASE_URL}/archive/job-postings/${id}`),
};