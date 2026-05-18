import { useState, useEffect } from 'react';
import { BASE_URL_API } from '@/utils/BASE_URL_API';
export const useEmployees = (role?: string) => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                // Replace with your actual API call
                const url = role ? `${BASE_URL_API}/dropdown/employees?role=${role}` : '/dropdown/employees';
                const response = await fetch(url);
                const data = await response.json();
                setEmployees(data.data);
            } catch (error) {
                console.error('Error fetching employees:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, [role]);

    return { employees, loading };
};