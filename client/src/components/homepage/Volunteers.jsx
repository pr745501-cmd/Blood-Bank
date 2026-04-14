import { useEffect, useState } from "react";
import axios from "axios";

const rowBg = (rank) => {
  if (rank === 1) return "bg-white/60";
  if (rank === 2) return "bg-white/40";
  if (rank === 3) return "bg-white/20";
  return "bg-white/10";
};

const Volunteers = () => {
  const [donors, setDonors] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/donor/all")
      .then((res) => {
        const list = (res.data || [])
          .slice(0, 10)
          .map((d, i) => ({
            rank: i + 1,
            name: d.name,
            location: d.city || d.address || "India",
            bloodType: d.bloodGroup,
          }));
        setDonors(list);
      })
      .catch(() => {});
  }, []);

  return (
    <section id="volunteers" className="bg-[#f08080] py-16">
      {/* Heading strip */}
      <div className="bg-white/90 py-4 text-center mb-6">
        <h2
          className="text-3xl md:text-4xl font-bold text-gray-800"
          style={{ fontFamily: "'Alegreya Sans SC', serif" }}
        >
          Our super heroes
        </h2>
      </div>

      {/* Description */}
      <div className="bg-white/80 mx-auto max-w-3xl rounded-lg px-6 py-4 mb-8 text-center text-gray-700 leading-relaxed">
        We depend on volunteers! Volunteers make up 96% of our total workforce and carry on our humanitarian work.
        Blood donation is healthy, our volunteers are available 24/7 to help and donate blood. Blood banks store
        blood bags but our volunteers are there with you in an emergency for a blood transfusion real time.
      </div>

      {/* Leaderboard */}
      <div className="overflow-x-auto px-4">
        <ul className="mx-auto max-w-[450px] bg-black/40 rounded-xl p-4 space-y-2">
          {donors.length === 0 ? (
            <li className="text-white/60 text-center py-6 text-sm">Loading donors…</li>
          ) : (
            donors.map((donor) => (
              <li
                key={donor.rank}
                className={`${rowBg(donor.rank)} text-white flex items-center gap-3 px-4 py-2 rounded-lg hover:scale-105 hover:bg-pink-200 hover:text-gray-800 transition-transform cursor-default`}
              >
                <span className="w-6 text-center font-bold shrink-0">{donor.rank}</span>
                <span className="flex-1 font-medium">{donor.name}</span>
                <span className="text-sm opacity-80 hidden sm:block">{donor.location}</span>
                <span className="shrink-0 font-semibold">{donor.bloodType} 🩸</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
};

export default Volunteers;
