export const TESTIMONIALS = [
  {
    quote:
      "Blood Buddy is just awesome! I just donated for the first time and it could not have been easier. Blood Buddy is doing a very important work and I'm happy that I could contribute. It's hygienic, safe and convenient, I recommend it to everyone!",
    name: "Esha Puri",
    avatar: "/Images/review-3.PNG",
  },
  {
    quote:
      "I found Blood Buddy at a time that my mother was in urgent need of blood. Blood Buddy arranged the required amount in no time. It saved us a lot of hassle and worry especially in such a trying time. Thank you Blood Buddy!",
    name: "Amit Mangal",
    avatar: "/Images/review-2.PNG",
  },
  {
    quote:
      "I have been a part of this organization for quite some time and each time I'm amazed by the seamless and efficient system in place. The importance of timely care especially in the recent times is known and having Blood Buddy takes a load off my mind.",
    name: "Dr. Kabir Khatri",
    avatar: "/Images/review-1.PNG",
  },
];

const Testimonials = () => (
  <section
    id="testimonials"
    style={{
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url(/Images/review-background.jpg)',
      backgroundAttachment: 'fixed',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: '#222',
    }}
    className="py-20"
  >
    <div className="max-w-5xl mx-auto px-6 text-center">
      <h2
        className="text-3xl font-bold uppercase text-white mb-2"
        style={{ fontFamily: "'Alegreya Sans SC', sans-serif" }}
      >
        Testimonials
      </h2>
      <p
        className="text-white uppercase mb-12 tracking-wide"
        style={{ fontFamily: "'Alegreya Sans SC', sans-serif" }}
      >
        See what our users have to say
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, i) => {
          return (
            <div
              key={i}
              className="rounded-lg p-6 text-left"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <span className="block text-white text-5xl leading-none mb-2">&ldquo;</span>
              <p className="text-white italic text-sm leading-relaxed mb-6">{t.quote}</p>
              <div className="flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <span className="font-semibold" style={{ color: '#ffb6c1' }}>
                  {t.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default Testimonials;
