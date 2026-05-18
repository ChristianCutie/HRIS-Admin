import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Filter, Eye, Mail, CheckCircle } from 'lucide-react';
import { getInitials } from '../utils/constant';
import { useNavigate } from "react-router-dom";

interface RecruitmentHiredProps {
    hiredEmployees: any[];
    onSearchChange: (term: string) => void;
    loading: any;
}

const RecruitmentHired = ({ hiredEmployees, onSearchChange }: RecruitmentHiredProps) => {
    const navigate = useNavigate()
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Hired Employees</h2>
                    <p className="text-muted-foreground">View recently hired candidates</p>
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search hired employees..."
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-64"
                    />
                    <Button variant="outline">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="grid gap-4">
                {hiredEmployees.map((hire) => (
                    <Card key={hire.id}>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start space-x-4 flex-1">
                                    <Avatar className="h-12 w-12">
                                        <AvatarFallback>{getInitials(hire.name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold">{hire.name}</h3>
                                            <Badge className="bg-green-600 text-white">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Hired
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground mb-3">{hire.position}</p>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Department</span>
                                                <p className="font-medium">{hire.department}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Description</span>
                                                <p className="font-medium">{hire.description}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Start Date</span>
                                                <p className="font-medium">{hire.startDate}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Salary</span>
                                                <p className="font-medium">{hire.salary}</p>
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <div className="flex flex-wrap gap-2">
                                                {hire.skills?.slice(0, 4).map((skill: string, index: number) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={() => navigate("/employees")} variant="outline" size="sm">
                                        <Eye className="w-4 h-4 mr-1" />
                                        View Profile
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            // You would implement email functionality here
                                            console.log('Send email to:', hire.email);
                                        }}
                                    >
                                        <Mail className="w-4 h-4 mr-1" />
                                        Contact
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {hiredEmployees.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold mb-2">No hired employees yet</h3>
                        <p className="text-muted-foreground">
                            Hired candidates will appear here once they accept offers
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default RecruitmentHired;