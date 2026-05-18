import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Users, Save, Download } from 'lucide-react';
import type { StepComponentProps } from '../setupManagerTypes';
import { toast } from 'sonner';
import api from '@/utils/axios'

// Backend interface to match Laravel API response
interface BackendEmploymentType {
    id: number;
    type_name: string;
    description: string;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

interface EmploymentTypesResponse {
    isSuccess: boolean;
    message: string;
    employment_types: BackendEmploymentType[];
}

interface CreateEmploymentTypeResponse {
    isSuccess: boolean;
    message: string;
    employment_types: BackendEmploymentType;
}

export const EmploymentTypesStep: React.FC<StepComponentProps> = ({ setupData, setSetupData }) => {
    const [newType, setNewType] = useState({
        name: '',
        description: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [backendEmploymentTypes, setBackendEmploymentTypes] = useState<BackendEmploymentType[]>([]);

    // Convert backend data to frontend format
    const backendToFrontendFormat = (backendData: BackendEmploymentType[]) => {
        return backendData.map(employmentType => ({
            id: employmentType.id.toString(),
            name: employmentType.type_name,
            description: employmentType.description || '',
        }));
    };

    // Convert frontend data to backend format
    const frontendToBackendFormat = (frontendData: {
        name: string;
        description: string;
    }) => {
        return {
            type_name: frontendData.name,
            description: frontendData.description,
        };
    };

    // Load employment types from backend
    const loadEmploymentTypes = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/employment-types');
            const result: EmploymentTypesResponse = response.data;

            if (result.isSuccess && result.employment_types) {
                setBackendEmploymentTypes(result.employment_types);

                // Also update setupData with the loaded employment types
                const frontendData = backendToFrontendFormat(result.employment_types);
                setSetupData({
                    ...setupData,
                    employmentTypes: frontendData
                });

            } else {
                toast.error('Failed to load employment types');
            }

            return result.employment_types;
        } catch (error: any) {
            console.error('Failed to load employment types:', error);

            // Don't show error if it's 404 (no data yet)
            if (error.response?.status !== 404) {
                toast.error('Failed to load employment types');
            }

            return [];
        } finally {
            setIsLoading(false);
        }
    };

    // Add employment type to backend
    const addEmploymentType = async () => {
        if (!newType.name.trim()) {
            toast.error('Please enter an employment type name');
            return;
        }

        try {
            setIsSaving(true);
            const backendData = frontendToBackendFormat(newType);

            const response = await api.post('/create/employment-types', backendData);
            const result: CreateEmploymentTypeResponse = response.data;

            if (result.isSuccess) {
                toast.success('Employment type created successfully');

                // Clear the form
                setNewType({
                    name: '',
                    description: ''
                });

                // Reload employment types from backend to get the updated list
                await loadEmploymentTypes();

                return result;
            } else {
                throw new Error(result.message || 'Failed to create employment type');
            }
        } catch (error: any) {
            console.error('Failed to create employment type:', error);

            // Handle duplicate type name error
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                if (errors?.type_name) {
                    toast.error(`Employment type name already exists: ${errors.type_name[0]}`);
                } else {
                    toast.error('Validation error occurred');
                }
            } else {
                const errorMessage = error.response?.data?.message || 'Failed to create employment type';
                toast.error(errorMessage);
            }

            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    // Archive employment type in backend
    const removeEmploymentType = async (id: string) => {
        if (!confirm('Are you sure you want to archive this employment type?')) {
            return;
        }

        try {
            const response = await api.post(`/employment-types/${id}/archive`);

            if (response.data.isSuccess) {
                toast.success('Employment type archived successfully');

                // Reload employment types from backend to get the updated list
                await loadEmploymentTypes();
            } else {
                throw new Error('Failed to archive employment type');
            }
        } catch (error: any) {
            console.error('Failed to archive employment type:', error);
            const errorMessage = error.response?.data?.message || 'Failed to archive employment type';
            toast.error(errorMessage);
        }
    };

    // Add employment type to local state only (for setup wizard)
    const addEmploymentTypeToLocal = () => {
        if (newType.name) {
            setSetupData({
                ...setupData,
                employmentTypes: [
                    ...setupData.employmentTypes,
                    {
                        id: Date.now().toString(),
                        name: newType.name,
                        description: newType.description
                    }
                ]
            });
            setNewType({ name: '', description: '' });
            toast.success('Employment type added to setup (will be saved later)');
        }
    };

    // Remove employment type from local state only
    const removeEmploymentTypeFromLocal = (id: string) => {
        setSetupData({
            ...setupData,
            employmentTypes: setupData.employmentTypes.filter(t => t.id !== id)
        });
    };

    // Load employment types when component mounts
    useEffect(() => {
        loadEmploymentTypes();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Employment Types
                </CardTitle>
                <CardDescription>
                    Define employment types and contract categories. Manage employment types directly in your backend system.
                </CardDescription>

                {/* Backend Actions */}
                <div className="flex gap-2 mt-4">
                    <Button
                        onClick={loadEmploymentTypes}
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
                {/* Add Employment Type Form */}
                <div className="p-4 border rounded-lg space-y-3 bg-slate-50">
                    <h4 className="font-medium">Add New Employment Type</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                            placeholder="Type name (e.g., Full-Time)"
                            value={newType.name}
                            onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                        />
                        <Input
                            placeholder="Description"
                            value={newType.description}
                            onChange={(e) => setNewType({ ...newType, description: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={addEmploymentType}
                            size="sm"
                            disabled={isSaving}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save to Server'}
                        </Button>

                        <Button
                            onClick={addEmploymentTypeToLocal}
                            variant="outline"
                            size="sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add to Setup Only
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        "Save to Server" will create the employment type in your database. "Add to Setup Only" will only add it to the current setup session.
                    </p>
                </div>

                {/* Server Employment Types List */}
                {backendEmploymentTypes.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">Employment Types from Server</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-20">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {backendEmploymentTypes.map((employmentType) => (
                                    <TableRow key={employmentType.id}>
                                        <TableCell className="font-medium">{employmentType.type_name}</TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {employmentType.description || 'No description'}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${!employmentType.is_archived
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {!employmentType.is_archived ? 'Active' : 'Archived'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeEmploymentType(employmentType.id.toString())}
                                                title="Archive Employment Type"
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

                {/* Local Setup Employment Types List */}
                {setupData.employmentTypes.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">Employment Types in Current Setup</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="w-20">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {setupData.employmentTypes.map((type) => (
                                    <TableRow key={type.id}>
                                        <TableCell className="font-medium">{type.name}</TableCell>
                                        <TableCell>{type.description}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeEmploymentTypeFromLocal(type.id)}
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

                {backendEmploymentTypes.length === 0 && setupData.employmentTypes.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No employment types found. Add your first employment type above.
                    </div>
                )}

                {/* Common Employment Types Suggestion */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-medium mb-2">Common Employment Types</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {[
                            { name: 'Full-Time', description: 'Regular full-time employment' },
                            { name: 'Part-Time', description: 'Part-time employment' },
                            { name: 'Contract', description: 'Fixed-term contract' },
                            { name: 'Intern', description: 'Internship position' },
                            { name: 'Temporary', description: 'Temporary employment' },
                            { name: 'Freelance', description: 'Project-based work' },
                            { name: 'Probationary', description: 'Probation period' },
                            { name: 'Remote', description: 'Remote work arrangement' },
                        ].map((commonType, index) => (
                            <div
                                key={index}
                                className="p-2 border rounded cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => setNewType({
                                    name: commonType.name,
                                    description: commonType.description
                                })}
                            >
                                <div className="font-medium">{commonType.name}</div>
                                <div className="text-xs text-muted-foreground truncate">{commonType.description}</div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Click on any common type above to pre-fill the form.
                    </p>
                </div>

                {/* Information Notice */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center text-sm text-blue-800">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Employment types are managed in your backend system. Use "Save to Server" to create permanent employment types.
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};