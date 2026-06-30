import React from 'react';

interface IllustrationProps {
  name: string; // 'enggang' | 'lamin' | 'hutan' | 'sungai' | 'sape'
  className?: string;
}

export const Illustration: React.FC<IllustrationProps> = ({ name, className = "w-24 h-24" }) => {
  // 1. Burung Enggang (AI Generated Image)
  if (name === 'enggang') {
    return <img src="/images/burung_enggang.png" alt="Burung Enggang" className={`${className} object-contain`} />;
  }

  // 2. Rumah Lamin (AI Generated Image)
  if (name === 'lamin') {
    return <img src="/images/rumah_lamin.png" alt="Rumah Lamin" className={`${className} object-contain`} />;
  }

  // 3. Hutan Hujan (Lush green cartoon forest trees)
  if (name === 'hutan' || name === 'eksplorasi_hutan' || name === 'Hutan') {
    return (
      <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
        {/* Sky / Back circle */}
        <circle cx="50" cy="50" r="45" fill="#ecfdf5" />
        {/* Sun */}
        <circle cx="25" cy="30" r="8" fill="#fef08a" />
        {/* Clouds */}
        <path d="M 65 30 a 5 5 0 0 1 10 0 a 6 6 0 0 1 8 0 a 5 5 0 0 1 -18 0 z" fill="#f1f5f9" />
        {/* Tree 1 (Back Left) */}
        <rect x="35" y="55" width="4" height="20" rx="2" fill="#78350f" />
        <ellipse cx="37" cy="52" rx="14" ry="12" fill="#059669" />
        {/* Tree 2 (Back Right) */}
        <rect x="62" y="52" width="4" height="22" rx="2" fill="#78350f" />
        <ellipse cx="64" cy="48" rx="12" ry="10" fill="#10b981" />
        {/* Tree 3 (Front Center) */}
        <rect x="48" y="50" width="6" height="28" rx="3" fill="#92400e" />
        <circle cx="51" cy="42" r="18" fill="#10b981" />
        <circle cx="45" cy="38" r="12" fill="#34d399" />
        <circle cx="57" cy="40" r="12" fill="#34d399" />
        {/* Grass / Ground */}
        <path d="M 5 72 Q 50 68 95 72 L 95 95 L 5 95 Z" fill="#059669" />
        {/* Small Flowers */}
        <circle cx="20" cy="78" r="2.5" fill="#f43f5e" />
        <circle cx="23" cy="79" r="1.5" fill="#fef08a" />
        <circle cx="75" cy="79" r="2.5" fill="#fbbf24" />
        <circle cx="77" cy="80" r="1.5" fill="#f43f5e" />
      </svg>
    );
  }

  // 4. Sungai Mahakam & Pesut Dolphin
  if (name === 'sungai' || name === 'eksplorasi_sungai' || name === 'Sungai') {
    return (
      <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
        {/* Sky / Back circle */}
        <circle cx="50" cy="50" r="45" fill="#eff6ff" />
        {/* River Waves (Back) */}
        <path d="M 5 65 Q 25 55 50 65 T 95 65 L 95 95 L 5 95 Z" fill="#60a5fa" />
        {/* Cute Pesut Dolphin leaping */}
        <g transform="translate(15, 10)">
          {/* Back Fin */}
          <path d="M 28 35 Q 20 22 28 20 Q 32 20 30 35 Z" fill="#93c5fd" />
          {/* Tail */}
          <path d="M 15 50 Q 5 50 5 42 Q 10 40 15 45 Z" fill="#93c5fd" />
          <path d="M 15 50 Q 5 54 8 60 Q 12 55 15 51 Z" fill="#93c5fd" />
          {/* Body */}
          <path d="M 12 48 Q 28 30 52 28 Q 62 30 65 36 Q 55 45 42 48 Q 25 52 12 48 Z" fill="#3b82f6" />
          {/* Belly (white) */}
          <path d="M 18 48 Q 30 38 45 37 Q 40 46 18 48 Z" fill="#eff6ff" opacity="0.8" />
          {/* Flipper */}
          <path d="M 38 43 Q 32 55 42 52 Q 43 45 38 43 Z" fill="#2563eb" />
          {/* Eye */}
          <circle cx="55" cy="33" r="1.5" fill="#0f172a" />
          <circle cx="55.5" cy="32.5" r="0.5" fill="#ffffff" />
          {/* Blowhole Water splash */}
          <path d="M 44 26 Q 44 15 40 12 M 45 26 Q 48 16 52 14" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>
        {/* River Waves (Front) */}
        <path d="M 5 72 Q 25 65 50 72 T 95 72 L 95 95 L 5 95 Z" fill="#2563eb" />
        {/* Water ripples */}
        <path d="M 20 80 H 40 M 60 85 H 75" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 5. Musik Sape (Traditional Dayak wooden guitar)
  if (name === 'sape' || name === 'eksplorasi_sape' || name === 'Sape') {
    return (
      <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
        {/* Background circle */}
        <circle cx="50" cy="50" r="45" fill="#fffbeb" />
        {/* Sape body rotated diagonally */}
        <g transform="rotate(-30, 50, 50)">
          {/* Headstock */}
          <rect x="47" y="10" width="6" height="15" rx="1.5" fill="#78350f" />
          {/* Pegs */}
          <circle cx="44" cy="15" r="2" fill="#d97706" />
          <circle cx="44" cy="20" r="2" fill="#d97706" />
          <circle cx="56" cy="15" r="2" fill="#d97706" />
          <circle cx="56" cy="20" r="2" fill="#d97706" />
          {/* Neck */}
          <rect x="48" y="24" width="4" height="24" fill="#92400e" />
          {/* Frets */}
          <line x1="48" y1="28" x2="52" y2="28" stroke="#f59e0b" strokeWidth="1" />
          <line x1="48" y1="33" x2="52" y2="33" stroke="#f59e0b" strokeWidth="1" />
          <line x1="48" y1="38" x2="52" y2="38" stroke="#f59e0b" strokeWidth="1" />
          <line x1="48" y1="43" x2="52" y2="43" stroke="#f59e0b" strokeWidth="1" />
          {/* Body shape (Long Sape) */}
          <path d="M 46 48 L 54 48 L 56 82 L 50 90 L 44 82 Z" fill="#d97706" />
          {/* Tribal Painted Patterns (Red and Yellow) */}
          <path d="M 46 54 L 54 54 Q 50 62 46 64 L 54 64 Q 50 74 54 82 L 46 82 Z" fill="none" stroke="#dc2626" strokeWidth="1.5" opacity="0.8" />
          <path d="M 50 48 V 85" stroke="#fef08a" strokeWidth="1" opacity="0.6" />
          {/* Sound hole */}
          <circle cx="50" cy="74" r="3.5" fill="#451a03" />
          {/* Strings */}
          <line x1="49.5" y1="14" x2="49.5" y2="84" stroke="#cbd5e1" strokeWidth="0.8" />
          <line x1="50.5" y1="14" x2="50.5" y2="84" stroke="#cbd5e1" strokeWidth="0.8" />
          {/* Tailpiece */}
          <rect x="48" y="83" width="4" height="3" fill="#451a03" />
        </g>
      </svg>
    );
  }

  // 6. Pesut Mahakam (AI Generated Image)
  if (name === 'pesut' || name === 'eksplorasi_pesut' || name === 'Pesut') {
    return <img src="/images/pesut_mahakam.png" alt="Pesut Mahakam" className={`${className} object-contain`} />;
  }

  // 7. Orangutan (AI Generated Image)
  if (name === 'orangutan' || name === 'eksplorasi_orangutan' || name === 'Orangutan') {
    return <img src="/images/orangutan.png" alt="Orangutan" className={`${className} object-contain`} />;
  }

  return null;
};
