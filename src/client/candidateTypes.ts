export interface Department {
    id: string;
    department_name: string;
}

export interface WorkLocation {
    id: string;
    location_name: string;
}

export interface JobPosting {
    id: string;
    title: string;
    department_id: string;
    department?: Department;
    location: string;
    salary_range: string;
    status: string;
    is_archived: boolean;
    created_at: string;
    description?: string;
    responsibilities?: string[];
    requirements?: string[];
    benefits?: string[];
    type?: string;
    remote?: string;
    featured?: boolean;
}

export interface PaginationInfo {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

export interface JobPostingsResponse {
    isSuccess: boolean;
    message: string;
    job_postings: JobPosting[];
    pagination: PaginationInfo;
}

export interface ApplicationFormData {
    job_posting_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    resume: File | null;
    cover_letter: string;
    linkedin_profile: string;
    portfolio_website: string;
    salary_expectations: string;
    available_start_date: string;
    experience_years: number | string;
}

export interface ApplicationResponse {
    isSuccess: boolean;
    message: string;
    data?: any;
}