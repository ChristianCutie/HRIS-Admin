

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

export interface CreateJobPostingRequest {
    title: string;
    department_id: string;
    location?: string;
    work_type?: string;
    employment_type?: string;
    salary_range?: string;
    description?: string;
    status?: 'draft' | 'active' | 'closed';
    posted_date?: string;
    deadline_date?: string;
}


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
    status: 'scheduled' | 'completed' | 'cancelled';
    notes: string;
    location?: string;
    meetingLink?: string;
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
