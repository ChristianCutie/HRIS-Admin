import { useEffect, useState } from 'react';
import axios from 'axios';
import { Archive, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { holidayTypeAPI, type HolidayTypePayload, type HolidayTypeRecord } from '../services/holidayApi';

interface HolidayTypeManagerProps {
    onTypesChanged?: (types: HolidayTypeRecord[]) => void;
}

const emptyForm: HolidayTypePayload = { type_name: '', description: '', rate: 0 };

export const HolidayTypeManager = ({ onTypesChanged }: HolidayTypeManagerProps) => {
    const [types, setTypes] = useState<HolidayTypeRecord[]>([]);
    const [form, setForm] = useState<HolidayTypePayload>(emptyForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [typeToArchive, setTypeToArchive] = useState<HolidayTypeRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);

    const loadTypes = async () => {
        try {
            const response = await holidayTypeAPI.getAll();
            const responseData = response.data.data;
            const loadedTypes = Array.isArray(responseData) ? responseData : [];
            setTypes(loadedTypes);
            onTypesChanged?.(loadedTypes);
        } catch (error) {
            console.error('Failed to load holiday types:', error);
            toast.error('Failed to load holiday types');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadTypes();
        // Load the types once when this manager mounts.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const saveType = async () => {
        const typeName = form.type_name.trim();
        if (!typeName || form.rate < 0 || form.rate > 10) {
            toast.error('Enter a holiday type name and a rate between 0 and 10');
            return;
        }

        try {
            setIsSaving(true);
            const payload = { type_name: typeName, description: form.description?.trim() || '', rate: form.rate };
            if (editingId === null) {
                await holidayTypeAPI.create(payload);
                toast.success('Holiday type created successfully');
            } else {
                await holidayTypeAPI.update(editingId, payload);
                toast.success('Holiday type updated successfully');
            }
            cancelEdit();
            setIsTypeDialogOpen(false);
            await loadTypes();
        } catch (error: unknown) {
            const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
            toast.error(message || 'Failed to save holiday type');
        } finally {
            setIsSaving(false);
        }
    };

    const editType = (type: HolidayTypeRecord) => {
        setEditingId(type.id);
        setForm({ type_name: type.type_name, description: type.description ?? '', rate: type.rate });
        setIsTypeDialogOpen(true);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm(emptyForm);
    };

    const openCreateType = () => {
        cancelEdit();
        setIsTypeDialogOpen(true);
    };

    const archiveType = async () => {
        if (!typeToArchive) return;

        try {
            setIsSaving(true);
            await holidayTypeAPI.archive(typeToArchive.id);
            setTypeToArchive(null);
            toast.success('Holiday type archived successfully');
            await loadTypes();
        } catch (error: unknown) {
            const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
            toast.error(message || 'Failed to archive holiday type');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <CardTitle>Holiday Types</CardTitle>
                            <CardDescription>Create the type that can be selected when adding a holiday.</CardDescription>
                        </div>
                        <Button type="button" onClick={openCreateType}>
                            <Plus className="w-4 h-4" />Create Type
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-5">
                    {isLoading ? <p className="rounded-md border p-5 text-center text-sm text-muted-foreground">Loading holiday types...</p> : types.length ? <div className="divide-y rounded-md border">{types.map((type) => <div key={type.id} className="flex items-center justify-between gap-4 p-3"><div className="min-w-0"><p className="font-medium truncate">{type.type_name}</p><p className="text-sm text-muted-foreground">Rate: {type.rate}</p>{type.description && <p className="text-sm text-muted-foreground truncate">{type.description}</p>}</div><div className="flex shrink-0 gap-1"><Button type="button" variant="ghost" size="icon" onClick={() => editType(type)} aria-label={`Edit ${type.type_name}`}><Pencil className="w-4 h-4" /></Button><Button type="button" variant="ghost" size="icon" onClick={() => setTypeToArchive(type)} aria-label={`Archive ${type.type_name}`}><Trash2 className="w-4 h-4" /></Button></div></div>)}</div> : <p className="rounded-md border border-dashed p-5 text-center text-sm text-muted-foreground">No holiday types created yet.</p>}
                </CardContent>
            </Card>
            <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId === null ? 'Create Holiday Type' : 'Edit Holiday Type'}</DialogTitle>
                        <DialogDescription>Enter the holiday type details and rate.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="holiday-type-name">Type name</Label>
                            <Input id="holiday-type-name" value={form.type_name} onChange={(event) => setForm({ ...form, type_name: event.target.value })} placeholder="e.g. Regular Holiday" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="holiday-type-description">Description</Label>
                            <Textarea id="holiday-type-description" value={form.description ?? ''} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Optional description" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="holiday-type-rate">Rate</Label>
                            <Input id="holiday-type-rate" type="number" min="0" max="10" step="0.01" value={form.rate} onChange={(event) => setForm({ ...form, rate: Number(event.target.value) })} placeholder="e.g. 2.00" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsTypeDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                        <Button type="button" onClick={() => void saveType()} disabled={isSaving}>
                            {editingId === null ? <Plus className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                            {editingId === null ? 'Create' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={typeToArchive !== null} onOpenChange={(open) => !open && setTypeToArchive(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Archive holiday type?</DialogTitle><DialogDescription>Archive {typeToArchive?.type_name}? It will no longer be available for new holidays.</DialogDescription></DialogHeader>
                    <DialogFooter><Button type="button" variant="outline" onClick={() => setTypeToArchive(null)} disabled={isSaving}>Cancel</Button><Button type="button" variant="destructive" onClick={() => void archiveType()} disabled={isSaving}><Archive className="w-4 h-4" />Archive</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
