import React from 'react';

export interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Authentic Spotify Brand Icon (RGB: #1DB954)
 */
export const SpotifyIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.516 17.307c-.22.36-.688.472-1.047.252-2.868-1.752-6.478-2.148-10.732-1.176-.41.094-.82-.164-.913-.574-.094-.41.164-.82.574-.913 4.654-1.064 8.653-.615 11.867 1.365.358.22.47.688.251 1.046zm1.47-3.266c-.277.45-.867.594-1.317.317-3.284-2.018-8.29-2.602-12.176-1.423-.508.154-1.043-.134-1.197-.642-.154-.508.134-1.043.642-1.197 4.442-1.348 9.957-.698 13.731 1.627.45.277.594.867.317 1.318zm.126-3.41c-3.938-2.339-10.435-2.555-14.212-1.408-.604.184-1.242-.16-1.425-.764-.184-.604.16-1.242.764-1.425 4.34-1.318 11.517-1.07 16.036 1.613.543.322.723 1.026.401 1.57-.322.542-1.025.722-1.564.414z" />
  </svg>
);

/**
 * Authentic YouTube Brand Icon (RGB: #FF0000)
 */
export const YouTubeIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

/**
 * Authentic Apple Music Brand Icon (RGB: #FA243C)
 */
export const AppleMusicIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path d="M18.5 3.1 8 5.2a1 1 0 0 0-.8 1v10.2a3.7 3.7 0 1 0 2 3.3V9.4l8-1.6v7.1a3.7 3.7 0 1 0 2 3.3V4.1a1 1 0 0 0-.7-1z" />
  </svg>
);

/**
 * Authentic SoundCloud Brand Icon (RGB: #FF5500)
 */
export const SoundCloudIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 36 24"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path d="M1 12.5h2v8H1zm3-3h2v11H4zm3-2h2v13H7zm3 3h2v10h-2zm3 4.5c0-4.1 3.3-7.4 7.4-7.4 3.3 0 6.1 2.2 7.1 5.2.4-.1.8-.2 1.2-.2 2.9 0 5.3 2.4 5.3 5.3s-2.4 5.3-5.3 5.3H17c-2.2 0-4-1.8-4-4z" />
  </svg>
);

export const BeatportIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path d="M4 2h5v7.2a5.8 5.8 0 1 1-5 5.7V2zm5 12.9a2.8 2.8 0 1 0 5.6 0 2.8 2.8 0 0 0-5.6 0zM15 2h5v13a5.8 5.8 0 1 1-5-5.7V2zm5 12.9a2.8 2.8 0 1 0 0 .1z" />
  </svg>
);

/**
 * Authentic Linktree Brand Icon (RGB: #43E660)
 */
export const LinktreeIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path d="m13.736 5.853 4.005-4.117 2.325 2.38-4.2 4.005h5.908v3.305h-5.937l4.229 4.108-2.325 2.38-4.005-4.117v7.977h-3.472v-7.977l-4.005 4.117-2.325-2.38 4.229-4.108h-5.937v-3.305h5.908l-4.2-4.005 2.325-2.38 4.005 4.117v-5.853h3.472v5.853z" />
  </svg>
);

/**
 * Push.fm Release Distribution Icon
 */
export const PushFmIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 14.5v-4.5h3l-4-5-4 5h3v4.5h2z" />
  </svg>
);
