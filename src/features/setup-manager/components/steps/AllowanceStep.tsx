import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Wallet, Save, Download, Edit } from 'lucide-react';
import type { StepComponentProps } from '../setupManagerTypes';
import { toast } from 'sonner';
import api from '@/utils/axios';

interface BackendAllowanceType {
  id: number;
  type_name: string;
  description: string | null;
  is_active: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface AllowanceTypesResponse {
  isSuccess: boolean;
  message: string;
  allowance_types: BackendAllowanceType[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

interface CreateAllowanceTypeResponse {
  isSuccess: boolean;
  message: string;
  allowance_type: BackendAllowanceType;
}

export const AllowanceStep: React.FC<StepComponentProps> = ({ setupData, setSetupData }) => {
  const [newAllowance, setNewAllowance] = useState({
    type_name: '',
    description: ''
  });
  const [editingAllowance, setEditingAllowance] = useState<BackendAllowanceType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [backendAllowances, setBackendAllowances] = useState<BackendAllowanceType[]>([]);

  // Convert backend data to frontend format
  const backendToFrontendFormat = (backendData: BackendAllowanceType[]) => {
    return backendData.map((allowance) => ({
      id: allowance.id.toString(),
      type_name: allowance.type_name,
      description: allowance.description || '',
    }));
  };

  // Convert frontend data to backend format
  const frontendToBackendFormat = (frontendData: {
    type_name: string;
    description: string;
  }) => ({
    type_name: frontendData.type_name,
    description: frontendData.description,
  });

  // Load allowance types from backend
  const loadAllowanceTypes = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/allowance-types');
      const result: AllowanceTypesResponse = response.data;

      if (result.isSuccess && result.allowance_types) {
        setBackendAllowances(result.allowance_types);

        // Also update setupData with the loaded allowance types
        const frontendData = backendToFrontendFormat(result.allowance_types);
        setSetupData({
          ...setupData,
          allowance: frontendData,
        });

        toast.success('Allowance types loaded successfully');
      } else {
        toast.error(result.message || 'Failed to load allowance types');
      }
    } catch (error: any) {
      console.error('Failed to load allowance types:', error);

      // Don't show error if it's 404 (no data yet)
      if (error.response?.status !== 404) {
        const errorMessage = error.response?.data?.message || 'Failed to load allowance types';
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add allowance type to backend
  const addAllowanceType = async () => {
    if (!newAllowance.type_name.trim()) {
      toast.error('Please enter an allowance type name');
      return;
    }

    try {
      setIsSaving(true);
      const backendData = frontendToBackendFormat(newAllowance);

      const response = await api.post('/create/allowance-types', backendData);
      const result: CreateAllowanceTypeResponse = response.data;

      if (result.isSuccess) {
        toast.success('Allowance type created successfully');

        // Clear the form
        setNewAllowance({
          type_name: '',
          description: ''
        });

        // Reload allowance types from backend to get the updated list
        await loadAllowanceTypes();

        return result;
      } else {
        throw new Error(result.message || 'Failed to create allowance type');
      }
    } catch (error: any) {
      console.error('Failed to create allowance type:', error);

      // Handle validation errors
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors?.type_name) {
          toast.error(`Allowance name error: ${errors.type_name[0]}`);
        } else {
          toast.error('Validation error occurred');
        }
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to create allowance type';
        toast.error(errorMessage);
      }

      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Update allowance type in backend
  const updateAllowanceType = async (allowanceType: BackendAllowanceType) => {
    try {
      const updateData = {
        type_name: allowanceType.type_name,
        description: allowanceType.description,
      };

      const response = await api.post(`/update/allowance-types/${allowanceType.id}`, updateData);

      if (response.data.isSuccess) {
        toast.success('Allowance type updated successfully');
        setEditingAllowance(null);
        await loadAllowanceTypes();
      } else {
        throw new Error('Failed to update allowance type');
      }
    } catch (error: any) {
      console.error('Failed to update allowance type:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update allowance type';
      toast.error(errorMessage);
    }
  };

  // Archive allowance type in backend
  const removeAllowanceType = async (id: string) => {
    if (!confirm('Are you sure you want to archive this allowance type?')) {
      return;
    }

    try {
      const response = await api.post(`/allowance-types/${id}/archive`);

      if (response.data.isSuccess) {
        toast.success('Allowance type archived successfully');

        // Reload allowance types from backend to get the updated list
        await loadAllowanceTypes();
      } else {
        throw new Error('Failed to archive allowance type');
      }
    } catch (error: any) {
      console.error('Failed to archive allowance type:', error);
      const errorMessage = error.response?.data?.message || 'Failed to archive allowance type';
      toast.error(errorMessage);
    }
  };

  // Add allowance type to local state only (for setup wizard)
  const addAllowanceToLocal = () => {
    if (newAllowance.type_name) {
      setSetupData({
        ...setupData,
        allowance: [
          ...setupData.allowance,
          {
            id: Date.now().toString(),
            type_name: newAllowance.type_name,
            description: newAllowance.description
          }
        ],
      });
      setNewAllowance({
        type_name: '',
        description: ''
      });
      toast.success('Allowance type added to setup (will be saved later)');
    }
  };

  // Remove allowance type from local state only
  const removeAllowanceFromLocal = (id: string) => {
    setSetupData({
      ...setupData,
      allowance: setupData.allowance.filter((a: any) => a.id !== id),
    });
  };

  // Start editing an allowance type
  const startEditing = (allowanceType: BackendAllowanceType) => {
    setEditingAllowance({ ...allowanceType });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingAllowance(null);
  };

  // Handle edit field changes
  const handleEditChange = (field: string, value: string) => {
    if (editingAllowance) {
      setEditingAllowance({
        ...editingAllowance,
        [field]: value
      });
    }
  };

  useEffect(() => {
    loadAllowanceTypes();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Allowance Types
        </CardTitle>
        <CardDescription>
          Define employee allowances and benefits. Manage allowance types directly in your backend system.
        </CardDescription>

        {/* Backend Actions */}
        <div className="flex gap-2 mt-4">
          <Button
            onClick={loadAllowanceTypes}
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
        {/* Add Allowance Form */}
        <div className="p-4 border rounded-lg space-y-3 bg-slate-50">
          <h4 className="font-medium">Add New Allowance Type</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Allowance type name *"
              value={newAllowance.type_name}
              onChange={(e) => setNewAllowance({ ...newAllowance, type_name: e.target.value })}
            />
            <Input
              placeholder="Description"
              value={newAllowance.description}
              onChange={(e) => setNewAllowance({ ...newAllowance, description: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={addAllowanceType}
              size="sm"
              disabled={isSaving || !newAllowance.type_name}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save to Server'}
            </Button>

            <Button
              onClick={addAllowanceToLocal}
              variant="outline"
              size="sm"
              disabled={!newAllowance.type_name}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to Setup Only
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            * Required field. "Save to Server" will create the allowance type in your database. "Add to Setup Only" will only add it to the current setup session.
          </p>
        </div>

        {/* Server Allowances List */}
        {backendAllowances.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Allowance Types from Server</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backendAllowances.map((allowance) => (
                    <TableRow key={allowance.id}>
                      {editingAllowance?.id === allowance.id ? (
                        // Edit Mode
                        <>
                          <TableCell>
                            <Input
                              value={editingAllowance.type_name}
                              onChange={(e) => handleEditChange('type_name', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editingAllowance.description || ''}
                              onChange={(e) => handleEditChange('description', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs 
                              bg-green-100 text-green-800 }`}>
                              Active
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={() => updateAllowanceType(editingAllowance)}
                              >
                                <Save className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelEditing}
                              >
                                Cancel
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        // View Mode
                        <>
                          <TableCell className="font-medium">{allowance.type_name}</TableCell>
                          <TableCell className="max-w-xs">
                            {allowance.description || 'No description'}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs bg-green-100 text-green-800'`}>
                              Active
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditing(allowance)}
                                title="Edit Allowance Type"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAllowanceType(allowance.id.toString())}
                                title="Archive Allowance Type"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Local Setup Allowances List */}
        {setupData.allowance.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Allowance Types in Current Setup</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {setupData.allowance.map((allowance: any) => (
                    <TableRow key={allowance.id}>
                      <TableCell className="font-medium">{allowance.type_name}</TableCell>
                      <TableCell>{allowance.description}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAllowanceFromLocal(allowance.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {backendAllowances.length === 0 && setupData.allowance.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Allowance Types</h3>
            <p>Get started by adding your first allowance type above.</p>
          </div>
        )}

        {/* Information Notice */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start text-sm text-blue-800">
            <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <strong>Note:</strong> Allowance types are managed in your backend system.
              Use "Save to Server" to create permanent allowance types that will be available
              for all employees.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};