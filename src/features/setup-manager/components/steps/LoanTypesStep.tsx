// components/steps/LoanTypesStep.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, CreditCard, Save, Download } from 'lucide-react';
import type { StepComponentProps, LoanType as LoanType } from '../setupManagerTypes';
import api from '@/utils/axios';
import { toast } from 'sonner';

// Backend interface to match Laravel API response
interface BackendLoanType {
    id: number;
    type_name: string;
    description: string;
    amount: number;
    interest_rate: number;
    amount_limit: number;
    is_active: boolean;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

interface LoanTypesResponse {
    isSuccess: boolean;
    loan_types: BackendLoanType[];
    pagination?: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
}

interface CreateLoanTypeResponse {
    isSuccess: boolean;
    message: string;
    loan_type: BackendLoanType;
}

export const LoanTypesStep: React.FC<StepComponentProps> = ({ setupData, setSetupData }) => {
    const [newLoan, setNewLoan] = useState({
        type_name: '',
        description: '',
        amount: '',
        amount_limit: '',
        interest_rate: '0'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [backendLoanTypes, setBackendLoanTypes] = useState<BackendLoanType[]>([]);

    // Convert backend data to frontend format
    const backendToFrontendFormat = (backendData: BackendLoanType[]): LoanType[] => {
        return backendData.map(loanType => ({
            id: loanType.id.toString(),
            name: loanType.type_name,
            description: loanType.description || '',
            defaultAmount: loanType.amount || 0,
            amountLimit: loanType.amount_limit || 0,
            interestRate: 0, // Default since backend doesn't have this field
            isActive: loanType.is_active,
        }));
    };

    // Convert frontend data to backend format
    const frontendToBackendFormat = (frontendData: {
        type_name: string;
        description: string;
        amount: string;
        amount_limit: string;
        interest_rate: string;
    }) => {
        return {
            type_name: frontendData.type_name,
            description: frontendData.description,
            amount: frontendData.amount ? parseFloat(frontendData.amount) : undefined,
            amount_limit: frontendData.amount_limit ? parseFloat(frontendData.amount_limit) : undefined,
            interest_rate: frontendData.interest_rate ? parseFloat(frontendData.interest_rate) : 0,
            is_active: true,
        };
    };

    // Load loan types from backend
    const loadLoanTypes = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await api.get('/loan-types', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const result: LoanTypesResponse = response.data;

            if (result.isSuccess && result.loan_types) {
                setBackendLoanTypes(result.loan_types);
                // Also update setupData with the loaded loan types
                const frontendData = backendToFrontendFormat(result.loan_types);
                setSetupData({
                    ...setupData,
                    LoanType: frontendData // FIXED: Changed from LoanTypes to LoanType
                });
            } else {
                toast.error('Failed to load loan types');
            }
            return result.loan_types;
        } catch (error: any) {
            console.error('Failed to load loan types:', error);
            // Don't show error if it's 404 (no data yet)
            if (error.response?.status !== 404) {
                toast.error('Failed to load loan types');
            }
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    // Add loan type to backend
    const addLoanType = async () => {
        if (!newLoan.type_name.trim()) {
            toast.error('Please enter a loan type name');
            return;
        }

        try {
            setIsSaving(true);
            const backendData = frontendToBackendFormat(newLoan);
            const token = localStorage.getItem('token');

            const response = await api.post('/create/loan-types', backendData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const result: CreateLoanTypeResponse = response.data;

            if (result.isSuccess) {
                toast.success('Loan type created successfully');
                // Clear the form
                setNewLoan({
                    type_name: '',
                    description: '',
                    amount: '',
                    amount_limit: '',
                    interest_rate: '0'
                });
                // Reload loan types from backend to get the updated list
                await loadLoanTypes();
                return result;
            } else {
                throw new Error(result.message || 'Failed to create loan type');
            }
        } catch (error: any) {
            console.error('Failed to create loan type:', error);
            // Handle duplicate loan type name error
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                if (errors?.type_name) {
                    toast.error(`Loan type name already exists: ${errors.type_name[0]}`);
                } else {
                    toast.error('Validation error occurred');
                }
            } else {
                const errorMessage = error.response?.data?.message || 'Failed to create loan type';
                toast.error(errorMessage);
            }
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    // Archive loan type in backend
    const removeLoanType = async (id: string) => {
        if (!confirm('Are you sure you want to archive this loan type?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await api.delete(`/loan-types/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.isSuccess) {
                toast.success('Loan type archived successfully');
                // Reload loan types from backend to get the updated list
                await loadLoanTypes();
            } else {
                throw new Error('Failed to archive loan type');
            }
        } catch (error: any) {
            console.error('Failed to archive loan type:', error);
            const errorMessage = error.response?.data?.message || 'Failed to archive loan type';
            toast.error(errorMessage);
        }
    };

    // Add loan type to local state only (for setup wizard)
    const addLoanTypeToLocal = () => {
        if (newLoan.type_name.trim()) {
            const newLoanType: LoanType = {
                id: Date.now().toString(),
                name: newLoan.type_name,
                description: newLoan.description,
                defaultAmount: newLoan.amount ? parseFloat(newLoan.amount) : 0,
                amountLimit: newLoan.amount_limit ? parseFloat(newLoan.amount_limit) : 0,
                interestRate: newLoan.interest_rate ? parseFloat(newLoan.interest_rate) : 0,
                isActive: true
            };

            setSetupData({
                ...setupData,
                LoanType: [...setupData.LoanType, newLoanType] // FIXED: Changed from LoanTypes to LoanType
            });

            setNewLoan({
                type_name: '',
                description: '',
                amount: '',
                amount_limit: '',
                interest_rate: '0'
            });
            toast.success('Loan type added to setup (will be saved later)');
        } else {
            toast.error('Please enter a loan type name');
        }
    };

    // Remove loan type from local state only
    const removeLoanTypeFromLocal = (id: string) => {
        setSetupData({
            ...setupData,
            LoanType: setupData.LoanType.filter(l => l.id !== id) // FIXED: Changed from loanTypes to LoanType
        });
    };

    // Format currency for display
    const formatCurrency = (amount: number | undefined) => {
        if (!amount || amount === 0) return 'Not set';
        return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    };

    // Format interest rate for display
    const formatInterestRate = (rate: number | undefined) => {
        if (!rate) return '0%';
        return `${rate}%`;
    };

    // Load loan types when component mounts
    useEffect(() => {
        loadLoanTypes();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Loan Types
                </CardTitle>
                <CardDescription>
                    Configure loan types and their limits. Manage loan types directly in your backend system.
                </CardDescription>

                {/* Backend Actions */}
                <div className="flex gap-2 mt-4">
                    <Button
                        onClick={loadLoanTypes}
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
                {/* Add Loan Type Form */}
                <div className="p-4 border rounded-lg space-y-3 bg-slate-50">
                    <h4 className="font-medium">Add New Loan Type</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <Input
                            placeholder="Loan type name *"
                            value={newLoan.type_name}
                            onChange={(e) => setNewLoan({ ...newLoan, type_name: e.target.value })}
                        />
                        <Input
                            placeholder="Description (optional)"
                            value={newLoan.description}
                            onChange={(e) => setNewLoan({ ...newLoan, description: e.target.value })}
                        />
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Default amount"
                            value={newLoan.amount}
                            onChange={(e) => setNewLoan({ ...newLoan, amount: e.target.value })}
                        />
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Amount limit"
                            value={newLoan.amount_limit}
                            onChange={(e) => setNewLoan({ ...newLoan, amount_limit: e.target.value })}
                        />
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="Interest rate %"
                            value={newLoan.interest_rate}
                            onChange={(e) => setNewLoan({ ...newLoan, interest_rate: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={addLoanType}
                            size="sm"
                            disabled={isSaving}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save to Server'}
                        </Button>

                        <Button
                            onClick={addLoanTypeToLocal}
                            variant="outline"
                            size="sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add to Setup Only
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        "Save to Server" will create the loan type in your database. "Add to Setup Only" will only add it to the current setup session.
                    </p>
                </div>

                {/* Server Loan Types List */}
                {backendLoanTypes.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">Loan Types from Server</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Loan Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Default Amount</TableHead>
                                    <TableHead>Amount Limit</TableHead>
                                    <TableHead>Interest Rate</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-20">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {backendLoanTypes.map((loanType) => (
                                    <TableRow key={loanType.id}>
                                        <TableCell className="font-medium">{loanType.type_name}</TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {loanType.description || 'No description'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {formatCurrency(loanType.amount)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {formatCurrency(loanType.amount_limit)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {formatInterestRate(loanType.interest_rate)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${loanType.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {loanType.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeLoanType(loanType.id.toString())}
                                                title="Archive Loan Type"
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

                {/* Local Setup Loan Types List */}
                {setupData.LoanType.length > 0 && ( // FIXED: Changed from loanTypes to LoanType
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">Loan Types in Current Setup</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Loan Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Default Amount</TableHead>
                                    <TableHead>Amount Limit</TableHead>
                                    <TableHead>Interest Rate</TableHead>
                                    <TableHead className="w-20">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {setupData.LoanType.map((loan) => ( // FIXED: Changed from loanTypes to LoanType
                                    <TableRow key={loan.id}>
                                        <TableCell className="font-medium">{loan.name}</TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {loan.description || 'No description'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {formatCurrency(loan.defaultAmount)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {formatCurrency(loan.amountLimit)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {formatInterestRate(loan.interestRate)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeLoanTypeFromLocal(loan.id)}
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

                {backendLoanTypes.length === 0 && setupData.LoanType.length === 0 && ( // FIXED: Changed from loanTypes to LoanType
                    <div className="text-center py-8 text-muted-foreground">
                        <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No loan types found.</p>
                        <p className="text-sm">Add your first loan type above to get started.</p>
                    </div>
                )}

                {/* Information Notice */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center text-sm text-blue-800">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Loan types are managed in your backend system. Use "Save to Server" to create permanent loan types.
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};