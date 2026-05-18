import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Clock, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useState } from 'react';
import api from "@/utils/axios";

// Types for our API response
interface DashboardData {
    total_employees: number;
    total_departments: number;
    pending_leaves: number;
    attendance_rate: number;
    today_attendance: {
        present: number;
        late: number;
        absent: number;
    };
    department_overview: Array<{
        id: number;
        name: string;
        employees_count: number;
    }>;
}

interface ApiResponse {
    success: boolean;
    data: DashboardData;
}

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch dashboard data from Laravel API
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await api.get<ApiResponse>('/dashboard');

                if (response.data.success) {
                    setDashboardData(response.data.data);
                } else {
                    setError('Failed to load dashboard data');
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to connect to server');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Prepare chart data from API response
    const departmentData = dashboardData?.department_overview.map(dept => ({
        name: dept.name,
        employees: dept.employees_count,
    })) || [];

    const attendanceData = dashboardData ? [
        { name: 'Present', value: dashboardData.today_attendance.present, color: '#10b981' },
        { name: 'Late', value: dashboardData.today_attendance.late, color: '#f59e0b' },
        { name: 'Absent', value: dashboardData.today_attendance.absent, color: '#ef4444' },
    ] : [];

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading dashboard data...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-red-500">{error}</div>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">No data available</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome to your HR dashboard. Here's an overview of your organization.
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.total_employees}</div>
                        <p className="text-xs text-muted-foreground">
                            All active employees
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Departments</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.total_departments}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all locations
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.pending_leaves}</div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting approval
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.attendance_rate}%</div>
                        <p className="text-xs text-muted-foreground">
                            Today's attendance
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Department Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Department Overview</CardTitle>
                        <CardDescription>
                            Employee count by department
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={departmentData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="employees" fill="#8884d8" name="Employees" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Attendance Chart */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Today's Attendance</CardTitle>
                        <CardDescription>
                            Current attendance status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={attendanceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {attendanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center space-x-4 mt-4">
                            {attendanceData.map((entry, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="text-sm">{entry.name}: {entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Today's Attendance Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Today's Attendance Summary</CardTitle>
                    <CardDescription>
                        Detailed breakdown of today's attendance
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">
                                    {dashboardData.today_attendance.present}
                                </p>
                                <p className="text-sm text-green-700">Present</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {dashboardData.today_attendance.late}
                                </p>
                                <p className="text-sm text-yellow-700">Late</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-lg">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div>
                                <p className="text-2xl font-bold text-red-600">
                                    {dashboardData.today_attendance.absent}
                                </p>
                                <p className="text-sm text-red-700">Absent</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Department Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Department Details</CardTitle>
                    <CardDescription>
                        Employee distribution across departments
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {dashboardData.department_overview.map((dept) => (
                            <div key={dept.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <div>
                                        <p className="font-medium">{dept.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {dept.employees_count} employees
                                        </p>
                                    </div>
                                </div>
                                <Badge variant="outline">
                                    {Math.round((dept.employees_count / dashboardData.total_employees) * 100)}%
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default Dashboard;