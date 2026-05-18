import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText } from 'lucide-react';

interface InterviewFeedback {
    overall_rating: number;
    technical_skills: number;
    communication: number;
    cultural_fit: number;
    problem_solving: number;
    experience_level: number;
    recommendation: 'hire' | 'hold' | 'reject';
    key_strengths: string;
    areas_for_improvement: string;
    detailed_notes: string;
    submitted_by?: string;
    submitted_at?: string;
}

interface Interview {
    id: string;
    candidateName: string;
    position: string;
    round?: number;
    interviewer: string;
    feedback?: InterviewFeedback;
}

interface InterviewFeedbackDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    interview: Interview | any;
    onSubmitFeedback: (interviewId: string, feedback: InterviewFeedback) => void;
}

const InterviewFeedbackDialog = ({
    open,
    onOpenChange,
    interview,
    onSubmitFeedback
}: InterviewFeedbackDialogProps) => {
    if (!interview) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        const feedback: InterviewFeedback = {
            overall_rating: Number(formData.get('overall_rating')),
            technical_skills: Number(formData.get('technical_skills')),
            communication: Number(formData.get('communication')),
            cultural_fit: Number(formData.get('cultural_fit')),
            problem_solving: Number(formData.get('problem_solving')),
            experience_level: Number(formData.get('experience_level')),
            recommendation: formData.get('recommendation') as 'hire' | 'hold' | 'reject',
            key_strengths: formData.get('key_strengths') as string,
            areas_for_improvement: formData.get('areas_for_improvement') as string,
            detailed_notes: formData.get('detailed_notes') as string,
            submitted_by: interview.interviewer,
            submitted_at: new Date().toISOString(),
        };

        onSubmitFeedback(interview.id, feedback);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Interview Feedback & Evaluation</DialogTitle>
                    <DialogDescription>
                        {interview.candidateName} - {interview.position} (Round {interview.round || 1})
                    </DialogDescription>
                </DialogHeader>

                {interview.feedback ? (
                    // View existing feedback
                    <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="font-medium">Overall Rating</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={`text-2xl ${i < interview.feedback!.overall_rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                                                ★
                                            </span>
                                        ))}
                                        <span className="ml-2 text-lg font-semibold">{interview.feedback.overall_rating}/5</span>
                                    </div>
                                </div>
                                <Badge
                                    className={
                                        interview.feedback.recommendation === 'hire' ? 'bg-green-600 text-lg px-4 py-2' :
                                            interview.feedback.recommendation === 'hold' ? 'bg-yellow-600 text-lg px-4 py-2' :
                                                'bg-red-600 text-lg px-4 py-2'
                                    }
                                >
                                    {interview.feedback.recommendation.toUpperCase()}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 border rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Technical Skills</p>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={i < (interview.feedback?.technical_skills || 0) ? 'text-yellow-500' : 'text-gray-300'}>
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="p-3 border rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Communication</p>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={i < (interview.feedback?.communication || 0) ? 'text-yellow-500' : 'text-gray-300'}>
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="p-3 border rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Cultural Fit</p>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={i < (interview.feedback?.cultural_fit || 0) ? 'text-yellow-500' : 'text-gray-300'}>
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="p-3 border rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Problem Solving</p>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={i < (interview.feedback?.problem_solving || 0) ? 'text-yellow-500' : 'text-gray-300'}>
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="p-3 border rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Experience Level</p>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={i < (interview.feedback?.experience_level || 0) ? 'text-yellow-500' : 'text-gray-300'}>
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label>Key Strengths</Label>
                            <p className="mt-2 text-sm p-3 bg-green-50 border border-green-200 rounded-md">
                                {interview.feedback.key_strengths}
                            </p>
                        </div>

                        <div>
                            <Label>Areas for Improvement</Label>
                            <p className="mt-2 text-sm p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                {interview.feedback.areas_for_improvement}
                            </p>
                        </div>

                        <div>
                            <Label>Detailed Notes</Label>
                            <p className="mt-2 text-sm p-3 bg-muted rounded-md whitespace-pre-wrap">
                                {interview.feedback.detailed_notes}
                            </p>
                        </div>

                        {interview.feedback.submitted_by && (
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm">
                                <span className="text-muted-foreground">Submitted by</span>
                                <span className="font-medium">{interview.feedback.submitted_by}</span>
                            </div>
                        )}
                        {interview.feedback.submitted_at && (
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm">
                                <span className="text-muted-foreground">Submitted on</span>
                                <span className="font-medium">
                                    {new Date(interview.feedback.submitted_at).toLocaleDateString()}
                                </span>
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    // Add new feedback
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="overall_rating">Overall Rating *</Label>
                            <Select name="overall_rating" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select overall rating" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 - Exceptional</SelectItem>
                                    <SelectItem value="4">4 - Above Average</SelectItem>
                                    <SelectItem value="3">3 - Average</SelectItem>
                                    <SelectItem value="2">2 - Below Average</SelectItem>
                                    <SelectItem value="1">1 - Poor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="technical_skills">Technical Skills *</Label>
                                <Select name="technical_skills" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select rating" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5 - Excellent</SelectItem>
                                        <SelectItem value="4">4 - Good</SelectItem>
                                        <SelectItem value="3">3 - Average</SelectItem>
                                        <SelectItem value="2">2 - Fair</SelectItem>
                                        <SelectItem value="1">1 - Poor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="communication">Communication *</Label>
                                <Select name="communication" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select rating" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5 - Excellent</SelectItem>
                                        <SelectItem value="4">4 - Good</SelectItem>
                                        <SelectItem value="3">3 - Average</SelectItem>
                                        <SelectItem value="2">2 - Fair</SelectItem>
                                        <SelectItem value="1">1 - Poor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cultural_fit">Cultural Fit *</Label>
                                <Select name="cultural_fit" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select rating" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5 - Excellent</SelectItem>
                                        <SelectItem value="4">4 - Good</SelectItem>
                                        <SelectItem value="3">3 - Average</SelectItem>
                                        <SelectItem value="2">2 - Fair</SelectItem>
                                        <SelectItem value="1">1 - Poor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="problem_solving">Problem Solving *</Label>
                                <Select name="problem_solving" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select rating" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5 - Excellent</SelectItem>
                                        <SelectItem value="4">4 - Good</SelectItem>
                                        <SelectItem value="3">3 - Average</SelectItem>
                                        <SelectItem value="2">2 - Fair</SelectItem>
                                        <SelectItem value="1">1 - Poor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="experience_level">Experience Level *</Label>
                                <Select name="experience_level" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select rating" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5 - Expert</SelectItem>
                                        <SelectItem value="4">4 - Advanced</SelectItem>
                                        <SelectItem value="3">3 - Intermediate</SelectItem>
                                        <SelectItem value="2">2 - Beginner</SelectItem>
                                        <SelectItem value="1">1 - Novice</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="recommendation">Recommendation *</Label>
                                <Select name="recommendation" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select recommendation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hire">Hire</SelectItem>
                                        <SelectItem value="hold">Hold</SelectItem>
                                        <SelectItem value="reject">Reject</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="key_strengths">Key Strengths *</Label>
                            <Textarea
                                name="key_strengths"
                                placeholder="List the candidate's main strengths and positive attributes..."
                                rows={3}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="areas_for_improvement">Areas for Improvement</Label>
                            <Textarea
                                name="areas_for_improvement"
                                placeholder="Note any concerns or areas where the candidate could improve..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="detailed_notes">Detailed Interview Notes *</Label>
                            <Textarea
                                name="detailed_notes"
                                placeholder="Provide detailed notes about the interview, responses to questions, overall impression, etc..."
                                rows={5}
                                required
                            />
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                <FileText className="w-4 h-4 mr-2" />
                                Submit Feedback
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default InterviewFeedbackDialog;