// In your types file
export interface Applicant {
    id: string;
    name: string;
    email: string;
    phone: string;
    experience: string;
    stage: string;
    position: string;
    source: string;
    appliedDate: string;
    rating: number;
    notes: string;
    resume: string;
    skills: string[];
    is_archived: boolean;
    job_posting?: {
        id: string;
        title: string;
        department: string;
        location: string;
    };
    created_at: string;
    updated_at: string;
}

export interface Candidate extends Applicant {
}

export interface BackendApplicant {
    id: number;
    name: string;
    email: string;
    phone: string;
    experience: string;
    stage: 'new_application' | 'screening' | 'phone_screening' | 'assessment' | 'technical_interview' | 'final_interview' | 'offer_extended' | 'hired';
    position: string;
    source: string;
    applied_date: string;
    rating: number;
    notes: string;
    resume: string;
    skills: string[];
    is_archived: boolean;
    job_posting?: {
        id: number;
        title: string;
        department: {
            department_name: string;
        };
        location: string;
    };
    created_at: string;
    updated_at: string;
}


export interface TransformedJobPosting {
    id: string;
    title: string;
    department: string;
    location: string;
    type: string | null;
    salary: string;
    status: string;
    applications: number;
    posted: string;
    deadline: string;
    description: string;
    requirements: string[];
    responsibilities: string;
}

export interface RecruitmentStage {
    id: string;
    label: string;
    color: string;
    icon: any;
}

export interface RecruitmentMetric {
    label: string;
    value: number | string;
    change: string;
    icon: any;
}




export interface AttendanceRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    date: string;
    clockIn: string;
    clockOut: string;
    checkIn: string | null;
    checkOut: string | null;
    hoursWorked: number;
    status: 'present' | 'absent' | 'late' | 'half-day';
}

// RECRUITMENT
export interface JobPosting {
    id: string | null;
    title: string | null;
    department: string | null;
    location: string | null;
    type: 'Full-time' | 'Part-time' | 'Contract' | 'Intern' | null;
    salary: string | null;
    status: 'active' | 'draft' | 'closed' | null;
    applications: number | null;
    posted: string | null;
    deadline: string | null;
    description: string | null;
    requirements: string[] | null | any;
    responsibilities?: string | null;
}


export interface Candidate {
    id: string;
    name: string;
    email: string;
    phone: string;
    position: string;
    stage: string;
    source: string;
    appliedDate: string;
    experience: string;
    skills: string[];
    resume: string;
    notes: string;
    rating: number;
    jobId?: string;
}

export interface Interview {
    id: string;
    candidateId: string;
    candidateName: string;
    position: string;
    interviewer: string;
    date: string;
    time: string;
    type: any;
    status: 'scheduled' | 'completed' | 'cancelled' | 'noshow';
    notes: string;
    location?: string;
    meetingLink?: string;
    created_at: string;
    updated_at: string;
}

export interface HiredEmployee {
    id: string;
    name: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    hireDate: string;
    startDate: string;
    salary: string;
    source: string;
    experience: string;
    skills: string[];
    employmentType: 'Full-time' | 'Part-time' | 'Contract';
    description: string;
    manager?: string;
}






export interface LeaveRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    leaveType: 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity';
    startDate: string;
    endDate: string;
    days: number;
    status: 'pending' | 'approved' | 'rejected';
    reason: string;
    appliedDate: string;
}

export interface PayrollSummary {
    employeeId: string;
    employeeName: string;
    baseSalary: number;
    overtime: number;
    bonuses: number;
    deductions: number;
    netPay: number;
    payPeriod: string;
}


// EMPLOYEE SECTION TYPES
export interface Department {
    id: number;
    department_name: string;
}

export interface PositionType {
    id: number;
    title: string;
    position_name: any;
}

export interface Employee {
    id: number;
    employee_id?: string;
    first_name: string;
    last_name: string;
    name: string;
    email: string;
    phone: string | null;
    department_id: number | null;
    position_id: number | null;
    base_salary: number;
    hire_date: string;
    is_active: boolean;
    manager_id: number | null;
    department?: Department;
    position?: PositionType;
    manager?: Employee;

}

export interface ApiResponse<T> {
    isSuccess: boolean;
    message: string;
    data: T;
}


// Define types
export type JobStatus = 'draft' | 'active' | 'closed';

export interface NewJobData {
    title: string;
    department_id: string;
    work_type: string;
    employment_type: string;
    location: string;
    salary_range: string;
    status: JobStatus;
    description: string;
    posted_date: string;
    deadline_date: string;
}