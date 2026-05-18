
// Types
export interface PayrollEmployeeData {
    employee_id: string;
    days_worked: number;
    overtime_hours: number;
    late_deductions: number;
    absences: number;
}

export interface PayrollPeriod {
    id: string;
    period_name: string;
    pay_date: string;
    cutoff_start_date: string;
    cutoff_end_date: string;
    status: 'draft' | 'processed';
    created_at?: string;
    updated_at?: string;
    payroll_records?: PayrollRecord[];
}

export interface PayrollRecord {
    id: string;
    employee_id: string;
    employee?: Employee;
    daily_rate: number;
    days_worked: number;
    overtime_hours: number;
    absences: number;
    late_deductions: number;
    gross_pay: number;
    total_deductions: number;
    net_pay: number;
    deductions?: PayrollDeduction[]
    summary: any;

}

export interface Employee {
    id: string;
    first_name: string;
    last_name: string;
    department?: string;
    position?: string;
    base_salary: number;
    employment_status?: string;
}

export interface PayrollDeduction {
    id: string;
    deduction_name: string;
    deduction_amount: number;
    benefitType?: {
        benefit_name: string;
    };
}

export interface PayrollSummary {
    total_periods: number;
    processed: number;
    drafts: number;
    active_employees: number;
}