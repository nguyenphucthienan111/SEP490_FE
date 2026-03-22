import { apiClient } from './api';

export interface League {
  leagueId: number;
  leagueName: string;
  apiLeagueId: number;
  country: string | null;
  logoUrl: string;
  leagueType: string;
  seasons: any[];
  teams: any[];
}

export interface Team {
  teamId: number;
  teamName: string;
  shortName: string | null;
  coachName: string | null;
  coachApiId: number | null;
  clubId: number;
  apiTeamId: number;
  founded: number | null;
  national: boolean;
  logoUrl: string;
  stadiumId: number;
  leagueId: number;
  stadium?: Stadium;
}

export interface Stadium {
  stadiumId: number;
  stadiumName: string;
  city: string | null;
  capacity: number;
  surface: string | null;
  address: string | null;
  imageUrl: string | null;
}

export interface PlayerStatistic {
  season: number;
  leagueId: number;
  teamId: number;
  appearances: number;
  lineups: number;
  minutes: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  rating: number | null;
}

export interface Player {
  playerId: number;
  fullName: string;
  nationality: string | null;
  heightCm: number | null;
  weightKg: number | null;
  photoUrl: string | null;
  statistics: PlayerStatistic[];
}

export interface SyncTeamsResponse {
  success: boolean;
  message: string;
  count: number;
  data: Team[];
}

export interface Season {
  seasonId: number;
  year: number;
  startDate: string;
  endDate: string;
  current: boolean;
  leagueId: number;
}

export interface PlayerFromAPI {
  playerId: number;
  apiPlayerId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  nationality: string;
  birthPlace: string | null;
  birthCountry: string;
  heightCm: number | null;
  weightKg: number | null;
  photoUrl: string;
  isInjured: boolean;
  teamId: number;
  position: string;
  number: number | null;
  team?: Team;
}

export interface PlayerStats {
  playerStatisticsId: number;
  playerId: number;
  teamId: number;
  leagueId: number;
  seasonId: number;
  appearances: number;
  lineups: number;
  minutes: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  rating: number | null;
  substitutionsIn: number | null;
  substitutionsOut: number | null;
  shotsTotal: number | null;
  shotsOnTarget: number | null;
  passesTotal: number | null;
  passesKey: number | null;
  passesAccuracy: number | null;
  dribblesAttempted: number | null;
  dribblesSuccess: number | null;
  dribblesSuccessRate: number | null;
  duelsWon: number | null;
  duelsTotal: number | null;
  duelsWonRate: number | null;
  tackles: number | null;
  interceptions: number | null;
  foulsDrawn: number | null;
  foulsCommitted: number | null;
  penaltiesScored: number | null;
  penaltiesMissed: number | null;
  league?: League;
  player?: PlayerFromAPI;
  season?: Season;
}

export interface MatchTeam {
  teamId: number;
  teamName: string;
  logoUrl: string;
}

export interface Match {
  matchId: number;
  apiFixtureId: number;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  homeGoals: number;
  awayGoals: number;
  matchDate: string;
  round: string;
  status: string;
  venue: string;
}

export interface StandingTeam {
  teamId: number;
  teamName: string;
  logoUrl: string;
}

export interface Standing {
  standingId: number;
  team: StandingTeam;
  rank: number;
  points: number;
  played: number;
  win: number;
  draw: number;
  loss: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form: string;
}

export interface SofascoreStandingRow {
  id: number;
  position: number;
  team: {
    id: number;
    name: string;
    logo: string; // built from team.id
  };
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  scoresFor: number;
  scoresAgainst: number;
  points: number;
}

export interface SofascoreTeamMatch {
  id: number;
  homeTeam: { id: number; name: string; };
  awayTeam: { id: number; name: string; };
  homeScore: { current: number; };
  awayScore: { current: number; };
  startTimestamp: number;
  status: { type: string; };
}

interface RawSofascoreRow {
  id: number;
  position: number;
  team: { id: number; name: string; };
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  scoresFor: number;
  scoresAgainst: number;
  points: number;
}

