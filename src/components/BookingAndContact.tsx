import React, { useState } from 'react';
import { Send, ExternalLink, Mail, MapPin, Music } from 'lucide-react';
import { BookingSubmission } from '../types';
import { SpotifyIcon, YouTubeIcon, LinktreeIcon } from './PlatformIcons';

export const BookingAndContact: React.FC = () => {
  const [formData, setFormData] = useState<BookingSubmission>({
    name: '',
    email: '',
    organization: '',
    eventDate: '',
    cityCountry: '',
    performanceType: 'Club DJ Set (Melodic Techno & Psychedelic)',
    soundSystemSpecs: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [emailDraftHref, setEmailDraftHref] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMsg('Please complete all required fields (Name & Email).');
      return;
    }
    setErrorMsg('');
    const inquiryDetails = [
      `Name: ${formData.name.trim()}`,
      `Email: ${formData.email.trim()}`,
      `Organization: ${formData.organization.trim() || 'Not provided'}`,
      `Event date / timeline: ${formData.eventDate.trim() || 'Not provided'}`,
      `City & country: ${formData.cityCountry.trim() || 'Not provided'}`,
      `Inquiry type: ${formData.performanceType}`,
      `Sound system specifications: ${formData.soundSystemSpecs.trim() || 'Not provided'}`,
      `Message:\n${formData.message.trim() || 'Not provided'}`,
    ].join('\n');
    const emailParams = new URLSearchParams({
      subject: `Booking inquiry — ${formData.performanceType}`,
      body: inquiryDetails,
    });
    setEmailDraftHref(`mailto:?${emailParams.toString()}`);
    setSubmitted(true);
  };

  return (
    <section id="booking" className="py-20 border-b border-zinc-200/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl pb-10 border-b border-zinc-200/70">
          <div className="text-xs font-mono uppercase tracking-widest text-indigo-600 font-semibold">
            Touring, Bookings & Licensing
          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 font-display">
            Direct Promoter & Curator Inquiries
          </h2>
          <p className="mt-2 text-zinc-600 text-sm sm:text-base font-light">
            Direct channel for festival curation, underground club bookings, sound installations, and official synchronization/licensing requests.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Direct Info & Digital Home (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-7 rounded-3xl glass-card space-y-6">
              <div>
                <h3 className="text-lg font-bold text-zinc-950 font-display">
                  Official Destination & Identity
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-zinc-600 font-light">
                  Find official releases, tour dates, and verified artist profiles through the artist links:
                </p>
                <a
                  href="https://linktr.ee/youmeiyou"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl glass-pill text-indigo-700 hover:text-indigo-900 font-mono text-xs transition-colors font-medium shadow-2xs"
                >
                  <span>linktr.ee/youmeiyou</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="pt-4 border-t border-zinc-150/80 space-y-3 text-xs sm:text-sm text-zinc-700 font-light">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Base: Cumilla, Bangladesh (Available Worldwide)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Music className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Founder & Producer: Khalid Bin Alam (<span className="font-bengali">অপূর্ব</span>)</span>
                </div>
                <div className="flex items-center gap-3">
                  <LinktreeIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Booking &amp; management: use the official artist links</span>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-150/80">
                <div className="text-xs font-mono uppercase text-zinc-500 font-semibold mb-1">
                  Average Response Window
                </div>
                <div className="text-sm text-zinc-600 font-light">
                  Within 24–48 hours for touring, performance dates, and master licensing.
                </div>
              </div>

              {/* Streaming Channels Fast Access with Brand Colors */}
              <div className="pt-4 border-t border-zinc-150/80 space-y-2">
                <div className="text-xs font-mono uppercase text-zinc-500 font-semibold">
                  Direct Verified Streaming Hubs
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href="https://open.spotify.com/artist/6ciIrhy1tI3vHlU1yGDiNk?si=_Knt6NAlT1exdb1WvWvh-g"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl border border-[#1DB954]/30 bg-[#1DB954]/10 hover:bg-[#1DB954] text-[#1DB954] hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                  >
                    <SpotifyIcon className="w-3.5 h-3.5" />
                    <span>Spotify</span>
                  </a>

                  <a
                    href="https://www.youtube.com/@euphonic404/videos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl border border-[#FF0000]/30 bg-[#FF0000]/10 hover:bg-[#FF0000] text-[#FF0000] hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                    title="First Channel (@euphonic404)"
                  >
                    <YouTubeIcon className="w-3.5 h-3.5" />
                    <span>@euphonic404</span>
                  </a>

                  <a
                    href="https://linktr.ee/khalidbinalam"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl border border-[#25D366]/40 bg-[#25D366]/15 hover:bg-[#25D366] text-[#1aa14a] hover:text-zinc-950 transition-all text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                  >
                    <LinktreeIcon className="w-3.5 h-3.5" />
                    <span>Linktree Hub</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form in White Glass (7 cols) */}
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="p-8 sm:p-10 rounded-3xl bg-emerald-50/70 border border-emerald-200/80 backdrop-blur-xl text-center space-y-4 shadow-sm">
                <Mail className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-2xl font-bold text-zinc-950 font-display">
                  Inquiry Ready to Send
                </h3>
                <p className="text-sm text-zinc-700 font-light max-w-md mx-auto">
                  Your email app can open a draft for <strong className="text-zinc-950">{formData.performanceType}</strong>. Add the booking recipient from the official artist links before sending. This website does not send inquiries directly.
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-4">
                  <a
                    href={emailDraftHref}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl transition-colors shadow-sm"
                  >
                    <Mail className="w-4 h-4" />
                    Open Email Draft
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setEmailDraftHref('');
                      setFormData({
                        name: '',
                        email: '',
                        organization: '',
                        eventDate: '',
                        cityCountry: '',
                        performanceType: 'Club DJ Set (Melodic Techno & Psychedelic)',
                        soundSystemSpecs: '',
                        message: '',
                      });
                    }}
                    className="px-5 py-2.5 text-xs font-semibold text-zinc-700 glass-pill rounded-xl transition-colors"
                  >
                    Edit Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl glass-card space-y-5">
                {errorMsg && (
                  <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl text-xs text-red-700">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-xs font-medium text-zinc-700 mb-1.5">
                      Your Name / Representative *
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Elena Rostova"
                      className="w-full px-3.5 py-2.5 glass-input rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-zinc-700 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="promoter@festival.com"
                      className="w-full px-3.5 py-2.5 glass-input rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="org" className="block text-xs font-medium text-zinc-700 mb-1.5">
                      Venue / Festival / Organization
                    </label>
                    <input
                      id="org"
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="Underground Echoes Festival"
                      className="w-full px-3.5 py-2.5 glass-input rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-xs font-medium text-zinc-700 mb-1.5">
                      City & Country
                    </label>
                    <input
                      id="location"
                      type="text"
                      value={formData.cityCountry}
                      onChange={(e) => setFormData({ ...formData, cityCountry: e.target.value })}
                      placeholder="e.g. Dhaka, BD or Berlin, DE"
                      className="w-full px-3.5 py-2.5 glass-input rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="performanceType" className="block text-xs font-medium text-zinc-700 mb-1.5">
                      Inquiry Type *
                    </label>
                    <select
                      id="performanceType"
                      value={formData.performanceType}
                      onChange={(e) => setFormData({ ...formData, performanceType: e.target.value })}
                      className="w-full px-3.5 py-2.5 glass-input rounded-xl text-sm text-zinc-900 focus:outline-none"
                    >
                      <option>Club DJ Set (Melodic Techno & Psychedelic)</option>
                      <option>Live Modular & Hybrid Performance</option>
                      <option>Ambient Frequency Installation</option>
                      <option>Production & Remix Collaboration</option>
                      <option>Media, Press & Interview</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="eventDate" className="block text-xs font-medium text-zinc-700 mb-1.5">
                      Proposed Date / Timeline
                    </label>
                    <input
                      id="eventDate"
                      type="text"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      placeholder="e.g. November 2025"
                      className="w-full px-3.5 py-2.5 glass-input rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="soundSystemSpecs" className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Sound System Specifications (FOH PA, Subs, Monitors)
                  </label>
                  <input
                    id="soundSystemSpecs"
                    type="text"
                    value={formData.soundSystemSpecs}
                    onChange={(e) => setFormData({ ...formData, soundSystemSpecs: e.target.value })}
                    placeholder="e.g. Funktion-One / d&b audiotechnik system, 2x 18-inch subwoofers"
                    className="w-full px-3.5 py-2.5 glass-input rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Message / Additional Event Details
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide details about stage time, expected attendance, concept, or licensing scope..."
                    className="w-full px-3.5 py-2.5 glass-input rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-7 py-3 text-sm font-semibold tracking-wide text-white bg-zinc-950 hover:bg-zinc-850 active:bg-black rounded-2xl transition-all shadow-md shadow-zinc-950/15 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <Send className="w-4 h-4" />
                    <span>Prepare Email Inquiry</span>
                  </button>
                  <p className="mt-3 text-xs text-zinc-500">
                    Your details are included in an email draft and are not sent until you send it.
                  </p>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
