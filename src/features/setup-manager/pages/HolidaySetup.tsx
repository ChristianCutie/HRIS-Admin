import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Pencil, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HOLIDAY_TYPES, holidayAPI, type Holiday, type HolidayPayload, type HolidayType } from '../services/holidayApi';

const emptyForm: HolidayPayload = { holiday_date: '', holiday_name: '', holiday_type: 'Regular' };

const HolidaySetup = () => {
    const navigate = useNavigate();
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [form, setForm] = useState<HolidayPayload>(emptyForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const loadHolidays = async () => {
        try {
            const response = await holidayAPI.getAll();
            const data = response.data.data;
            setHolidays(Array.isArray(data) ? data.filter((holiday) => !holiday.is_archived) : []);
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

    const updateForm = (field: keyof HolidayPayload, value: string) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const saveHoliday = async () => {
        if (!form.holiday_name.trim() || !form.holiday_date) {
            toast.error('Please enter a name and date');
            return;
        }

        try {
            setIsSaving(true);
            if (editingId === null) {
                await holidayAPI.create({ ...form, holiday_name: form.holiday_name.trim() });
                toast.success('Holiday added successfully');
            } else {
                await holidayAPI.update(editingId, { ...form, holiday_name: form.holiday_name.trim() });
                toast.success('Holiday updated successfully');
            }
            setForm(emptyForm);
            setEditingId(null);
            await loadHolidays();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to save holiday';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const editHoliday = (holiday: Holiday) => {
        setEditingId(holiday.id);
        setForm({
            holiday_date: holiday.holiday_date.slice(0, 10),
            holiday_name: holiday.holiday_name,
            holiday_type: holiday.holiday_type,
        });
    };

    const archiveHoliday = async (holiday: Holiday) => {
        if (!window.confirm(`Archive ${holiday.holiday_name}?`)) return;

        try {
            await holidayAPI.archive(holiday.id);
            toast.success('Holiday archived successfully');
            await loadHolidays();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to archive holiday');
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm(emptyForm);
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-100 px-6 py-4 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                    <button onClick={() => navigate('/dashboard')} className="hover:text-blue-600 transition-colors">Dashboard</button>
                    <span className="text-gray-500">›</span>
                    <button onClick={() => navigate('/setup-manager')} className="hover:text-blue-600 transition-colors">Setup Manager</button>
                    <span className="text-gray-500">›</span>
                    <span className="text-gray-700 font-medium">Holidays</span>
                </div>
            </div>

            <div className="p-6 mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <CalendarDays className="w-8 h-8" />
                        Holidays &amp; Events
                    </h1>
                    <p className="text-muted-foreground mt-2">Add company holidays and important events to your HRIS calendar.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{editingId === null ? 'Add Holiday or Event' : 'Edit Holiday or Event'}</CardTitle>
                        <CardDescription>Keep your company calendar up to date.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="overflow-x-auto">
                            <div className="flex min-w-[720px] items-end gap-4">
                            <div className="min-w-0 flex-1 space-y-2">
                                <Label htmlFor="holiday-event-name">Name</Label>
                                <Input id="holiday-event-name" value={form.holiday_name} onChange={(event) => updateForm('holiday_name', event.target.value)} placeholder="e.g. Independence Day" />
                            </div>
                            <div className="w-[180px] shrink-0 space-y-2">
                                <Label htmlFor="holiday-event-date">Date</Label>
                                <Input id="holiday-event-date" type="date" value={form.holiday_date} onChange={(event) => updateForm('holiday_date', event.target.value)} />
                            </div>
                            <div className="w-[160px] shrink-0 space-y-2">
                                <Label>Type</Label>
                                <Select value={form.holiday_type} onValueChange={(value: HolidayType) => updateForm('holiday_type', value)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {HOLIDAY_TYPES.map((type) => <SelectItem key={type} value={type}>{type} Holiday</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" onClick={() => void saveHoliday()} disabled={isSaving}>
                                    {editingId === null ? <Plus className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                                    {editingId === null ? 'Add' : 'Save'}
                                </Button>
                                {editingId !== null && <Button type="button" variant="outline" size="icon" onClick={cancelEdit} aria-label="Cancel editing"><X className="w-4 h-4" /></Button>}
                            </div>
                            </div>
                        </div>

                        {isLoading ? <p className="rounded-md border p-6 text-center text-sm text-muted-foreground">Loading holidays...</p> : holidays.length > 0 ? (
                            <div className="divide-y rounded-md border">
                                {holidays.map((holiday) => (
                                    <div key={holiday.id} className="flex items-center justify-between gap-4 p-4">
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">{holiday.holiday_name}</p>
                                            <p className="text-sm text-muted-foreground">{new Date(`${holiday.holiday_date.slice(0, 10)}T00:00:00`).toLocaleDateString()} - {holiday.holiday_type === 'Regular' ? 'Regular Holiday' : 'Special Holiday'}</p>
                                        </div>
                                        <div className="flex shrink-0 gap-1">
                                            <Button type="button" variant="ghost" size="icon" onClick={() => editHoliday(holiday)} aria-label={`Edit ${holiday.holiday_name}`}><Pencil className="w-4 h-4" /></Button>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => void archiveHoliday(holiday)} aria-label={`Archive ${holiday.holiday_name}`}><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">No holidays or events added yet.</p>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HolidaySetup;