import express from "express";

const router = express.Router();

const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

// Keywords that indicate a blood bank regardless of OSM tags
const BLOOD_BANK_KEYWORDS = [
  "blood bank",
  "blood centre",
  "blood center",
  "blood storage",
  "raktadan",
  "rakt kosh",
  "blood donation",
  "blood collection",
];

function isBloodBankByName(name = "") {
  const lower = name.toLowerCase();
  return BLOOD_BANK_KEYWORDS.some((kw) => lower.includes(kw));
}

function isBloodBankByTags(tags = {}) {
  return (
    tags.amenity === "blood_bank" ||
    tags.healthcare === "blood_bank" ||
    tags.healthcare === "blood_donation" ||
    tags["healthcare:speciality"] === "blood_bank" ||
    tags.blood_bank === "yes" ||
    isBloodBankByName(tags.name || "") ||
    isBloodBankByName(tags["name:en"] || "") ||
    isBloodBankByName(tags["name:hi"] || "")
  );
}

async function queryOverpass(body, timeoutMs = 30000) {
  for (const url of OVERPASS_MIRRORS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, {
        method: "POST",
        body,
        headers: { "Content-Type": "text/plain" },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) continue;
      const data = await res.json();
      if (data && Array.isArray(data.elements)) return data;
    } catch {
      // try next mirror
    }
  }
  return null;
}

/**
 * Post-process Overpass elements: re-classify hospitals whose name
 * contains blood bank keywords as blood_bank category.
 */
function reclassifyElements(elements) {
  return elements.map((el) => {
    if (!el.tags) return el;
    if (isBloodBankByTags(el.tags)) {
      return {
        ...el,
        tags: { ...el.tags, amenity: "blood_bank", healthcare: "blood_bank" },
      };
    }
    return el;
  });
}

/**
 * Fallback: use Nominatim to search for hospitals and blood banks near a point.
 * Returns a synthetic { elements: [...] } object shaped like Overpass output.
 */
async function queryNominatimFallback(lat, lon, radius) {
  const radiusKm = Math.round(radius / 1000);

  // Search for both hospitals and blood banks explicitly
  const searches = [
    "blood bank",
    "hospital",
    "raktadan kendra",
    "blood centre",
  ];

  const seen = new Set();
  const elements = [];

  for (const term of searches) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      const url =
        `https://nominatim.openstreetmap.org/search` +
        `?q=${encodeURIComponent(term)}` +
        `&format=json&limit=20&addressdetails=0&extratags=1` +
        `&viewbox=${lon - 0.3},${lat + 0.3},${lon + 0.3},${lat - 0.3}` +
        `&bounded=1`;
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "BloodConnect/1.0" },
      });
      clearTimeout(timer);
      if (!res.ok) continue;
      const results = await res.json();

      for (const r of results) {
        if (seen.has(r.place_id)) continue;
        seen.add(r.place_id);

        const elLat = parseFloat(r.lat);
        const elLon = parseFloat(r.lon);

        // Distance filter in degrees (~111 km per degree)
        const distDeg = Math.sqrt((elLat - lat) ** 2 + (elLon - lon) ** 2);
        if (distDeg > radiusKm / 90) continue;

        const displayName = r.display_name || "";
        const firstName = displayName.split(",")[0];

        const bloodBank =
          r.type === "blood_bank" ||
          r.extratags?.amenity === "blood_bank" ||
          r.extratags?.healthcare === "blood_bank" ||
          isBloodBankByName(firstName) ||
          isBloodBankByName(displayName.slice(0, 80));

        elements.push({
          id: r.place_id,
          lat: elLat,
          lon: elLon,
          tags: {
            name: firstName || "Unnamed Facility",
            amenity: bloodBank ? "blood_bank" : "hospital",
            healthcare: bloodBank ? "blood_bank" : "hospital",
            phone: r.extratags?.phone || r.extratags?.["contact:phone"] || null,
            opening_hours: r.extratags?.opening_hours || null,
          },
        });
      }
    } catch {
      // ignore individual search failures
    }
  }

  return elements.length > 0 ? { elements } : null;
}

// GET /api/nearby?lat=xx&lon=yy&radius=15000
router.get("/", async (req, res) => {
  const { lat, lon, radius = 15000 } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "lat and lon are required" });
  }

  // Expanded query — catches all common ways blood banks are tagged in OSM
  const query = `
    [out:json][timeout:45];
    (
      node["amenity"="blood_bank"](around:${radius},${lat},${lon});
      node["healthcare"="blood_bank"](around:${radius},${lat},${lon});
      node["healthcare"="blood_donation"](around:${radius},${lat},${lon});
      node["blood_bank"="yes"](around:${radius},${lat},${lon});
      node["amenity"="hospital"](around:${radius},${lat},${lon});
      node["healthcare"="hospital"](around:${radius},${lat},${lon});
      way["amenity"="blood_bank"](around:${radius},${lat},${lon});
      way["healthcare"="blood_bank"](around:${radius},${lat},${lon});
      way["amenity"="hospital"](around:${radius},${lat},${lon});
      way["healthcare"="hospital"](around:${radius},${lat},${lon});
    );
    out body center;
  `;

  // Try Overpass first, then reclassify by name
  let data = await queryOverpass(query);
  if (data?.elements) {
    data = { ...data, elements: reclassifyElements(data.elements) };
  }

  // If all Overpass mirrors fail, fall back to Nominatim
  if (!data) {
    data = await queryNominatimFallback(parseFloat(lat), parseFloat(lon), parseInt(radius));
  }

  if (!data) {
    return res.status(502).json({
      error: "All map data sources are currently unavailable. Please try again in a moment.",
    });
  }

  res.json(data);
});

export default router;
