import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Send } from 'lucide-react';
import { toast } from "sonner";

interface JobDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    job: any;
}

const JobDetailDialog = ({ open, onOpenChange, job }: JobDetailDialogProps) => {
    if (!job) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{job.title}</DialogTitle>
                    <DialogDescription>
                        {job.department} • {job.location}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Employment Type</Label>
                            <p className="mt-1">{job.type}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Salary Range</Label>
                            <p className="mt-1">{job.salary}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Applications</Label>
                            <p className="mt-1">{job.applications}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Status</Label>
                            <Badge className="mt-1" variant={job.status === 'active' ? 'default' : 'secondary'}>
                                {job.status}
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <Label>Description</Label>
                        <p className="mt-2 text-sm text-muted-foreground">{job.description}</p>
                    </div>

                    {job.responsibilities && (
                        <div>
                            <Label>Responsibilities</Label>
                            <p className="mt-2 text-sm text-muted-foreground">{job.responsibilities}</p>
                        </div>
                    )}

                    <div>
                        <Label>Requirements</Label>
                        <ul className="mt-2 space-y-1">
                            {job.requirements?.map((req: any, index: any) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                                    {req}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <Label className="text-muted-foreground">Posted Date</Label>
                            <p className="mt-1">{job.posted}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Application Deadline</Label>
                            <p className="mt-1">{job.deadline}</p>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                    <Button onClick={() => {
                        onOpenChange(false);
                        toast.success('Job link copied to clipboard!');
                    }}>
                        <Send className="w-4 h-4 mr-2" />
                        Share Job
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default JobDetailDialog;