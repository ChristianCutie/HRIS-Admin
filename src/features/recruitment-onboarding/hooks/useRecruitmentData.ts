import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { applicantAPI, interviewAPI } from '../services/api';
import { transformApplicant, transformInterview } from '../utils/transformer';
import api from '@/utils/axios';
export const useRecruitmentData = (activeTab: string) => {
    const [applicants, setApplicants] = useState([]);
    const [hiredApplicants, setHiredApplicants] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [hiredEmployees, setHiredEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchApplicants = async () => {
        setLoading(true);
        try {
            const response = await applicantAPI.getAll();
            if (response.data.isSuccess) {
                const transformedApplicants = response.data.data.map(transformApplicant);
                setApplicants(transformedApplicants);
            }
        } catch (error) {
            console.error('Error fetching applicants:', error);
            toast.error('Failed to fetch applicants');
        } finally {
            setLoading(false);
        }
    };

    const fetchHiredApplicants = async () => {
        try {
            const response = await applicantAPI.getHired();
            if (response.data.isSuccess) {
                const transformedHired = response.data.data.map(transformApplicant);
                setHiredApplicants(transformedHired);
                setHiredEmployees(transformedHired.map((applicant: any) => ({
                    id: applicant.id,
                    name: applicant.name,
                    email: applicant.email,
                    phone: applicant.phone,
                    position: applicant.position,
                    department: applicant.job_posting?.department || 'Unknown',
                    description: applicant.job_posting?.description || 'N/A',
                    startDate: applicant.appliedDate,
                    salary: 'To be determined',
                    source: applicant.source,
                    skills: applicant.skills
                })));
            }
        } catch (error) {
            console.error('Error fetching hired applicants:', error);
            toast.error('Failed to fetch hired applicants');
        }
    };

    const fetchInterviews = async () => {
        setLoading(true);
        try {
            const response = await interviewAPI.getAll();
            if (response.data.isSuccess) {
                const transformedInterviews = response.data.data.map(transformInterview);
                setInterviews(transformedInterviews);
            }
        } catch (error) {
            console.error('Error fetching interviews:', error);
            toast.error('Failed to fetch interviews');
        } finally {
            setLoading(false);
        }
    };

    // NEW: Function to fetch interviewers dropdown
    const fetchInterviewers = async () => {
        try {
            const response = await api.get('/interviewers/dropdown');
            if (response.data.isSuccess) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching interviewers:', error);
            toast.error('Failed to fetch interviewers');
            return [];
        }
    };

    useEffect(() => {
        switch (activeTab) {
            case 'overview':
                fetchApplicants();
                fetchInterviews();
                break;
            case 'pipeline':
            case 'candidates':
                fetchApplicants();
                break;
            case 'interviews':
                fetchInterviews();
                break;
            case 'assessments':
                fetchApplicants();
                break;
            case 'hired':
                fetchHiredApplicants();
                break;
        }
    }, [activeTab]);

    return {
        applicants,
        hiredApplicants,
        interviews,
        hiredEmployees,
        loading,
        searchTerm,
        setSearchTerm,
        fetchApplicants,
        fetchHiredApplicants,
        fetchInterviews,
        fetchInterviewers // NEW: Export the interviewers fetch function
    };
};