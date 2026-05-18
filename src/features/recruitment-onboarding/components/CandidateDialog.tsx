import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, FileText, Download, XCircle, CheckCircle, Calendar, Upload } from 'lucide-react';
import { recruitmentStages, getStageColor, getStageLabel, getInitials } from '../utils/constant';
import { useState } from 'react';
import { BASE_URL_API } from "@/utils/BASE_URL_API";
interface CandidateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    candidate: any;
    onMoveCandidateStage: (candidateId: string, stage: string) => void;
    onScheduleInterview: () => void;
    onHireCandidate: (candidateId: string, hireData: any) => void;
    departments: any[];
    positions: any[];
    managers: any[];
    supervisors: any[];
}

const CandidateDialog = ({
    open,
    onOpenChange,
    candidate,
    onMoveCandidateStage,
    onScheduleInterview,
    onHireCandidate,
    departments = [],
    positions = [],
    managers = [],
    supervisors = []
}: CandidateDialogProps) => {
    const [showHireForm, setShowHireForm] = useState(false);
    const [hireData, setHireData] = useState({
        department_id: '',
        position_id: '',
        base_salary: '',
        hire_date: '',
        password: '',
        manager_id: '',
        supervisor_id: '',
        file_201: null as File | null
    });

    if (!candidate) return null;

    const handleHireSubmit = () => {
        if (!hireData.department_id || !hireData.position_id || !hireData.base_salary || !hireData.hire_date || !hireData.password) {
            alert('Please fill in all required fields');
            return;
        }

        const formattedData = {
            ...hireData,
            base_salary: parseFloat(hireData.base_salary),
            file_201: hireData.file_201
        };

        onHireCandidate(candidate.id, formattedData);
        setShowHireForm(false);
        setHireData({
            department_id: '',
            position_id: '',
            base_salary: '',
            hire_date: '',
            password: '',
            manager_id: '',
            supervisor_id: '',
            file_201: null
        });
        onOpenChange(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setHireData(prev => ({ ...prev, file_201: file }));
        }
    };


    const handleOpenClose = async () => {
        try {
            const newStatus = candidate.status === "draft" ? "active" : "draft";

            const response = await fetch(`${BASE_URL_API}/job-postings/${candidate.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();

            if (data.isSuccess) {
                // optional: show toast
                console.log(`Job status updated to ${newStatus}`);
                // update UI instantly
                candidate.status = newStatus;
            } else {
                console.error("Failed to update status:", data.message);
            }
        } catch (error) {
            console.error("Error updating job posting:", error);
        }
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="md:min-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{candidate.name}</DialogTitle>
                    <DialogDescription>Candidate Profile & Actions</DialogDescription>
                </DialogHeader>

                {!showHireForm ? (
                    // Candidate Profile View
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-20 w-20">
                                <AvatarFallback className="text-xl">
                                    {getInitials(candidate.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h3 className="font-semibold text-xl">{candidate.name}</h3>
                                <p className="text-muted-foreground">{candidate.position}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge className={getStageColor(candidate.stage)}>
                                        {getStageLabel(candidate.stage)}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">{candidate.experience} experience</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-right">
                                    <div className="text-2xl font-bold">{candidate.rating}</div>
                                    <div className="text-xs text-muted-foreground">Rating</div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <Label className="text-muted-foreground">Email</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <p>{candidate.email}</p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Phone</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <p>{candidate.phone}</p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Source</Label>
                                <p className="mt-1">{candidate.source}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Applied Date</Label>
                                <p className="mt-1">{candidate.appliedDate}</p>
                            </div>
                        </div>

                        <div>
                            <Label className="text-muted-foreground">Skills</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {candidate.skills?.map((skill: string, index: number) => (
                                    <Badge key={index} variant="outline">{skill}</Badge>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label className="text-muted-foreground">Resume</Label>
                            <div className="flex items-center gap-2 mt-2">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{candidate.resume}</span>
                                <Button variant="outline" size="sm" onClick={() => console.log('Download resume')}>
                                    <Download className="w-4 h-4 mr-1" />
                                    Download
                                </Button>
                            </div>
                        </div>

                        <div>
                            <Label className="text-muted-foreground">Notes</Label>
                            <p className="text-sm mt-1">{candidate.notes}</p>
                        </div>

                        <Separator />

                        <div>
                            <Label className="mb-3 block">Move to Stage</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {recruitmentStages
                                    .filter(s => s.id !== candidate.stage && s.id !== 'rejected')
                                    .map((stage) => (
                                        <Button
                                            key={stage.id}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                onMoveCandidateStage(candidate.id, stage.id);
                                                onOpenChange(false);
                                            }}
                                        >
                                            {stage.label}
                                        </Button>
                                    ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Hire Form View
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-800 mb-2">Hiring {candidate.name}</h4>
                            <p className="text-sm text-blue-700">
                                Complete the employee onboarding form to hire this candidate.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="department_id">Department *</Label>
                                <Select
                                    value={hireData.department_id}
                                    onValueChange={(value) => setHireData(prev => ({ ...prev, department_id: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                {dept.department_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="position_id">Position *</Label>
                                <Select
                                    value={hireData.position_id}
                                    onValueChange={(value) => setHireData(prev => ({ ...prev, position_id: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select position" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {positions.map((position) => (
                                            <SelectItem key={position.id} value={position.id.toString()}>
                                                {position.position_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="base_salary">Base Salary (₱) *</Label>
                                <Input
                                    type="number"
                                    id="base_salary"
                                    placeholder="e.g., 25000"
                                    value={hireData.base_salary}
                                    onChange={(e) => setHireData(prev => ({ ...prev, base_salary: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="hire_date">Hire Date *</Label>
                                <Input
                                    type="date"
                                    id="hire_date"
                                    value={hireData.hire_date}
                                    onChange={(e) => setHireData(prev => ({ ...prev, hire_date: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Temporary Password *</Label>
                                <Input
                                    type="password"
                                    id="password"
                                    placeholder="Minimum 8 characters"
                                    value={hireData.password}
                                    onChange={(e) => setHireData(prev => ({ ...prev, password: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="manager_id">Manager</Label>
                                <Select
                                    value={hireData.manager_id}
                                    onValueChange={(value) => setHireData(prev => ({ ...prev, manager_id: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select manager" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {managers.map((manager) => (
                                            <SelectItem key={manager.id} value={manager.id.toString()}>
                                                {manager.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="supervisor_id">Supervisor</Label>
                                <Select
                                    value={hireData.supervisor_id}
                                    onValueChange={(value) => setHireData(prev => ({ ...prev, supervisor_id: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select supervisor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {supervisors.map((supervisor) => (
                                            <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                                                {supervisor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="file_201">201 File (Optional)</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        id="file_201"
                                        accept=".pdf,.doc,.docx,.jpg,.png"
                                        onChange={handleFileChange}
                                    />
                                    <Upload className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    PDF, DOC, DOCX, JPG, PNG files up to 2MB
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter className="flex justify-between">
                    {!showHireForm ? (
                        // Regular Actions
                        <>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleOpenClose}>
                                    {candidate.status === "draft" ? "Reopen" : "Close"}
                                </Button>
                                <Button onClick={onScheduleInterview}>
                                    <Calendar className="w-4 h-4 mr-1" />
                                    Schedule Interview
                                </Button>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        onMoveCandidateStage(candidate.id, 'rejected');
                                        onOpenChange(false);
                                    }}
                                >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                </Button>
                                <Button
                                    variant="success"
                                    onClick={() => setShowHireForm(true)}
                                >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Hire Candidate
                                </Button>
                            </div>
                        </>
                    ) : (
                        // Hire Form Actions
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setShowHireForm(false)}
                            >
                                Back to Profile
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowHireForm(false);
                                        setHireData({
                                            department_id: '',
                                            position_id: '',
                                            base_salary: '',
                                            hire_date: '',
                                            password: '',
                                            manager_id: '',
                                            supervisor_id: '',
                                            file_201: null
                                        });
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="default"
                                    onClick={handleHireSubmit}
                                >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Complete Hiring
                                </Button>
                            </div>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CandidateDialog;