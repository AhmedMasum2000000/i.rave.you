import React, { useState } from 'react';
import { Download, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
import { ArtistLogo } from './ArtistLogo';

export const PressKit: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const oneLineStatement = 'অপূর্ব — Independent electronic music from Bangladesh, exploring rhythm, psychedelia, and the space between sound and consciousness.';

  const shortBio = 'অপূর্ব is the electronic music project of Khalid Bin Alam, a producer, audio engineer, DJ, and A&R at Badenstock Records from Cumilla, Bangladesh. Since beginning his journey in 2016, he has explored psychedelic electronic music, melodic techno, bass-driven club sounds, ambient textures, and experimental production. His wider work includes the Luminous Lullabies and Zalvix projects and playlist curation through PlayLSD.';

  const fullBio = `অপূর্ব is an independent electronic music artist from Cumilla, Bangladesh, and the creative identity of Khalid Bin Alam. He works as a music producer, audio engineer, DJ, and A&R at Badenstock Records. Beginning his electronic music journey in 2016, he developed a self-taught approach to production, mixing, mastering, sound design, and musical experimentation.

His work explores the relationship between rhythm, atmosphere, psychedelic textures, and emotional energy. Moving across psychedelic and melodic electronic music, bass-driven club sounds, ambient compositions, and cinematic experimentation, অপূর্ব approaches genre as a creative tool rather than a limitation. His wider project identities include Luminous Lullabies, Zalvix, and Euphonic. He also lists Qbic Pulse as an upcoming record-label project.

Alongside his artist projects, Khalid curates playlists through PlayLSD. Some Euphonic releases have been removed from Spotify, so availability varies by platform. Rooted in Bangladesh but oriented toward an international electronic music audience, অপূর্ব represents an evolving artistic journey built around experimentation, independence, and a belief that sound can communicate beyond language.`;

  const pressImages = [
    {
      title: 'Official Artist Portrait',
      type: 'Primary Artist Photo',
      resolution: 'High-Res Square (1080x1080)',
      url: 'https://ugc.production.linktr.ee/6605408b-cfe6-457c-b2e4-ef32ca95dafe_606073c7-35ba-44be-8675-092b4bf21316.jpeg',
    },
    {
      title: 'Flagship Artwork — 1by1',
      type: 'Single Artwork',
      resolution: 'Hi-Res Cover Art (3000x3000)',
      url: 'https://ugc.production.linktr.ee/466abdcf-2371-4aff-bca9-cecfe6c0192d_ab67616d0000b27331cf5a17a5870893b547f1ac.jpeg',
    },
    {
      title: 'Monolithic Flow Artwork',
      type: 'Release Visual',
      resolution: 'Hi-Res Cover Art (3000x3000)',
      url: 'https://ugc.production.linktr.ee/fe615147-7f4b-4f6b-a1e9-2a0ae82b5aba_ab67616d0000b2735b82331b23fe80fe873e4c31.jpeg',
    },
    {
      title: 'Billboard Bangladesh Session',
      type: 'Performance Visual',
      resolution: 'Feature Visual',
      url: 'https://ugc.production.linktr.ee/c9bb35e3-554b-4c19-bb6b-70dd266922ed_image.png',
    },
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadPressKit = () => {
    const pressKitBundle = `===================================================================
অপূর্ব (APURBA) — OFFICIAL ELECTRONIC PRESS KIT (EPK)
Artist Identity: Khalid Bin Alam
Origin: Cumilla, Bangladesh
Artistic Journey: Since 2016
Official Artist Links: https://linktr.ee/youmeiyou
Official Linktree: https://linktr.ee/khalidbinalam
Apurba Artist Linktree: https://linktr.ee/youmeiyou
PlayLSD Playlist Curator: https://open.spotify.com/user/31yr74ep4pmmjd54bjrgsyqef33a?si=aa755e1e18184a32
First YouTube Channel: https://www.youtube.com/@euphonic404
Booking & Management: Contact through the official artist links
===================================================================

[CORE PHILOSOPHY]
“Language doesn’t matter. Frequency does.”

[ONE-LINE ARTIST STATEMENT]
${oneLineStatement}

[SHORT BIOGRAPHY]
${shortBio}

[COMPREHENSIVE BIOGRAPHY]
${fullBio}

[KEY ARTISTIC MILESTONES]
- Active producer, sound designer, and DJ since 2016 from Cumilla, Bangladesh.
- Formative roots on first YouTube channel @euphonic404 (Euphonic) spanning 2018–2023 with 23 early productions & remixes.
- 46 verified catalog releases spanning singles, compilation features, and collaborative aliases (ZALVIX, Euphonic, Luminous Lullabies).
- Featured on Billboard Bangladesh for the electronic folk reimagining "Nitol Paye Electric".
- Featured on international Spotify compilation album "London Love".
- Music producer, audio engineer, DJ, and A&R at Badenstock Records; playlist curator for PlayLSD.
- Developing Qbic Pulse as an upcoming record-label project.
- Flagship subterranean psytrance and melodic techno works calibrated to 432 Hz earth harmonic resonance.

[AUDIO SPECIFICATIONS FOR PROMOTERS & FESTIVALS]
- FOH PA System capable of articulate 30 Hz sub reproduction without aggressive master limiters.
- Stage format: Hybrid live synthesis + CDJ-3000 / DJM-900NXS2 setup.
- Official Technical Rider available in the artist website's Live & DJ section.

===================================================================`;

    const blob = new Blob([pressKitBundle], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Apurba_EPK_Press_Kit.txt';
    link.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <section id="press" className="py-20 border-b border-zinc-200/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-zinc-200/70">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-indigo-600 font-semibold">
              Electronic Press Kit (EPK)
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 font-display">
              Media, Promoters & Festival Curators
            </h2>
            <p className="mt-2 text-zinc-600 text-sm sm:text-base max-w-2xl font-light">
              Official press assets, verified biographies, high-resolution visual collateral, and technical documentation for event promoters, music journalists, and festival coordinators.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadPressKit}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-850 active:bg-black rounded-xl flex items-center gap-2 transition-all shadow-md shadow-zinc-950/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>EPK Bundle Downloaded</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Complete EPK (.txt)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Biographies & Copyable Statements in White Glass (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* One-Line Statement Box */}
            <div className="p-5 sm:p-6 rounded-2xl glass-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-700 font-semibold">
                  One-Line Description
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(oneLineStatement, 'oneline')}
                  className="text-xs text-zinc-650 hover:text-zinc-950 flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-pill transition-colors"
                >
                  {copiedKey === 'oneline' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-base text-zinc-950 font-medium italic">
                “{oneLineStatement}”
              </p>
            </div>

            {/* Short Bio Box */}
            <div className="p-5 sm:p-6 rounded-2xl glass-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                  Short Biography (Programs & Festival Flyers)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(shortBio, 'short')}
                  className="text-xs text-zinc-650 hover:text-zinc-950 flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-pill transition-colors"
                >
                  {copiedKey === 'short' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-zinc-700 font-light leading-relaxed">
                {shortBio}
              </p>
            </div>

            {/* Comprehensive Bio Box */}
            <div className="p-5 sm:p-6 rounded-2xl glass-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                  Main Artist Biography (Media & In-Depth Features)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(fullBio, 'full')}
                  className="text-xs text-zinc-650 hover:text-zinc-950 flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-pill transition-colors"
                >
                  {copiedKey === 'full' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs sm:text-sm text-zinc-700 font-light leading-relaxed whitespace-pre-line">
                {fullBio}
              </p>
            </div>
          </div>

          {/* Right Column: Press Images & Brand Fast Facts (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Press Visuals Grid */}
            <div className="p-5 sm:p-6 rounded-2xl glass-card space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                  Approved Press Photos & Artwork
                </span>
                <span className="text-[11px] font-mono text-zinc-400">4 Assets</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {pressImages.map((img) => (
                  <div
                    key={img.title}
                    className="group relative rounded-xl overflow-hidden border border-white/80 bg-zinc-100 shadow-2xs"
                  >
                    <div className="aspect-square w-full overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-2 bg-white/90 backdrop-blur-md border-t border-white/80 flex items-center justify-between text-[11px]">
                      <div className="truncate pr-1">
                        <div className="text-zinc-950 font-medium truncate">{img.title}</div>
                        <div className="text-zinc-500 text-[10px]">{img.type}</div>
                      </div>
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-zinc-400 hover:text-zinc-950 shrink-0"
                        title="View Full Size"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Artist Wordmark Card */}
            <div className="p-5 sm:p-6 rounded-2xl glass-card space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Official Artist Wordmark</span>
                </span>
                <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold">
                  Name
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/80 border border-white/90 shadow-inner flex flex-col items-center justify-center text-center">
                <ArtistLogo variant="monogram" size="xl" />
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-zinc-500 font-mono text-[11px]">Wordmark: অপূর্ব</span>
                <button
                  type="button"
                  onClick={() => {
                    const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="180" viewBox="0 0 520 180"><rect width="100%" height="100%" fill="#fff"/><text x="260" y="115" text-anchor="middle" fill="#09090b" font-family="Anek Bangla, Hind Siliguri, sans-serif" font-size="88" font-weight="700">অপূর্ব</text></svg>`;
                    const blob = new Blob([svgData], { type: 'image/svg+xml' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'Apurba_Wordmark.svg';
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-1.5 rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SVG</span>
                </button>
              </div>
            </div>

            {/* Quick Fast Facts for Event Hosts */}
            <div className="p-5 sm:p-6 rounded-2xl glass-card space-y-3.5">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                Fast Facts & Press Reference
              </span>

              <div className="space-y-2 text-xs text-zinc-700 font-light">
                <div className="flex justify-between py-1.5 border-b border-zinc-150/80">
                  <span className="text-zinc-500">Artist Name (Bengali)</span>
                  <span className="font-bengali font-bold text-zinc-950">অপূর্ব</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-150/80">
                  <span className="text-zinc-500">International Spelling</span>
                  <span className="font-medium text-zinc-950">Apurba</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-150/80">
                  <span className="text-zinc-500">Founder & Producer</span>
                  <span className="font-medium text-zinc-950">Khalid Bin Alam</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-150/80">
                  <span className="text-zinc-500">Hometown</span>
                  <span className="font-medium text-zinc-950">Cumilla, Bangladesh</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-150/80">
                  <span className="text-zinc-500">Catalog Size</span>
                  <span className="font-medium text-zinc-950">46 Works (Releases + Euphonic Archive)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-150/80">
                  <span className="text-zinc-500">First YouTube Channel</span>
                  <a href="https://www.youtube.com/@euphonic404/videos" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline font-medium">
                    @euphonic404 (23 Videos)
                  </a>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500">Booking Point</span>
                  <a href="#booking" className="text-indigo-600 hover:underline font-semibold">
                    Direct Inquiry Form
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
