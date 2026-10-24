import React, { useState } from 'react';
import { ExternalLink, Music2, X, Play, Sliders } from 'lucide-react';
import { Track, TrackCategory } from '../types';
import { SOCIAL_PROFILES, TRACKS } from '../data/discography';
import { GenerativeArtwork } from './GenerativeArtwork';
import { StreamDrawer } from './StreamDrawer';
import { formatDuration, filterTracks } from '../utils/audioMath';
import {
  SpotifyIcon,
  YouTubeIcon,
  AppleMusicIcon,
  PushFmIcon,
  SoundCloudIcon,
} from './PlatformIcons';

interface DiscographyProps {
  onSelectTrack?: (track: Track) => void;
}

const getTrackLinks = (track: Track) => {
  const links = [];
  const { streamingLinks } = track;

  if (streamingLinks.spotify && /\/(track|album)\//.test(streamingLinks.spotify)) {
    links.push({
      label: 'Spotify',
      href: streamingLinks.spotify,
      icon: <SpotifyIcon className="h-4 w-4" />,
      className: 'border-[#1DB954]/30 bg-[#1DB954]/10 text-[#1DB954] hover:bg-[#1DB954] hover:text-white',
    });
  }

  if (streamingLinks.youtube && /youtu\.be\/|youtube\.com\/watch\?/.test(streamingLinks.youtube)) {
    links.push({
      label: 'YouTube',
      href: streamingLinks.youtube,
      icon: <YouTubeIcon className="h-4 w-4" />,
      className: 'border-[#FF0000]/30 bg-[#FF0000]/10 text-[#FF0000] hover:bg-[#FF0000] hover:text-white',
    });
  }

  if (streamingLinks.appleMusic && /\/(album|song)\//.test(streamingLinks.appleMusic)) {
    links.push({
      label: 'Apple Music',
      href: streamingLinks.appleMusic,
      icon: <AppleMusicIcon className="h-4 w-4" />,
      className: 'border-[#FA243C]/30 bg-[#FA243C]/10 text-[#FA243C] hover:bg-[#FA243C] hover:text-white',
    });
  }

  if (streamingLinks.soundcloud && /^https:\/\/soundcloud\.com\/[^/]+\/[^/]+/.test(streamingLinks.soundcloud)) {
    links.push({
      label: 'SoundCloud',
      href: streamingLinks.soundcloud,
      icon: <SoundCloudIcon className="h-4 w-4" />,
      className: 'border-[#FF5500]/30 bg-[#FF5500]/10 text-[#FF5500] hover:bg-[#FF5500] hover:text-white',
    });
  }

  if (streamingLinks.pushFm) {
    links.push({
      label: 'Push.fm',
      href: streamingLinks.pushFm,
      icon: <PushFmIcon className="h-4 w-4" />,
      className: 'border-indigo-300/30 bg-indigo-400/10 text-indigo-300 hover:bg-indigo-500 hover:text-white',
    });
  }

  return links;
};

