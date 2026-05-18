import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Users,
    Calendar,
} from 'lucide-react';
import { recruitmentMetrics, getStageColor, getStageLabel, getInitials } from '../utils/constant';

interface RecruitmentOverviewProps {
    applicants: any[];
    interviews: any[];
    loading: boolean;
    onOpenCandidateDetail: (candidate: any) => void;
    onShowJobDialog: (show: boolean) => void;
    onShowInterviewDialog: (show: boolean) => void;
    onSetActiveTab: (tab: string) => void;
}

const RecruitmentOverview = ({
    applicants,
    interviews,
    onOpenCandidateDetail,
    onShowInterviewDialog,
    onSetActiveTab
}: RecruitmentOverviewProps) => {
    const navigate = useNavigate();
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recruitmentMetrics.map((metric, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                            <metric.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metric.value}</div>
                            <p className="text-xs text-muted-foreground">{metric.change} from last month</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common recruitment tasks</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button className="h-20 flex flex-col gap-2" onClick={() => navigate("/job-posting")}>
                            <Plus className="w-6 h-6" />
                            Post New Job
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => onSetActiveTab('pipeline')}>
                            <Users className="w-6 h-6" />
                            Review Candidates
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => onShowInterviewDialog(true)}>
                            <Calendar className="w-6 h-6" />
                            Schedule Interview
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {applicants
                                .filter(app => app.stage === 'new')
                                .slice(0, 5)
                                .map((applicant) => (
                                    <div
                                        key={applicant.id}
                                        className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer"
                                        onClick={() => onOpenCandidateDetail(applicant)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback>
                                                    {getInitials(applicant.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{applicant.name}</p>
                                                <p className="text-sm text-muted-foreground">{applicant.position}</p>
                                            </div>
                                        </div>
                                        <Badge className={getStageColor(applicant.stage)}>
                                            {getStageLabel(applicant.stage)}
                                        </Badge>
                                    </div>
                                ))}
                            {applicants.filter(app => app.stage === 'new').length === 0 && (
                                <p className="text-center text-muted-foreground py-4">No new applications</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Interviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {interviews.filter(i => i.status === 'scheduled').slice(0, 5).map((interview) => (
                                <div key={interview.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div>
                                        <p className="font-medium">{interview.candidateName}</p>
                                        <p className="text-sm text-muted-foreground">{interview.date} at {interview.time}</p>
                                    </div>
                                    <Badge variant="outline">{interview.type}</Badge>
                                </div>
                            ))}
                            {interviews.filter(i => i.status === 'scheduled').length === 0 && (
                                <p className="text-center text-muted-foreground py-4">No scheduled interviews</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default RecruitmentOverview;