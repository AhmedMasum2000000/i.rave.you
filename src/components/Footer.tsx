import React from 'react';
import { ExternalLink, FileText, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import { ArtistLogo } from './ArtistLogo';
import { SOCIAL_PROFILES } from '../data/discography';
import {
  AppleMusicIcon,
  LinktreeIcon,
  PushFmIcon,
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

const artistProfileCards = [
  {
    ...getArtistProfile('Instagram'),
    description: 'Artist updates and visuals',
    icon: <Instagram className="h-5 w-5" />,
    color: 'text-pink-600',
  },
  {
    ...getArtistProfile('Spotify'),
    description: 'Stream Apurba releases',
    icon: <SpotifyIcon className="h-5 w-5" />,
    color: 'text-[#1DB954]',
  },
  {
    ...getArtistProfile('Apple Music'),
    description: 'Listen on Apple Music',
    icon: <AppleMusicIcon className="h-5 w-5" />,
    color: 'text-[#FA243C]',
  },
  {
    ...getArtistProfile('YouTube'),
    description: 'Official videos and music',
    icon: <YouTubeIcon className="h-5 w-5" />,
    color: 'text-[#FF0000]',
  },
  {
    ...getArtistProfile('SoundCloud'),
    description: 'Listen to mixes and tracks',
    icon: <SoundCloudIcon className="h-5 w-5" />,
    color: 'text-[#FF5500]',
  },
  {
    ...getArtistProfile('Push.fm'),
    description: 'Find music across platforms',
    icon: <PushFmIcon className="h-5 w-5" />,
    color: 'text-indigo-600',
  },
  {
    ...getArtistProfile('Substack'),
    description: 'Writing and artist notes',
    icon: <FileText className="h-5 w-5" />,
    color: 'text-orange-600',
  },
  {
    ...getArtistProfile('Discord'),
    description: 'Join the community',
    icon: <MessageCircle className="h-5 w-5" />,
    color: 'text-indigo-600',
  },
  {
    ...getArtistProfile('LinkedIn'),
    description: 'Khalid Bin Alam',
    icon: <Linkedin className="h-5 w-5" />,
    color: 'text-sky-700',
  },
  {
    ...getArtistProfile('YouTube (Euphonic)'),
    description: 'Explore the early music archive',
    icon: <YouTubeIcon className="h-5 w-5" />,
    color: 'text-[#FF0000]',
  },
  {
    ...getArtistProfile('Apurba Links'),
    description: 'All official artist links',
    icon: <LinktreeIcon className="h-5 w-5" />,
    color: 'text-[#25a244]',
  },
];

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-white/70 backdrop-blur-2xl border-t border-zinc-200/80 text-zinc-600 py-16">
      {/* Subtle top specular sheen */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-zinc-200/80">
          <div className="space-y-3">
            <ArtistLogo variant="full" size="md" />
            <p className="text-xs sm:text-sm text-zinc-600 font-light max-w-md">
              Independent electronic music project founded by Khalid Bin Alam. Cumilla, Bangladesh. 46 catalog works across the artist project and foundational Euphonic vault.
            </p>
            <p className="text-xs text-indigo-700 font-mono font-medium">
              “Language doesn’t matter. Frequency does.”
            </p>
          </div>

          {/* Quick Nav Links */}
          <div className="flex flex-col sm:items-end gap-3.5 text-xs font-medium text-zinc-600">
            <div className="flex flex-wrap items-center gap-5">
              <a href="#music" className="hover:text-zinc-950 transition-colors">
                Music
              </a>
              <a href="#philosophy" className="hover:text-zinc-950 transition-colors">
                Philosophy & Bio
              </a>
              <a href="#live" className="hover:text-zinc-950 transition-colors">
                Live & DJ
              </a>
              <a href="#press" className="hover:text-zinc-950 transition-colors">
                EPK / Press
              </a>
              <a href="#booking" className="hover:text-zinc-950 transition-colors">
                Booking
              </a>
            </div>

          </div>
        </div>

        <section aria-labelledby="artist-links-heading" className="py-10 border-b border-zinc-200/80">
          <div className="mb-5">
            <h2 id="artist-links-heading" className="text-lg font-bold text-zinc-950 font-display">
              Official Artist Links
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600">
              Follow, listen, and connect through Apurba’s verified platforms.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {artistProfileCards.map((profile) => (
              <a
                key={profile.name}
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${profile.name}: ${profile.handle}`}
                className="group flex min-h-20 items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white/70 p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-white hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <span className={`shrink-0 ${profile.color}`} aria-hidden="true">
                  {profile.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-zinc-950">
                    {profile.name}
                  </span>
                  <span className="mt-0.5 block text-[10px] leading-snug text-zinc-500">
                    {profile.description}
                  </span>
                </span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-400 transition group-hover:text-indigo-600" aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-light">
          <div>
            © {new Date().getFullYear()} <span className="font-bengali font-normal">অপূর্ব</span> · Khalid Bin Alam. All sonic rights reserved.
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
            <span>Cumilla, Bangladesh</span>
            <span aria-hidden="true" className="text-zinc-300">·</span>
            <span>Est. 2016</span>
            <span aria-hidden="true" className="text-zinc-300">·</span>
            <span>432 Hz Mastered</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
