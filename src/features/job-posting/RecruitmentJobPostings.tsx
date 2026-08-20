import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, PhilippinePeso, Eye, Trash2, Plus, Clock, Users, Calendar } from "lucide-react";
import { getStatusIcon } from "./constant";
import JobFormDialog from "./components/JobFormDialog";
import JobDetailDialog from "./components/JobDetailDialog";
import { toast } from "sonner";
import { useRecruitmentDialogs } from "../recruitment-onboarding/hooks/useRecruitmentDialog";
import { jobPostingAPI, type JobPosting, type CreateJobPostingRequest, type UpdateJobPostingRequest } from "./api";
import api from "@/utils/axios";

const RecruitmentJobPostings = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [searchTerm] = useState("");
    const [departments, setDepartments] = useState<any[]>([]);

    const {
        showJobDialog,
        setShowJobDialog,
        selectedJob,
        setSelectedJob,
        showJobDetailDialog,
        setShowJobDetailDialog,
    } = useRecruitmentDialogs();

    const [newJob, setNewJob] = useState<CreateJobPostingRequest>({
        title: "",
        department_id: "",
        work_type: "On-site",
        employment_type: "Full-time",
        location: "",
        salary_range: "",
        status: "draft",
        description: "",
        posted_date: new Date().toISOString().split("T")[0],
        deadline_date: "",
    });

    // Fetch jobs
    const fetchJobPostings = async () => {
        setLoading(true);
        try {
            const response = await jobPostingAPI.getAll({
                search: searchTerm,
                per_page: 50,
            });

            if (response.data.isSuccess && response.data.job_postings) {
                setJobs(response.data.job_postings);
            } else {
                toast.error(response.data.message || "Failed to fetch job postings");
            }
        } catch (error: any) {
            console.error("Error fetching job postings:", error);
            const errorMessage = error.response?.data?.message || "Failed to fetch job postings";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Fetch departments for dropdown
    const fetchDepartments = async () => {
        try {
            const response = await api.get(`/departments`);
            if (response.data.isSuccess) {
                setDepartments(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    useEffect(() => {
        fetchJobPostings();
        fetchDepartments();
    }, []);

    const createJobPosting = async (jobData: CreateJobPostingRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await jobPostingAPI.create(jobData);
            if (response.data.isSuccess) {
                toast.success("Job created successfully!");
                await fetchJobPostings();
                return true;
            } else {
                throw new Error(response.data.message);
            }
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || "Failed to create job posting";
            setError(message);
            toast.error(message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateJobPosting = async (jobId: string, jobData: UpdateJobPostingRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await jobPostingAPI.update(jobId, jobData);
            if (response.data.isSuccess) {
                toast.success("Job updated successfully!");
                await fetchJobPostings();
                return true;
            } else {
                throw new Error(response.data.message);
            }
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || "Failed to update job";
            setError(message);
            toast.error(message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateJobStatus = async (jobId: string, status: 'draft' | 'active' | 'closed') => {
        return await updateJobPosting(jobId, { status });
    };

    const archiveJob = async (jobId: string) => {
        if (!confirm("Are you sure you want to archive this job posting?")) return;

        setLoading(true);
        setError(null);
        try {
            const response = await jobPostingAPI.archive(jobId);
            if (response.data.isSuccess) {
                toast.success("Job archived successfully");
                await fetchJobPostings();
            } else {
                throw new Error(response.data.message);
            }
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || "Failed to archive job";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenJobDetail = (job: JobPosting) => {
        console.log("Opening job detail:", job);
        setSelectedJob(job);
        setShowJobDetailDialog(true);
    };

    const handleCreateJobPosting = async () => {
        if (!newJob.title.trim()) {
            toast.error("Job title is required");
            return;
        }
        if (!newJob.department_id) {
            toast.error("Department is required");
            return;
        }

        const success = await createJobPosting(newJob);
        if (success) {
            setShowJobDialog(false);
            setNewJob({
                title: "",
                department_id: "",
                work_type: "On-site",
                employment_type: "Full-time",
                location: "",
                salary_range: "",
                status: "draft",
                description: "",
                posted_date: new Date().toISOString().split("T")[0],
                deadline_date: "",
            });
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getApplicationsText = (count: number = 0) => {
        if (count === 0) return "No applications";
        if (count === 1) return "1 application";
        return `${count} applications`;
    };

    // FIXED: Properly extract department name from the department object
    const getDepartmentName = (job: JobPosting) => {
        if (!job.department) return "Unknown Department";

        // Check if department is a string (shouldn't be, but just in case)
        if (typeof job.department === 'string') {
            return job.department;
        }

        // Department is an object, so access the department_name property
        return job.department.department_name || "Unknown Department";
    };

    // Also fix the JobDetailDialog to handle department objects properly
    const JobDetailDialogFixed = ({ open, onOpenChange, job }: any) => {
        if (!job) return null;

        const getDepartmentNameForDialog = (job: JobPosting) => {
            if (!job.department) return "Unknown Department";
            if (typeof job.department === 'string') return job.department;
            return job.department.department_name || "Unknown Department";
        };

        return (
            <JobDetailDialog
                open={open}
                onOpenChange={onOpenChange}
                job={{
                    ...job,
                    // Ensure department is a string for the dialog
                    department: getDepartmentNameForDialog(job)
                }}
            />
        );
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Job Post Management</h2>
                    <p className="text-muted-foreground">Manage your job openings</p>
                </div>
                <Button onClick={() => setShowJobDialog(true)} disabled={loading}>
                    <Plus className="w-4 h-4 mr-2" />
                    Post New Job
                </Button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Error: </strong>
                    {error}
                    <button onClick={() => setError(null)} className="float-right font-bold">×</button>
                </div>
            )}

            {loading ? (
                <Card>
                    <CardContent className="p-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            Loading job postings...
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {jobs.length > 0 ? (
                        jobs.map((job) => (
                            <Card key={job.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CardTitle className="text-lg">{job.title}</CardTitle>
                                                {getStatusIcon(job.status)}
                                            </div>
                                            <CardDescription className="flex flex-wrap items-center gap-4 mt-2">
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="w-4 h-4" />
                                                    {/* FIXED: Now properly rendering department name string */}
                                                    {getDepartmentName(job)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {job.location || "Remote"}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <PhilippinePeso className="w-4 h-4" />
                                                    {job.salary_range || "Salary not specified"}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {job.employment_type}
                                                </span>
                                            </CardDescription>
                                        </div>
                                        <Badge
                                            variant={
                                                job.status === "active"
                                                    ? "default"
                                                    : job.status === "draft"
                                                        ? "secondary"
                                                        : "destructive"
                                            }
                                        >
                                            {job.status?.charAt(0).toUpperCase() + job.status?.slice(1)}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {getApplicationsText(job.applications_count)}
                                            </span>
                                            {job.posted_date && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    Posted: {formatDate(job.posted_date)}
                                                </span>
                                            )}
                                            {job.deadline_date && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    Deadline: {formatDate(job.deadline_date)}
                                                </span>
                                            )}
                                            {job.work_type && <span>{job.work_type}</span>}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenJobDetail(job)}
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
                                            </Button>
                                            {job.status === "active" && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateJobStatus(job.id, "draft")}
                                                    disabled={loading}
                                                >
                                                    Close
                                                </Button>
                                            )}
                                            {job.status === "draft" && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateJobStatus(job.id, "active")}
                                                    disabled={loading}
                                                >
                                                    Publish
                                                </Button>
                                            )}
                                            {job.status === "closed" && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateJobStatus(job.id, "active")}
                                                    disabled={loading}
                                                >
                                                    Reopen
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => archiveJob(job.id)}
                                                disabled={loading}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <h3 className="text-lg font-semibold mb-2">No job postings found</h3>
                                <p className="text-muted-foreground mb-4">
                                    Create your first job posting to start receiving applications.
                                </p>
                                <Button onClick={() => setShowJobDialog(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Your First Job Posting
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Job Form Dialog */}
            <JobFormDialog
                open={showJobDialog}
                onOpenChange={setShowJobDialog}
                newJob={newJob}
                onNewJobChange={setNewJob}
                onCreateJob={handleCreateJobPosting}
                loading={loading}
                departments={departments}
            />

            {/* Job Detail Dialog with fixed department handling */}
            {selectedJob && (
                <JobDetailDialogFixed
                    open={showJobDetailDialog}
                    onOpenChange={setShowJobDetailDialog}
                    job={selectedJob}
                />
            )}
        </div>
    );
};

export default RecruitmentJobPostings;