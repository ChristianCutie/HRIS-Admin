import { useState, useEffect } from 'react';
import { BASE_URL_API } from '@/utils/BASE_URL_API';
export const usePositions = () => {
    const [positions, setPositions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPositions = async () => {
            try {
                // Replace with your actual API call
                const response = await fetch(`${BASE_URL_API}/dropdown/position-types`);
                const data = await response.json();
                setPositions(data.data);
            } catch (error) {
                console.error('Error fetching positions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPositions();
    }, []);

    return { positions, loading };
};