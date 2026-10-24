import React, { useState } from 'react';
import { Radio, Calendar, MapPin, Download, FileText, CheckCircle2, X, ExternalLink } from 'lucide-react';
import { LIVE_PERFORMANCES } from '../data/discography';
import { SoundCloudIcon, YouTubeIcon } from './PlatformIcons';

export const LiveAndCuration: React.FC = () => {
  const [showRiderModal, setShowRiderModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadRider = () => {
    // Generate text technical rider file
    const riderText = `=====================================================
অপূর্ব (APURBA) — TECHNICAL RIDER & STAGE SPECIFICATION
Artist: Khalid Bin Alam (অপূর্ব)
Official Artist Links: https://linktr.ee/youmeiyou
Inquiries: Contact through the official artist links
=====================================================

1. PERFORMANCE FORMATS:
   Option A: Live Hybrid Performance (Hardware modular synths, drum machine, live stems)
   Option B: Club DJ Set (Hypnotic Psytrance, Melodic Techno, Psychedelic Bass House)
   Option C: Ambient / Drone Spatial Sound Installation

2. AUDIO & SOUND SYSTEM REQUIREMENTS:
   - FOH PA: High-end point-source or line-array system capable of clean reproduction down to 30 Hz without distortion. Subwoofers must be phase-aligned.
   - Booth Monitoring: Stereo active reference monitors (e.g. Genelec, Adam Audio, or high-output club booth wedges) with independent booth volume control.
   - Mixer / I/O:
     * For Live Set: 2x Balanced Stereo 1/4" TRS or XLR inputs to FOH mixer.
     * For DJ Set: 2x Pioneer CDJ-3000 / CDJ-2000NXS2 + Pioneer DJM-900NXS2 or DJM-V10. Pro DJ Link connected.
   - Stage Power: 2x Clean, grounded AC power outlets (220-240V 50Hz) at artist table.

3. SOUND PHILOSOPHY & DYNAMICS:
   - Do NOT run aggressive master bus limiters at FOH. Dynamic headroom is vital for subterranean sub-bass and hypnotic tension.
   - Tuning: Artist sets utilize 432Hz harmonic references and dynamic sub-frequency shifts.

4. HOSPITALITY & AMENITIES:
   - Mineral water (room temperature).
   - Dedicated quiet staging area prior to performance.
=====================================================`;

    const blob = new Blob([riderText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Apurba_Technical_Rider_2025.txt';
    link.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <section id="live" className="py-20 border-b border-zinc-200/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-zinc-200/70">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-indigo-600 font-semibold">
              Live Sets & Curated Experiences
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 font-display">
              DJ Performance & Sound Systems
            </h2>
            <p className="mt-2 text-zinc-600 text-sm sm:text-base max-w-2xl font-light">
              Bridging electronic club energy with deep atmospheric pacing. Available for festivals, underground dance venues, and immersive audio installations worldwide.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowRiderModal(true)}
              className="px-4 py-2.5 text-xs font-medium text-zinc-750 hover:text-zinc-950 glass-pill rounded-xl flex items-center gap-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>View Technical Rider</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadRider}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-850 active:bg-black rounded-xl flex items-center gap-2 transition-all shadow-md shadow-zinc-950/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Rider Downloaded</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Rider (.txt)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Set Showcase Cards in White Glass */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {LIVE_PERFORMANCES.map((perf) => (
            <div
              key={perf.id}
              className="rounded-2xl glass-card p-4 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {perf.thumbnailUrl && (
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/80 mb-3 bg-zinc-100 shadow-inner">
                    <img
                      src={perf.thumbnailUrl}
                      alt={perf.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                  <span className="text-indigo-600 font-semibold">{perf.type}</span>
                  <span aria-hidden="true" className="text-zinc-300">·</span>
                  <span>{perf.duration}</span>
                </div>

                <h3 className="mt-2.5 text-base font-bold text-zinc-950 font-display">
                  {perf.title}
                </h3>

                <div className="mt-2.5 space-y-1.5 text-xs text-zinc-600 font-mono">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{perf.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{perf.venueOrPlatform}</span>
                  </div>
                </div>

                <p className="mt-3 text-xs sm:text-sm text-zinc-650 font-light leading-relaxed">
                  {perf.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-150/80 flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-mono text-[11px]">{perf.genreFocus}</span>
                {perf.youtubeUrl ? (
                  <a
                    href={perf.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-xl bg-[#FF0000]/10 hover:bg-[#FF0000] border border-[#FF0000]/30 text-[#FF0000] hover:text-white font-semibold flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-[0_2px_12px_rgba(255,0,0,0.3)]"
                  >
                    <YouTubeIcon className="w-3.5 h-3.5" />
                    <span>Watch Stream</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                ) : perf.soundcloudUrl ? (
                  <a
                    href={perf.soundcloudUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-xl bg-[#FF5500]/10 hover:bg-[#FF5500] border border-[#FF5500]/30 text-[#FF5500] hover:text-white font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
                  >
                    <SoundCloudIcon className="w-3.5 h-3.5" />
                    <span>Listen on SoundCloud</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                ) : (
                  <span className="text-indigo-600 font-medium">Archive Set</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Technical Rider Strip in White Glass Panel */}
        <div className="mt-10 p-6 sm:p-8 rounded-3xl glass-panel flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-zinc-950 font-display">
              Sound System & Acoustics Protocol
            </h4>
            <p className="text-xs sm:text-sm text-zinc-600 font-light max-w-2xl">
              Performances are engineered for club systems featuring dedicated low-frequency articulation (30–90 Hz). Subwoofers must be in-phase with stereo mains to deliver full physical impact.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#booking"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-850 active:bg-black rounded-xl transition-all shadow-sm whitespace-nowrap"
            >
              Inquire for Booking
            </a>
          </div>
        </div>

      </div>

      {/* Tech Rider Frosted Glass Modal */}
      {showRiderModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-md"
        >
          <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-3xl border border-white/80 rounded-3xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-2xl text-zinc-900">
            <button
              type="button"
              onClick={() => setShowRiderModal(false)}
              aria-label="Close rider specifications"
              className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-900 p-2 rounded-xl hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-mono uppercase text-indigo-600 font-semibold mb-1">
              <span>Technical Rider & Sound Specifications</span>
            </div>
            <h3 className="text-2xl font-bold text-zinc-950 font-display">
              <span className="font-bengali">অপূর্ব</span> (Apurba) — Stage & FOH Requirements
            </h3>

            <div className="mt-6 space-y-4 text-xs sm:text-sm text-zinc-700 font-light">
              <div className="p-4 rounded-2xl bg-white/70 border border-white/90 shadow-2xs">
                <strong className="text-zinc-950 font-semibold block mb-1">1. PA & FOH Acoustics</strong>
                <p>Clean linear response down to 30 Hz. No excessive hard limiting or multiband pumping on the master stereo bus. Preserving transient attack and dynamic range is mandatory.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 border border-white/90 shadow-2xs">
                <strong className="text-zinc-950 font-semibold block mb-1">2. Booth Monitoring</strong>
                <p>High-powered stereo booth monitors with dedicated low-end representation, decoupled from table vibration, equipped with immediate volume control at arm's reach.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 border border-white/90 shadow-2xs">
                <strong className="text-zinc-950 font-semibold block mb-1">3. Hybrid Live Gear Table</strong>
                <p>Sturdy, vibration-isolated table (min 150cm x 80cm) with 2x clean grounded 220-240V power strips and 2x balanced stereo DI feeds to house mixing console.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 border border-white/90 shadow-2xs">
                <strong className="text-zinc-950 font-semibold block mb-1">4. DJ Set Standard</strong>
                <p>2x Pioneer CDJ-3000 or CDJ-2000NXS2 linked via Gigabit Ethernet hub + Pioneer DJM-900NXS2 / DJM-V10 mixer with updated firmware.</p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-200/80 flex items-center justify-between">
              <button
                type="button"
                onClick={handleDownloadRider}
                className="px-4 py-2.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center gap-2 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Document (.txt)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRiderModal(false)}
                className="px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 glass-pill rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
