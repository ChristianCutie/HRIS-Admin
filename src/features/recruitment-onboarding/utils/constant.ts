import {
    FileText,
    Filter,
    Phone,
    Users,
    CheckCircle,
    XCircle,
    Briefcase,
    Clock
} from 'lucide-react';

export const recruitmentStages = [
    { id: 'new', label: 'New Applications', color: 'bg-blue-100 text-blue-800', icon: FileText },
    { id: 'screening', label: 'Screening', color: 'bg-purple-100 text-purple-800', icon: Filter },
    { id: 'phone-screening', label: 'Phone Screening', color: 'bg-indigo-100 text-indigo-800', icon: Phone },
    { id: 'assessment', label: 'Assessment', color: 'bg-yellow-100 text-yellow-800', icon: FileText },
    { id: 'technical-interview', label: 'Technical Interview', color: 'bg-orange-100 text-orange-800', icon: Users },
    { id: 'final-interview', label: 'Final Interview', color: 'bg-pink-100 text-pink-800', icon: Users },
    { id: 'offer', label: 'Offer Extended', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { id: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
];

export const recruitmentMetrics = [
    { label: 'Open Positions', value: 12, change: '+2', icon: Briefcase },
    { label: 'Active Candidates', value: 45, change: '+8', icon: Users },
    { label: 'This Month Hires', value: 3, change: '+1', icon: CheckCircle },
    { label: 'Avg Time to Hire', value: '18 days', change: '-2', icon: Clock },
];

export const stageMapping = {
    'new': 'new_application',
    'screening': 'screening',
    'phone-screening': 'phone_screening',
    'assessment': 'assessment',
    'technical-interview': 'technical_interview',
    'final-interview': 'final_interview',
    'offer': 'offer_extended',
    'hired': 'hired'
} as const;

export const reverseStageMapping = {
    'new_application': 'new',
    'screening': 'screening',
    'phone_screening': 'phone-screening',
    'assessment': 'assessment',
    'technical_interview': 'technical-interview',
    'final_interview': 'final-interview',
    'offer_extended': 'offer',
    'hired': 'hired'
} as const;

export const getStageColor = (stage: string) => {
    const stageConfig = recruitmentStages.find(s => s.id === stage);
    return stageConfig?.color || 'bg-gray-100 text-gray-800';
};

export const getStageLabel = (stage: string) => {
    const stageConfig = recruitmentStages.find(s => s.id === stage);
    return stageConfig?.label || stage;
};

export const getInitials = (name: string | undefined): string => {
    if (!name || typeof name !== 'string') return '??';

    try {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    } catch {
        return '??';
    }
};