export const Discography: React.FC<DiscographyProps> = ({ onSelectTrack }) => {
  const [selectedCategory, setSelectedCategory] = useState<TrackCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalTrack, setActiveModalTrack] = useState<Track | null>(null);
  const [streamDrawerTrack, setStreamDrawerTrack] = useState<Track | null>(null);

  const categories: { id: TrackCategory; label: string; count: number }[] = [
    { id: 'all', label: 'All Works', count: TRACKS.length },
    { id: 'releases', label: 'Official Releases', count: TRACKS.filter((t) => t.category === 'releases').length },
    { id: 'remixes', label: 'Remixes & Features', count: TRACKS.filter((t) => t.category === 'remixes').length },
    { id: 'aliases', label: 'Other Aliases', count: TRACKS.filter((t) => t.category === 'aliases').length },
    { id: 'euphonic', label: 'Euphonic Vault (@euphonic404)', count: TRACKS.filter((t) => t.category === 'euphonic').length },
    { id: 'live', label: 'Live Sets & Mixes', count: TRACKS.filter((t) => t.category === 'live').length },
  ];

  const filteredTracks = filterTracks(TRACKS, selectedCategory, searchQuery);

  return (
    <section id="music" className="py-20 border-b border-zinc-200/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-zinc-200/70">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-indigo-600 font-semibold">
              Catalog & Listening Links
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 font-display">
              Musical Releases, Remixes, Aliases & Archives
            </h2>
            <p className="mt-2 text-zinc-600 text-sm sm:text-base max-w-2xl font-light">
              Browse releases, remixes, aliases, live mixes, and the Euphonic archive. Track links open the available streaming or video source; artist links provide additional places to listen.
            </p>
          </div>

          {/* Frosted Glass Search bar */}
          <div className="w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracks, aliases (Zalvix, Euphonic), genres..."
              className="w-full px-4 py-2.5 glass-input rounded-2xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Category filters stay visible as full-width buttons instead of a hidden horizontal strip. */}
        <div className="grid grid-cols-2 gap-2.5 py-6 sm:grid-cols-3 xl:grid-cols-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              aria-pressed={selectedCategory === cat.id}
              className={`flex min-h-11 w-full min-w-0 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090e] ${
                selectedCategory === cat.id
                  ? 'border-indigo-400/60 bg-indigo-500/15 text-indigo-100 shadow-md shadow-indigo-950/30'
                  : 'border-indigo-300/20 bg-[#11131e]/80 text-zinc-200 hover:border-indigo-300/45 hover:bg-[#1d2032]'
              }`}
            >
              <span className="min-w-0 break-words leading-snug">{cat.label}</span>
              <span className={`shrink-0 rounded-full border px-1.5 py-0.5 font-mono text-[10px] ${
                selectedCategory === cat.id
                  ? 'border-indigo-300/30 bg-indigo-400/15 text-indigo-100'
                  : 'border-white/10 bg-white/5 text-zinc-400'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tracks Grid in Pro White Glass Cards */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filteredTracks.map((track) => {
            const isEuphonic = track.category === 'euphonic';
            const trackLinks = getTrackLinks(track);
            const hasSpotify = trackLinks.some((link) => link.label === 'Spotify');
            const hasYouTube = trackLinks.some((link) => link.label === 'YouTube');
            const hasApple = trackLinks.some((link) => link.label === 'Apple Music');
            const hasSoundCloud = trackLinks.some((link) => link.label === 'SoundCloud');
            const hasPush = trackLinks.some((link) => link.label === 'Push.fm');

            return (
              <div
                key={track.id}
                className="group relative rounded-2xl glass-card transition-all duration-300 p-4 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_20px_48px_-10px_rgba(99,102,241,0.14)] hover:border-indigo-200/90"
              >
                <div>
                  {/* Artwork and duration */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-white/90 mb-3 bg-zinc-100/90 shadow-xs">
                    {track.thumbnailUrl ? (
                      <img
                        src={track.thumbnailUrl}
                        alt={`${track.title} cover artwork`}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <GenerativeArtwork
                        type={track.coverPattern}
                        accentColor={track.coverAccent}
                        className="w-full h-full"
                      />
                    )}

                    {track.duration !== undefined && (
                      <div className="absolute top-3 right-3 z-10">
                        <div className="px-2.5 py-1 rounded-xl bg-black/65 backdrop-blur-md border border-white/20 text-[10px] font-mono text-zinc-150 font-medium shadow-sm">
                          {formatDuration(track.duration)}
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectTrack) onSelectTrack(track);
                        else setStreamDrawerTrack(track);
                      }}
                      aria-label={`Play stream preview for ${track.title}`}
                      className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center opacity-100 transition-all duration-300 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400"
                    >
                      <div className="w-14 h-14 rounded-full bg-white/95 backdrop-blur-md border border-white shadow-2xl flex items-center justify-center transform scale-75 group-hover:scale-100 transition-all duration-300 hover:bg-white hover:scale-110 active:scale-95">
                        <Play className="w-6 h-6 text-zinc-950 fill-zinc-950 ml-0.5" />
                      </div>
                    </button>
                  </div>

                  {/* Metadata Header: Artist, Era, Year */}
                  <div className="flex items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-indigo-600 font-bold truncate max-w-[140px]">
                        {track.artist}
                      </span>
                      {track.year !== undefined && (
                        <>
                          <span aria-hidden="true" className="text-zinc-300">·</span>
                          <span className="text-zinc-500">{track.year}</span>
                        </>
                      )}
                    </div>

                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-lg bg-zinc-100 text-zinc-600 font-medium shrink-0">
                      {isEuphonic ? 'Euphonic' : track.category}
                    </span>
                  </div>

                  {/* Main Titles */}
                  <div className="mt-1.5">
                    <h3 className="text-xl font-bold text-zinc-950 tracking-tight flex items-baseline gap-2 group-hover:text-indigo-950 transition-colors">
                      <span className="truncate">{track.title}</span>
                      {track.titleBengali && (
                        <span className="font-bengali max-w-[42%] truncate text-sm font-semibold text-zinc-500 shrink-0">
                          ({track.titleBengali})
                        </span>
                      )}
                    </h3>
                  </div>

                </div>

                <div className="mt-4 pt-3.5 border-t border-zinc-200/70 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalTrack(track)}
                    aria-label={`View details for ${track.title}`}
                    className="text-xs font-semibold text-zinc-650 hover:text-zinc-950 flex items-center gap-1.5 focus:outline-none focus-visible:underline transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Details</span>
                  </button>

                  <div className="flex items-center gap-1.5" aria-label={`Listen to ${track.title}`}>
                    {hasSpotify && (
                      <a
                        href={track.streamingLinks.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Listen to ${track.title} on Spotify`}
                        className="rounded-lg border border-[#1DB954]/30 bg-[#1DB954]/10 p-2 text-[#1DB954] transition-colors hover:bg-[#1DB954] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1DB954]"
                        title="Spotify"
                      >
                        <SpotifyIcon className="h-4 w-4" />
                      </a>
                    )}

                    {hasYouTube && (
                      <a
                        href={track.streamingLinks.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Watch ${track.title} on YouTube`}
                        className="rounded-lg border border-[#FF0000]/30 bg-[#FF0000]/10 p-2 text-[#FF0000] transition-colors hover:bg-[#FF0000] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0000]"
                        title={isEuphonic ? 'Euphonic on YouTube' : 'YouTube'}
                      >
                        <YouTubeIcon className="h-4 w-4" />
                      </a>
                    )}

                    {hasApple && (
                      <a
                        href={track.streamingLinks.appleMusic}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Listen to ${track.title} on Apple Music`}
                        className="rounded-lg border border-[#FA243C]/30 bg-[#FA243C]/10 p-2 text-[#FA243C] transition-colors hover:bg-[#FA243C] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FA243C]"
                        title="Apple Music"
                      >
                        <AppleMusicIcon className="h-4 w-4" />
                      </a>
                    )}

                    {hasSoundCloud && (
                      <a
                        href={track.streamingLinks.soundcloud}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Listen to ${track.title} on SoundCloud`}
                        className="rounded-lg border border-[#FF5500]/30 bg-[#FF5500]/10 p-2 text-[#FF5500] transition-colors hover:bg-[#FF5500] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                        title="SoundCloud"
                      >
                        <SoundCloudIcon className="h-4 w-4" />
                      </a>
                    )}

                    {hasPush && (
                      <a
                        href={track.streamingLinks.pushFm}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${track.title} on Push.fm`}
                        className="rounded-lg border border-indigo-300/30 bg-indigo-400/10 p-2 text-indigo-300 transition-colors hover:bg-indigo-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                        title="Push.fm"
                      >
                        <PushFmIcon className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state when search yields no tracks */}
        {filteredTracks.length === 0 && (
          <div className="py-16 text-center">
            <Music2 className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
            <h3 className="text-base font-medium text-zinc-900">No tracks match your query</h3>
            <p className="text-xs text-zinc-500 mt-1">Try resetting the category filter or searching with different keywords.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 text-xs text-indigo-600 hover:text-indigo-700 border border-zinc-300 rounded-xl glass-pill"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>

      {/* Compact track details and direct listening links. */}
      {activeModalTrack && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-md"
        >
          <div className="relative w-full max-w-xl bg-[#11131e] border border-indigo-300/20 rounded-3xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl text-zinc-100">
            <button
              type="button"
              onClick={() => setActiveModalTrack(null)}
              aria-label="Close track details modal"
              className="absolute right-4 top-4 rounded-xl p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pr-10">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                {activeModalTrack.thumbnailUrl ? (
                  <img
                    src={activeModalTrack.thumbnailUrl}
                    alt={activeModalTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <GenerativeArtwork
                    type={activeModalTrack.coverPattern}
                    accentColor={activeModalTrack.coverAccent}
                    className="w-full h-full"
                  />
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-indigo-200">
                  {activeModalTrack.artist}
                </p>
                <h3 className="mt-0.5 text-lg font-bold leading-tight text-white">
                  {activeModalTrack.title}
                </h3>
                {(activeModalTrack.year !== undefined || activeModalTrack.duration !== undefined) && (
                  <p className="mt-1 text-xs font-mono text-zinc-400">
                    {activeModalTrack.year}
                    {activeModalTrack.year !== undefined && activeModalTrack.duration !== undefined && ' · '}
                    {activeModalTrack.duration !== undefined && formatDuration(activeModalTrack.duration)}
                  </p>
                )}
              </div>
            </div>

            {(() => {
              const trackLinks = getTrackLinks(activeModalTrack);
              const artistLinks = [
                { label: 'Apurba Instagram', profile: 'Instagram' },
                { label: 'Artist writing · Substack', profile: 'Substack' },
                { label: 'Community · Discord', profile: 'Discord' },
                { label: 'Khalid Bin Alam · LinkedIn', profile: 'LinkedIn' },
              ].flatMap((link) => {
                const profile = SOCIAL_PROFILES.find((item) => item.name === link.profile);
                if (!profile || trackLinks.some((trackLink) => trackLink.href === profile.url)) return [];
                return [{ ...link, href: profile.url }];
              });

              return (
                <>
                  <section className="mt-5 border-t border-white/10 pt-4">
                    <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Track-specific listening links
                    </h4>
                    {trackLinks.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {trackLinks.map((link) => (
                          <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex min-h-11 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${link.className}`}
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              {link.icon}
                              <span>{link.label}</span>
                            </span>
                            <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500">No track-specific streaming link is listed for this release yet.</p>
                    )}
                  </section>

                  {artistLinks.length > 0 && (
                    <section className="mt-4 border-t border-white/10 pt-4">
                      <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Follow &amp; connect
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {artistLinks.map((link) => (
                          <a
                            key={link.profile}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-zinc-300 transition-colors hover:border-indigo-300/40 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                          >
                            {link.label}
                            <ExternalLink className="h-3 w-3 text-zinc-500" />
                          </a>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              );
            })()}

            {/* Bottom Actions */}
            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => {
                  const targetTrack = activeModalTrack;
                  setActiveModalTrack(null);
                  if (onSelectTrack) onSelectTrack(targetTrack);
                  else setStreamDrawerTrack(targetTrack);
                }}
                className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTrack(null)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Stream Preview Drawer */}
      <StreamDrawer
        track={streamDrawerTrack}
        onClose={() => setStreamDrawerTrack(null)}
      />
    </section>
  );
};
