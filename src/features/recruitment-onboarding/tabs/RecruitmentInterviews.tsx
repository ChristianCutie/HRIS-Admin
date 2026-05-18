import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Link as LinkIcon, Mail, Plus, Calendar, Clock, User, FileText, CheckCircle, XCircle, Eye } from 'lucide-react';
import InterviewFeedbackDialog from '../components/InterviewFeedbackDialog';
import CandidateProfileDialog from '../components/CandidateProfileDialog';

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

interface Interview {
    id: string;
    candidateId: string;
    candidateName: string;
    position: string;
    interviewer: string;
    date: string;
    time: string;
    type: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'noshow';
    location?: string;
    meetingLink?: string;
    notes?: string;
    round?: number;
    duration?: number;
    interviewPanel?: string[];
    feedback?: {
        rating: number;
        technicalSkills: number;
        communication: number;
        culturalFit: number;
        problemSolving: number;
        experience: number;
        recommendation: 'strong-hire' | 'hire' | 'maybe' | 'no-hire';
        strengths: string;
        weaknesses: string;
        detailedNotes: string;
        submittedBy: string;
        submittedAt: string;
    };
}

interface RecruitmentInterviewsProps {
    interviews: Interview[];
    candidates: Candidate[];
    onShowInterviewDialog: (show: boolean) => void;
    onUpdateInterviewStatus: (interviewId: string, status: string, additionalData?: any) => void;
    onSubmitInterviewFeedback: (interviewId: string, feedback: any) => void;
    onSendEmail?: (candidateEmail: string) => void;
    onMoveCandidateToStage?: (candidateId: string, newStage: string) => void;
    onRejectCandidate?: (candidateId: string) => void;
    interviewFilter?: 'all' | 'upcoming' | 'completed' | 'cancelled';
    onInterviewFilterChange?: (filter: 'all' | 'upcoming' | 'completed' | 'cancelled') => void;
    loading: any;
}

