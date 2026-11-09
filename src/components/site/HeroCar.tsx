/** رسم السيارة في الواجهة: هيكل بخطوط متوهجة وخط فحص يمسح السيارة (كناية عن الفحص بالكمبيوتر). */
export function HeroCar() {
  const body =
    'M30 150 L40 121 Q62 112 112 108 L172 70 Q192 57 232 56 L322 56 Q352 58 382 80 L424 106 Q482 113 496 129 L500 150 Q500 160 490 160 L456 160 A36 36 0 0 0 384 160 L171 160 A36 36 0 0 0 99 160 L40 160 Q30 160 30 150 Z';
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div className="absolute inset-x-10 bottom-4 h-10 rounded-[50%] bg-brand-600/30 blur-2xl" aria-hidden="true" />
      <svg viewBox="0 0 530 210" className="relative w-full" role="img" aria-label="رسم توضيحي لسيارة أثناء الفحص">
        <defs>
          <linearGradient id="hcBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2c3039" />
            <stop offset="1" stopColor="#15171c" />
          </linearGradient>
          <linearGradient id="hcEdge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ff8238" />
            <stop offset=".6" stopColor="#ef4707" />
            <stop offset="1" stopColor="#ffb347" />
          </linearGradient>
          <linearGradient id="hcScan" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ff8238" stopOpacity="0" />
            <stop offset=".5" stopColor="#ff8238" stopOpacity=".55" />
            <stop offset="1" stopColor="#ff8238" stopOpacity="0" />
          </linearGradient>
          <clipPath id="hcClip">
            <path d={body} />
          </clipPath>
        </defs>
        <path d={body} fill="url(#hcBody)" stroke="url(#hcEdge)" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M182 104 L216 73 Q226 66 246 66 L287 66 L287 104 Z" fill="#0b0c0f" stroke="#434957" strokeWidth="1.5" />
        <path d="M299 66 L326 66 Q346 68 363 84 L382 104 L299 104 Z" fill="#0b0c0f" stroke="#434957" strokeWidth="1.5" />
        <path d="M60 128 H486" stroke="#434957" strokeWidth="1" strokeDasharray="3 6" />
        <rect x="470" y="118" width="22" height="7" rx="3.5" fill="#ffb347" opacity=".9" />
        <rect x="36" y="124" width="14" height="6" rx="3" fill="#ef4707" />
        <g clipPath="url(#hcClip)">
          <rect className="scan-bar" x="-60" y="0" width="60" height="210" fill="url(#hcScan)" />
        </g>
        {[135, 420].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy={160} r={31} fill="#0b0c0f" stroke="#2c3039" strokeWidth="6" />
            <g className="wheel" style={{ transformOrigin: `${cx}px 160px` }}>
              <circle cx={cx} cy={160} r={17} fill="none" stroke="#868fa0" strokeWidth="2.5" />
              {[0, 72, 144, 216, 288].map((a) => (
                <line key={a} x1={cx} y1={160} x2={cx + 17 * Math.cos((a * Math.PI) / 180)} y2={160 + 17 * Math.sin((a * Math.PI) / 180)} stroke="#868fa0" strokeWidth="2.5" strokeLinecap="round" />
              ))}
              <circle cx={cx} cy={160} r={4.5} fill="#ef4707" />
            </g>
          </g>
        ))}
        <line x1="10" y1="194" x2="520" y2="194" stroke="#2c3039" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
