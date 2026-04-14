import express from "express";

const router = express.Router();

const OVERPASS_MIRRORS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

async function queryOverpass(body) {
  for (const url of OVERPASS_MIRRORS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 25000);
      const res = await fetch(url, {
        method: "POST",
        body,
        headers: { "Content-Type": "text/plain" },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) continue;
      return await res.json();
    } catch {
      // try next mirror
    }
  }
  return null;
}

// GET /api/nearby?lat=xx&lon=yy&radius=15000
router.get("/", async (req, res) => {
  const { lat, lon, radius = 15000 } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "lat and lon are required" });
  }

  const query = `
    [out:json][timeout:40];
    (
      node["amenity"="blood_bank"](around:${radius},${lat},${lon});
      node["healthcare"="blood_bank"](around:${radius},${lat},${lon});
      node["amenity"="hospital"](around:${radius},${lat},${lon});
      node["healthcare"="hospital"](around:${radius},${lat},${lon});
      way["amenity"="hospital"](around:${radius},${lat},${lon});
    );
    out body center;
  `;

  const data = await queryOverpass(query);

  if (!data) {
    return res.status(502).json({ error: "Overpass API unavailable. Try again later." });
  }

  res.json(data);
});

export default router;
