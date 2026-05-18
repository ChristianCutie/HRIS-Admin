import { useState } from 'react';

export const useRecruitmentDialogs = () => {
    const [showJobDialog, setShowJobDialog] = useState(false);
    const [showInterviewDialog, setShowInterviewDialog] = useState(false);
    const [showCandidateDialog, setShowCandidateDialog] = useState(false);
    const [showJobDetailDialog, setShowJobDetailDialog] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [selectedJob, setSelectedJob] = useState<any>(null);

    const [newJob, setNewJob] = useState({
        title: '',
        department_id: '',
        work_type: 'On-site',
        employment_type: 'Full-time',
        location: '',
        salary_range: '',
        status: 'draft',
        description: '',
        posted_date: new Date().toISOString().split('T')[0],
        deadline_date: '',
    });

    // UPDATED: Make sure all required fields are included
    const [newInterview, setNewInterview] = useState({
        candidateId: '',
        candidateName: '',
        position: '',
        interviewer: '',
        date: '',
        time: '',
        type: 'Technical',
        status: 'scheduled', // Make sure status is included
        notes: '',
        location: '',
        meetingLink: '',
    });

    // Reset new job form when dialog closes
    const handleJobDialogChange = (open: boolean) => {
        setShowJobDialog(open);
        if (!open) {
            setNewJob({
                title: '',
                department_id: '',
                work_type: 'On-site',
                employment_type: 'Full-time',
                location: '',
                salary_range: '',
                status: 'draft',
                description: '',
                posted_date: new Date().toISOString().split('T')[0],
                deadline_date: '',
            });
        }
    };

    // UPDATED: Reset new interview form when dialog closes - include all fields
    const handleInterviewDialogChange = (open: boolean) => {
        setShowInterviewDialog(open);
        if (!open) {
            setNewInterview({
                candidateId: '',
                candidateName: '',
                position: '',
                interviewer: '',
                date: '',
                time: '',
                type: 'Technical',
                status: 'scheduled', // Include status
                notes: '',
                location: '',
                meetingLink: '',
            });
        }
    };

    // Reset selected candidate when dialog closes
    const handleCandidateDialogChange = (open: boolean) => {
        setShowCandidateDialog(open);
        if (!open) {
            setSelectedCandidate(null);
        }
    };

    // Reset selected job when dialog closes
    const handleJobDetailDialogChange = (open: boolean) => {
        setShowJobDetailDialog(open);
        if (!open) {
            setSelectedJob(null);
        }
    };

    return {
        // Dialog visibility states
        showJobDialog,
        showInterviewDialog,
        showCandidateDialog,
        showJobDetailDialog,

        // Dialog visibility setters with reset logic
        setShowJobDialog: handleJobDialogChange,
        setShowInterviewDialog: handleInterviewDialogChange,
        setShowCandidateDialog: handleCandidateDialogChange,
        setShowJobDetailDialog: handleJobDetailDialogChange,

        // Selected items
        selectedCandidate,
        setSelectedCandidate,
        selectedJob,
        setSelectedJob,

        // Form data
        newJob,
        setNewJob,
        newInterview,
        setNewInterview
    };
};