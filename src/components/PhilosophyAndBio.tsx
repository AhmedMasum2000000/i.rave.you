import React from 'react';
import { YouTubeIcon } from './PlatformIcons';

export const PhilosophyAndBio: React.FC = () => {
  const pillars = [
    {
      title: '01. Subterranean Roots & Soil Resonance',
      titleBengali: 'মাটির শিকড় ও প্রতিধ্বনি',
      description:
        'Connecting the organic textures of Bangladesh with global electronic sound design. Field recordings, tactile soil micro-acoustics, and deep subterranean low-end create an anchor for psychedelic exploration.',
    },
    {
      title: '02. Frequency as Universal Dialogue',
      titleBengali: 'সার্বজনীন ফ্রিকোয়েন্সি',
      description:
        'Rooted in the principle “Language doesn’t matter. Frequency does.” Pure tones, harmonic overtones, and tuned sub-bass communicate direct emotional states beyond linguistic and cultural constructs.',
    },
    {
      title: '03. Rhythm & Consciousness',
      titleBengali: 'তাল ও সচেতনতা',
      description:
        'The dance floor as a meditative and collective ritual. Hypnotic evolving polyrhythms, precise phase alignment, and dynamic tension guide the listener between spiritual stillness and kinetic physical movement.',
    },
    {
      title: '04. Self-Taught Independent Ethos',
      titleBengali: 'স্বাধীন সৃষ্টির ধারা',
      description:
        'A journey cultivated from Cumilla since 2016 through rigorous experimentation with synthesis, mixing, sound design, and live performance—charting an authentic independent path in modern electronic music.',
    },
  ];

  return (
    <section id="philosophy" className="py-20 border-b border-zinc-200/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="text-xs font-mono uppercase tracking-widest text-indigo-600 font-semibold">
            Artistic Philosophy & Biography
          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 font-display">
            Sound Above Language
          </h2>
          <p className="mt-3 text-lg text-indigo-950 font-light italic">
            “Language doesn’t matter. Frequency does.”
          </p>
        </div>

        {/* 2-Column Split: Comprehensive Bio (Left) & Sonic Pillars (Right) */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Biography Narrative (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-zinc-700 leading-relaxed font-light">
            <div className="p-6 sm:p-8 rounded-3xl glass-card space-y-5">
              <div className="flex items-center gap-4">
                <img
                  src="./images/6605408b-cfe6-457c-b2e4-ef32ca95dafe_606073c7-35ba-44be-8675"
                  alt="Khalid Bin Alam (অপূর্ব)"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/20 shrink-0 shadow-md"
                />
                <div>
                  <h3 className="text-xl font-bold text-zinc-950 font-display flex items-baseline gap-2">
                    <span>Khalid Bin Alam</span>
                    <span className="font-bengali text-base font-normal text-zinc-500">(অপূর্ব)</span>
                  </h3>
                  
                  <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono mt-0.5">
                    <span>Producer · Audio Engineer · DJ · A&amp;R</span>
                    <span aria-hidden="true" className="text-zinc-300">·</span>
                    <span>Cumilla, Bangladesh</span>
                    <span aria-hidden="true" className="text-zinc-300">·</span>
                    <span>Since 2016</span>
                  </div>
                </div>
              </div>

              <p className="text-sm sm:text-base leading-relaxed text-zinc-700">
                <strong className="text-zinc-950 font-semibold">অপূর্ব (Apurba)</strong> is the independent electronic music project of Khalid Bin Alam, a producer, DJ, and sound engineer from Cumilla, Bangladesh. Since 2016, his self-taught practice has spanned music production, audio engineering, mixing, mastering, sound design, and live performance.
              </p>

              <p className="text-sm sm:text-base leading-relaxed text-zinc-700">
                His work explores the relationship between rhythm, atmosphere, psychedelic textures, and emotional energy. Moving across psychedelic and melodic electronic music, bass-driven club sounds, ambient compositions, and cinematic experimentation, অপূর্ব approaches genre as a creative tool rather than a limitation.
              </p>

              <p className="text-sm sm:text-base leading-relaxed text-zinc-700">
                His sound and artistic direction draw from underground dance culture, hypnotic grooves, spiritual curiosity, organic textures, and the possibilities of electronic sound design. His creative practice extends beyond making records into DJ performance, music curation, and supporting independent artists and electronic music culture.
              </p>

              <p className="text-sm sm:text-base leading-relaxed text-zinc-700">
                His creative foundations were established through his first YouTube channel, <strong className="text-zinc-950 font-semibold">@euphonic404</strong> (under the alias <span className="font-semibold text-indigo-700">Euphonic</span>). Spanning 2018 to 2023, this early archive served as an open production laboratory—spanning future house, synthwave, melodic dance, and collaborative remixes with international vocalists and producers—before evolving into the subterranean sound design and frequency explorations of অপূর্ব.
              </p>

              <p className="text-sm sm:text-base leading-relaxed text-zinc-700">
                His wider creative work includes the Luminous Lullabies and Zalvix projects, A&amp;R work with Badenstock Records, and playlist curation through PlayLSD. He also lists Qbic Pulse as an upcoming record-label project. Some Euphonic releases have been removed from Spotify; availability may vary by platform.
              </p>

              <p className="text-sm sm:text-base leading-relaxed text-zinc-700">
                Rooted in Bangladesh but oriented toward an international electronic music audience, অপূর্ব represents an evolving artistic journey built around experimentation, independence, and a belief that sound can communicate beyond language.
              </p>
            </div>

            {/* Quote Callout in Frosted Glass */}
            <div className="p-6 rounded-2xl glass-card border-indigo-200/80 bg-indigo-50/50 shadow-2xs">
              <div className="text-xs font-mono uppercase text-indigo-700 font-semibold mb-1">
                One-Line Artist Statement
              </div>
              <p className="text-base font-normal text-zinc-950 italic">
                “অপূর্ব — Independent electronic music from Bangladesh, exploring rhythm, psychedelia, and the space between sound and consciousness.”
              </p>
            </div>
          </div>

          {/* Right Column: 4 Sonic Identity Pillars (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">
              Foundational Principles
            </div>

            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl glass-card"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-base font-semibold text-zinc-950 font-display">
                    {pillar.title}
                  </h4>
                  <span className="font-bengali text-xs text-zinc-500 shrink-0">
                    {pillar.titleBengali}
                  </span>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-zinc-650 leading-relaxed font-light">
                  {pillar.description}
                </p>
              </div>
            ))}

            {/* Official artist links */}
            <div className="p-4 rounded-2xl glass-pill flex items-center justify-between text-xs">
              <div className="text-zinc-750">
                <span className="text-indigo-600 font-semibold">Official Artist Links: </span>
                <span className="font-mono">linktr.ee/youmeiyou</span>
              </div>
              <a
                href="https://linktr.ee/youmeiyou"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700 font-semibold underline shrink-0"
              >
                Visit
              </a>
            </div>

            <div className="p-4 rounded-2xl glass-pill flex items-center justify-between text-xs border-emerald-200/60 bg-emerald-50/30">
              <div className="flex items-center gap-2 text-zinc-750">
                <span className="font-semibold text-emerald-700">Playlist curator:</span>
                <span className="font-mono text-zinc-700">PlayLSD</span>
              </div>
              <a
                href="https://open.spotify.com/user/31yr74ep4pmmjd54bjrgsyqef33a?si=aa755e1e18184a32"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-xl bg-[#1DB954]/10 hover:bg-[#1DB954] border border-[#1DB954]/30 text-[#169643] hover:text-white font-semibold transition-colors"
              >
                Spotify
              </a>
            </div>

            {/* First YouTube Channel Badge in Frosted Glass with Authentic Brand Styling */}
            <div className="p-4 rounded-2xl glass-pill flex items-center justify-between text-xs border-red-200/50 bg-red-50/30">
              <div className="flex items-center gap-2 text-zinc-750">
                <YouTubeIcon className="w-4 h-4 text-[#FF0000]" />
                <div>
                  <span className="text-[#FF0000] font-semibold">First YouTube Channel: </span>
                  <span className="font-mono text-zinc-700">@euphonic404 (23 Videos)</span>
                </div>
              </div>
              <a
                href="https://www.youtube.com/@euphonic404/videos"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-xl bg-[#FF0000] hover:bg-[#e60000] text-white font-semibold transition-colors shadow-xs shadow-[#FF0000]/25 shrink-0"
              >
                Vault
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
