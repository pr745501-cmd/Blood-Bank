import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Search,
  Navigation,
  Phone,
  Clock,
  Droplets,
  Tent,
  Building2,
  Hospital,
  Loader2,
  AlertCircle,
  ExternalLink,
  Filter,
} from "lucide-react";

const CATEGORY_FILTERS = [
  { id: "all", label: "All", icon: Filter },
  { id: "blood_bank", label: "Blood Banks", icon: Droplets },
  { id: "hospital", label: "Hospitals", icon: Hospital },
  { id: "camp", label: "Blood Camps", icon: Tent },
];

// Backend proxy — calls our Express server which handles Overpass mirrors server-side
async function fetchNearbyFromBackend(lat, lon, radius = 15000) {
  const res = await fetch(
    `http://localhost:5000/api/nearby?lat=${lat}&lon=${lon}&radius=${radius}`
  );
  if (!res.ok) throw new Error("Backend nearby API failed");
  return await res.json();
}

function getCategory(tags) {
  if (tags?.amenity === "blood_bank" || tags?.healthcare === "blood_bank") return "blood_bank";
  if (tags?.amenity === "hospital" || tags?.healthcare === "hospital") return "hospital";
  return "hospital";
}

function getCategoryIcon(cat) {
  if (cat === "blood_bank") return <Droplets size={16} className="text-red-500" />;
  if (cat === "camp") return <Tent size={16} className="text-emerald-500" />;
  return <Building2 size={16} className="text-blue-500" />;
}

function getCategoryBadge(cat) {
  if (cat === "blood_bank") return "bg-red-50 text-red-700 border-red-100";
  if (cat === "camp") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  return "bg-blue-50 text-blue-700 border-blue-100";
}

