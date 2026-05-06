'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Eye, EyeOff, X, ChevronUp, ChevronDown, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { tripService } from '@/lib/supabase';
import { Trip, TripStop, TripTheme, THEME_LABELS } from '@/types/Trip';
import { locations as allLocations } from '@/data/locations';
import toast from 'react-hot-toast';

const THEMES: TripTheme[] = ['temple_trail', 'beach_hopping', 'foodie_tour', 'nature', 'mixed'];

interface StopDraft {
  location_id: number | null;
  tip: string;
  narrative: string;
}

const emptyForm = {
  title: '',
  description: '',
  theme: 'mixed' as TripTheme,
  duration_label: '',
  cover_image_url: '',
  is_published: false,
};

export default function AdminTripsPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [stops, setStops] = useState<StopDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<number | ''>('');

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    const { data, error } = await tripService.getAllTrips();
    if (!error && data) setTrips(data as Trip[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  const openAdd = () => {
    setEditingTrip(null);
    setForm(emptyForm);
    setStops([]);
    setSelectedLocationId('');
    setShowForm(true);
  };

  const openEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setForm({
      title: trip.title,
      description: trip.description,
      theme: trip.theme,
      duration_label: trip.duration_label,
      cover_image_url: trip.cover_image_url ?? '',
      is_published: trip.is_published,
    });
    const sorted = (trip.stops ?? []).sort((a, b) => a.stop_order - b.stop_order);
    setStops(sorted.map((s: TripStop) => ({ location_id: s.location_id ?? null, tip: s.tip ?? '', narrative: s.narrative ?? '' })));
    setSelectedLocationId('');
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingTrip(null); };

  const addStop = () => {
    if (!selectedLocationId) return;
    if (stops.some((s) => s.location_id === selectedLocationId)) {
      toast.error('Location already added');
      return;
    }
    setStops((prev) => [...prev, { location_id: selectedLocationId as number, tip: '', narrative: '' }]);
    setSelectedLocationId('');
  };

  const removeStop = (idx: number) => setStops((prev) => prev.filter((_, i) => i !== idx));

  const moveStop = (idx: number, dir: -1 | 1) => {
    const next = [...stops];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setStops(next);
  };

  const updateStopTip = (idx: number, tip: string) =>
    setStops((prev) => prev.map((s, i) => (i === idx ? { ...s, tip } : s)));

  const updateStopNarrative = (idx: number, narrative: string) =>
    setStops((prev) => prev.map((s, i) => (i === idx ? { ...s, narrative } : s)));

  const addTextBlock = () =>
    setStops((prev) => [...prev, { location_id: null, tip: '', narrative: '' }]);

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.duration_label.trim()) {
      toast.error('Title, description and duration are required');
      return;
    }
    if (!user) return;
    setSaving(true);
    try {
      let tripId: string;
      if (editingTrip) {
        await tripService.updateTrip(editingTrip.id, form);
        tripId = editingTrip.id;
      } else {
        const { data, error } = await tripService.createTrip({ ...form, author_id: user.id });
        if (error || !data) { toast.error('Failed to create trip'); return; }
        tripId = (data as Trip).id;
      }
      await tripService.upsertStops(tripId, stops.map((s, i) => ({
        location_id: s.location_id,
        stop_order: i + 1,
        tip: s.tip || undefined,
        narrative: s.narrative || undefined,
      })));
      toast.success(editingTrip ? 'Trip updated' : 'Trip created');
      closeForm();
      fetchTrips();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (trip: Trip) => {
    if (!confirm(`Delete "${trip.title}"? This cannot be undone.`)) return;
    await tripService.deleteTrip(trip.id);
    toast.success('Trip deleted');
    fetchTrips();
  };

  const togglePublish = async (trip: Trip) => {
    await tripService.updateTrip(trip.id, { is_published: !trip.is_published });
    toast.success(trip.is_published ? 'Set to draft' : 'Published');
    fetchTrips();
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trips</h1>
          <p className="text-sm text-gray-500 mt-1">{trips.length} trip{trips.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Trip
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-20">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No trips yet. Create your first one!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Title</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Theme</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Duration</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Stops</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900 max-w-xs truncate">{trip.title}</td>
                  <td className="px-5 py-4 text-gray-600">{THEME_LABELS[trip.theme]}</td>
                  <td className="px-5 py-4 text-gray-600">{trip.duration_label}</td>
                  <td className="px-5 py-4 text-gray-600">{trip.stops?.length ?? 0}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => togglePublish(trip)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                        trip.is_published
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {trip.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {trip.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(trip)} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(trip)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeForm} />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-gray-900">
                {editingTrip ? 'Edit Trip' : 'New Trip'}
              </h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Title */}
              <Field label="Title *">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. A Perfect Sunday in Udupi"
                  className="w-full h-11 px-4 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none focus:bg-white bg-gray-50 transition-colors"
                />
              </Field>

              {/* Description */}
              <Field label="Description *">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What makes this trip special? Share your local insights..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none focus:bg-white bg-gray-50 transition-colors resize-none"
                />
              </Field>

              {/* Theme + Duration row */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Theme *">
                  <select
                    value={form.theme}
                    onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value as TripTheme }))}
                    className="w-full h-11 px-4 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:border-amber-400 focus:outline-none bg-gray-50 transition-colors"
                  >
                    {THEMES.map((t) => (
                      <option key={t} value={t}>{THEME_LABELS[t]}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Duration *">
                  <input
                    type="text"
                    value={form.duration_label}
                    onChange={(e) => setForm((f) => ({ ...f, duration_label: e.target.value }))}
                    placeholder="e.g. Half day, Full day"
                    className="w-full h-11 px-4 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none focus:bg-white bg-gray-50 transition-colors"
                  />
                </Field>
              </div>

              {/* Cover image */}
              <Field label="Cover Image URL">
                <input
                  type="url"
                  value={form.cover_image_url}
                  onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-11 px-4 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none focus:bg-white bg-gray-50 transition-colors"
                />
              </Field>

              {/* Stops builder */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Itinerary</p>

                {/* Add location stop */}
                <div className="flex gap-2 mb-2">
                  <select
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value ? Number(e.target.value) : '')}
                    className="flex-1 h-10 px-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:border-amber-400 focus:outline-none bg-gray-50"
                  >
                    <option value="">Select a location...</option>
                    {allLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addStop}
                    disabled={!selectedLocationId}
                    className="px-4 h-10 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    + Location
                  </button>
                </div>

                {/* Add text block */}
                <button
                  type="button"
                  onClick={addTextBlock}
                  className="w-full h-9 mb-3 border-2 border-dashed border-gray-300 hover:border-amber-400 hover:text-amber-600 text-gray-400 rounded-xl text-sm font-medium transition-colors"
                >
                  + Text block
                </button>

                {/* Stop list */}
                {stops.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4 border-2 border-dashed border-gray-200 rounded-xl">
                    No items yet — add a location or text block
                  </p>
                ) : (
                  <div className="space-y-2">
                    {stops.map((stop, idx) => {
                      const isTextBlock = stop.location_id === null;
                      const loc = isTextBlock ? null : allLocations.find((l) => l.id === stop.location_id);
                      return (
                        <div
                          key={idx}
                          className={`flex items-start gap-2 p-3 rounded-xl border ${
                            isTextBlock
                              ? 'bg-blue-50/60 border-blue-200 border-dashed'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          {/* Badge */}
                          <div className={`w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-1 ${isTextBlock ? 'bg-blue-400' : 'bg-amber-500'}`}>
                            {isTextBlock ? '¶' : idx + 1}
                          </div>

                          <div className="flex-1 min-w-0">
                            {isTextBlock ? (
                              /* Text block — just a large textarea */
                              <>
                                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1.5">Text block</p>
                                <textarea
                                  value={stop.narrative}
                                  onChange={(e) => updateStopNarrative(idx, e.target.value)}
                                  placeholder="Write your paragraph here — directions, context, local tips, anything the traveller should know at this point in the journey…"
                                  rows={4}
                                  className="w-full px-2.5 py-2 border border-blue-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none bg-white resize-y leading-relaxed"
                                />
                              </>
                            ) : (
                              /* Location stop */
                              <>
                                <p className="text-sm font-medium text-gray-900 mb-1">{loc?.name ?? `Location ${stop.location_id}`}</p>
                                <textarea
                                  value={stop.narrative}
                                  onChange={(e) => updateStopNarrative(idx, e.target.value)}
                                  placeholder="Directions to this stop (e.g. Take bus 55A to Malpe, walk 10 mins…)"
                                  rows={2}
                                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none bg-white resize-none"
                                />
                                <input
                                  type="text"
                                  value={stop.tip}
                                  onChange={(e) => updateStopTip(idx, e.target.value)}
                                  placeholder="Guide's tip about this place (optional)"
                                  className="mt-1.5 w-full h-8 px-2.5 border border-gray-200 rounded-lg text-xs text-gray-700 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none bg-white"
                                />
                              </>
                            )}
                          </div>

                          {/* Controls */}
                          <div className="flex flex-col gap-0.5">
                            <button onClick={() => moveStop(idx, -1)} disabled={idx === 0} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button onClick={() => moveStop(idx, 1)} disabled={idx === stops.length - 1} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>
                          <button onClick={() => removeStop(idx)} className="p-1 text-gray-400 hover:text-red-500 transition-colors mt-0.5">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Published toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${form.is_published ? 'bg-amber-500' : 'bg-gray-300'}`} />
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_published ? 'left-5' : 'left-1'}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {form.is_published ? 'Published — visible on site' : 'Draft — hidden from site'}
                </span>
              </label>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
              <button onClick={closeForm} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {editingTrip ? 'Save Changes' : 'Create Trip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-1.5">{label}</p>
      {children}
    </div>
  );
}
