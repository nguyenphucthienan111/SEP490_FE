// Player types
export type Position = 'forward' | 'midfielder' | 'defender' | 'goalkeeper';

export interface Player {
  id: string;
  name: string;
  position: Position;
  team: string;
  teamLogo?: string;
  number: number;
  nationality: string;
  age: number;
  height: number;
  weight: number;
  rating: number;
  photoUrl?: string;
  stats: PlayerStats;
  matchHistory: MatchPerformance[];
}

export interface PlayerStats {
  matches: number;
  goals: number;
  assists: number;
  minutesPlayed: number;
  yellowCards: number;
  redCards: number;
  cleanSheets?: number;
  saves?: number;
  passAccuracy: number;
  tacklesWon?: number;
  interceptions?: number;
  aerialDuels?: number;
  shotsOnTarget?: number;
  keyPasses?: number;
  dribbles?: number;
}

export interface MatchPerformance {
  matchId: string;
  date: string;
  opponent: string;
  rating: number;
  minutesPlayed: number;
  goals?: number;
  assists?: number;
  contributions: RatingContribution[];
}

export interface RatingContribution {
  category: string;
  value: number;
  positive: boolean;
  description: string;
}

// Stadium types
export interface Stadium {
  id: string;
  name: string;
  city: string;
  capacity: number;
  yearBuilt: number;
  surface: 'grass' | 'artificial' | 'hybrid';
  imageUrl?: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Match types
export interface Match {
  id: string;
  date: string;
  time: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  venue: string; // Stadium name for display
  stadium?: Stadium; // Full stadium details
  league: string;
  season: string;
  status: 'scheduled' | 'live' | 'completed';
  playerPerformances?: PlayerMatchPerformance[];
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  league: string;
  homeStadium?: Stadium; // Sân nhà của câu lạc bộ
}

export interface PlayerMatchPerformance {
  playerId: string;
  playerName: string;
  position: Position;
  rating: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  contributions: RatingContribution[];
}

// League types
export interface League {
  id: string;
  name: string;
  season: string;
  country: string;
  logo?: string;
  teamCount: number;
  matchesPlayed: number;
}

// Article types
export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  imageUrl?: string;
  linkedPlayers: string[];
  linkedMatches: string[];
  tags: string[];
}