function getCategoryLabel(cat) {
  if (cat === "blood_bank") return "Blood Bank";
  if (cat === "camp") return "Blood Camp";
  return "Hospital";
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function BloodBankLocator() {
  const [userLocation, setUserLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [locError, setLocError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersLayer = useRef(null);

  // Load Leaflet dynamically
  useEffect(() => {
    if (window.L) { setMapLoaded(true); return; }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Init map once Leaflet is ready
  useEffect(() => {
    if (!mapLoaded || leafletMap.current) return;
    const L = window.L;
    leafletMap.current = L.map(mapRef.current).setView([20.5937, 78.9629], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(leafletMap.current);
    markersLayer.current = L.layerGroup().addTo(leafletMap.current);
  }, [mapLoaded]);

  // Update markers when places or selected changes
  useEffect(() => {
    if (!mapLoaded || !leafletMap.current || !markersLayer.current) return;
    const L = window.L;
    markersLayer.current.clearLayers();

    // User location marker
    if (userLocation) {
      const userIcon = L.divIcon({
        html: `<div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(59,130,246,0.6)"></div>`,
        className: "",
        iconAnchor: [8, 8],
      });
      L.marker([userLocation.lat, userLocation.lon], { icon: userIcon })
        .addTo(markersLayer.current)
        .bindPopup("<b>Your Location</b>");
    }

    filtered.forEach((place) => {
      const isSelected = selected?._id === place._id;
      const color = place.category === "blood_bank" ? "#dc2626" : place.category === "camp" ? "#059669" : "#2563eb";
      const icon = L.divIcon({
        html: `<div style="width:${isSelected ? 20 : 14}px;height:${isSelected ? 20 : 14}px;background:${color};border:${isSelected ? 4 : 2}px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);transition:all 0.2s"></div>`,
        className: "",
        iconAnchor: [isSelected ? 10 : 7, isSelected ? 10 : 7],
      });
      L.marker([place.lat, place.lon], { icon })
        .addTo(markersLayer.current)
        .bindPopup(`<b>${place.name}</b><br/><small>${getCategoryLabel(place.category)}</small>`)
        .on("click", () => setSelected(place));
    });
  }, [filtered, selected, userLocation, mapLoaded]);

  // Pan map to selected
  useEffect(() => {
    if (!selected || !leafletMap.current) return;
    leafletMap.current.flyTo([selected.lat, selected.lon], 15, { duration: 1 });
  }, [selected]);

  // Filter logic
  useEffect(() => {
    let result = places;
    if (activeFilter !== "all") result = result.filter((p) => p.category === activeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    setFiltered(result);
  }, [places, activeFilter, searchQuery]);

  async function fetchNearby(lat, lon) {
    setLoading(true);
    setLocError("");
    try {
      const data = await fetchNearbyFromBackend(lat, lon, 15000);
      const results = (data.elements || [])
        .filter((el) => el.lat || el.center?.lat)
        .map((el) => {
          const elLat = el.lat ?? el.center?.lat;
          const elLon = el.lon ?? el.center?.lon;
          return {
            _id: el.id,
            name: el.tags?.name || el.tags?.["name:en"] || "Unnamed Facility",
            category: getCategory(el.tags),
            lat: elLat,
            lon: elLon,
            phone: el.tags?.phone || el.tags?.["contact:phone"] || null,
            hours: el.tags?.opening_hours || null,
            distance: haversineDistance(lat, lon, elLat, elLon),
          };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 40);

      setPlaces(results);
      if (results.length === 0) setLocError("No facilities found within 15 km. Try a different location.");
    } catch {
      setLocError("Failed to fetch nearby facilities. Please try again.");
    }
    setLoading(false);
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    setLocError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setUserLocation({ lat, lon });
        if (leafletMap.current) leafletMap.current.flyTo([lat, lon], 13, { duration: 1.5 });
        fetchNearby(lat, lon);
      },
      () => {
        setLoading(false);
        setLocError("Location access denied. Please allow location access and try again.");
      }
    );
  }

  async function searchCity(city) {
    if (!city.trim()) return;
    setLoading(true);
    setLocError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`
      );
      const data = await res.json();
      if (!data.length) { setLocError("City not found. Try a different name."); setLoading(false); return; }
      const { lat, lon } = data[0];
      const numLat = parseFloat(lat);
      const numLon = parseFloat(lon);
      setUserLocation({ lat: numLat, lon: numLon });
      if (leafletMap.current) leafletMap.current.flyTo([numLat, numLon], 13, { duration: 1.5 });
      fetchNearby(numLat, numLon);
    } catch {
      setLocError("Search failed. Please try again.");
      setLoading(false);
    }
  }

  const [cityInput, setCityInput] = useState("");

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Header */}
      <div className="relative bg-[#881337] overflow-hidden pt-16 pb-28">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-500 rounded-full blur-[120px] opacity-20 animate-pulse" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="text-red-300" size={18} />
            <span className="text-red-300 font-black tracking-[0.4em] text-[10px] uppercase">Geolocation Services</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
            Blood Bank <span className="text-red-400">Locator</span>
          </h1>
          <p className="text-red-100/70 text-base font-medium mt-3 max-w-xl border-l-2 border-red-500/30 pl-4">
            Find nearby blood banks, hospitals, and active donation camps on a live map.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20 pb-24">

        {/* Search Controls */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* City search */}
            <div className="flex-1 flex gap-3">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by city (e.g. Mumbai, Delhi...)"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchCity(cityInput)}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-3.5 pl-11 pr-4 font-semibold text-slate-700 focus:bg-white focus:border-red-500 outline-none transition-all"
                />
              </div>
              <button
                onClick={() => searchCity(cityInput)}
                disabled={loading}
                className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black uppercase tracking-wider hover:bg-slate-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>

            {/* Detect location */}
            <button
              onClick={detectLocation}
              disabled={loading}
              className="bg-[#881337] text-white px-6 py-3.5 rounded-2xl font-black uppercase tracking-wider shadow-lg hover:bg-red-800 transition-all disabled:opacity-50 flex items-center gap-2 justify-center"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
              Use My Location
            </button>
          </div>

          {locError && (
            <div className="mt-4 flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-2xl text-sm font-semibold">
              <AlertCircle size={16} className="flex-shrink-0" /> {locError}
            </div>
          )}
        </div>

        {/* Main layout: Map + List */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Map */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden" style={{ height: "560px" }}>
              {!mapLoaded && (
                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                  <Loader2 size={32} className="animate-spin text-red-600" />
                </div>
              )}
              <div ref={mapRef} style={{ width: "100%", height: "100%", display: mapLoaded ? "block" : "none" }} />
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-2 text-center">
              Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">OpenStreetMap</a> contributors
            </p>
          </div>

          {/* List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Filter tabs */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-3 flex gap-2 flex-wrap">
              {CATEGORY_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all
                    ${activeFilter === f.id
                      ? "bg-[#881337] text-white shadow-md"
                      : "text-slate-500 hover:bg-slate-50"
                    }`}
                >
                  <f.icon size={13} /> {f.label}
                </button>
              ))}
            </div>

            {/* Search within results */}
            <div className="relative">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter results..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm font-semibold text-slate-700 focus:border-red-400 outline-none transition-all shadow-sm"
              />
            </div>

            {/* Results count */}
            {places.length > 0 && (
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                {filtered.length} {filtered.length === 1 ? "result" : "results"} found
              </p>
            )}

            {/* Empty / loading state */}
            {loading && (
              <div className="bg-white rounded-[2rem] border border-slate-100 p-10 text-center shadow-sm">
                <Loader2 size={32} className="animate-spin text-red-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-500">Searching nearby facilities...</p>
              </div>
            )}

            {!loading && places.length === 0 && !locError && (
              <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-10 text-center">
                <MapPin size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-black text-slate-600 uppercase tracking-tight mb-1">No results yet</p>
                <p className="text-xs text-slate-400 font-medium">Use your location or search a city to find nearby facilities.</p>
              </div>
            )}

            {/* Place cards */}
            {!loading && filtered.length > 0 && (
              <div className="space-y-3 overflow-y-auto" style={{ maxHeight: "440px" }}>
                {filtered.map((place) => (
                  <button
                    key={place._id}
                    onClick={() => setSelected(place)}
                    className={`w-full text-left bg-white rounded-[1.5rem] border-2 p-5 transition-all duration-200 shadow-sm hover:shadow-md
                      ${selected?._id === place._id
                        ? "border-red-500 shadow-red-100"
                        : "border-slate-100 hover:border-red-200"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`p-2 rounded-xl border ${getCategoryBadge(place.category)}`}>
                          {getCategoryIcon(place.category)}
                        </div>
                        <p className="font-black text-slate-800 text-sm leading-tight truncate">{place.name}</p>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border flex-shrink-0 ${getCategoryBadge(place.category)}`}>
                        {getCategoryLabel(place.category)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {place.distance.toFixed(1)} km
                      </span>
                      {place.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={11} /> {place.phone}
                        </span>
                      )}
                      {place.hours && (
                        <span className="flex items-center gap-1 truncate">
                          <Clock size={11} /> {place.hours}
                        </span>
                      )}
                    </div>

                    {selected?._id === place._id && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                        <a
                          href={`https://www.openstreetmap.org/directions?from=&to=${place.lat},${place.lon}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 text-xs font-black text-red-600 hover:underline"
                        >
                          <ExternalLink size={12} /> Get Directions
                        </a>
                        {place.phone && (
                          <a
                            href={`tel:${place.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-xs font-black text-blue-600 hover:underline ml-4"
                          >
                            <Phone size={12} /> Call
                          </a>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
