import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    User,
    IdCard,
    Home,
    Users,
    GraduationCap,
    Briefcase,
    DollarSign,
    CheckCircle2,
    ChevronRight,
    ChevronLeft
} from "lucide-react";
import api from '@/utils/axios';

interface CreateEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEmployeeCreated: () => void;
    departments: any[];
    positions: any[];
    benefitTypes: any[];
    allowanceTypes: any[];
    managers: any[];
    employmentTypes: any[];
}

interface EmployeeFormData {
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    email: string;
    phone: string;
    date_of_birth: string;
    place_of_birth: string;
    sex: string;
    civil_status: string;
    height_m: string;
    weight_kg: string;
    blood_type: string;
    citizenship: string;
    gsis_no: string;
    pagibig_no: string;
    philhealth_no: string;
    sss_no: string;
    tin_no: string;
    agency_employee_no: string;
    residential_address: string;
    residential_zipcode: string;
    residential_tel_no: string;
    permanent_address: string;
    permanent_zipcode: string;
    permanent_tel_no: string;
    spouse_name: string;
    spouse_occupation: string;
    spouse_employer: string;
    spouse_business_address: string;
    spouse_tel_no: string;
    father_name: string;
    mother_name: string;
    parents_address: string;
    elementary_school_name: string;
    elementary_year_graduated: string;
    secondary_school_name: string;
    secondary_year_graduated: string;
    college_school_name: string;
    college_year_graduated: string;
    department_id: string;
    position_id: string;
    employment_type_id: string;
    manager_id: string;
    base_salary: string;
    hire_date: string;
    emergency_contact_name: string;
    emergency_contact_number: string;
    emergency_contact_relation: string;
    benefit_type_ids: string[];
    allowance_type_ids: string[];
    password: string;
    role: string;
    is_interviewer: boolean;
    resume: File | null;
    '201_file': File[];
}