export const leagueService = {
  async getTeamLastMatches(teamId: number, page = 0): Promise<SofascoreTeamMatch[]> {
    const result = await apiClient.get<any>(
      `/api/Sofascore/team/last-matches?teamId=${teamId}&page=${page}`
    );
    const raw = result?.events ?? result?.matches ?? result ?? [];
    return Array.isArray(raw) ? raw : [];
  },

  async getSofascoreStandings(tournamentId: number, seasonId: number): Promise<SofascoreStandingRow[]> {
    const result = await apiClient.get<any>(
      `/api/Sofascore/standings?tournamentId=${tournamentId}&seasonId=${seasonId}`
    );
    // Response: { standings: [{ type: "total", rows: [...] }] }
    const rawRows: RawSofascoreRow[] = result?.standings?.[0]?.rows ?? [];
    return rawRows.map((row) => ({
      ...row,
      team: {
        id: row.team.id,
        name: row.team.name,
        logo: `https://api.sofascore.app/api/v1/team/${row.team.id}/image`,
      },
    }));
  },

  async getLeagues(): Promise<League[]> {
    return await apiClient.get<League[]>('/api/Football/leagues');
  },

  async getAllTeams(): Promise<Team[]> {
    return await apiClient.get<Team[]>('/api/Football/teams');
  },

  async getSeasons(leagueId: number): Promise<Season[]> {
    return await apiClient.get<Season[]>(`/api/Football/seasons?leagueId=${leagueId}`);
  },

  async getTeams(leagueId: number): Promise<Team[]> {
    return await apiClient.get<Team[]>(`/api/Football/teams?leagueId=${leagueId}`);
  },

  async getTeamById(teamId: number): Promise<Team> {
    const raw = await apiClient.get<any>(`/api/Football/teams/${teamId}`);
    // BE returns PascalCase — normalize to camelCase
    return {
      teamId: raw.TeamId ?? raw.teamId,
      teamName: raw.TeamName ?? raw.teamName,
      shortName: raw.ShortName ?? raw.shortName ?? null,
      coachName: raw.CoachName ?? raw.coachName ?? null,
      coachApiId: raw.CoachApiId ?? raw.coachApiId ?? null,
      clubId: raw.ClubId ?? raw.clubId,
      apiTeamId: raw.ApiTeamId ?? raw.apiTeamId,
      founded: raw.Founded ?? raw.founded ?? null,
      national: raw.National ?? raw.national ?? false,
      logoUrl: raw.LogoUrl ?? raw.logoUrl,
      stadiumId: raw.StadiumId ?? raw.stadiumId,
      leagueId: raw.LeagueId ?? raw.leagueId,
      stadium: (raw.Stadium ?? raw.stadium) ? {
        stadiumId: (raw.Stadium ?? raw.stadium).StadiumId ?? (raw.Stadium ?? raw.stadium).stadiumId,
        stadiumName: (raw.Stadium ?? raw.stadium).StadiumName ?? (raw.Stadium ?? raw.stadium).stadiumName,
        city: (raw.Stadium ?? raw.stadium).City ?? (raw.Stadium ?? raw.stadium).city ?? null,
        capacity: (raw.Stadium ?? raw.stadium).Capacity ?? (raw.Stadium ?? raw.stadium).capacity,
        surface: (raw.Stadium ?? raw.stadium).Surface ?? (raw.Stadium ?? raw.stadium).surface ?? null,
        address: (raw.Stadium ?? raw.stadium).Address ?? (raw.Stadium ?? raw.stadium).address ?? null,
        imageUrl: (raw.Stadium ?? raw.stadium).ImageUrl ?? (raw.Stadium ?? raw.stadium).imageUrl ?? null,
      } : undefined,
    };
  },

  async getPlayerById(playerId: number): Promise<PlayerFromAPI> {
    const p = await apiClient.get<any>(`/api/Football/players/${playerId}`);
    return {
      playerId: p.PlayerId ?? p.playerId,
      apiPlayerId: p.ApiPlayerId ?? p.apiPlayerId,
      firstName: p.FirstName ?? p.firstName,
      lastName: p.LastName ?? p.lastName,
      fullName: p.FullName ?? p.fullName,
      dateOfBirth: p.DateOfBirth ?? p.dateOfBirth,
      age: p.Age ?? p.age,
      nationality: p.Nationality ?? p.nationality,
      birthPlace: p.BirthPlace ?? p.birthPlace ?? null,
      birthCountry: p.BirthCountry ?? p.birthCountry,
      heightCm: p.HeightCm ?? p.heightCm ?? null,
      weightKg: p.WeightKg ?? p.weightKg ?? null,
      photoUrl: p.PhotoUrl ?? p.photoUrl,
      isInjured: p.IsInjured ?? p.isInjured ?? false,
      teamId: p.TeamId ?? p.teamId,
      position: p.Position ?? p.position,
      number: p.Number ?? p.number ?? null,
    };
  },

  async getPlayerStatsByPlayerId(playerId: number): Promise<PlayerStats[]> {
    const raw = await apiClient.get<any[]>(`/api/Football/player-stats/by-player/${playerId}`);
    if (!Array.isArray(raw)) return [];
    return raw.map((x) => ({
      playerStatisticsId: x.PlayerStatisticsId ?? x.playerStatisticsId,
      playerId: x.PlayerId ?? x.playerId,
      teamId: x.TeamId ?? x.teamId,
      leagueId: x.LeagueId ?? x.leagueId,
      seasonId: x.SeasonId ?? x.seasonId,
      appearances: x.Appearances ?? x.appearances,
      lineups: x.Lineups ?? x.lineups,
      minutes: x.Minutes ?? x.minutes,
      goals: x.Goals ?? x.goals,
      assists: x.Assists ?? x.assists,
      yellowCards: x.YellowCards ?? x.yellowCards,
      redCards: x.RedCards ?? x.redCards,
      rating: x.Rating ?? x.rating ?? null,
      substitutionsIn: x.SubstitutionsIn ?? x.substitutionsIn ?? null,
      substitutionsOut: x.SubstitutionsOut ?? x.substitutionsOut ?? null,
      shotsTotal: x.ShotsTotal ?? x.shotsTotal ?? null,
      shotsOnTarget: x.ShotsOnTarget ?? x.shotsOnTarget ?? null,
      passesTotal: x.PassesTotal ?? x.passesTotal ?? null,
      passesKey: x.PassesKey ?? x.passesKey ?? null,
      passesAccuracy: x.PassesAccuracy ?? x.passesAccuracy ?? null,
      dribblesAttempted: x.DribblesAttempted ?? x.dribblesAttempted ?? null,
      dribblesSuccess: x.DribblesSuccess ?? x.dribblesSuccess ?? null,
      dribblesSuccessRate: x.DribblesSuccessRate ?? x.dribblesSuccessRate ?? null,
      duelsWon: x.DuelsWon ?? x.duelsWon ?? null,
      duelsTotal: x.DuelsTotal ?? x.duelsTotal ?? null,
      duelsWonRate: x.DuelsWonRate ?? x.duelsWonRate ?? null,
      tackles: x.Tackles ?? x.tackles ?? null,
      interceptions: x.Interceptions ?? x.interceptions ?? null,
      foulsDrawn: x.FoulsDrawn ?? x.foulsDrawn ?? null,
      foulsCommitted: x.FoulsCommitted ?? x.foulsCommitted ?? null,
      penaltiesScored: x.PenaltiesScored ?? x.penaltiesScored ?? null,
      penaltiesMissed: x.PenaltiesMissed ?? x.penaltiesMissed ?? null,
    }));
  },

  async getPlayers(teamId: number): Promise<PlayerFromAPI[]> {    const raw = await apiClient.get<any[]>(`/api/Football/players?teamId=${teamId}`);
    if (!Array.isArray(raw)) return [];
    return raw.map((p) => ({
      playerId: p.PlayerId ?? p.playerId,
      apiPlayerId: p.ApiPlayerId ?? p.apiPlayerId,
      firstName: p.FirstName ?? p.firstName,
      lastName: p.LastName ?? p.lastName,
      fullName: p.FullName ?? p.fullName,
      dateOfBirth: p.DateOfBirth ?? p.dateOfBirth,
      age: p.Age ?? p.age,
      nationality: p.Nationality ?? p.nationality,
      birthPlace: p.BirthPlace ?? p.birthPlace ?? null,
      birthCountry: p.BirthCountry ?? p.birthCountry,
      heightCm: p.HeightCm ?? p.heightCm ?? null,
      weightKg: p.WeightKg ?? p.weightKg ?? null,
      photoUrl: p.PhotoUrl ?? p.photoUrl,
      isInjured: p.IsInjured ?? p.isInjured ?? false,
      teamId: p.TeamId ?? p.teamId,
      position: p.Position ?? p.position,
      number: p.Number ?? p.number ?? null,
    }));
  },

  async getPlayerStats(playerId: number, seasonId: number): Promise<PlayerStats[]> {
    return await apiClient.get<PlayerStats[]>(`/api/Football/player-stats?playerId=${playerId}&seasonId=${seasonId}`);
  },

  async getMatches(leagueId: number, seasonId: number): Promise<Match[]> {
    return await apiClient.get<Match[]>(`/api/Football/matches?leagueId=${leagueId}&seasonId=${seasonId}`);
  },

  async getStandings(leagueId: number, seasonId: number): Promise<Standing[]> {
    return await apiClient.get<Standing[]>(`/api/Football/standings?leagueId=${leagueId}&seasonId=${seasonId}`);
  },

  async getStadium(stadiumId: number): Promise<Stadium> {
    return await apiClient.get<Stadium>(`/api/Football/stadiums/${stadiumId}`);
  },

  // Legacy sync methods - deprecated
  async syncLeagues(): Promise<League[]> {
    return await apiClient.post<League[]>('/api/Football/sync-leagues');
  },

  async syncTeams(apiLeagueId: number, season: number): Promise<Team[]> {
    return await apiClient.post<Team[]>(
      `/api/Football/sync-teams?apiLeagueId=${apiLeagueId}&season=${season}`
    );
  },

  async syncStadiums(): Promise<Stadium[]> {
    return await apiClient.post<Stadium[]>('/api/Football/sync-stadiums');
  },

  async syncPlayers(apiLeagueId: number, season: number): Promise<Player[]> {
    return await apiClient.post<Player[]>(
      `/api/Football/sync-players?apiLeagueId=${apiLeagueId}&season=${season}`
    );
  },
};
