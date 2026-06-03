// types/employee.ts

// Base API Response
export interface ApiResponse<T> {
    isSuccess: boolean;
    message: string;
    data?: T;
    employees?: T[];
    summary?: Summary;
    pagination?: Pagination;
}

// Summary Interface
export interface Summary {
    total_employees: number;
    active_employees: number;
    inactive_employees: number;
}

// Pagination Interface
export interface Pagination {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

// Department Interface
export interface Department {
    id: number;
    department_name: string;
    description: string;
    head_id: number;
    is_active: boolean;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

// Position Interface
export interface PositionType {
    id: number;
    position_name: string;
    description: string;
    department_id: number | null;
    is_active: boolean;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

// Educational Background Interfaces
export interface EducationalBackground {
    // Elementary
    elementary_school_name?: string | null;
    elementary_degree_course?: string | null;
    elementary_year_graduated?: string | null;
    elementary_highest_level?: string | null;
    elementary_inclusive_dates?: string | null;
    elementary_honors?: string | null;

    // Secondary
    secondary_school_name?: string | null;
    secondary_degree_course?: string | null;
    secondary_year_graduated?: string | null;
    secondary_highest_level?: string | null;
    secondary_inclusive_dates?: string | null;
    secondary_honors?: string | null;

    // Vocational
    vocational_school_name?: string | null;
    vocational_degree_course?: string | null;
    vocational_year_graduated?: string | null;
    vocational_highest_level?: string | null;
    vocational_inclusive_dates?: string | null;
    vocational_honors?: string | null;

    // College
    college_school_name?: string | null;
    college_degree_course?: string | null;
    college_year_graduated?: string | null;
    college_highest_level?: string | null;
    college_inclusive_dates?: string | null;
    college_honors?: string | null;

    // Graduate
    graduate_school_name?: string | null;
    graduate_degree_course?: string | null;
    graduate_year_graduated?: string | null;
    graduate_highest_level?: string | null;
    graduate_inclusive_dates?: string | null;
    graduate_honors?: string | null;
}

// Contact Information Interfaces
export interface ContactInformation {
    // Personal Contact
    email: string;
    phone?: string | null;

    // Residential Address
    residential_address?: string | null;
    residential_zipcode?: string | null;
    residential_tel_no?: string | null;

    // Permanent Address
    permanent_address?: string | null;
    permanent_zipcode?: string | null;
    permanent_tel_no?: string | null;

    // Emergency Contact
    emergency_contact_name?: string | null;
    emergency_contact_number?: string | null;
    emergency_contact_relation?: string | null;
}

// Family Information Interfaces
export interface FamilyInformation {
    // Spouse Information
    spouse_name?: string | null;
    spouse_occupation?: string | null;
    spouse_employer?: string | null;
    spouse_business_address?: string | null;
    spouse_tel_no?: string | null;

    // Parents Information
    father_name?: string | null;
    mother_name?: string | null;
    parents_address?: string | null;
}

// Personal Information Interfaces
export interface PersonalInformation {
    // Basic Information
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    suffix?: string | null;

    // Personal Details
    date_of_birth?: string | null | any;
    place_of_birth?: string | null;
    sex?: string | null;
    civil_status?: string | null;

    // Physical Attributes
    height_m?: any;
    weight_kg?: any;
    blood_type?: string | null;
    citizenship?: string | null;
    salary_mode?: string | null;
}

// Government IDs Interface
export interface GovernmentIDs {
    gsis_no?: string | null;
    pagibig_no?: string | null;
    philhealth_no?: string | null;
    sss_no?: string | null;
    tin_no?: string | null;
    agency_employee_no?: string | null;
}

// Employment Information Interface
export interface EmploymentInformation {
    // Employment Details
    department_id: number;
    position_id: number;
    night_hours: number;
    employment_type_id?: number | null;
    manager_id?: number | null;
    supervisor_id?: number | null;

    // Compensation
    base_salary: string | number;  //daily rate
    base_pay: string | number;
    hire_date: string;
    shift_start: string | any;
    shift_end: string | any;

    // Status
    is_active: boolean;
    is_archived: number;
    is_regular?: number;
    role: string;

    // Documents
    files: any;
    resume?: string | null;
    "201_file"?: string | null;
}

// System Information Interface
export interface SystemInformation {
    id: number;
    employee_id?: string | null;
    created_at: string;
    updated_at: string;
}
export interface AllowanceType {
    id: number;
    type_name: string;
    description?: string;
    amount: number | string;


}

// Main Employee Interface combining all aspects
export interface Employee extends
    PersonalInformation,
    ContactInformation,
    FamilyInformation,
    EducationalBackground,
    GovernmentIDs,
    EmploymentInformation,
    SystemInformation {

    // Nested relationships (from API response)
    department?: Department;
    position?: PositionType;
    manager?: Employee | null;
    supervisor?: Employee | null;
    benefits?: BenefitType[];
    allowances?: AllowanceType[];
    is_interviewer?: number;
}

export interface BenefitType {
    id: number;
    benefit_name: string;
    category: string;
    rate: string;
    description?: string;
    amount: string | number;
}

// Employee Form Data (for create/update operations)
export interface EmployeeFormData {
    // Personal Information
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    email: string;
    phone: string;
    salary_mode: string;
    date_of_birth: string;
    place_of_birth: string;
    sex: string;
    civil_status: string;
    height_m: any;
    weight_kg: any;
    blood_type: string;
    citizenship: string;
    password: string;

