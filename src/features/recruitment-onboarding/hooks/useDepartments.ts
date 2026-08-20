import { useState, useEffect } from 'react';
import { BASE_URL_API } from '@/utils/BASE_URL_API';
export const useDepartments = () => {
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                // Replace with your actual API call
                const response = await fetch(`${BASE_URL_API}/departments`);
                const data = await response.json();
                setDepartments(data.data);
            } catch (error) {
                console.error('Error fetching departments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    return { departments, loading };
};