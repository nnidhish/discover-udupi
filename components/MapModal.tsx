'use client';
import { X, Search, ChevronUp, MapPin, Star, Navigation } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Location } from '@/types/Location';
import { categories } from '@/data/locations';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Location[];
  onLocationSelect: (location: Location) => void;
  selectedCategory: string;
}

const CAT_ICONS: Record<string, string> = {
  temples: '🕉️',
  food: '🍽️',
  beaches: '🏖️',
  photography: '📸',
};

const MARKER_CSS = `
  .mm-marker {
    background: white;
    border-radius: 50%;
    width: 38px; height: 38px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    border: 3px solid #F59E0B;
    cursor: pointer; font-size: 15px;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .mm-marker:hover { transform: scale(1.12); }
  .mm-marker.selected {
    transform: scale(1.25); border-width: 4px;
    box-shadow: 0 5px 18px rgba(0,0,0,0.28);
  }
  .mm-marker.temples     { border-color: #F59E0B; }
  .mm-marker.beaches     { border-color: #0891B2; }
  .mm-marker.food        { border-color: #16A34A; }
  .mm-marker.photography { border-color: #9333EA; }
`;

const MapModal: React.FC<MapModalProps> = ({
  isOpen,
  onClose,
  locations,
  onLocationSelect,
  selectedCategory: initialCategory,
}) => {
  const mapRef        = useRef<HTMLDivElement>(null);
  const mapInstance   = useRef<L.Map | null>(null);
  const markersMap    = useRef<Map<number, L.Marker>>(new Map());

  const [mapFilter, setMapFilter]     = useState(initialCategory);
  const [mapSearch, setMapSearch]     = useState('');
  const [selectedPin, setSelectedPin] = useState<Location | null>(null);
  const [sheetOpen, setSheetOpen]     = useState(false);

  // Derived: what locations are currently visible
  const visible = locations.filter(loc => {
    const catOk    = mapFilter === 'all' || loc.category === mapFilter;
    const searchOk = loc.name.toLowerCase().includes(mapSearch.toLowerCase()) ||
                     loc.description.toLowerCase().includes(mapSearch.toLowerCase());
    return catOk && searchOk;
  });

  // ── Initialize map ──────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !mapRef.current) return;

    // Inject marker CSS once
    if (!document.getElementById('mm-styles')) {
      const s = document.createElement('style');
      s.id = 'mm-styles';
      s.textContent = MARKER_CSS;
      document.head.appendChild(s);
    }

    // Fix default icon path issue
    delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    const map = L.map(mapRef.current, {
      center:      [13.3409, 74.7421],
      zoom:        13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstance.current = map;

    // Fit all locations in view
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(l => [l.lat, l.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Add one marker per location
    locations.forEach(loc => {
      const icon = L.divIcon({
        html:       `<div class="mm-marker ${loc.category}">${CAT_ICONS[loc.category] ?? '📍'}</div>`,
        className:  '',
        iconSize:   [38, 38],
        iconAnchor: [19, 38],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(map);

      marker.on('click', () => {
        setSelectedPin(loc);
        setSheetOpen(true);
        // Highlight this marker
        markersMap.current.forEach(m => {
          m.getElement()?.querySelector('.mm-marker')?.classList.remove('selected');
        });
        marker.getElement()?.querySelector('.mm-marker')?.classList.add('selected');
      });

      markersMap.current.set(loc.id, marker);
    });

    setTimeout(() => map.invalidateSize(), 120);

    return () => {
      map.remove();
      mapInstance.current = null;
      markersMap.current.clear();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Sync marker visibility with filter / search ─────────────────
  useEffect(() => {
    markersMap.current.forEach((marker, id) => {
      const isVisible = visible.some(l => l.id === id);
      const el = marker.getElement();
      if (el) el.style.display = isVisible ? '' : 'none';
    });
  }, [visible]);

  // ── Helper: select a location from the list ─────────────────────
  const selectFromList = (loc: Location) => {
    setSelectedPin(loc);
    setSheetOpen(false);
    mapInstance.current?.setView([loc.lat, loc.lng], 16);
    markersMap.current.forEach(m => {
      m.getElement()?.querySelector('.mm-marker')?.classList.remove('selected');
    });
    markersMap.current.get(loc.id)?.getElement()
      ?.querySelector('.mm-marker')?.classList.add('selected');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal shell — full-screen on mobile, inset card on desktop */}
      <div className="absolute inset-0 md:inset-8 bg-white md:rounded-2xl overflow-hidden flex flex-col shadow-2xl">

        {/* ── Header ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}
            >
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 leading-tight">Explore Udupi</h2>
              <p className="text-xs text-gray-500">
                {visible.length} of {locations.length} places
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close map"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 flex overflow-hidden relative">

          {/* Leaflet map container */}
          <div ref={mapRef} className="flex-1 h-full z-0" />

          {/* ── Desktop sidebar ── */}
          <aside className="hidden md:flex flex-col w-72 border-l bg-white overflow-hidden">

            {/* Search */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search locations…"
                  value={mapSearch}
                  onChange={e => setMapSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-amber-400 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Category pills */}
            <div className="px-3 py-2 border-b flex gap-1.5 overflow-x-auto scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setMapFilter(cat.id)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                    mapFilter === cat.id
                      ? 'text-white border-transparent'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                  style={
                    mapFilter === cat.id
                      ? { background: `var(--cat-${cat.id}, var(--primary))` }
                      : {}
                  }
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Location list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
              {visible.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-400">No places match your filter</p>
              ) : (
                visible.map(loc => (
                  <button
                    key={loc.id}
                    className={`w-full text-left p-3 rounded-xl border transition-all hover:shadow-sm ${
                      selectedPin?.id === loc.id
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                    onClick={() => selectFromList(loc)}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-xl mt-0.5 leading-none">
                        {CAT_ICONS[loc.category] ?? '📍'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{loc.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3 h-3 text-amber-400 fill-current" />
                          <span className="text-xs text-gray-500">{loc.rating}</span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400">{loc.reviews.toLocaleString()} reviews</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* View details CTA */}
            {selectedPin && (
              <div className="p-3 border-t flex-shrink-0">
                <button
                  onClick={() => { onLocationSelect(selectedPin); onClose(); }}
                  className="w-full py-2.5 text-sm font-semibold text-white rounded-xl flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}
                >
                  <Navigation className="w-4 h-4" />
                  View Details — {selectedPin.name}
                </button>
              </div>
            )}
          </aside>

          {/* ── Mobile bottom sheet ── */}
          <div
            className={`md:hidden absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col z-10 ${
              sheetOpen ? 'max-h-[55%]' : 'max-h-[72px]'
            } overflow-hidden`}
          >
            {/* Drag handle row */}
            <button
              className="flex-shrink-0 flex flex-col items-center pt-2"
              onClick={() => setSheetOpen(o => !o)}
              aria-label={sheetOpen ? 'Collapse list' : 'Expand list'}
            >
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
              <div className="flex items-center justify-between w-full px-4 py-2">
                {selectedPin && !sheetOpen ? (
                  <>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">{CAT_ICONS[selectedPin.category]}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{selectedPin.name}</p>
                        <p className="text-xs text-gray-400">{visible.length} places total</p>
                      </div>
                    </div>
                    <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 font-medium">
                      {visible.length} places{mapFilter !== 'all' ? ` · ${categories.find(c => c.id === mapFilter)?.name}` : ''}
                    </p>
                    <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform ${sheetOpen ? 'rotate-180' : ''}`} />
                  </>
                )}
              </div>
            </button>

            {/* Expanded content */}
            {sheetOpen && (
              <>
                <div className="px-4 pb-2 border-b flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                    <input
                      type="text"
                      placeholder="Search…"
                      value={mapSearch}
                      onChange={e => setMapSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-amber-400 outline-none"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
                  {visible.map(loc => (
                    <button
                      key={loc.id}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        selectedPin?.id === loc.id
                          ? 'border-amber-400 bg-amber-50'
                          : 'border-gray-100 bg-white'
                      }`}
                      onClick={() => selectFromList(loc)}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{CAT_ICONS[loc.category] ?? '📍'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{loc.name}</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-current" />
                            <span className="text-xs text-gray-500">{loc.rating}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* View details CTA */}
            {selectedPin && (
              <div className="px-4 py-3 border-t flex-shrink-0">
                <button
                  onClick={() => { onLocationSelect(selectedPin); onClose(); }}
                  className="w-full py-2.5 text-sm font-semibold text-white rounded-xl flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}
                >
                  <Navigation className="w-4 h-4" />
                  View Details — {selectedPin.name}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
