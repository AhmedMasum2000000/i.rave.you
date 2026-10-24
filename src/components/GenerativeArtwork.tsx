import React from 'react';

interface GenerativeArtworkProps {
  type: 'roots' | 'mandala' | 'wave' | 'mycelium' | 'topography';
  accentColor?: string;
  className?: string;
  interactive?: boolean;
}

export const GenerativeArtwork: React.FC<GenerativeArtworkProps> = ({
  type,
  accentColor = '#6366f1',
  className = 'w-full h-full',
}) => {
  if (type === 'roots') {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-br from-[#0c0d14] to-[#161726] flex items-center justify-center ${className}`}>
        {/* Subtle radial depth & glass sheen */}
        <div
          className="absolute inset-0 opacity-40 mix-blend-screen"
          style={{
            background: `radial-gradient(circle at 50% 60%, ${accentColor}33 0%, transparent 70%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none" />

        <svg viewBox="0 0 400 400" className="w-full h-full p-4 relative z-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="rootGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="40%" stopColor={accentColor} stopOpacity="0.95" />
              <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.3" />
            </linearGradient>
            <filter id="rootGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background subtle grid */}
          <g stroke="rgba(255,255,255,0.06)" strokeWidth="0.5">
            <line x1="50" y1="0" x2="50" y2="400" />
            <line x1="150" y1="0" x2="150" y2="400" />
            <line x1="250" y1="0" x2="250" y2="400" />
            <line x1="350" y1="0" x2="350" y2="400" />
            <line x1="0" y1="100" x2="400" y2="100" />
            <line x1="0" y1="200" x2="400" y2="200" />
            <line x1="0" y1="300" x2="400" y2="300" />
          </g>

          {/* Central Root Trunk descending */}
          <path
            d="M 200 40 Q 195 90 200 140 T 190 220 Q 210 290 200 360"
            fill="none"
            stroke="url(#rootGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#rootGlow)"
          />

          {/* Primary Branch Roots */}
          <path
            d="M 200 140 Q 160 170 130 210 T 80 270 Q 50 310 30 350"
            fill="none"
            stroke={accentColor}
            strokeWidth="2.2"
            strokeOpacity="0.8"
            strokeLinecap="round"
          />
          <path
            d="M 200 140 Q 240 165 270 205 T 320 265 Q 350 300 370 340"
            fill="none"
            stroke={accentColor}
            strokeWidth="2.2"
            strokeOpacity="0.8"
            strokeLinecap="round"
          />

          {/* Secondary Subterranean Filaments */}
          <path
            d="M 190 220 Q 150 250 120 290 T 90 350"
            fill="none"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M 190 220 Q 230 250 260 295 T 300 355"
            fill="none"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M 130 210 Q 110 230 80 235"
            fill="none"
            stroke={accentColor}
            strokeWidth="1"
            strokeOpacity="0.6"
          />
          <path
            d="M 270 205 Q 290 225 330 230"
            fill="none"
            stroke={accentColor}
            strokeWidth="1"
            strokeOpacity="0.6"
          />

          {/* Micro-nodes */}
          <circle cx="200" cy="140" r="4" fill="#ffffff" filter="url(#rootGlow)" />
          <circle cx="190" cy="220" r="3.5" fill="#ffffff" filter="url(#rootGlow)" />
          <circle cx="130" cy="210" r="3" fill={accentColor} />
          <circle cx="270" cy="205" r="3" fill={accentColor} />
          <circle cx="80" cy="270" r="2.5" fill="rgba(255,255,255,0.85)" />
          <circle cx="320" cy="265" r="2.5" fill="rgba(255,255,255,0.85)" />
          <circle cx="200" cy="360" r="3" fill={accentColor} />
        </svg>
      </div>
    );
  }

  if (type === 'mandala') {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-br from-[#0c0a1a] to-[#181232] flex items-center justify-center ${className}`}>
        <div
          className="absolute inset-0 opacity-35"
          style={{
            background: `radial-gradient(circle at center, ${accentColor}44 0%, transparent 65%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none" />

        <svg viewBox="0 0 400 400" className="w-full h-full p-6 relative z-10" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(200, 200)">
            <circle r="160" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />
            <circle r="120" fill="none" stroke={accentColor} strokeOpacity="0.45" strokeWidth="1" />
            <circle r="80" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <circle r="40" fill="none" stroke={accentColor} strokeOpacity="0.85" strokeWidth="1.5" />
            <circle r="6" fill="#ffffff" />

            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <g key={deg} transform={`rotate(${deg})`}>
                <line x1="0" y1="40" x2="0" y2="160" stroke={accentColor} strokeOpacity="0.3" strokeWidth="1" />
                <circle cx="0" cy="80" r="3" fill="rgba(255,255,255,0.75)" />
                <circle cx="0" cy="120" r="4" fill={accentColor} fillOpacity="0.65" />
                <circle cx="0" cy="160" r="2" fill="rgba(255,255,255,0.9)" />
                <path
                  d="M 0 40 Q 20 80 0 120 Q -20 80 0 40"
                  fill="none"
                  stroke={accentColor}
                  strokeOpacity="0.55"
                  strokeWidth="0.8"
                />
              </g>
            ))}
          </g>
        </svg>
      </div>
    );
  }

  if (type === 'mycelium') {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-br from-[#081017] to-[#122332] flex items-center justify-center ${className}`}>
        <div
          className="absolute inset-0 opacity-35"
          style={{
            background: `radial-gradient(circle at 40% 40%, ${accentColor}44 0%, transparent 70%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none" />

        <svg viewBox="0 0 400 400" className="w-full h-full p-4 relative z-10" xmlns="http://www.w3.org/2000/svg">
          <g stroke={accentColor} strokeLinecap="round">
            <path
              d="M 60 180 Q 120 160 160 200 T 260 210 Q 320 180 350 140"
              fill="none"
              strokeWidth="2"
              strokeOpacity="0.85"
            />
            <path
              d="M 160 200 Q 180 270 230 300 T 320 340"
              fill="none"
              strokeWidth="1.6"
              strokeOpacity="0.75"
            />
            <path
              d="M 120 160 Q 140 100 200 80 T 290 70"
              fill="none"
              strokeWidth="1.4"
              strokeOpacity="0.65"
            />
            <path
              d="M 230 300 Q 210 350 150 360"
              fill="none"
              strokeWidth="1"
              strokeOpacity="0.55"
            />
            <path
              d="M 260 210 Q 290 260 340 270"
              fill="none"
              strokeWidth="1.2"
              strokeOpacity="0.65"
            />
          </g>

          <circle cx="160" cy="200" r="4.5" fill="#ffffff" />
          <circle cx="120" cy="160" r="3.5" fill={accentColor} />
          <circle cx="230" cy="300" r="3.5" fill={accentColor} />
          <circle cx="260" cy="210" r="4" fill="#ffffff" />
          <circle cx="200" cy="80" r="3" fill="rgba(255,255,255,0.75)" />
          <circle cx="320" cy="340" r="2.5" fill="rgba(255,255,255,0.9)" />
          <circle cx="350" cy="140" r="2.5" fill="rgba(255,255,255,0.9)" />
        </svg>
      </div>
    );
  }

  if (type === 'topography') {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-br from-[#09101c] to-[#12223a] flex items-center justify-center ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none" />
        <svg viewBox="0 0 400 400" className="w-full h-full p-4 relative z-10" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" stroke={accentColor} strokeWidth="1.2">
            <path
              d="M 20 80 Q 90 60 170 90 T 310 70 Q 360 80 390 110"
              strokeOpacity="0.35"
            />
            <path
              d="M 10 130 Q 110 110 200 140 T 340 120 Q 370 140 390 160"
              strokeOpacity="0.5"
            />
            <path
              d="M 20 180 Q 120 160 210 190 T 330 180 Q 370 200 390 220"
              strokeOpacity="0.65"
              strokeWidth="1.5"
            />
            <path
              d="M 10 240 Q 130 210 220 250 T 350 230 Q 380 250 390 280"
              strokeOpacity="0.85"
              stroke="#ffffff"
            />
            <path
              d="M 20 290 Q 110 270 200 300 T 330 290 Q 370 310 390 330"
              strokeOpacity="0.55"
            />
            <path
              d="M 10 340 Q 100 320 180 350 T 320 340 Q 360 360 390 380"
              strokeOpacity="0.35"
            />
          </g>
        </svg>
      </div>
    );
  }

  // Wave / Oscilloscope
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-[#0c0a1a] to-[#181232] flex items-center justify-center ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none" />
      <svg viewBox="0 0 400 400" className="w-full h-full p-4 relative z-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="waveLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4338ca" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <g fill="none">
          <line x1="20" y1="200" x2="380" y2="200" stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" />
          <path
            d="M 20 200 Q 65 110 110 200 T 200 200 T 290 200 T 380 200"
            stroke={accentColor}
            strokeWidth="1.5"
            strokeOpacity="0.55"
          />
          <path
            d="M 20 200 Q 42 140 65 200 T 110 200 T 155 200 T 200 200 T 245 200 T 290 200 T 335 200 T 380 200"
            stroke="url(#waveLine)"
            strokeWidth="2.5"
          />
          <path
            d="M 20 200 Q 30 180 40 200 T 60 200 T 80 200 T 100 200 T 120 200 T 140 200 T 160 200 T 180 200 T 200 200 T 220 200 T 240 200 T 260 200 T 280 200 T 300 200 T 320 200 T 340 200 T 360 200 T 380 200"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="0.8"
          />
        </g>
      </svg>
    </div>
  );
};
