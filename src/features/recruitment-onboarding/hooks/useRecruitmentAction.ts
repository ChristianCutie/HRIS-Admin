// hooks/useRecruitmentActions.ts
import { useState } from 'react';
import api from '@/utils/axios';
import { stageMapping } from '../utils/constant';
import { toast } from 'sonner';

interface UseRecruitmentActionsProps {
    fetchApplicants: () => void;
    fetchHiredApplicants: () => void;
    fetchInterviews: () => void;
}

export const useRecruitmentActions = ({
    fetchApplicants,
    fetchHiredApplicants,
    fetchInterviews
}: UseRecruitmentActionsProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const moveCandidateToStage = async (candidateId: string, stage: string) => {
        setLoading(true);
        setError(null);
        try {
            console.log('🔍 Original stage:', stage);

            // Map the frontend stage to backend stage
            const backendStage = stageMapping[stage as keyof typeof stageMapping];

            if (!backendStage) {
                throw new Error(`Invalid stage: ${stage}`);
            }

            console.log('🔧 Mapped to backend stage:', backendStage);

            const response = await api.post(`/applicants/${candidateId}/move`, {
                stage: backendStage
            });

            console.log('✅ API Response:', response.data);

            if (response.data.isSuccess) {
                await fetchApplicants();
                return true;
            } else {
                throw new Error(response.data.message);
            }
        } catch (err: any) {
            console.error('❌ Error moving candidate:', {
                originalStage: stage,
                error: err.message,
                response: err.response?.data
            });
            setError(err.response?.data?.message || err.message || 'Failed to move candidate');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const hireApplicant = async (candidateId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post(`/applicants/${candidateId}/hire`);

            if (response.data.isSuccess) {
                // Refetch both lists
                await Promise.all([fetchApplicants(), fetchHiredApplicants()]);
                return true;
            } else {
                throw new Error(response.data.message);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to hire candidate');
            console.error('Error hiring candidate:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // UPDATED: Schedule interview function that matches your backend

    const scheduleInterview = async (interviewData: any) => {
        setLoading(true);
        setError(null);
        try {
            // Use the correct endpoint from your interviewAPI
            const response = await api.post(`/applicants/${interviewData.applicant_id}/schedule-interview`, interviewData);

            if (response.data.isSuccess) {
                toast.success('Interview scheduled successfully!');
                await fetchInterviews();
                await fetchApplicants();
                return true;
            } else {
                throw new Error(response.data.message);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to schedule interview';
            setError(errorMessage);
            toast.error(errorMessage);
            console.error('Error scheduling interview:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateInterviewStatus = async (interviewId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post(`/interviews/${interviewId}/noshow`);

            if (response.data.isSuccess) {
                await fetchInterviews();
                return true;
            } else {
                throw new Error(response.data.message);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to update interview status');
            console.error('Error updating interview status:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };


    const submitInterviewFeedback = async (interviewId: string, feedback: any) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post(`/interviews/${interviewId}/feedback`, feedback);

            if (response.data.isSuccess) {
                await fetchInterviews();
                return true;
            } else {
                throw new Error(response.data.message);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to submit feedback');
            console.error('Error submitting feedback:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        moveCandidateToStage,
        hireApplicant,
        scheduleInterview,
        updateInterviewStatus,
        submitInterviewFeedback,
        loading,
        error
    };
};