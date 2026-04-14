export const FEATURE_CARDS = [
  {
    img: '/Images/drop.png',
    title: 'What we do?',
    description:
      'We connect blood donors with recipients, without any intermediary such as blood banks, for an efficient and seamless process.',
  },
  {
    img: '/Images/innovation.png',
    title: 'Innovative',
    description:
      'Blood Buddy is an innovative approach to address global health. We provide immediate access to blood donors.',
  },
  {
    img: '/Images/netwotk.png',
    title: 'Network',
    description:
      'Blood Buddy is one of several community organizations working together as a network that responds to emergencies in an efficient manner.',
  },
  {
    img: '/Images/noti.png',
    title: 'Get notified',
    description:
      'Blood Buddy Connect works with network partners to connect blood donors and recipients through an automated SMS service and a mobile app.',
  },
  {
    img: '/Images/cost.png',
    title: 'Totally Free',
    description:
      "Blood Buddy's ultimate goal is to provide an easy-to-use, easy-to-access, fast, efficient, and reliable way to get life-saving blood, totally Free of cost.",
  },
  {
    img: '/Images/save.png',
    title: 'Save Life',
    description:
      'We are a non profit foundation and our main objective is to make sure that everything is done to protect vulnerable persons. Help us by making a gift!',
  },
];

const Features = () => (
  <section id="about" className="py-16 bg-white">
    <div className="max-w-5xl mx-auto px-6">
      <h2
        className="text-center text-4xl mb-4"
        style={{ fontFamily: "'Alegreya Sans SC', serif" }}
      >
        What is this all about?
      </h2>
      <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">
        We solve the problem of blood emergencies by connecting blood donors directly with people in blood need.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURE_CARDS.map((card) => (
          <div
            key={card.title}
            className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300"
          >
            <img src={card.img} alt={card.title} className="w-24 h-24 object-contain mb-4" />
            <h3
              className="text-xl mb-2"
              style={{ fontFamily: "'Alegreya Sans SC', serif" }}
            >
              {card.title}
            </h3>
            <p
              className="text-gray-600 text-sm leading-relaxed"
              style={{ fontFamily: "'NTR', sans-serif" }}
            >
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
