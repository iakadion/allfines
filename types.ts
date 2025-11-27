export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  cover: string;
  duration: string; // Display string e.g., "3:45"
  lyrics?: string;
}

export enum PlayerStatus {
  PLAYING,
  PAUSED,
  STOPPED
}

export interface PlayerState {
  currentTrack: Track | null;
  status: PlayerStatus;
  volume: number;
  currentTime: number;
  duration: number;
  isMuted: boolean;
}