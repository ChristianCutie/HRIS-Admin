import { reverseStageMapping } from './constant';

export const transformApplicant = (backendApplicant: any) => {
    if (!backendApplicant) {
        console.warn('Received undefined backendApplicant');
        return createDefaultApplicant();
    }

    console.log('Transforming applicant:', backendApplicant);

    try {
        return {
            id: backendApplicant.id?.toString() || 'unknown',
            name: backendApplicant.first_name + " " + backendApplicant.last_name || 'Unknown Candidate',
            email: backendApplicant.email || '',
            phone: backendApplicant.phone || '',
            experience: backendApplicant.experience || '',
            stage: getSafeStage(backendApplicant.stage),
            position: backendApplicant.job_posting?.title || backendApplicant.position || 'Not specified',
            source: backendApplicant.source || '',
            appliedDate: getSafeDate(backendApplicant.applied_date, backendApplicant.created_at),
            rating: backendApplicant.rating || 0,
            notes: backendApplicant.notes || '',
            resume: backendApplicant.resume || '',
            skills: getSafeSkills(backendApplicant.skills),
            is_archived: backendApplicant.is_archived || false,
            module_id: backendApplicant.module_id || null,
            assessment_status: backendApplicant.assessment_status || 'not-started',
            assessment_date: backendApplicant.assessment_date || null,
            attempts: backendApplicant.attempts || 0,
            job_posting: backendApplicant.job_posting ? {
                id: backendApplicant.job_posting.id?.toString() || 'unknown',
                title: backendApplicant.job_posting.title || '',
                department: backendApplicant.job_posting.department?.department_name || 'Unknown',
                location: backendApplicant.job_posting.location || ''
            } : undefined,
            created_at: backendApplicant.created_at || new Date().toISOString(),
            updated_at: backendApplicant.updated_at || new Date().toISOString()
        };
    } catch (error) {
        console.error('Error transforming applicant:', error, backendApplicant);
        return createDefaultApplicant();
    }
};

export const transformInterview = (backendInterview: any) => {
    if (!backendInterview) {
        console.warn('Received undefined backendInterview');
        return createDefaultInterview();
    }

    try {
        const scheduledAt = backendInterview.scheduled_at;
        let date = '';
        let time = '';

        if (scheduledAt) {
            const datetime = new Date(scheduledAt);
            date = datetime.toISOString().split('T')[0];
            time = datetime.toTimeString().split(' ')[0].substring(0, 5);
        }

        return {
            id: backendInterview.id?.toString() || 'unknown',
            candidateId: backendInterview.applicant_id?.toString() || '',
            candidateName: backendInterview.applicant ?
                `${backendInterview.applicant.first_name} ${backendInterview.applicant.last_name}` :
                'Unknown Candidate',
            position: backendInterview.position ||
                backendInterview.applicant?.job_posting?.title ||
                'Not specified',
            interviewer: backendInterview.interviewer ?
                `${backendInterview.interviewer.first_name} ${backendInterview.interviewer.last_name}` :
                'Unknown Interviewer',
            date: date,
            time: time,
            type: backendInterview.mode === 'in-person' ? 'In-Person' :
                backendInterview.mode === 'virtual' ? 'Virtual' :
                    backendInterview.stage || 'Phone Screening',
            status: backendInterview.status || 'scheduled',
            notes: backendInterview.notes || '',
            location: backendInterview.mode === 'in-person' ? backendInterview.location_link : '',
            meetingLink: backendInterview.mode === 'virtual' ? backendInterview.location_link : '',
            created_at: backendInterview.created_at || new Date().toISOString(),
            updated_at: backendInterview.updated_at || new Date().toISOString()
        };
    } catch (error) {
        console.error('Error transforming interview:', error, backendInterview);
        return createDefaultInterview();
    }
};

// Helper functions
const createDefaultApplicant = () => ({
    id: 'default',
    name: 'Unknown Candidate',
    email: '',
    phone: '',
    experience: '',
    stage: 'new',
    position: 'Not specified',
    source: '',
    appliedDate: new Date().toISOString().split('T')[0],
    rating: 0,
    notes: '',
    resume: '',
    skills: [],
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
});

const createDefaultInterview = () => ({
    id: 'default',
    candidateId: '',
    candidateName: 'Unknown Candidate',
    position: 'Not specified',
    interviewer: '',
    date: '',
    time: '',
    type: 'Phone Screening',
    status: 'scheduled',
    notes: '',
    location: '',
    meetingLink: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
});

const getSafeStage = (stage: any): string => {
    if (!stage) return 'new';
    const safeStage = reverseStageMapping[stage as keyof typeof reverseStageMapping];
    return safeStage || stage || 'new';
};

const getSafeDate = (appliedDate: any, createdDate: any): string => {
    const date = appliedDate || createdDate;
    if (!date) return new Date().toISOString().split('T')[0];

    try {
        return date.split('T')[0];
    } catch {
        return new Date().toISOString().split('T')[0];
    }
};

const getSafeSkills = (skills: any): string[] => {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') {
        try {
            return JSON.parse(skills);
        } catch {
            return [];
        }
    }
    return [];
};