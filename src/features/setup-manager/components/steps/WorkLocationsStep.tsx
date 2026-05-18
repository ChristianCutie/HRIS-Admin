import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, MapPin, Save, Download } from 'lucide-react';
import type { StepComponentProps } from '../setupManagerTypes';
import { toast } from 'sonner';
import api from '@/utils/axios'

// Backend interface to match Laravel API response
interface BackendWorkLocation {
    id: number;
    location_name: string;
    address: string;
    location_type: 'Physical Office' | 'Remote' | 'Hybrid';
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

interface WorkLocationsResponse {
    isSuccess: boolean;
    message: string;
    work_locations: BackendWorkLocation[];
}

interface CreateWorkLocationResponse {
    isSuccess: boolean;
    message: string;
    work_location: BackendWorkLocation;
}

export const WorkLocationsStep: React.FC<StepComponentProps> = ({ setupData, setSetupData }) => {
    const [newLocation, setNewLocation] = useState({
        name: '',
        address: '',
        locationType: 'Physical Office' as 'Physical Office' | 'Remote' | 'Hybrid'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [backendWorkLocations, setBackendWorkLocations] = useState<BackendWorkLocation[]>([]);

    // Convert backend data to frontend format
    const backendToFrontendFormat = (backendData: BackendWorkLocation[]) => {
        return backendData.map(location => ({
            id: location.id.toString(),
            name: location.location_name,
            address: location.address || '',
            isRemote: location.location_type === 'Remote',
            locationType: location.location_type,
        }));
    };

    // Convert frontend data to backend format
    const frontendToBackendFormat = (frontendData: {
        name: string;
        address: string;
        locationType: 'Physical Office' | 'Remote' | 'Hybrid';
    }) => {
        return {
            location_name: frontendData.name,
            address: frontendData.address,
            location_type: frontendData.locationType,
        };
    };

    // Load work locations from backend
    const loadWorkLocations = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/work-locations');
            const result: WorkLocationsResponse = response.data;

            if (result.isSuccess && result.work_locations) {
                setBackendWorkLocations(result.work_locations);

                // Also update setupData with the loaded work locations
                const frontendData = backendToFrontendFormat(result.work_locations);
                setSetupData({
                    ...setupData,
                    workLocations: frontendData
                });

                toast.success('Work locations loaded successfully');
            } else {
                toast.error('Failed to load work locations');
            }

            return result.work_locations;
        } catch (error: any) {
            console.error('Failed to load work locations:', error);

            // Don't show error if it's 404 (no data yet)
            if (error.response?.status !== 404) {
                toast.error('Failed to load work locations');
            }

            return [];
        } finally {
            setIsLoading(false);
        }
    };

    // Add work location to backend
    const addWorkLocation = async () => {
        if (!newLocation.name.trim()) {
            toast.error('Please enter a location name');
            return;
        }

        if (!newLocation.locationType) {
            toast.error('Please select a location type');
            return;
        }

        try {
            setIsSaving(true);
            const backendData = frontendToBackendFormat(newLocation);

            const response = await api.post('/create/work-locations', backendData);
            const result: CreateWorkLocationResponse = response.data;

            if (result.isSuccess) {
                toast.success('Work location created successfully');

                // Clear the form
                setNewLocation({
                    name: '',
                    address: '',
                    locationType: 'Physical Office'
                });

                // Reload work locations from backend to get the updated list
                await loadWorkLocations();

                return result;
            } else {
                throw new Error(result.message || 'Failed to create work location');
            }
        } catch (error: any) {
            console.error('Failed to create work location:', error);

            // Handle duplicate location name error
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                if (errors?.location_name) {
                    toast.error(`Location name already exists: ${errors.location_name[0]}`);
                } else {
                    toast.error('Validation error occurred');
                }
            } else {
                const errorMessage = error.response?.data?.message || 'Failed to create work location';
                toast.error(errorMessage);
            }

            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    // Archive work location in backend
    const removeWorkLocation = async (id: string) => {
        if (!confirm('Are you sure you want to archive this work location?')) {
            return;
        }

        try {
            const response = await api.post(`/work-locations/${id}/archive`);

            if (response.data.isSuccess) {
                toast.success('Work location archived successfully');

                // Reload work locations from backend to get the updated list
                await loadWorkLocations();
            } else {
                throw new Error('Failed to archive work location');
            }
        } catch (error: any) {
            console.error('Failed to archive work location:', error);
            const errorMessage = error.response?.data?.message || 'Failed to archive work location';
            toast.error(errorMessage);
        }
    };

    // Add work location to local state only (for setup wizard)
    const addWorkLocationToLocal = () => {
        if (newLocation.name) {
            setSetupData({
                ...setupData,
                workLocations: [
                    ...setupData.workLocations,
                    {
                        id: Date.now().toString(),
                        name: newLocation.name,
                        address: newLocation.address,
                        isRemote: newLocation.locationType === 'Remote',
                        locationType: newLocation.locationType
                    }
                ]
            });
            setNewLocation({
                name: '',
                address: '',
                locationType: 'Physical Office'
            });
            toast.success('Work location added to setup (will be saved later)');
        }
    };

    // Remove work location from local state only
    const removeWorkLocationFromLocal = (id: string) => {
        setSetupData({
            ...setupData,
            workLocations: setupData.workLocations.filter(l => l.id !== id)
        });
    };

    // Load work locations when component mounts
    useEffect(() => {
        loadWorkLocations();
    }, []);

    // Get badge variant based on location type
    const getLocationTypeBadgeVariant = (locationType: string) => {
        switch (locationType) {
            case 'Physical Office':
                return 'default';
            case 'Remote':
                return 'secondary';
            case 'Hybrid':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Work Locations
                </CardTitle>
                <CardDescription>
                    Set up office locations and work arrangements. Manage work locations directly in your backend system.
                </CardDescription>

                {/* Backend Actions */}
                <div className="flex gap-2 mt-4">
                    <Button
                        onClick={loadWorkLocations}
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
                {/* Add Work Location Form */}
                <div className="p-4 border rounded-lg space-y-3 bg-slate-50">
                    <h4 className="font-medium">Add New Work Location</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                            placeholder="Location name (e.g., Headquarters)"
                            value={newLocation.name}
                            onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                        />
                        <Input
                            placeholder="Address (optional)"
                            value={newLocation.address}
                            onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                        />
                        <Select
                            value={newLocation.locationType}
                            onValueChange={(value: 'Physical Office' | 'Remote' | 'Hybrid') =>
                                setNewLocation({ ...newLocation, locationType: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Physical Office">Physical Office</SelectItem>
                                <SelectItem value="Remote">Remote</SelectItem>
                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={addWorkLocation}
                            size="sm"
                            disabled={isSaving}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save to Server'}
                        </Button>

                        <Button
                            onClick={addWorkLocationToLocal}
                            variant="outline"
                            size="sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add to Setup Only
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        "Save to Server" will create the work location in your database. "Add to Setup Only" will only add it to the current setup session.
                    </p>
                </div>

                {/* Server Work Locations List */}
                {backendWorkLocations.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">Work Locations from Server</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Location Name</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-20">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {backendWorkLocations.map((location) => (
                                    <TableRow key={location.id}>
                                        <TableCell className="font-medium">{location.location_name}</TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {location.address || 'No address provided'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getLocationTypeBadgeVariant(location.location_type)}>
                                                {location.location_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${!location.is_archived
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {!location.is_archived ? 'Active' : 'Archived'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeWorkLocation(location.id.toString())}
                                                title="Archive Work Location"
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

                {/* Local Setup Work Locations List */}
                {setupData.workLocations.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">Work Locations in Current Setup</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Location Name</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="w-20">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {setupData.workLocations.map((location) => (
                                    <TableRow key={location.id}>
                                        <TableCell className="font-medium">{location.name}</TableCell>
                                        <TableCell>{location.address}</TableCell>
                                        <TableCell>
                                            <Badge variant={getLocationTypeBadgeVariant(location.locationType)}>
                                                {location.locationType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeWorkLocationFromLocal(location.id)}
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

                {backendWorkLocations.length === 0 && setupData.workLocations.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No work locations found. Add your first work location above.
                    </div>
                )}

                {/* Common Work Locations Suggestion */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-medium mb-2">Common Work Location Types</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        {[
                            { name: 'Headquarters', type: 'Physical Office', description: 'Main company office' },
                            { name: 'Branch Office', type: 'Physical Office', description: 'Secondary office location' },
                            { name: 'Remote Work', type: 'Remote', description: 'Fully remote work arrangement' },
                            { name: 'Hybrid Setup', type: 'Hybrid', description: 'Combination of office and remote' },
                            { name: 'Co-working Space', type: 'Physical Office', description: 'Shared office space' },
                            { name: 'Home Office', type: 'Remote', description: 'Employee home workspace' },
                        ].map((commonLocation, index) => (
                            <div
                                key={index}
                                className="p-3 border rounded cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => setNewLocation({
                                    name: commonLocation.name,
                                    address: '',
                                    locationType: commonLocation.type as 'Physical Office' | 'Remote' | 'Hybrid'
                                })}
                            >
                                <div className="font-medium flex items-center gap-2">
                                    {commonLocation.name}
                                    <Badge variant={getLocationTypeBadgeVariant(commonLocation.type)} className="text-xs">
                                        {commonLocation.type}
                                    </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">{commonLocation.description}</div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Click on any common location above to pre-fill the form.
                    </p>
                </div>

                {/* Information Notice */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center text-sm text-blue-800">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Work locations are managed in your backend system. Use "Save to Server" to create permanent work locations.
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};