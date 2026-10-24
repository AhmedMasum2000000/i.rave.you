import React, { useEffect } from 'react';
import { X, ExternalLink, Music } from 'lucide-react';
import { Track } from '../types';
import { GenerativeArtwork } from './GenerativeArtwork';
import {
  AppleMusicIcon,
  PushFmIcon,
  SoundCloudIcon,
  SpotifyIcon,
  YouTubeIcon,
} from './PlatformIcons';

interface StreamDrawerProps {
  track: Track | null;
  onClose: () => void;
}

type EmbedInfo =
  | { type: 'spotify'; embedUrl: string }
  | { type: 'youtube'; embedUrl: string }
  | { type: 'appleMusic'; embedUrl: string }
  | { type: 'soundcloud'; embedUrl: string };

const getEmbedInfo = (track: Track): EmbedInfo | null => {
  const spotifyUrl = track.streamingLinks.spotify;
  if (spotifyUrl) {
    try {
      const url = new URL(spotifyUrl);
      const [contentType, contentId] = url.pathname.split('/').filter(Boolean);
      if (
        url.hostname === 'open.spotify.com' &&
        ['track', 'album'].includes(contentType) &&
        contentId
      ) {
        return {
          type: 'spotify',
          embedUrl: `https://open.spotify.com/embed/${contentType}/${contentId}?utm_source=generator&theme=0`,
        };
      }
    } catch {
      // Ignore malformed provider URLs and try another supported provider.
    }
  }

  const youtubeUrl = track.streamingLinks.youtube;
  if (youtubeUrl) {
    try {
      const url = new URL(youtubeUrl);
      let videoId = '';

      if (url.hostname === 'youtu.be') {
        videoId = url.pathname.split('/').filter(Boolean)[0] ?? '';
      } else if (
        ['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)
      ) {
        const pathSegments = url.pathname.split('/').filter(Boolean);
        if (pathSegments[0] === 'watch') {
          videoId = url.searchParams.get('v') ?? '';
        } else if (['embed', 'shorts', 'live'].includes(pathSegments[0])) {
          videoId = pathSegments[1] ?? '';
        }
      }

      if (/^[\w-]{11}$/.test(videoId)) {
        return {
          type: 'youtube',
          embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0`,
        };
      }
    } catch {
      // Ignore malformed provider URLs and show the direct track link instead.
    }
  }

  const appleMusicUrl = track.streamingLinks.appleMusic;
  if (appleMusicUrl) {
    try {
      const url = new URL(appleMusicUrl);
      const [country, contentType, ...contentPath] = url.pathname.split('/').filter(Boolean);
      const contentId = contentPath.at(-1);
      if (
        url.hostname === 'music.apple.com' &&
        /^[a-z]{2}$/i.test(country) &&
        ['album', 'song'].includes(contentType) &&
        contentId &&
        /^\d+$/.test(contentId)
      ) {
        return {
          type: 'appleMusic',
          embedUrl: `https://embed.music.apple.com/${country}/${contentType}/${contentPath.join('/')}`,
        };
      }
    } catch {
      // Ignore artist pages and malformed links; they are not track embeds.
    }
  }

  const soundcloudUrl = track.streamingLinks.soundcloud;
  if (soundcloudUrl) {
    try {
      const url = new URL(soundcloudUrl);
      const pathSegments = url.pathname.split('/').filter(Boolean);
      if (
        url.protocol === 'https:' &&
        url.hostname === 'soundcloud.com' &&
        pathSegments.length === 2
      ) {
        const embedParams = new URLSearchParams({
          url: url.href,
          color: '#818cf8',
          auto_play: 'false',
          hide_related: 'true',
          show_comments: 'false',
          show_user: 'true',
          show_reposts: 'false',
          visual: 'true',
        });
        return {
          type: 'soundcloud',
          embedUrl: `https://w.soundcloud.com/player/?${embedParams.toString()}`,
        };
      }
    } catch {
      // Ignore artist pages and malformed links; they are not track embeds.
    }
  }

  return null;
};

export const StreamDrawer: React.FC<StreamDrawerProps> = ({ track, onClose }) => {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (track) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [track, onClose]);

  if (!track) return null;

  const embedInfo = getEmbedInfo(track);
  const directLinks = [
    track.streamingLinks.spotify &&
    /^https:\/\/open\.spotify\.com\/(track|album)\//.test(track.streamingLinks.spotify)
      ? {
          label: 'Spotify',
          href: track.streamingLinks.spotify,
          icon: <SpotifyIcon className="h-4 w-4" />,
          className: 'bg-[#1DB954] hover:bg-[#1aa34a] shadow-[#1DB954]/25',
        }
      : null,
    track.streamingLinks.youtube &&
    /^(https:\/\/youtu\.be\/|https:\/\/(www\.)?youtube\.com\/(watch\?|shorts\/|live\/))/.test(track.streamingLinks.youtube)
      ? {
          label: 'YouTube',
          href: track.streamingLinks.youtube,
          icon: <YouTubeIcon className="h-4 w-4" />,
          className: 'bg-[#FF0000] hover:bg-[#e60000] shadow-[#FF0000]/25',
        }
      : null,
    track.streamingLinks.appleMusic &&
    /https:\/\/music\.apple\.com\/[^/]+\/(album|song)\//.test(track.streamingLinks.appleMusic)
      ? {
          label: 'Apple Music',
          href: track.streamingLinks.appleMusic,
          icon: <AppleMusicIcon className="h-4 w-4" />,
          className: 'bg-[#FA243C] hover:bg-[#df1f35] shadow-[#FA243C]/25',
        }
      : null,
    track.streamingLinks.soundcloud &&
    /^https:\/\/soundcloud\.com\/[^/]+\/[^/]+/.test(track.streamingLinks.soundcloud)
      ? {
          label: 'SoundCloud',
          href: track.streamingLinks.soundcloud,
          icon: <SoundCloudIcon className="h-4 w-4" />,
          className: 'bg-[#FF5500] hover:bg-[#e64d00] shadow-[#FF5500]/25',
        }
      : null,
    track.streamingLinks.pushFm
      ? {
          label: 'Push.fm',
          href: track.streamingLinks.pushFm,
          icon: <PushFmIcon className="h-4 w-4" />,
          className: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25',
        }
      : null,
  ].filter((link): link is NonNullable<typeof link> => link !== null);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-zinc-900/35 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex w-full justify-end sm:w-auto sm:pl-10">
        <aside
          role="dialog"
          aria-modal="true"
          aria-label={`Stream preview for ${track.title}`}
          className="flex h-dvh w-full flex-col overflow-hidden border-l border-white/10 bg-[#10121b] text-zinc-100 shadow-[-24px_0_80px_rgba(0,0,0,0.38)] sm:w-[min(28rem,calc(100vw-2.5rem))]"
        >
          <div className="z-10 flex shrink-0 items-start justify-between gap-4 border-b border-white/10 bg-[#10121b]/95 p-4 backdrop-blur-2xl sm:p-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-sm">
                {track.thumbnailUrl ? (
                  <img
                    src={track.thumbnailUrl}
                    alt={track.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-indigo-300">
                    <Music className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 truncate text-xs font-mono font-semibold text-indigo-300">
                  <span>{track.artist}</span>
                  {track.year !== undefined && (
                    <>
                      <span aria-hidden="true" className="text-zinc-500">·</span>
                      <span>{track.year}</span>
                    </>
                  )}
                </div>
                <h3 className="flex items-baseline gap-2 break-words text-lg font-bold text-white">
                  <span className="min-w-0">{track.title}</span>
                  {track.titleBengali && (
                    <span className="font-bengali text-xs font-normal text-zinc-400">
                      ({track.titleBengali})
                    </span>
                  )}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Stream Drawer"
              className="shrink-0 rounded-xl border border-white/10 p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-lg shadow-black/20">
              {embedInfo?.type === 'spotify' ? (
                <iframe
                  key={`${track.id}-spotify`}
                  src={embedInfo.embedUrl}
                  width="100%"
                  height="352"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="eager"
                  title={`Spotify player for ${track.title} by ${track.artist}`}
                  className="block w-full"
                />
              ) : embedInfo?.type === 'youtube' ? (
                <div className="relative aspect-video w-full bg-black">
                  <iframe
                    key={`${track.id}-youtube`}
                    src={embedInfo.embedUrl}
                    title={`YouTube video for ${track.title} by ${track.artist}`}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              ) : embedInfo?.type === 'appleMusic' ? (
                <iframe
                  key={`${track.id}-apple-music`}
                  src={embedInfo.embedUrl}
                  width="100%"
                  height="450"
                  frameBorder="0"
                  allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                  loading="eager"
                  title={`Apple Music player for ${track.title} by ${track.artist}`}
                  className="block w-full"
                />
              ) : embedInfo?.type === 'soundcloud' ? (
                <iframe
                  key={`${track.id}-soundcloud`}
                  src={embedInfo.embedUrl}
                  width="100%"
                  height="450"
                  frameBorder="0"
                  allow="autoplay"
                  loading="eager"
                  title={`SoundCloud player for ${track.title} by ${track.artist}`}
                  className="block w-full"
                />
              ) : (
                <div
                  role="img"
                  aria-label={`Artwork for ${track.title}`}
                  className="aspect-square w-full"
                >
                  <GenerativeArtwork
                    type={track.coverPattern}
                    accentColor={track.coverAccent}
                    className="h-full w-full"
                  />
                </div>
              )}
            </div>

          </div>

          {directLinks.length > 0 && (
            <div className="shrink-0 space-y-3 border-t border-white/10 bg-[#10121b]/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-2xl sm:p-6">
              <div className="grid grid-cols-2 gap-2">
                {directLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${link.className}`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
