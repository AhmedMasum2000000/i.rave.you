import React from 'react';
import { ArrowDown, ArrowUpRight, Calendar, Headphones } from 'lucide-react';
import { SOCIAL_PROFILES, TRACKS } from '../data/discography';
import {
  AppleMusicIcon,
  SoundCloudIcon,
  SpotifyIcon,
  YouTubeIcon,
} from './PlatformIcons';

const getArtistProfile = (name: string) => {
  const profile = SOCIAL_PROFILES.find((item) => item.name === name);
  if (!profile) {
    throw new Error(`Missing artist profile link: ${name}`);
  }
  return profile;
};

const streamingProfiles = [
  {
    ...getArtistProfile('Spotify'),
    icon: <SpotifyIcon className="h-4 w-4 text-[#1DB954]" />,
  },
  {
    ...getArtistProfile('Apple Music'),
    icon: <AppleMusicIcon className="h-4 w-4 text-[#FA243C]" />,
  },
  {
    ...getArtistProfile('YouTube'),
    icon: <YouTubeIcon className="h-4 w-4 text-[#FF0000]" />,
  },
  {
    ...getArtistProfile('SoundCloud'),
    icon: <SoundCloudIcon className="h-4 w-4 text-[#FF5500]" />,
  },
];

const featuredRelease = TRACKS.find(
  (track) =>
    track.isFeatured &&
    track.category === 'releases' &&
    track.thumbnailUrl &&
    track.streamingLinks.spotify,
);

export const Hero: React.FC = () => {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden border-b border-zinc-200/70 py-14 sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-48 top-0 -z-10 h-[32rem] w-[32rem] rounded-full bg-indigo-500/15 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-48 bottom-0 -z-10 h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-[130px]"
      />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8">
        <div className="text-center lg:text-left">
          <div className="mb-7 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/75 px-3.5 py-2 font-mono text-[11px] font-medium text-zinc-700 shadow-sm shadow-zinc-950/[0.03]">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Cumilla, Bangladesh · Worldwide
            </span>
            <span className="rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
              Independent electronic artist
            </span>
          </div>

          <h1 lang="bn" className="font-bengali text-7xl font-bold leading-[1.08] tracking-tight text-zinc-950 sm:text-8xl lg:text-9xl">
            অপূর্ব
          </h1>
          <p className="mt-2 font-display text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">
            APURBA
          </p>

          <p className="mt-5 font-display text-2xl font-light italic leading-snug tracking-wide text-indigo-950 sm:text-3xl lg:text-4xl">
            “Language doesn’t matter.
            <br className="hidden sm:block" /> Frequency does.”
          </p>

          <p className="mx-auto mt-5 max-w-xl text-sm font-light leading-relaxed text-zinc-600 sm:text-base lg:mx-0">
            Underground psychedelic electronic music from Bangladesh. Producer,
            DJ, and sound engineer Khalid Bin Alam brings hypnotic club sounds
            and independent releases to listeners worldwide.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <a
              href="#music"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-zinc-950/10 transition hover:-translate-y-0.5 hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <Headphones className="h-4 w-4 text-indigo-300" />
              Explore the music
              <ArrowDown className="h-4 w-4" />
            </a>
            <a
              href="#booking"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white/75 px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <Calendar className="h-4 w-4 text-indigo-400" />
              Booking &amp; inquiries
            </a>
          </div>

          <div className="mt-6">
            <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              অপূর্ব on streaming platforms
            </p>
            <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
              {streamingProfiles.map((profile) => (
                <a
                  key={profile.name}
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`অপূর্ব on ${profile.name}`}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white/75 px-3 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  {profile.icon}
                  {profile.name}
                </a>
              ))}
            </div>
          </div>

          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            Psychedelic sound · Independent spirit · Since 2016
          </p>
        </div>

        {featuredRelease && (
          <article className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[2rem] border border-indigo-200/15 bg-[#11131e] p-3 shadow-[0_32px_100px_-38px_rgba(79,70,229,0.5)] sm:p-4">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-cyan-500/10"
            />
            <div className="relative grid items-center gap-5 sm:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)]">
              <a
                href={featuredRelease.streamingLinks.spotify}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Listen to ${featuredRelease.title} on Spotify`}
                className="group relative block aspect-square overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-lg shadow-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
              >
                <img
                  src={featuredRelease.thumbnailUrl}
                  alt={`${featuredRelease.title} cover artwork`}
                  fetchPriority="high"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent px-4 pb-4 pt-14 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90">
                  অপূর্ব <span className="px-1 text-indigo-200/70">/</span> Official release
                </span>
              </a>

              <div className="flex min-w-0 flex-col px-1 py-1 text-center sm:py-2 sm:text-left">
                <p className="inline-flex items-center justify-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-200 sm:justify-start">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.8)]" />
                  In rotation
                </p>
                <h2 className="mt-2 break-words font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {featuredRelease.title}
                </h2>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-zinc-400 sm:justify-start">
                  <span>{featuredRelease.genre}</span>
                  <span aria-hidden="true" className="text-indigo-300/70">·</span>
                  <span>{featuredRelease.year}</span>
                </div>
                <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-zinc-200">
                  {featuredRelease.description}
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  <a
                    href={featuredRelease.streamingLinks.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-between gap-3 rounded-xl bg-indigo-300 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <span>Listen on Spotify</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#music"
                    className="inline-flex min-h-10 items-center justify-between gap-2 px-1 text-xs font-medium text-zinc-300 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                  >
                    Browse the full catalog
                    <ArrowDown className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </article>
        )}
      </div>
    </section>
  );
};
