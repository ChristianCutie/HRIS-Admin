import api from '@/utils/axios';

export const HOLIDAY_TYPES = ['Regular', 'Special'] as const;
export type HolidayType = typeof HOLIDAY_TYPES[number];
export const HOLIDAY_COUNTRIES = ['US', 'PH'] as const;
export type HolidayCountry = typeof HOLIDAY_COUNTRIES[number];

export interface Holiday {
    id: number;
    holiday_date: string;
    holiday_name: string;
    holiday_type: HolidayType;
    holiday_country: HolidayCountry;
    is_archived?: boolean | number;
}

interface HolidayResponse {
    isSuccess: boolean;
    message: string;
    data?: Holiday | Holiday[];
}

export interface HolidayPayload {
    holiday_date: string;
    holiday_name: string;
    holiday_type: HolidayType;
    holiday_country: HolidayCountry;
}

export const holidayAPI = {
    getAll: () => api.get<HolidayResponse>('/getholidays'),
    create: (data: HolidayPayload) => api.post<HolidayResponse>('/createholidays', data),
    update: (id: number, data: HolidayPayload) => api.post<HolidayResponse>(`/holidays/${id}`, data),
    archive: (id: number) => api.post<HolidayResponse>(`/archiveHolidays/${id}`),
};