const CreateEmployeeModal: React.FC<CreateEmployeeModalProps> = ({
    isOpen,
    onClose,
    onEmployeeCreated,
    departments,
    positions,
    benefitTypes,
    allowanceTypes,
    managers,
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<EmployeeFormData>({
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        email: '',
        phone: '',
        date_of_birth: '',
        place_of_birth: '',
        sex: '',
        civil_status: '',
        height_m: '',
        weight_kg: '',
        blood_type: '',
        citizenship: '',
        gsis_no: '',
        pagibig_no: '',
        philhealth_no: '',
        sss_no: '',
        tin_no: '',
        agency_employee_no: '',
        residential_address: '',
        residential_zipcode: '',
        residential_tel_no: '',
        permanent_address: '',
        permanent_zipcode: '',
        permanent_tel_no: '',
        spouse_name: '',
        spouse_occupation: '',
        spouse_employer: '',
        spouse_business_address: '',
        spouse_tel_no: '',
        father_name: '',
        mother_name: '',
        parents_address: '',
        elementary_school_name: '',
        elementary_year_graduated: '',
        secondary_school_name: '',
        secondary_year_graduated: '',
        college_school_name: '',
        college_year_graduated: '',
        department_id: '',
        position_id: '',
        employment_type_id: '',
        manager_id: '',
        base_salary: '',
        hire_date: '',
        emergency_contact_name: '',
        emergency_contact_number: '',
        emergency_contact_relation: '',
        benefit_type_ids: [],
        allowance_type_ids: [],
        password: '',
        role: 'employee',
        is_interviewer: false,
        resume: null,
        '201_file': [],
    });

    const steps = [
        { id: 'personal', label: 'Personal', icon: User },
        { id: 'government', label: 'Government IDs', icon: IdCard },
        { id: 'address', label: 'Address', icon: Home },
        { id: 'family', label: 'Family', icon: Users },
        { id: 'education', label: 'Education', icon: GraduationCap },
        { id: 'employment', label: 'Employment', icon: Briefcase },
        { id: 'benefits', label: 'Benefits', icon: DollarSign },
        { id: 'files', label: 'Files', icon: FileText },
    ];

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayChange = (field: 'benefit_type_ids' | 'allowance_type_ids', value: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: checked
                ? [...prev[field], value]
                : prev[field].filter(item => item !== value)
        }));
    };

    const handleFileChange = (field: 'resume' | '201_file', files: FileList | null) => {
        if (!files) return;
        if (field === 'resume') {
            setFormData(prev => ({ ...prev, resume: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, '201_file': Array.from(files) }));
        }
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            const submitData = new FormData();

            Object.keys(formData).forEach(key => {
                const value = formData[key as keyof EmployeeFormData];
                if (key === 'resume' && value) {
                    submitData.append('resume', value as File);
                } else if (key === '201_file' && Array.isArray(value)) {
                    (value as File[]).forEach(file => submitData.append('201_file[]', file));
                } else if (Array.isArray(value)) {
                    value.forEach(item => submitData.append(`${key}[]`, item));
                } else if (typeof value === 'boolean') {
                    submitData.append(key, value ? '1' : '0');
                } else if (value !== null && value !== undefined) {
                    submitData.append(key, value as string);
                }
            });

            const token = localStorage.getItem('token');
            const response = await api.post('/create/employees', submitData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.data.isSuccess) {
                onEmployeeCreated();
                onClose();
                setFormData({
                    first_name: '', middle_name: '', last_name: '', suffix: '', email: '', phone: '',
                    date_of_birth: '', place_of_birth: '', sex: '', civil_status: '', height_m: '', weight_kg: '',
                    blood_type: '', citizenship: '', gsis_no: '', pagibig_no: '', philhealth_no: '', sss_no: '',
                    tin_no: '', agency_employee_no: '', residential_address: '', residential_zipcode: '',
                    residential_tel_no: '', permanent_address: '', permanent_zipcode: '', permanent_tel_no: '',
                    spouse_name: '', spouse_occupation: '', spouse_employer: '', spouse_business_address: '',
                    spouse_tel_no: '', father_name: '', mother_name: '', parents_address: '',
                    elementary_school_name: '', elementary_year_graduated: '', secondary_school_name: '',
                    secondary_year_graduated: '', college_school_name: '', college_year_graduated: '',
                    department_id: '', position_id: '', employment_type_id: '', manager_id: '', base_salary: '',
                    hire_date: '', emergency_contact_name: '', emergency_contact_number: '',
                    emergency_contact_relation: '', benefit_type_ids: [], allowance_type_ids: [], password: '',
                    role: 'employee', is_interviewer: false, resume: null, '201_file': [],
                });
                setCurrentStep(0);
            } else {
                throw new Error(response.data.message);
            }
        } catch (error: any) {
            console.error('Error creating employee:', error);
            alert(error.response?.data?.message || 'Failed to create employee');
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => currentStep < steps.length - 1 && setCurrentStep(currentStep + 1);
    const prevStep = () => currentStep > 0 && setCurrentStep(currentStep - 1);

    const renderPersonalInfo = () => (
        <div className="space-y-4">
            <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                <p className="text-slate-600 text-sm">Basic personal details</p>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm">First Name *</Label>
                            <Input
                                value={formData.first_name}
                                onChange={(e) => handleInputChange('first_name', e.target.value)}
                                required
                                placeholder="First name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">Last Name *</Label>
                            <Input
                                value={formData.last_name}
                                onChange={(e) => handleInputChange('last_name', e.target.value)}
                                required
                                placeholder="Last name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">Middle Name</Label>
                            <Input
                                value={formData.middle_name}
                                onChange={(e) => handleInputChange('middle_name', e.target.value)}
                                placeholder="Middle name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">Suffix</Label>
                            <Input
                                value={formData.suffix}
                                onChange={(e) => handleInputChange('suffix', e.target.value)}
                                placeholder="Jr., Sr."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">Email *</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                required
                                placeholder="email@company.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">Phone</Label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                placeholder="Phone number"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">Date of Birth</Label>
                            <Input
                                type="date"
                                value={formData.date_of_birth}
                                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">Gender</Label>
                            <select
                                value={formData.sex}
                                onChange={(e) => handleInputChange('sex', e.target.value)}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderGovernmentIDs = () => (
        <div className="space-y-4">
            <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-slate-900">Government IDs</h2>
                <p className="text-slate-600 text-sm">Identification numbers</p>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Government Identification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm">SSS No.</Label>
                            <Input
                                value={formData.sss_no}
                                onChange={(e) => handleInputChange('sss_no', e.target.value)}
                                placeholder="SSS number"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">TIN No.</Label>
                            <Input
                                value={formData.tin_no}
                                onChange={(e) => handleInputChange('tin_no', e.target.value)}
                                placeholder="Tax Identification Number"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">PhilHealth No.</Label>
                            <Input
                                value={formData.philhealth_no}
                                onChange={(e) => handleInputChange('philhealth_no', e.target.value)}
                                placeholder="PhilHealth number"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">PAG-IBIG No.</Label>
                            <Input
                                value={formData.pagibig_no}
                                onChange={(e) => handleInputChange('pagibig_no', e.target.value)}
                                placeholder="PAG-IBIG number"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">GSIS No.</Label>
                            <Input
                                value={formData.gsis_no}
                                onChange={(e) => handleInputChange('gsis_no', e.target.value)}
                                placeholder="GSIS number"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderAddressInfo = () => (
        <div className="space-y-4">
            <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-slate-900">Address & Contact</h2>
                <p className="text-slate-600 text-sm">Location information</p>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Residential Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label className="text-sm">Address</Label>
                            <Input
                                value={formData.residential_address}
                                onChange={(e) => handleInputChange('residential_address', e.target.value)}
                                placeholder="Street address"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm">Zip Code</Label>
                                <Input
                                    value={formData.residential_zipcode}
                                    onChange={(e) => handleInputChange('residential_zipcode', e.target.value)}
                                    placeholder="Zip code"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm">Telephone</Label>
                                <Input
                                    value={formData.residential_tel_no}
                                    onChange={(e) => handleInputChange('residential_tel_no', e.target.value)}
                                    placeholder="Telephone number"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm">Contact Name</Label>
                            <Input
                                value={formData.emergency_contact_name}
                                onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                                placeholder="Full name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">Contact Number</Label>
                            <Input
                                value={formData.emergency_contact_number}
                                onChange={(e) => handleInputChange('emergency_contact_number', e.target.value)}
                                placeholder="Phone number"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">Relationship</Label>
                            <Input
                                value={formData.emergency_contact_relation}
                                onChange={(e) => handleInputChange('emergency_contact_relation', e.target.value)}
                                placeholder="Relationship"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderEmployment = () => (
        <div className="space-y-4">
            <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-slate-900">Employment</h2>
                <p className="text-slate-600 text-sm">Work information</p>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Employment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm">Department</Label>
                            <select
                                value={formData.department_id}
                                onChange={(e) => handleInputChange('department_id', e.target.value)}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">Select Department</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.department_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">Position</Label>
                            <select
                                value={formData.position_id}
                                onChange={(e) => handleInputChange('position_id', e.target.value)}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">Select Position</option>
                                {positions.map(position => (
                                    <option key={position.id} value={position.id}>{position.position_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">Manager</Label>
                            <select
                                value={formData.manager_id}
                                onChange={(e) => handleInputChange('manager_id', e.target.value)}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">Select Manager</option>
                                {managers.map(manager => (
                                    <option key={manager.id} value={manager.id}>
                                        {manager.first_name} {manager.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">Base Salary</Label>
                            <Input
                                type="number"
                                value={formData.base_salary}
                                onChange={(e) => handleInputChange('base_salary', e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">Hire Date</Label>
                            <Input
                                type="date"
                                value={formData.hire_date}
                                onChange={(e) => handleInputChange('hire_date', e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">System Access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm">Password *</Label>
                            <Input
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                required
                                placeholder="Minimum 8 characters"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">Role</Label>
                            <select
                                value={formData.role}
                                onChange={(e) => handleInputChange('role', e.target.value)}
                                className="w-full p-2 border rounded"
                            >
                                <option value="employee">Employee</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="is_interviewer"
                            checked={formData.is_interviewer}
                            onChange={(e) => handleInputChange('is_interviewer', e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        <Label htmlFor="is_interviewer" className="text-sm">Is Interviewer</Label>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderBenefits = () => (
        <div className="space-y-4">
            <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-slate-900">Benefits & Allowances</h2>
                <p className="text-slate-600 text-sm">Compensation details</p>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                        {benefitTypes.map(benefit => (
                            <div key={benefit.id} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.benefit_type_ids.includes(benefit.id.toString())}
                                    onChange={(e) => handleArrayChange('benefit_type_ids', benefit.id.toString(), e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <Label className="text-sm">{benefit.benefit_name}</Label>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Allowances</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                        {allowanceTypes.map(allowance => (
                            <div key={allowance.id} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.allowance_type_ids.includes(allowance.id.toString())}
                                    onChange={(e) => handleArrayChange('allowance_type_ids', allowance.id.toString(), e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <Label className="text-sm">{allowance.type_name}</Label>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderFiles = () => (
        <div className="space-y-4">
            <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-slate-900">Documents</h2>
                <p className="text-slate-600 text-sm">Upload required files</p>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Resume</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <Label className="text-sm">Upload Resume (PDF, DOC, DOCX)</Label>
                        <Input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => handleFileChange('resume', e.target.files)}
                        />
                        {formData.resume && (
                            <Badge variant="secondary" className="flex items-center gap-1 text-sm">
                                <FileText className="h-3 w-3" />
                                {formData.resume.name}
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">201 Files</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <Label className="text-sm">Upload 201 Files</Label>
                        <Input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.jpeg,.jpg,.png,.xlsx"
                            onChange={(e) => handleFileChange('201_file', e.target.files)}
                        />
                        <div className="flex flex-wrap gap-1">
                            {formData['201_file'].map((file, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                    {file.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: return renderPersonalInfo();
            case 1: return renderGovernmentIDs();
            case 2: return renderAddressInfo();
            case 3: return <div className="text-center py-8">Family Information - Similar structure</div>;
            case 4: return <div className="text-center py-8">Education - Similar structure</div>;
            case 5: return renderEmployment();
            case 6: return renderBenefits();
            case 7: return renderFiles();
            default: return renderPersonalInfo();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="md:min-w-7xl max-h-[85vh] overflow-auto">
                <DialogHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl">Create New Employee</DialogTitle>
                            <DialogDescription>
                                Step {currentStep + 1} of {steps.length} - {steps[currentStep].label}
                            </DialogDescription>
                        </div>

                    </div>
                </DialogHeader>

                {/* Progress Steps */}
                <div className="flex justify-between items-center mb-6 px-2">
                    {steps.map((step, index) => {
                        const StepIcon = step.icon;
                        const isCompleted = index < currentStep;
                        const isCurrent = index === currentStep;

                        return (
                            <div key={step.id} className="flex items-center">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs ${isCompleted ? 'bg-green-500 text-white' :
                                    isCurrent ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                                </div>
                                <span className={`ml-2 text-sm ${isCurrent ? 'font-semibold text-blue-600' : 'text-gray-600'}`}>
                                    {step.label}
                                </span>
                                {index < steps.length - 1 && (
                                    <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="min-h-[400px]">
                    {renderStepContent()}
                </div>

                {/* Footer */}
                <DialogFooter className="pt-4 border-t">
                    <div className="flex justify-between w-full">
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className="flex items-center gap-2"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back
                        </Button>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            {currentStep < steps.length - 1 ? (
                                <Button onClick={nextStep} className="flex items-center gap-2">
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-4 w-4" />
                                            Create Employee
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateEmployeeModal;