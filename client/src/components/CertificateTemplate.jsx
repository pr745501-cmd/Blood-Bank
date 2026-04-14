import { QRCodeCanvas } from "qrcode.react";
import logo from "../assets/bloodconnect-logo.jpg";

export default function CertificateTemplate({ cert }) {
  const verifyURL = `http://localhost:3000/verify/${cert.certificateId}`;

  return (
    <div className="w-[1100px] h-[750px] bg-white relative border-[20px] border-red-700 p-4 shadow-2xl overflow-hidden font-sans">
      
      {/* Structural Inner Border */}
      <div className="w-full h-full border-2 border-red-100 flex flex-col justify-between p-12 relative bg-white">
        
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-red-700"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-red-700"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-red-700"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-red-700"></div>

        {/* WATERMARK */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <img src={logo} className="w-[480px] opacity-[0.04]" alt="watermark" />
        </div>

        {/* 1. TOP SECTION: Logo & Header */}
        <div className="text-center z-10 flex flex-col items-center">
          <img src={logo} className="w-20 mb-2" alt="logo" />
          <h1 className="text-5xl font-serif font-extrabold text-red-800 tracking-tight">
            BloodConnect Blood Center
          </h1>
          <p className="text-gray-400 uppercase tracking-[0.3em] text-[11px] font-bold mt-2">
            Saving Lives Through Blood Donation
          </p>
          <div className="w-40 h-[1px] bg-gray-200 mt-4"></div>
        </div>

        {/* 2. MIDDLE SECTION: Main Content */}
        <div className="text-center z-10 -mt-4">
          <h2 className="text-6xl font-serif italic text-gray-700 mb-4 tracking-tight">
            Certificate of Appreciation
          </h2>
          <p className="text-lg text-gray-400 italic font-serif">
            This award is proudly presented to
          </p>
          
          <div className="my-4">
            <h3 className="text-6xl text-red-600 font-bold border-b-4 border-red-50 inline-block px-12 py-2">
              {cert.donorName}
            </h3>
          </div>

          <p className="max-w-3xl mx-auto text-xl text-gray-500 leading-relaxed font-light">
            In recognition of your selfless contribution and noble gesture of 
            voluntarily donating blood. Your generosity provides the gift of 
            life to those in need.
          </p>
        </div>

        {/* 3. BOTTOM SECTION: Data & Signatures */}
        <div className="grid grid-cols-3 items-end z-10 px-4 relative">
          
          {/* QR Code Column */}
          <div className="flex flex-col items-start">
            <div className="p-2 border border-gray-100 bg-white shadow-sm">
              <QRCodeCanvas value={verifyURL} size={90} />
            </div>
            <div className="mt-2">
              <p className="text-[10px] text-gray-400 font-mono tracking-tighter">
                VERIFY ID: {cert.certificateId}
              </p>
            </div>
          </div>

          {/* Details Column (Centered) */}
          <div className="flex flex-col items-center justify-center pb-2">
            <div className="text-center mb-6">
              <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">Blood Group</p>
              <p className="text-4xl font-black text-red-600 leading-none">{cert.bloodGroup}</p>
            </div>
            <div className="w-full h-[1px] bg-gray-100 mb-4"></div>
            <div className="text-center">
              <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">Donation Date</p>
              <p className="text-xl font-bold text-gray-700 leading-none">
                {new Date(cert.donationDate).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Signature Column */}
          <div className="flex flex-col items-end">
            <div className="text-center">
              <p 
                className="text-4xl text-gray-800 mb-0"
                style={{ fontFamily: "'Great Vibes', cursive" }}
              >
                Pankaj Singh Katal
              </p>
              <div className="w-60 h-[2px] bg-gray-800 my-1"></div>
              <p className="text-[12px] font-bold text-gray-600 uppercase tracking-widest">
                Medical Camp Director
              </p>
              <p className="text-[10px] text-gray-400 italic">Authorized Signatory</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}