    // Government IDs
    gsis_no: string;
    pagibig_no: string;
    philhealth_no: string;
    sss_no: string;
    tin_no: string;
    agency_employee_no: string;

    // Address Information
    residential_address: string;
    residential_zipcode: string;
    residential_tel_no: string;
    permanent_address: string;
    permanent_zipcode: string;
    permanent_tel_no: string;

    // Family Information
    spouse_name: string;
    spouse_occupation: string;
    spouse_employer: string;
    spouse_business_address: string;
    spouse_tel_no: string;
    father_name: string;
    mother_name: string;
    parents_address: string;

    // Emergency Contact
    emergency_contact_name: string;
    emergency_contact_number: string;
    emergency_contact_relation: string;

    // Employment Information
    department_id: string;
    position_id: string;
    employment_type_id: string;
    manager_id: string;
    supervisor_id: string;
    base_salary: string;
    night_rate: string;
    hire_date: string;
    shift_start: string;
    shift_end: string;
    role: string;
    is_active: boolean;

    // Educational Background
    elementary_school_name: string;
    elementary_degree_course: string;
    elementary_year_graduated: string;
    elementary_highest_level: string;
    elementary_inclusive_dates: string;
    elementary_honors: string;

    secondary_school_name: string;
    secondary_degree_course: string;
    secondary_year_graduated: string;
    secondary_highest_level: string;
    secondary_inclusive_dates: string;
    secondary_honors: string;

    vocational_school_name: string;
    vocational_degree_course: string;
    vocational_year_graduated: string;
    vocational_highest_level: string;
    vocational_inclusive_dates: string;
    vocational_honors: string;

    college_school_name: string;
    college_degree_course: string;
    college_year_graduated: string;
    college_highest_level: string;
    college_inclusive_dates: string;
    college_honors: string;

    graduate_school_name: string;
    graduate_degree_course: string;
    graduate_year_graduated: string;
    graduate_highest_level: string;
    graduate_inclusive_dates: string;
    graduate_honors: string;

    benefit_type_ids: any;
    benefits: any;
    allowances: any;
    is_archived: any;
    allowance_type_ids: any;
    is_interviewer: any;
    resume: any;
    "201_file": any[];
}

// Employee Filters
export interface EmployeeFilters {
    search?: string;
    department_id?: number;
    position_id?: number;
    is_active?: boolean;
    employment_type_id?: number;
    manager_id?: number;
}

// Employee List Response
export interface EmployeeListResponse {
    employees: Employee[];
    summary: Summary;
    pagination: Pagination;
}

// Dropdown Options
export interface DropdownOptions {
    departments: Department[];
    positions: PositionType[];
    managers: Employee[];
    employmentTypes: { id: number; name: string }[];
}

// Employee Stats
export interface EmployeeStats {
    total: number;
    active: number;
    inactive: number;
    byDepartment: { department: string; count: number }[];
    byPosition: { position: string; count: number }[];
}

// File Upload Types
export interface FileUpload {
    file: File;
    type: 'resume' | '201_file' | 'profile_picture';
    employee_id?: number;
}

// Bulk Operations
export interface BulkOperation {
    employee_ids: number[];
    action: 'activate' | 'deactivate' | 'archive' | 'delete';
}

// API Error Response
export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
    status: number;
}

// Hook Return Types
export interface UseEmployeesReturn {
    employees: Employee[];
    loading: boolean;
    error: string | null;
    filters: EmployeeFilters;
    pagination: Pagination;
    summary: Summary;
    fetchEmployees: (page?: number, filters?: EmployeeFilters) => Promise<void>;
    createEmployee: (data: EmployeeFormData) => Promise<Employee>;
    updateEmployee: (id: number, data: EmployeeFormData) => Promise<Employee>;
    deleteEmployee: (id: number) => Promise<void>;
    archiveEmployee: (id: number) => Promise<void>;
    restoreEmployee: (id: number) => Promise<void>;
}

// Component Props
export interface EmployeeTableProps {
    employees: Employee[];
    loading?: boolean;
    onEdit: (employee: Employee) => void;
    onView: (employee: Employee) => void;
    onArchive: (employee: Employee) => void;
    selectedEmployees?: number[];
    onSelectionChange?: (ids: number[]) => void;
}

export interface EmployeeFormProps {
    employee?: Employee | null;
    departments: Department[];
    positions: PositionType[];
    managers: Employee[];
    onSubmit: (data: EmployeeFormData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export interface EmployeeDetailsProps {
    employee: Employee;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (employee: Employee) => void;
}

export interface EmployeeCardProps {
    employee: Employee;
    compact?: boolean;
    onEdit?: (employee: Employee) => void;
    onView?: (employee: Employee) => void;
}

// Utility Types
export type EmployeeStatus = 'active' | 'inactive' | 'archived';
export type EmployeeRole = 'employee' | 'manager' | 'admin' | 'supervisor';
export type SortField = keyof Employee;
export type SortOrder = 'asc' | 'desc';

// Search and Sort Types
export interface EmployeeSearchOptions {
    query: string;
    fields: (keyof Employee)[];
}

export interface EmployeeSortOptions {
    field: SortField;
    order: SortOrder;
}

// Chart Data Types
export interface DepartmentDistribution {
    department: string;
    count: number;
    percentage: number;
}

export interface HiringTrend {
    month: string;
    hires: number;
}


export * from './Employees';