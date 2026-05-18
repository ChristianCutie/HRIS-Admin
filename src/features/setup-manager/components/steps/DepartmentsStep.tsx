import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Users, Save, Download } from 'lucide-react';
import type { StepComponentProps } from '../setupManagerTypes';
import { toast } from 'sonner';
import api from '@/utils/axios'; // Your existing API instance

// Backend interface to match Laravel API response
interface BackendDepartment {
    id: number;
    department_name: string;
    description: string;
    head?: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        role_name: string | null;
    } | null;
    total_employees: number;
    is_active: boolean;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

interface DepartmentsResponse {
    isSuccess: boolean;
    departments: BackendDepartment[];
    pagination?: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
}

interface CreateDepartmentResponse {
    isSuccess: boolean;
    message: string;
    department: BackendDepartment;
}

export const DepartmentsStep: React.FC<StepComponentProps> = ({ setupData, setSetupData }) => {
    const [newDept, setNewDept] = useState({ name: '', description: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [backendDepartments, setBackendDepartments] = useState<BackendDepartment[]>([]);

    // Convert backend data to frontend format
    const backendToFrontendFormat = (backendData: BackendDepartment[]) => {
        return backendData.map(dept => ({
            id: dept.id.toString(),
            name: dept.department_name,
            description: dept.description || '',
        }));
    };

    // Convert frontend data to backend format
    const frontendToBackendFormat = (frontendData: { name: string; description: string }) => {
        return {
            department_name: frontendData.name,
            description: frontendData.description,
            is_active: true,
        };
    };

    // Load departments from backend
    const loadDepartments = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/departments');
            const result: DepartmentsResponse = response.data;

            if (result.isSuccess && result.departments) {
                setBackendDepartments(result.departments);

                // Also update setupData with the loaded departments
                const frontendData = backendToFrontendFormat(result.departments);
                setSetupData({
                    ...setupData,
                    departments: frontendData
                });

            } else {
                toast.error('Failed to load departments');
            }

            return result.departments;
        } catch (error: any) {
            console.error('Failed to load departments:', error);

            // Don't show error if it's 404 (no data yet)
            if (error.response?.status !== 404) {
                toast.error('Failed to load departments');
            }

            return [];
        } finally {
            setIsLoading(false);
        }
    };

    // Add department to backend
    const addDepartment = async () => {
        if (!newDept.name.trim()) {
            toast.error('Please enter a department name');
            return;
        }

        try {
            setIsSaving(true);
            const backendData = frontendToBackendFormat(newDept);

            const response = await api.post('/create/departments', backendData);
            const result: CreateDepartmentResponse = response.data;

            if (result.isSuccess) {
                toast.success('Department created successfully');

                // Clear the form
                setNewDept({ name: '', description: '' });

                // Reload departments from backend to get the updated list
                await loadDepartments();

                return result;
            } else {
                throw new Error(result.message || 'Failed to create department');
            }
        } catch (error: any) {
            console.error('Failed to create department:', error);

            // Handle duplicate department name error
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                if (errors?.department_name) {
                    toast.error(`Department name already exists: ${errors.department_name[0]}`);
                } else {
                    toast.error('Validation error occurred');
                }
            } else {
                const errorMessage = error.response?.data?.message || 'Failed to create department';
                toast.error(errorMessage);
            }

            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    // Archive department in backend
    const removeDepartment = async (id: string) => {
        if (!confirm('Are you sure you want to archive this department?')) {
            return;
        }

        try {
            const response = await api.post(`/departments/${id}/archive`);

            if (response.data.isSuccess) {
                toast.success('Department archived successfully');

                // Reload departments from backend to get the updated list
                await loadDepartments();
            } else {
                throw new Error('Failed to archive department');
            }
        } catch (error: any) {
            console.error('Failed to archive department:', error);
            const errorMessage = error.response?.data?.message || 'Failed to archive department';
            toast.error(errorMessage);
        }
    };

    // Add department to local state only (for setup wizard)
    const addDepartmentToLocal = () => {
        if (newDept.name) {
            setSetupData({
                ...setupData,
                departments: [
                    ...setupData.departments,
                    { id: Date.now().toString(), ...newDept }
                ]
            });
            setNewDept({ name: '', description: '' });
            toast.success('Department added to setup (will be saved later)');
        }
    };

    // Remove department from local state only
    const removeDepartmentFromLocal = (id: string) => {
        setSetupData({
            ...setupData,
            departments: setupData.departments.filter(d => d.id !== id)
        });
    };

    // Load departments when component mounts
    useEffect(() => {
        loadDepartments();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Departments
                </CardTitle>
                <CardDescription>
                    Define the departments in your organization. Manage departments directly in your backend system.
                </CardDescription>

                {/* Backend Actions */}
                <div className="flex gap-2 mt-4">
                    <Button
                        onClick={loadDepartments}
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        {isLoading ? 'Loading...' : 'Refresh from Server'}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Add Department Form */}
                <div className="p-4 border rounded-lg space-y-3 bg-slate-50">
                    <h4 className="font-medium">Add New Department</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                            placeholder="Department name (e.g., Engineering)"
                            value={newDept.name}
                            onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                        />
                        <Input
                            placeholder="Description"
                            value={newDept.description}
                            onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={addDepartment}
                            size="sm"
                            disabled={isSaving}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save to Server'}
                        </Button>

                        <Button
                            onClick={addDepartmentToLocal}
                            variant="outline"
                            size="sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add to Setup Only
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        "Save to Server" will create the department in your database. "Add to Setup Only" will only add it to the current setup session.
                    </p>
                </div>

                {/* Server Departments List */}
                {backendDepartments.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">Departments from Server</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Department Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Head</TableHead>
                                    <TableHead>Employees</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-20">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {backendDepartments.map((dept) => (
                                    <TableRow key={dept.id}>
                                        <TableCell className="font-medium">{dept.department_name}</TableCell>
                                        <TableCell>{dept.description}</TableCell>
                                        <TableCell>
                                            {dept.head ? (
                                                <div className="text-sm">
                                                    <div>{dept.head.first_name} {dept.head.last_name}</div>
                                                    <div className="text-muted-foreground">{dept.head.email}</div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">Not assigned</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                {dept.total_employees} employees
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${dept.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {dept.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeDepartment(dept.id.toString())}
                                                title="Archive Department"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Local Setup Departments List */}
                {setupData.departments.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">Departments in Current Setup</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="w-20">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {setupData.departments.map((dept) => (
                                    <TableRow key={dept.id}>
                                        <TableCell className="font-medium">{dept.name}</TableCell>
                                        <TableCell>{dept.description}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeDepartmentFromLocal(dept.id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {backendDepartments.length === 0 && setupData.departments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No departments found. Add your first department above.
                    </div>
                )}

                {/* Information Notice */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center text-sm text-blue-800">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Departments are managed in your backend system. Use "Save to Server" to create permanent departments.
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};