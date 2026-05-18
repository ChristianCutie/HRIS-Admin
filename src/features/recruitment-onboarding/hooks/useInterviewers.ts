// hooks/useInterviewers.ts
import { useState, useEffect } from 'react';
import api from '@/utils/axios'; // Use your existing API utility
import { toast } from 'sonner';

export const useInterviewers = () => {
    const [interviewers, setInterviewers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInterviewers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/dropdown/interviewers');

            if (response.data.isSuccess) {
                setInterviewers(response.data.data);
            } else {
                const errorMessage = response.data.message || 'Failed to fetch interviewers';
                setError(errorMessage);
                toast.error(errorMessage);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch interviewers';
            setError(errorMessage);
            toast.error(errorMessage);
            console.error('Error fetching interviewers:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInterviewers();
    }, []);

    return {
        interviewers,
        loading,
        error,
        refetch: fetchInterviewers
    };
};