import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Briefcase, Save, Download } from 'lucide-react';
import type { StepComponentProps } from '../setupManagerTypes';
import { toast } from 'sonner';
import api from '@/utils/axios'; // Your existing API instance

// Backend interface to match Laravel API response
interface BackendPositionType {
    id: number;
    position_name: string;
    description: string;
    department_id: number;
    department?: {
        id: number;
        department_name: string;
        description: string;
    };
    is_active: boolean;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

interface BackendDepartment {
    id: number;
    department_name: string;
    description: string;
    // Add other department fields as needed
}

interface PositionsResponse {
    isSuccess: boolean;
    position_types: BackendPositionType[];
    pagination?: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
}

interface CreatePositionResponse {
    isSuccess: boolean;
    message: string;
    position_type: BackendPositionType;
}

export const PositionsStep: React.FC<StepComponentProps> = ({ setupData, setSetupData }) => {
    const [newPos, setNewPos] = useState({
        title: '',
        department: '',
        level: '',
        description: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [backendPositions, setBackendPositions] = useState<BackendPositionType[]>([]);
    const [backendDepartments, setBackendDepartments] = useState<BackendDepartment[]>([]);

    // Convert backend data to frontend format
    const backendToFrontendFormat = (backendData: BackendPositionType[]) => {
        return backendData.map(position => ({
            id: position.id.toString(),
            title: position.position_name,
            department: position.department?.department_name || 'Unknown Department',
            level: 'Mid-Level', // Default level since backend doesn't have this field
            description: position.description || '',
        }));
    };

    // Convert frontend data to backend format
    const frontendToBackendFormat = (frontendData: {
        title: string;
        department: string;
        description: string;
    }) => {
        // Find department ID by name
        const department = backendDepartments.find(dept =>
            dept.department_name === frontendData.department
        );

        return {
            position_name: frontendData.title,
            description: frontendData.description,
            department_id: department?.id || 0,
            is_active: true,
        };
    };

    // Load positions from backend
    const loadPositions = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/position-types'); // Adjust endpoint if different
            const result: PositionsResponse = response.data;

            if (result.isSuccess && result.position_types) {
                setBackendPositions(result.position_types);

                // Also update setupData with the loaded positions
                const frontendData = backendToFrontendFormat(result.position_types);
                setSetupData({
                    ...setupData,
                    positions: frontendData
                });

                toast.success('Positions loaded successfully');
            } else {
                toast.error('Failed to load positions');
            }

            return result.position_types;
        } catch (error: any) {
            console.error('Failed to load positions:', error);

            // Don't show error if it's 404 (no data yet)
            if (error.response?.status !== 404) {
                toast.error('Failed to load positions');
            }

            return [];
        } finally {
            setIsLoading(false);
        }
    };

    // Load departments for dropdown
    const loadDepartments = async () => {
        try {
            const response = await api.get('/departments');
            if (response.data.isSuccess && response.data.departments) {
                setBackendDepartments(response.data.departments);
            }
        } catch (error: any) {
            console.error('Failed to load departments:', error);
        }
    };

    // Add position to backend
    const addPosition = async () => {
        if (!newPos.title.trim()) {
            toast.error('Please enter a position title');
            return;
        }

        if (!newPos.department) {
            toast.error('Please select a department');
            return;
        }

        try {
            setIsSaving(true);
            const backendData = frontendToBackendFormat(newPos);

            // Validate department ID
            if (!backendData.department_id) {
                toast.error('Invalid department selected');
                return;
            }

            const response = await api.post('/create/position-types', backendData);
            const result: CreatePositionResponse = response.data;

            if (result.isSuccess) {
                toast.success('Position created successfully');

                // Clear the form
                setNewPos({ title: '', department: '', level: '', description: '' });

                // Reload positions from backend to get the updated list
                await loadPositions();

                return result;
            } else {
                throw new Error(result.message || 'Failed to create position');
            }
        } catch (error: any) {
            console.error('Failed to create position:', error);

            // Handle duplicate position name error
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                if (errors?.position_name) {
                    toast.error(`Position name already exists: ${errors.position_name[0]}`);
                } else {
                    toast.error('Validation error occurred');
                }
            } else {
                const errorMessage = error.response?.data?.message || 'Failed to create position';
                toast.error(errorMessage);
            }

            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    // Archive position in backend
    const removePosition = async (id: string) => {
        if (!confirm('Are you sure you want to archive this position?')) {
            return;
        }

        try {
            const response = await api.post(`/position-types/${id}/archive`);

            if (response.data.isSuccess) {
                toast.success('Position archived successfully');

                // Reload positions from backend to get the updated list
                await loadPositions();
            } else {
                throw new Error('Failed to archive position');
            }
        } catch (error: any) {
            console.error('Failed to archive position:', error);
            const errorMessage = error.response?.data?.message || 'Failed to archive position';
            toast.error(errorMessage);
        }
    };

    // Add position to local state only (for setup wizard)
    const addPositionToLocal = () => {
        if (newPos.title && newPos.department && newPos.level) {
            setSetupData({
                ...setupData,
                positions: [
                    ...setupData.positions,
                    {
                        id: Date.now().toString(),
                        title: newPos.title,
                        department: newPos.department,
                        level: newPos.level,
                        description: newPos.description
                    }
                ]
            });
            setNewPos({ title: '', department: '', level: '', description: '' });
            toast.success('Position added to setup (will be saved later)');
        }
    };

    // Remove position from local state only
    const removePositionFromLocal = (id: string) => {
        setSetupData({
            ...setupData,
            positions: setupData.positions.filter(p => p.id !== id)
        });
    };

    // Load data when component mounts
    useEffect(() => {
        loadPositions();
        loadDepartments();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Job Positions
                </CardTitle>
                <CardDescription>
                    Define job titles and positions across departments. Manage positions directly in your backend system.
                </CardDescription>

                {/* Backend Actions */}
                <div className="flex gap-2 mt-4">
                    <Button
                        onClick={loadPositions}
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
                {/* Add Position Form */}
                <div className="p-4 border rounded-lg space-y-3 bg-slate-50">
                    <h4 className="font-medium">Add New Position</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                            placeholder="Position title"
                            value={newPos.title}
                            onChange={(e) => setNewPos({ ...newPos, title: e.target.value })}
                        />
                        <Select
                            value={newPos.department}
                            onValueChange={(value) => setNewPos({ ...newPos, department: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent>
                                {backendDepartments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.department_name}>
                                        {dept.department_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={newPos.level}
                            onValueChange={(value) => setNewPos({ ...newPos, level: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Entry">Entry Level</SelectItem>
                                <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                                <SelectItem value="Senior">Senior</SelectItem>
                                <SelectItem value="Manager">Manager</SelectItem>
                                <SelectItem value="Director">Director</SelectItem>
                                <SelectItem value="Executive">Executive</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Description (optional)"
                            value={newPos.description}
                            onChange={(e) => setNewPos({ ...newPos, description: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={addPosition}
                            size="sm"
                            disabled={isSaving || backendDepartments.length === 0}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save to Server'}
                        </Button>

                        <Button
                            onClick={addPositionToLocal}
                            variant="outline"
                            size="sm"
                            disabled={backendDepartments.length === 0}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add to Setup Only
                        </Button>
                    </div>

                    {backendDepartments.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                            Please add departments first to create positions
                        </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                        "Save to Server" will create the position in your database. "Add to Setup Only" will only add it to the current setup session.
                    </p>
                </div>

                {/* Server Positions List */}
                {backendPositions.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">Positions from Server</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Position Name</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-20">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {backendPositions.map((position) => (
                                    <TableRow key={position.id}>
                                        <TableCell className="font-medium">{position.position_name}</TableCell>
                                        <TableCell>
                                            {position.department ? (
                                                <Badge variant="secondary">{position.department.department_name}</Badge>
                                            ) : (
                                                <span className="text-muted-foreground">No department</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {position.description || 'No description'}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${position.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {position.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removePosition(position.id.toString())}
                                                title="Archive Position"
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

                {/* Local Setup Positions List */}
                {setupData.positions.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">Positions in Current Setup</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Job Title</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Level</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="w-20">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {setupData.positions.map((pos) => (
                                    <TableRow key={pos.id}>
                                        <TableCell className="font-medium">{pos.title}</TableCell>
                                        <TableCell>{pos.department}</TableCell>
                                        <TableCell><Badge variant="secondary">{pos.level}</Badge></TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {pos.description || 'No description'}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removePositionFromLocal(pos.id)}
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

                {backendPositions.length === 0 && setupData.positions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No positions found. Add your first position above.
                    </div>
                )}

                {/* Information Notice */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center text-sm text-blue-800">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Positions are managed in your backend system. Use "Save to Server" to create permanent positions.
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};