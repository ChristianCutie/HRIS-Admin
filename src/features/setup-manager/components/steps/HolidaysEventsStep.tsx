import { useEffect, useState } from 'react';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { HolidayFormData, StepComponentProps } from '../setupManagerTypes';
import { HOLIDAY_COUNTRIES, HOLIDAY_TYPES, holidayAPI, type Holiday, type HolidayCountry } from '../../services/holidayApi';

export const HolidaysEventsStep = ({ setupData, setSetupData }: StepComponentProps) => {
    const [newItem, setNewItem] = useState<Omit<HolidayFormData, 'id'>>({
        name: '',
        date: '',
        type: 'Regular',
        country: 'PH',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const applyBackendHolidays = (holidays: Holiday[]) => {
        setSetupData({
            ...setupData,
            holidays: holidays
                .filter((holiday) => !holiday.is_archived)
                .map((holiday) => ({
                    id: holiday.id.toString(),
                    name: holiday.holiday_name,
                    date: holiday.holiday_date.slice(0, 10),
                    type: holiday.holiday_type,
                    country: holiday.holiday_country || 'PH',
                })),
        });
    };

    const loadHolidays = async () => {
        try {
            const response = await holidayAPI.getAll();
            const holidays = response.data.data;
            applyBackendHolidays(Array.isArray(holidays) ? holidays : []);
        } catch (error) {
            console.error('Failed to load holidays:', error);
            toast.error('Failed to load holidays');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadHolidays();
    }, []);

    const addItem = async () => {
        if (!newItem.name.trim() || !newItem.date) {
            toast.error('Please enter a name and date');
            return;
        }

        try {
            setIsSaving(true);
            await holidayAPI.create({
                holiday_date: newItem.date,
                holiday_name: newItem.name.trim(),
                holiday_type: newItem.type,
                holiday_country: newItem.country,
            });
            setNewItem({ name: '', date: '', type: 'Regular', country: 'PH' });
            await loadHolidays();
            toast.success(`${newItem.type} holiday added to setup`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save holiday');
        } finally {
            setIsSaving(false);
        }
    };

    const removeItem = async (id: string) => {
        try {
            setIsSaving(true);
            await holidayAPI.archive(Number(id));
            await loadHolidays();
            toast.success('Holiday archived successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to archive holiday');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5" />
                    Holidays
                </CardTitle>
                <CardDescription>Add company holidays and important events to your HRIS calendar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="overflow-x-auto">
                    <div className="flex min-w-[720px] items-end gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                        <Label htmlFor="holiday-event-name">Name</Label>
                        <Input id="holiday-event-name" value={newItem.name} onChange={(event) => setNewItem({ ...newItem, name: event.target.value })} placeholder="e.g. Independence Day" />
                    </div>
                    <div className="w-[180px] shrink-0 space-y-2">
                        <Label htmlFor="holiday-event-date">Date</Label>
                        <Input id="holiday-event-date" type="date" value={newItem.date} onChange={(event) => setNewItem({ ...newItem, date: event.target.value })} />
                    </div>
                    <div className="w-[160px] shrink-0 space-y-2">
                        <Label>Type</Label>
                        <Select value={newItem.type} onValueChange={(value: HolidayFormData['type']) => setNewItem({ ...newItem, type: value })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {HOLIDAY_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-[180px] shrink-0 space-y-2">
                        <Label>Holiday calendar</Label>
                        <div className="flex h-10 items-center gap-4 rounded-md border px-3">
                            {HOLIDAY_COUNTRIES.map((country) => (
                                <label key={country} className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={newItem.country === country} onChange={(event) => event.target.checked && setNewItem({ ...newItem, country: country as HolidayCountry })} />
                                    {country}
                                </label>
                            ))}
                        </div>
                    </div>
                    <Button type="button" onClick={() => void addItem()} disabled={isSaving}><Plus className="w-4 h-4" />Add</Button>
                    </div>
                </div>

                {isLoading ? <p className="rounded-md border p-6 text-center text-sm text-muted-foreground">Loading holidays...</p> : setupData.holidays.length > 0 ? (
                    <div className="divide-y rounded-md border">
                        {setupData.holidays.map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-4 p-4">
                                <div className="min-w-0">
                                    <p className="font-medium truncate">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{new Date(`${item.date}T00:00:00`).toLocaleDateString()} - {item.country} {item.type} Holiday</p>
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => void removeItem(item.id)} disabled={isSaving} aria-label={`Remove ${item.name}`}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        ))}
                    </div>
                ) : <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">No holidays or events added yet.</p>}
            </CardContent>
        </Card>
    );
};