import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, FileText, Download, XCircle, Calendar, User, Briefcase, Clock } from 'lucide-react';

interface Candidate {
    id: string;
    name: string;
    email: string;
    position: string;
    stage: string;
    rating: number;
    experience: string;
    skills: string[];
    phone: string;
    appliedDate: string;
    source: string;
    resume: string;
    notes: string;
}

interface CandidateProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    candidate: Candidate | null;
    onMoveToStage: (candidateId: string, newStage: string) => void;
    onRejectCandidate: (candidateId: string) => void;
    onScheduleInterview: (candidate: Candidate) => void;
    onSendEmail: (email: string) => void;
    recruitmentStages?: Array<{ id: string; label: string }>;
}

const CandidateProfileDialog = ({
    open,
    onOpenChange,
    candidate,
    onMoveToStage,
    onRejectCandidate,
    onScheduleInterview,
    onSendEmail,
    recruitmentStages = [
        { id: 'new', label: 'New Applications' },
        { id: 'screening', label: 'Screening' },
        { id: 'phone-screening', label: 'Phone Screening' },
        { id: 'assessment', label: 'Assessment' },
        { id: 'technical-interview', label: 'Technical Interview' },
        { id: 'final-interview', label: 'Final Interview' },
        { id: 'offer', label: 'Offer Extended' },
    ]
}: CandidateProfileDialogProps) => {
    if (!candidate) return null;

    const getStageColor = (stage: string) => {
        const stageColors: { [key: string]: string } = {
            'new': 'bg-blue-100 text-blue-800',
            'screening': 'bg-purple-100 text-purple-800',
            'phone-screening': 'bg-indigo-100 text-indigo-800',
            'assessment': 'bg-yellow-100 text-yellow-800',
            'technical-interview': 'bg-orange-100 text-orange-800',
            'final-interview': 'bg-pink-100 text-pink-800',
            'offer': 'bg-green-100 text-green-800',
            'rejected': 'bg-red-100 text-red-800',
        };
        return stageColors[stage] || 'bg-gray-100 text-gray-800';
    };

    const getStageLabel = (stage: string) => {
        const stageConfig = recruitmentStages.find(s => s.id === stage);
        return stageConfig?.label || stage;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="md:min-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{candidate.name}</DialogTitle>
                    <DialogDescription>Candidate Profile & Actions</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20">
                            <AvatarFallback className="text-xl">
                                {candidate.name.split(' ').map(n => n[0]).join('')}
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
                            <div className="flex items-center gap-2 mt-1">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <p>{candidate.source}</p>
                            </div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Applied Date</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <p>{candidate.appliedDate}</p>
                            </div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Experience</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <Briefcase className="w-4 h-4 text-muted-foreground" />
                                <p>{candidate.experience}</p>
                            </div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Current Stage</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <p>{getStageLabel(candidate.stage)}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label className="text-muted-foreground">Skills</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {candidate.skills.map((skill, index) => (
                                <Badge key={index} variant="outline">{skill}</Badge>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label className="text-muted-foreground">Resume</Label>
                        <div className="flex items-center gap-2 mt-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{candidate.resume}</span>
                            <Button variant="outline" size="sm" onClick={() => console.log('Downloading resume...')}>
                                <Download className="w-4 h-4 mr-1" />
                                Download
                            </Button>
                        </div>
                    </div>

                    <div>
                        <Label className="text-muted-foreground">Notes</Label>
                        <p className="text-sm mt-1 p-3 bg-muted rounded-md">{candidate.notes || "No notes available."}</p>
                    </div>

                    <Separator />

                    <div>
                        <Label className="mb-3 block">Move to Stage</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {recruitmentStages
                                .filter(stage => stage.id !== candidate.stage && stage.id !== 'rejected')
                                .map((stage) => (
                                    <Button
                                        key={stage.id}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            onMoveToStage(candidate.id, stage.id);
                                            onOpenChange(false);
                                        }}
                                    >
                                        {stage.label}
                                    </Button>
                                ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex justify-between">
                    <div className="flex gap-2">
                        <Button
                            variant="destructive"
                            onClick={() => {
                                onRejectCandidate(candidate.id);
                                onOpenChange(false);
                            }}
                        >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject Candidate
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => onSendEmail(candidate.email)}
                        >
                            <Mail className="w-4 h-4 mr-1" />
                            Send Email
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Close
                        </Button>
                        <Button
                            onClick={() => {
                                onScheduleInterview(candidate);
                                onOpenChange(false);
                            }}
                        >
                            <Calendar className="w-4 h-4 mr-1" />
                            Schedule Interview
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CandidateProfileDialog;