import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, Filter, TrendingUp, Users, Clock, DollarSign } from 'lucide-react';
import { mockEmployees, mockDepartments, mockPayroll } from '../data/mockData';

// Mock report data
const turnoverData = [
    { month: 'Jan', hired: 5, left: 2, rate: 8.5 },
    { month: 'Feb', hired: 3, left: 1, rate: 4.2 },
    { month: 'Mar', hired: 7, left: 3, rate: 12.8 },
    { month: 'Apr', hired: 4, left: 1, rate: 4.1 },
    { month: 'May', hired: 6, left: 2, rate: 8.3 },
    { month: 'Jun', hired: 2, left: 4, rate: 16.7 },
];

const attendanceData = [
    { department: 'Engineering', present: 95.2, absent: 4.8 },
    { department: 'Marketing', present: 92.8, absent: 7.2 },
    { department: 'Sales', present: 88.5, absent: 11.5 },
    { department: 'HR', present: 96.1, absent: 3.9 },
    { department: 'Finance', present: 94.3, absent: 5.7 },
];

const payrollTrends = [
    { month: 'Jan', totalCost: 485000, avgSalary: 7800 },
    { month: 'Feb', totalCost: 492000, avgSalary: 7920 },
    { month: 'Mar', totalCost: 498000, avgSalary: 8030 },
    { month: 'Apr', totalCost: 501000, avgSalary: 8080 },
    { month: 'May', totalCost: 507000, avgSalary: 8180 },
    { month: 'Jun', totalCost: 512000, avgSalary: 8260 },
];

const complianceReports = [
    { type: 'Labor Law Compliance', status: 'Compliant', lastAudit: '2024-01-15', nextAudit: '2024-07-15' },
    { type: 'Tax Compliance', status: 'Compliant', lastAudit: '2024-01-01', nextAudit: '2024-04-01' },
    { type: 'Safety Regulations', status: 'Minor Issues', lastAudit: '2023-12-10', nextAudit: '2024-03-10' },
    { type: 'Benefits Compliance', status: 'Compliant', lastAudit: '2024-01-20', nextAudit: '2024-06-20' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ReportAnalytics = () => {
    const [selectedReport, setSelectedReport] = useState('overview');

    const reportTypes = [
        { value: 'overview', label: 'Overview Dashboard' },
        { value: 'workforce', label: 'Workforce Analytics' },
        { value: 'attendance', label: 'Attendance Reports' },
        { value: 'payroll', label: 'Payroll Analysis' },
        { value: 'compliance', label: 'Compliance Reports' },
        { value: 'performance', label: 'Performance Metrics' },
    ];

    const exportReport = (format: string) => {
        // Simulate report export
        alert(`Exporting ${selectedReport} report as ${format.toUpperCase()}`);
    };

    const renderOverviewDashboard = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mockEmployees.length}</div>
                        <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">93.4%</div>
                        <p className="text-xs text-muted-foreground">+1.2% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$512K</div>
                        <p className="text-xs text-muted-foreground">+1.0% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Turnover Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">9.2%</div>
                        <p className="text-xs text-muted-foreground">-2.1% from last month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Turnover Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={turnoverData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="rate" stroke="#8884d8" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Department Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={mockDepartments}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="employeeCount"
                                >
                                    {mockDepartments.map((index: any) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    const renderAttendanceReports = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Attendance by Department</CardTitle>
                    <CardDescription>Average attendance rates across departments</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={attendanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="department" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="present" fill="#22c55e" name="Present %" />
                            <Bar dataKey="absent" fill="#ef4444" name="Absent %" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );

    const renderPayrollAnalysis = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Payroll Trends</CardTitle>
                    <CardDescription>Monthly payroll costs and average salary trends</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={payrollTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="totalCost" stroke="#8884d8" strokeWidth={2} name="Total Cost" />
                            <Line type="monotone" dataKey="avgSalary" stroke="#82ca9d" strokeWidth={2} name="Avg Salary" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payroll Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Base Salary</TableHead>
                                <TableHead>Overtime</TableHead>
                                <TableHead>Bonuses</TableHead>
                                <TableHead>Deductions</TableHead>
                                <TableHead>Net Pay</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockPayroll.map((pay) => (
                                <TableRow key={pay.employeeId}>
                                    <TableCell>{pay.employeeName}</TableCell>
                                    <TableCell>${pay.baseSalary.toLocaleString()}</TableCell>
                                    <TableCell>${pay.overtime.toLocaleString()}</TableCell>
                                    <TableCell>${pay.bonuses.toLocaleString()}</TableCell>
                                    <TableCell>${pay.deductions.toLocaleString()}</TableCell>
                                    <TableCell className="font-medium">${pay.netPay.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );

    const renderComplianceReports = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Compliance Status</CardTitle>
                    <CardDescription>Current compliance status across all regulations</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Compliance Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Audit</TableHead>
                                <TableHead>Next Audit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {complianceReports.map((report, index) => (
                                <TableRow key={index}>
                                    <TableCell>{report.type}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={report.status === 'Compliant' ? 'default' : 'secondary'}
                                            className={report.status === 'Compliant' ? 'bg-green-500' : 'bg-yellow-500'}
                                        >
                                            {report.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{report.lastAudit}</TableCell>
                                    <TableCell>{report.nextAudit}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );

    const renderReportContent = () => {
        switch (selectedReport) {
            case 'overview':
                return renderOverviewDashboard();
            case 'attendance':
                return renderAttendanceReports();
            case 'payroll':
                return renderPayrollAnalysis();
            case 'compliance':
                return renderComplianceReports();
            default:
                return renderOverviewDashboard();
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                    <p className="text-muted-foreground">
                        Comprehensive insights and compliance reporting
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => exportReport('pdf')}>
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                    </Button>
                    <Button variant="outline" onClick={() => exportReport('excel')}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Excel
                    </Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <Select value={selectedReport} onValueChange={setSelectedReport}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                            {reportTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                </Button>
            </div>

            {renderReportContent()}
        </div>
    );
}

export default ReportAnalytics