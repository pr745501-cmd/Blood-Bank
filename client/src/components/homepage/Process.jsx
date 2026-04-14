import { Link } from "react-router-dom";

export const STEPS = [
  { number: 1, emoji: '🧍🏻', title: 'Register' },
  { number: 2, emoji: '🩸', title: 'Post a Blood request' },
  { number: 3, emoji: '✅', title: 'Respond' },
  { number: 4, emoji: '🔢', title: 'Get notified' },
  { number: 5, emoji: '💲❌', title: 'Forever Free' },
  { number: 6, emoji: '🩸🧬', title: 'Save a Life' },
];

const Process = () => (
  <section
    id="donate"
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: `url(/Images/div.jpg)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      padding: '20px',
    }}
  >
    {/* Box — exact from donate.css .box */}
    <div
      style={{
        width: '500px',
        maxWidth: '100%',
        borderBottomLeftRadius: '10px',
        borderBottomRightRadius: '10px',
        borderBottom: '20px solid #DC143C',
      }}
    >
      {/* Red header */}
      <h2
        style={{
          color: '#fff',
          background: '#DC143C',
          padding: '14px 19px',
          fontSize: '20px',
          fontWeight: 700,
          borderTopLeftRadius: '10px',
          borderTopRightRadius: '10px',
          fontFamily: "'Josefin Sans', sans-serif",
          textAlign: 'center',
        }}
      >
        Connect with us &amp; save lives around your location
      </h2>

      {/* Steps list */}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: '24px' }}>
        {STEPS.map(({ number, title, emoji }) => (
          <li
            key={number}
            style={{
              padding: '10px',
              width: '96%',
              background: '#fff',
              boxShadow: '0 5px 25px rgba(0,0,0,0.1)',
              transition: 'transform 0.5s',
              fontFamily: "'Patrick Hand', cursive",
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.background = '#DB7093';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.color = 'inherit';
            }}
          >
            {/* Pink circle number badge */}
            <span
              style={{
                width: '20px',
                height: '20px',
                textAlign: 'center',
                lineHeight: '20px',
                background: '#DB7093',
                color: '#fff',
                display: 'inline-block',
                borderRadius: '50%',
                marginRight: '10px',
                fontSize: '12px',
                fontWeight: 600,
                transform: 'translateY(-2px)',
              }}
            >
              {number}
            </span>
            {title} {emoji}
          </li>
        ))}
      </ul>

      {/* Register button */}
      <div style={{ textAlign: 'center', background: '#fff', paddingTop: '16px', paddingBottom: '16px' }}>
        <Link
          to="/register"
          style={{
            display: 'inline-block',
            textDecoration: 'none',
            color: 'black',
            border: '1px solid #fff',
            padding: '12px 29px',
            fontSize: '20px',
            background: 'transparent',
            cursor: 'pointer',
            letterSpacing: '4px',
            fontFamily: "'Patrick Hand SC', cursive",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.border = '1px solid #DC143C';
            e.currentTarget.style.background = '#DC143C';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.border = '1px solid #fff';
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'black';
          }}
        >
          Register
        </Link>
      </div>
    </div>
  </section>
);

export default Process;
