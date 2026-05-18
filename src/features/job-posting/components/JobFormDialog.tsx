// components/JobFormDialog.tsx
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface JobFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    newJob: any;
    onNewJobChange: (job: any) => void;
    onCreateJob: () => void;
    loading: boolean;
    departments?: any[];
}

export function JobFormDialog({
    open,
    onOpenChange,
    newJob,
    onNewJobChange,
    onCreateJob,
    loading,
    departments = [],
}: JobFormDialogProps) {
    const handleChange = (field: string, value: string) => {
        onNewJobChange({ ...newJob, [field]: value });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Job Posting</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the new job posting.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Job Title *</Label>
                        <Input
                            id="title"
                            value={newJob.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                            placeholder="e.g., Senior Frontend Developer"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="department">Department *</Label>
                            <Select
                                value={newJob.department_id}
                                onValueChange={(value) => handleChange("department_id", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id}>
                                            {dept.department_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={newJob.location}
                                onChange={(e) => handleChange("location", e.target.value)}
                                placeholder="e.g., Manila, Philippines"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="work_type">Work Type</Label>
                            <Select
                                value={newJob.work_type}
                                onValueChange={(value) => handleChange("work_type", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select work type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="On-site">On-site</SelectItem>
                                    <SelectItem value="Remote">Remote</SelectItem>
                                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="employment_type">Employment Type</Label>
                            <Select
                                value={newJob.employment_type}
                                onValueChange={(value) => handleChange("employment_type", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select employment type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Full-time">Full-time</SelectItem>
                                    <SelectItem value="Part-time">Part-time</SelectItem>
                                    <SelectItem value="Contract">Contract</SelectItem>
                                    <SelectItem value="Freelance">Freelance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="salary_range">Salary Range</Label>
                            <Input
                                id="salary_range"
                                value={newJob.salary_range}
                                onChange={(e) => handleChange("salary_range", e.target.value)}
                                placeholder="e.g., ₱50,000 - ₱80,000"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={newJob.status}
                                onValueChange={(value) => handleChange("status", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="posted_date">Posted Date</Label>
                            <Input
                                id="posted_date"
                                type="date"
                                value={newJob.posted_date}
                                onChange={(e) => handleChange("posted_date", e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="deadline_date">Deadline Date</Label>
                            <Input
                                id="deadline_date"
                                type="date"
                                value={newJob.deadline_date}
                                onChange={(e) => handleChange("deadline_date", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Job Description</Label>
                        <Textarea
                            id="description"
                            value={newJob.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            placeholder="Describe the job responsibilities, requirements, and benefits..."
                            rows={4}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={onCreateJob} disabled={loading}>
                        {loading ? "Creating..." : "Create Job Posting"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default JobFormDialog;