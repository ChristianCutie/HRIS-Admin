import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Check, X, Eye, RefreshCw } from "lucide-react";
import { format, } from 'date-fns';

const API_BASE_URL = 'https://api-hris.slarenasitsolutions.com/public/api';

// Define types based on your backend response
interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    department_id: number;
    position_id: number;
}

interface LeaveType {
    id: number;
    leave_name: string;
    description: string;
    max_days: number;
    is_paid: boolean;
    is_active: boolean;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

interface LeaveRequest {
    id: number;
    employee_id: number;
    leave_type_id: number;
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
    status: string;
    is_archived: number;
    created_at: string;
    updated_at: string;
    employee: Employee;
    leave_type: LeaveType;
}

interface LeaveResponse {
    isSuccess: boolean;
    data: LeaveRequest[];
}

const LeaveManagement = () => {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const token = localStorage.getItem('token');

    // Fetch leave data from API
    const fetchLeaveRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/leaves`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: LeaveResponse = await response.json();

            if (data.isSuccess) {
                setLeaveRequests(data.data);
            } else {
                setError('Failed to fetch leave requests');
            }
        } catch (err) {
            console.error('Error fetching leave requests:', err);
            setError('Failed to fetch leave requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveRequests();
    }, []);

    const handleConfirmLeave = async (id: number, status: 'Approved' | 'Rejected') => {
        setActionLoading(id);
        try {
            const response = await fetch(`${API_BASE_URL}/confirm-leave/${id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.isSuccess) {
                // Update the local state with the updated leave request
                setLeaveRequests(prev =>
                    prev.map(request =>
                        request.id === id ? { ...request, status: status } : request
                    )
                );

                // Show success message (you can replace this with a toast notification)
                alert(`Leave request ${status.toLowerCase()} successfully.`);
            } else {
                throw new Error(result.message || 'Failed to update leave request');
            }
        } catch (err) {
            console.error(`Error ${status.toLowerCase()}ing leave:`, err);
            alert(`Failed to ${status.toLowerCase()} leave request. Please try again.`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleApprove = async (id: number) => {
        await handleConfirmLeave(id, 'Approved');
    };

    const handleReject = async (id: number) => {
        await handleConfirmLeave(id, 'Rejected');
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'rejected':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const getLeaveTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'vacation':
                return 'bg-blue-100 text-blue-800';
            case 'sick leave':
                return 'bg-red-100 text-red-800';
            case 'personal':
                return 'bg-green-100 text-green-800';
            case 'maternity':
                return 'bg-purple-100 text-purple-800';
            case 'paternity':
                return 'bg-indigo-100 text-indigo-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const getEmployeeName = (employee: Employee) => {
        return `${employee.first_name} ${employee.last_name}`;
    };


    const pendingRequests = leaveRequests.filter(r => r.status.toLowerCase() === 'pending').length;
    const approvedRequests = leaveRequests.filter(r => r.status.toLowerCase() === 'approved').length;
    const rejectedRequests = leaveRequests.filter(r => r.status.toLowerCase() === 'rejected').length;

    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center">
                <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="p-6 text-center">
                        <div className="text-red-500">{error}</div>
                        <Button onClick={fetchLeaveRequests} className="mt-4">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
                    <p className="text-muted-foreground">
                        Manage employee leave requests and approvals
                    </p>
                </div>
            </div>

            {/* Leave Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                        <div className="h-4 w-4 bg-yellow-500 rounded-full"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{pendingRequests}</div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting approval
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                        <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{approvedRequests}</div>
                        <p className="text-xs text-muted-foreground">
                            This month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                        <div className="h-4 w-4 bg-red-500 rounded-full"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{rejectedRequests}</div>
                        <p className="text-xs text-muted-foreground">
                            This month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Leave Requests Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Leave Requests</CardTitle>
                    <CardDescription>
                        Manage and review employee leave requests
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {leaveRequests.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No leave requests found
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Leave Type</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Applied</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaveRequests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell className="flex items-center space-x-3">
                                            <Avatar>
                                                <AvatarFallback>
                                                    {getInitials(request.employee.first_name, request.employee.last_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{getEmployeeName(request.employee)}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {request.employee.email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getLeaveTypeColor(request.leave_type.leave_name)}>
                                                {request.leave_type.leave_name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{request.total_days} day{request.total_days > 1 ? 's' : ''}</TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {format(new Date(request.start_date), 'MMM dd')} - {format(new Date(request.end_date), 'MMM dd, yyyy')}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusColor(request.status)}>
                                                {request.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(request.created_at), 'MMM dd, yyyy')}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setIsViewDialogOpen(true);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {request.status.toLowerCase() === 'pending' && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleApprove(request.id)}
                                                            className="text-green-600 hover:text-green-700"
                                                            disabled={actionLoading === request.id}
                                                        >
                                                            {actionLoading === request.id ? (
                                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Check className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleReject(request.id)}
                                                            className="text-red-600 hover:text-red-700"
                                                            disabled={actionLoading === request.id}
                                                        >
                                                            {actionLoading === request.id ? (
                                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <X className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Leave Request Details Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Leave Request Details</DialogTitle>
                        <DialogDescription>
                            Complete information for this leave request
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback>
                                        {getInitials(selectedRequest.employee.first_name, selectedRequest.employee.last_name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold">{getEmployeeName(selectedRequest.employee)}</h3>
                                    <p className="text-sm text-muted-foreground">{selectedRequest.employee.email}</p>
                                </div>
                                <div className="ml-auto">
                                    <Badge variant={getStatusColor(selectedRequest.status)}>
                                        {selectedRequest.status}
                                    </Badge>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Leave Type</Label>
                                    <p className="text-sm">
                                        <Badge variant="outline" className={getLeaveTypeColor(selectedRequest.leave_type.leave_name)}>
                                            {selectedRequest.leave_type.leave_name}
                                        </Badge>
                                    </p>
                                </div>
                                <div>
                                    <Label>Duration</Label>
                                    <p className="text-sm">{selectedRequest.total_days} day{selectedRequest.total_days > 1 ? 's' : ''}</p>
                                </div>
                                <div>
                                    <Label>Start Date</Label>
                                    <p className="text-sm">{format(new Date(selectedRequest.start_date), 'PPP')}</p>
                                </div>
                                <div>
                                    <Label>End Date</Label>
                                    <p className="text-sm">{format(new Date(selectedRequest.end_date), 'PPP')}</p>
                                </div>
                                <div className="col-span-2">
                                    <Label>Applied Date</Label>
                                    <p className="text-sm">{format(new Date(selectedRequest.created_at), 'PPP')}</p>
                                </div>
                            </div>
                            <div>
                                <Label>Reason</Label>
                                <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedRequest.reason}</p>
                            </div>
                            {selectedRequest.status.toLowerCase() === 'pending' && (
                                <div className="flex space-x-2 pt-4">
                                    <Button
                                        onClick={() => {
                                            handleApprove(selectedRequest.id);
                                            setIsViewDialogOpen(false);
                                        }}
                                        className="flex-1"
                                        disabled={actionLoading === selectedRequest.id}
                                    >
                                        {actionLoading === selectedRequest.id ? (
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Check className="mr-2 h-4 w-4" />
                                        )}
                                        Approve
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            handleReject(selectedRequest.id);
                                            setIsViewDialogOpen(false);
                                        }}
                                        className="flex-1"
                                        disabled={actionLoading === selectedRequest.id}
                                    >
                                        {actionLoading === selectedRequest.id ? (
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <X className="mr-2 h-4 w-4" />
                                        )}
                                        Reject
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default LeaveManagement;