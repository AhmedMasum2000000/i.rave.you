export type TrackCategory = 'all' | 'releases' | 'remixes' | 'aliases' | 'euphonic' | 'live';

export interface Track {
  id: string;
  title: string;
  titleBengali?: string;
  artist: string;
  year?: number | string;
  duration?: number; // in seconds
  bpm: number;
  key: string;
  camelotKey?: string;
  genre: string;
  category: 'releases' | 'remixes' | 'aliases' | 'euphonic' | 'live';
  coverAccent: string;
  coverPattern: 'roots' | 'mandala' | 'wave' | 'mycelium' | 'topography';
  thumbnailUrl?: string;
  description: string;
  philosophicalTheme: string;
  soundDesignNotes: string;
  frequencyTuning: string;
  productionDetails?: string;
  isFeatured?: boolean;
  streamingLinks: {
    spotify?: string;
    appleMusic?: string;
    youtube?: string;
    soundcloud?: string;
    pushFm?: string;
  };
}

export interface LivePerformance {
  id: string;
  title: string;
  venueOrPlatform: string;
  location: string;
  date: string;
  type: 'DJ Set' | 'Live Hybrid' | 'Curated Broadcast' | 'Festival Mix' | 'Video Feature';
  duration: string;
  genreFocus: string;
  recordingAvailable: boolean;
  thumbnailUrl?: string;
  youtubeUrl?: string;
  soundcloudUrl?: string;
  description: string;
}

export interface BookingSubmission {
  name: string;
  email: string;
  organization: string;
  eventDate: string;
  cityCountry: string;
  performanceType: string;
  soundSystemSpecs: string;
  message: string;
}
