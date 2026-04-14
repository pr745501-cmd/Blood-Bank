import { useState } from "react";
import API from "../../services/api";

export const validateContactForm = ({ name, email, phone, message }) => {
  const errors = {};
  if (!name || !name.trim()) errors.name = "Name is required";
  if (!email || !email.trim()) errors.email = "Email is required";
  if (!phone || !phone.trim()) errors.phone = "Phone is required";
  if (!message || !message.trim()) errors.message = "Message is required";
  return errors;
};

const fieldStyle = {
  width: '100%',
  border: '2px solid rgba(0,0,0,0)',
  outline: 'none',
  backgroundColor: 'rgba(230,230,230,0.6)',
  padding: '0.5rem 1rem',
  fontSize: '1.1rem',
  marginBottom: '22px',
  transition: '0.3s',
  boxSizing: 'border-box',
};

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const validationErrors = validateContactForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      await API.post("/contact", form);
      setSent(true);
    } catch {
      setApiError("Something went wrong. Please try again.");
    }
  };

  return (
    <section
      id="contact"
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 20px',
        background: '#f5f5f5',
      }}
    >
      {/* contact-box — exact from help.css */}
      <div
        style={{
          maxWidth: '850px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          backgroundColor: '#fff',
          boxShadow: '0px 0px 19px 5px rgba(0,0,0,0.19)',
        }}
        className="contact-grid"
      >
        {/* Left — background image */}
        <div
          style={{
            background: 'url(/Images/help.jpg) no-repeat center',
            backgroundSize: 'cover',
            minHeight: '400px',
          }}
        />

        {/* Right — form */}
        <div style={{ padding: '25px 40px' }}>
          {sent ? (
            <div style={{ textAlign: 'center', paddingTop: '60px' }}>
              <p style={{ fontSize: '1.2rem', color: '#008B8B', fontWeight: 600 }}>Message sent! We'll get back to you soon.</p>
              <button
                onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", message: "" }); }}
                style={{ marginTop: '16px', color: '#008B8B', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
              >
                Send another
              </button>
            </div>
          ) : (
            <>
              {/* h2 with teal underline — exact from help.css */}
              <h2
                style={{
                  position: 'relative',
                  padding: '0 0 10px',
                  marginBottom: '10px',
                  fontFamily: "'Advent Pro', sans-serif",
                  textAlign: 'center',
                }}
              >
                Connect with us
                <span
                  style={{
                    content: "''",
                    position: 'absolute',
                    left: '50%',
                    bottom: 0,
                    transform: 'translateX(-50%)',
                    height: '4px',
                    width: '50px',
                    borderRadius: '2px',
                    backgroundColor: '#008B8B',
                    display: 'block',
                  }}
                />
              </h2>

              {apiError && <p style={{ color: 'red', fontSize: '0.9rem', marginBottom: '10px' }}>{apiError}</p>}

              <form onSubmit={handleSubmit} noValidate>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  style={fieldStyle}
                  onFocus={e => { e.target.style.border = '2px solid rgba(30,85,250,0.47)'; e.target.style.backgroundColor = '#fff'; }}
                  onBlur={e => { e.target.style.border = '2px solid rgba(0,0,0,0)'; e.target.style.backgroundColor = 'rgba(230,230,230,0.6)'; }}
                  onMouseEnter={e => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
                  onMouseLeave={e => { if (document.activeElement !== e.target) e.target.style.backgroundColor = 'rgba(230,230,230,0.6)'; }}
                />
                {errors.name && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '-18px', marginBottom: '10px' }}>{errors.name}</p>}

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  style={fieldStyle}
                  onFocus={e => { e.target.style.border = '2px solid rgba(30,85,250,0.47)'; e.target.style.backgroundColor = '#fff'; }}
                  onBlur={e => { e.target.style.border = '2px solid rgba(0,0,0,0)'; e.target.style.backgroundColor = 'rgba(230,230,230,0.6)'; }}
                  onMouseEnter={e => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
                  onMouseLeave={e => { if (document.activeElement !== e.target) e.target.style.backgroundColor = 'rgba(230,230,230,0.6)'; }}
                />
                {errors.email && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '-18px', marginBottom: '10px' }}>{errors.email}</p>}

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  style={fieldStyle}
                  onFocus={e => { e.target.style.border = '2px solid rgba(30,85,250,0.47)'; e.target.style.backgroundColor = '#fff'; }}
                  onBlur={e => { e.target.style.border = '2px solid rgba(0,0,0,0)'; e.target.style.backgroundColor = 'rgba(230,230,230,0.6)'; }}
                  onMouseEnter={e => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
                  onMouseLeave={e => { if (document.activeElement !== e.target) e.target.style.backgroundColor = 'rgba(230,230,230,0.6)'; }}
                />
                {errors.phone && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '-18px', marginBottom: '10px' }}>{errors.phone}</p>}

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Message"
                  style={{ ...fieldStyle, minHeight: '150px', resize: 'vertical' }}
                  onFocus={e => { e.target.style.border = '2px solid rgba(30,85,250,0.47)'; e.target.style.backgroundColor = '#fff'; }}
                  onBlur={e => { e.target.style.border = '2px solid rgba(0,0,0,0)'; e.target.style.backgroundColor = 'rgba(230,230,230,0.6)'; }}
                  onMouseEnter={e => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
                  onMouseLeave={e => { if (document.activeElement !== e.target) e.target.style.backgroundColor = 'rgba(230,230,230,0.6)'; }}
                />
                {errors.message && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '-18px', marginBottom: '10px' }}>{errors.message}</p>}

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#008B8B',
                    color: '#fff',
                    fontSize: '1.1rem',
                    border: 'none',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: '0.3s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(72,61,139,1)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#008B8B'}
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media screen and (max-width: 880px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
          .contact-grid > div:first-child {
            height: 200px !important;
            min-height: 200px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Contact;