const RecruitmentInterviews = ({
    interviews,
    candidates,
    onShowInterviewDialog,
    onUpdateInterviewStatus,
    onSubmitInterviewFeedback,
    onSendEmail,
    onMoveCandidateToStage,
    onRejectCandidate,
    interviewFilter = 'all',
    onInterviewFilterChange
}: RecruitmentInterviewsProps) => {
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [showInterviewFeedbackDialog, setShowInterviewFeedbackDialog] = useState(false);
    const [showCandidateProfileDialog, setShowCandidateProfileDialog] = useState(false);

    console.log('RecruitmentInterviews component rendered');
    console.log('Interviews count:', interviews.length);
    console.log('Candidates count:', candidates.length);



    const filteredInterviews = interviews.filter(interview => {
        if (interviewFilter === 'all') return true;
        if (interviewFilter === 'upcoming') return interview.status === 'scheduled';
        if (interviewFilter === 'completed') return interview.status === 'completed';
        if (interviewFilter === 'cancelled') return interview.status === 'cancelled' || interview.status === 'noshow';
        return true;
    });

    const upcomingCount = interviews.filter(i => i.status === 'scheduled').length;
    const completedCount = interviews.filter(i => i.status === 'completed').length;
    const cancelledCount = interviews.filter(i => i.status === 'cancelled' || i.status === 'noshow').length;

    const handleFeedbackSubmit = (interviewId: string, feedback: any) => {
        console.log('Submitting feedback for interview:', interviewId);
        onSubmitInterviewFeedback(interviewId, feedback);
    };

    const handleSelectInterview = (interview: Interview) => {
        console.log('Selecting interview:', interview.id);
        setSelectedInterview(interview);
        setShowInterviewFeedbackDialog(true);
    };

    const handleViewCandidateProfile = (candidate: Candidate) => {
        console.log('🔴 handleViewCandidateProfile called with candidate:', candidate);
        console.log('🔴 Candidate name:', candidate.name);
        setSelectedCandidate(candidate);
        setShowCandidateProfileDialog(true);
        console.log('🔴 Dialog state should be true now');
    };

    const handleMoveToStage = (candidateId: string, newStage: string) => {
        console.log('Moving candidate to stage:', candidateId, newStage);
        onMoveCandidateToStage?.(candidateId, newStage);
    };

    const handleRejectCandidate = (candidateId: string) => {
        console.log('Rejecting candidate:', candidateId);
        onRejectCandidate?.(candidateId);
    };

    const handleScheduleInterview = (candidate: Candidate) => {
        console.log('Scheduling interview for candidate:', candidate.name);
        onShowInterviewDialog(true);
    };

    const handleSendEmail = (email: string) => {
        console.log('Sending email to:', email);
        onSendEmail?.(email);
    };

    const recruitmentStages = [
        { id: 'new', label: 'New Applications' },
        { id: 'screening', label: 'Screening' },
        { id: 'phone-screening', label: 'Phone Screening' },
        { id: 'assessment', label: 'Assessment' },
        { id: 'technical-interview', label: 'Technical Interview' },
        { id: 'final-interview', label: 'Final Interview' },
        { id: 'offer', label: 'Offer Extended' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Interview Management</h2>
                    <p className="text-muted-foreground">Schedule, track, and evaluate candidate interviews</p>
                </div>
                <Button onClick={() => {
                    console.log('Schedule Interview button clicked');
                    onShowInterviewDialog(true);
                }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Interview
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Interviews</p>
                                <h3 className="text-2xl font-bold">{interviews.length}</h3>
                            </div>
                            <Calendar className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Upcoming</p>
                                <h3 className="text-2xl font-bold text-blue-600">{upcomingCount}</h3>
                            </div>
                            <Clock className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Completed</p>
                                <h3 className="text-2xl font-bold text-green-600">{completedCount}</h3>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Cancelled/No-show</p>
                                <h3 className="text-2xl font-bold text-red-600">{cancelledCount}</h3>
                            </div>
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                <Button
                    variant={interviewFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onInterviewFilterChange?.('all')}
                >
                    All ({interviews.length})
                </Button>
                <Button
                    variant={interviewFilter === 'upcoming' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onInterviewFilterChange?.('upcoming')}
                >
                    Upcoming ({upcomingCount})
                </Button>
                <Button
                    variant={interviewFilter === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onInterviewFilterChange?.('completed')}
                >
                    Completed ({completedCount})
                </Button>
                <Button
                    variant={interviewFilter === 'cancelled' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onInterviewFilterChange?.('cancelled')}
                >
                    Cancelled/No-show ({cancelledCount})
                </Button>
            </div>

            {/* Interviews List */}
            <div className="space-y-4">
                {filteredInterviews.map((interview) => {
                    const candidate = candidates.find(c => c.id === interview.candidateId);
                    const isUpcoming = interview.status === 'scheduled';
                    const hasFeedback = interview.feedback !== undefined;

                    console.log('Rendering interview:', interview.id, 'with candidate:', candidate);

                    return (
                        <Card key={interview.id} className={isUpcoming ? 'border-l-4 border-l-blue-500' : ''}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4 flex-1">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback>
                                                {interview.candidateName.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-semibold text-lg">{interview.candidateName}</h3>
                                                    <Badge variant="outline" className="text-xs">
                                                        Round {interview.round || 1}
                                                    </Badge>
                                                    <Badge
                                                        variant={
                                                            interview.status === 'completed' ? 'default' :
                                                                interview.status === 'scheduled' ? 'secondary' :
                                                                    'destructive'
                                                        }
                                                        className={
                                                            interview.status === 'completed' ? 'bg-green-600' :
                                                                interview.status === 'scheduled' ? 'bg-blue-600' : ''
                                                        }
                                                    >
                                                        {interview.status === 'noshow' ? 'No Show' : interview.status}
                                                    </Badge>
                                                    {hasFeedback && (
                                                        <Badge className="bg-purple-600">
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Feedback Submitted
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{interview.position}</p>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground block mb-1">Interview Type</span>
                                                    <Badge variant="outline">{interview.type}</Badge>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block mb-1">Date & Time</span>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span className="font-medium">{interview.date}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{interview.time} ({interview.duration || 60} min)</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block mb-1">Interviewer(s)</span>
                                                    <p className="font-medium">{interview.interviewer}</p>
                                                    {interview.interviewPanel && interview.interviewPanel.length > 0 && (
                                                        <p className="text-xs text-muted-foreground">
                                                            +{interview.interviewPanel.length} panel members
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block mb-1">Location</span>
                                                    {interview.meetingLink ? (
                                                        <a
                                                            href={interview.meetingLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline flex items-center gap-1"
                                                        >
                                                            <LinkIcon className="w-3 h-3" />
                                                            Video Call
                                                        </a>
                                                    ) : interview.location ? (
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            <span className="font-medium">{interview.location}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">Not specified</span>
                                                    )}
                                                </div>
                                            </div>

                                            {interview.notes && (
                                                <div className="p-3 bg-muted rounded-md">
                                                    <p className="text-sm"><strong>Notes:</strong> {interview.notes}</p>
                                                </div>
                                            )}

                                            {hasFeedback && interview.feedback && (
                                                <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <p className="text-sm font-medium">Interview Feedback</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                By {interview.feedback.submittedBy} • {interview.feedback.submittedAt}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                className={
                                                                    interview.feedback.recommendation === 'strong-hire' ? 'bg-green-600' :
                                                                        interview.feedback.recommendation === 'hire' ? 'bg-blue-600' :
                                                                            interview.feedback.recommendation === 'maybe' ? 'bg-yellow-600' :
                                                                                'bg-red-600'
                                                                }
                                                            >
                                                                {interview.feedback.recommendation.replace('-', ' ').toUpperCase()}
                                                            </Badge>
                                                            <div className="flex items-center gap-1">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <span key={i} className={i < interview.feedback!.rating ? 'text-yellow-500' : 'text-gray-300'}>
                                                                        ★
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">{interview.feedback.detailedNotes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 ml-4">
                                        {isUpcoming && (
                                            <>
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => {
                                                        console.log('Add Feedback clicked for interview:', interview.id);
                                                        handleSelectInterview(interview);
                                                    }}
                                                >
                                                    <FileText className="w-4 h-4 mr-1" />
                                                    Add Feedback
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        console.log('No Show clicked for interview:', interview.id);
                                                        onUpdateInterviewStatus(interview.id, 'noshow');
                                                    }}
                                                >
                                                    No Show
                                                </Button>
                                            </>
                                        )}
                                        {interview.status === 'completed' && !hasFeedback && (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => {
                                                    console.log('Add Feedback clicked for completed interview:', interview.id);
                                                    handleSelectInterview(interview);
                                                }}
                                            >
                                                <FileText className="w-4 h-4 mr-1" />
                                                Add Feedback
                                            </Button>
                                        )}
                                        {hasFeedback && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    console.log('View Feedback clicked for interview:', interview.id);
                                                    handleSelectInterview(interview);
                                                }}
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View Feedback
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                console.log('🟡 View Profile button clicked for interview:', interview.id);
                                                console.log('🟡 Looking for candidate with ID:', interview.candidateId);
                                                const candidate = candidates.find(c => c.id === interview.candidateId);
                                                console.log('🟡 Found candidate:', candidate);
                                                if (candidate) {
                                                    handleViewCandidateProfile(candidate);
                                                } else {
                                                    console.log('🟡 No candidate found!');
                                                }
                                            }}
                                        >
                                            <User className="w-4 h-4 mr-1" />
                                            View Profile
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                console.log('Email button clicked');
                                                handleSendEmail(candidate?.email || '');
                                            }}
                                        >
                                            <Mail className="w-4 h-4 mr-1" />
                                            Email
                                        </Button>
                                        {isUpcoming && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    console.log('Cancel button clicked');
                                                    if (confirm('Cancel this interview?')) {
                                                        onUpdateInterviewStatus(interview.id, 'cancelled');
                                                    }
                                                }}
                                            >
                                                <XCircle className="w-4 h-4 mr-1" />
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {filteredInterviews.length === 0 && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="font-semibold mb-2">No interviews found</h3>
                            <p className="text-muted-foreground mb-4">
                                {interviewFilter === 'all'
                                    ? 'Schedule your first interview to get started'
                                    : `No ${interviewFilter} interviews at the moment`}
                            </p>
                            {interviewFilter === 'all' && (
                                <Button onClick={() => onShowInterviewDialog(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Schedule Interview
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Interview Feedback Dialog */}
            <InterviewFeedbackDialog
                open={showInterviewFeedbackDialog}
                onOpenChange={setShowInterviewFeedbackDialog}
                interview={selectedInterview}
                onSubmitFeedback={handleFeedbackSubmit}
            />

            {/* Candidate Profile Dialog */}
            <CandidateProfileDialog
                open={showCandidateProfileDialog}
                onOpenChange={setShowCandidateProfileDialog}
                candidate={selectedCandidate}
                onMoveToStage={handleMoveToStage}
                onRejectCandidate={handleRejectCandidate}
                onScheduleInterview={handleScheduleInterview}
                onSendEmail={handleSendEmail}
                recruitmentStages={recruitmentStages}
            />
        </div>
    );
};

export default RecruitmentInterviews;