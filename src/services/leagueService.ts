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
  league?: League;
  contracts?: any[];
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
  apiPlayerId: number;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  dateOfBirth: string | null;
  age: number | null;
  nationality: string | null;
  birthPlace: string | null;
  birthCountry: string | null;
  heightCm: number | null;
  weightKg: number | null;
  photoUrl: string | null;
  isInjured: boolean;
  teamId: number | null;
  position: string | null;
  number: number | null;
  statistics: PlayerStatistic[];
}

export interface Standing {
  standingId: number;
  leagueId: number;
  seasonId: number;
  teamId: number;
  rank: number;
  played: number;
  win: number;
  draw: number;
  loss: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string;
  status: string;
  description: string | null;
  homeRecord: string;
  awayRecord: string;
  apiLastUpdated: string;
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
}

export interface TeamStatistic {
  teamStatId: number;
  teamId: number;
  leagueId: number;
  seasonId: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  form: string;
  homePlayed: number;
  homeWins: number;
  homeDraws: number;
  homeLosses: number;
  awayPlayed: number;
  awayWins: number;
  awayDraws: number;
  awayLosses: number;
  homeGoalsFor: number;
  awayGoalsFor: number;
  homeGoalsAgainst: number;
  awayGoalsAgainst: number;
  goalsForAvgTotal: string;
  goalsAgainstAvgTotal: string;
  biggestStreakWins: number;
  biggestStreakDraws: number;
  biggestStreakLosses: number;
  biggestWinHome: string;
  biggestWinAway: string;
  biggestLossHome: string;
  biggestLossAway: string;
  cleanSheets: number;
  cleanSheetsHome: number;
  cleanSheetsAway: number;
  failedToScore: number;
  penaltiesScored: number;
  penaltiesMissed: number;
  penaltiesTotal: number;
  penaltyPercentage: string;
}

export interface Transfer {
  transferId: number;
  playerId: number;
  fromTeamId: number;
  toTeamId: number;
  transferDate: string;
  transferType: string;
}

export interface MatchStat {
  statId: number;
  matchId: number;
  teamId: number;
  possession: number | null;
  shots: number | null;
  shotsOnTarget: number | null;
  corners: number | null;
  fouls: number | null;
  yellowCards: number | null;
  redCards: number | null;
  offsides: number | null;
  shotsBlocked: number | null;
  shotsInsideBox: number | null;
  shotsOutsideBox: number | null;
  passesAccuracy: number | null;
  passesKey: number | null;
  tacklesWon: number | null;
  saves: number | null;
  interceptions: number | null;
  clearances: number | null;
  expectedGoals: number | null;
}

export interface MatchEvent {
  eventId: number;
  matchId: number;
  teamId: number;
  playerId: number | null;
  assistPlayerId: number | null;
  eventType: string;
  detail: string;
  eventTime: number;
  extraTime: number | null;
  period: string;
  comments: string | null;
}

export interface ApiMatch {
  matchId: number;
  apiFixtureId: number;
  leagueId: number;
  seasonId: number;
  matchDate: string;
  kickOffTime: string;
  status: string;
  homeTeamId: number;
  awayTeamId: number;
  homeGoals: number | null;
  awayGoals: number | null;
  venue: string;
  refereeName: string | null;
  attendance: number | null;
  round: string;
  apiVenueId: number | null;
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
  // GK stats
  saves: number | null;
  savesInsideBox: number | null;
  punches: number | null;
  runsOut: number | null;
  runsOutSuccessful: number | null;
  highClaims: number | null;
  goalsConceded: number | null;
  penaltiesSaved: number | null;
  cleanSheets: number | null;
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
    id: number;       // Sofascore apiTeamId — used for logos and FormCell
    dbTeamId?: number; // internal DB teamId — used for navigation
    name: string;
    logo: string;
  };
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  scoresFor: number;
  scoresAgainst: number;
  points: number;
  form?: string;
}

export interface LineupPlayer {
  player: {
    id: number;
    name: string;
    shortName: string;
    position: string;
    jerseyNumber?: string;
    height?: number;
    dateOfBirthTimestamp?: number;
    country?: { name: string; alpha2?: string; };
  };
  teamId: number;
  shirtNumber: number;
  jerseyNumber: string;
  position: string;
  substitute: boolean;
  captain?: boolean;
  statistics?: {
    goals: number;
    ownGoals: number;
    minutesPlayed: number;
    totalShots: number;
    // extended match stats
    rating?: number;
    assists?: number;
    yellowCards?: number;
    redCards?: number;
    shotsOnTarget?: number;
    blockedShots?: number;
    bigChancesCreated?: number;
    bigChancesMissed?: number;
    keyPasses?: number;
    accuratePasses?: number;
    totalPasses?: number;
    accurateLongBalls?: number;
    totalLongBalls?: number;
    accurateCrosses?: number;
    totalCrosses?: number;
    dribbleAttempts?: number;
    successfulDribbles?: number;
    tackles?: number;
    interceptions?: number;
    clearances?: number;
    aerialDuelsWon?: number;
    aerialDuelsTotal?: number;
    foulsCommitted?: number;
    wasFouled?: number;
    possessionLost?: number;
    touches?: number;
  };
}

export interface TeamLineup {
  players: LineupPlayer[];
  formation: string;
  playerColor: { primary: string; number: string; outline: string; };
  goalkeeperColor: { primary: string; number: string; outline: string; };
}

export interface MatchLineups {
  confirmed: boolean;
  home: TeamLineup;
  away: TeamLineup;
}

export interface SofascoreTeamMatch {
  id: number;
  homeTeam: { id: number; name: string; };
  awayTeam: { id: number; name: string; };
  homeScore: { current: number; display?: number; penalties?: number | null; };
  awayScore: { current: number; display?: number; penalties?: number | null; };
  startTimestamp: number;
  status: { type: string; };
  roundInfo?: { round: number; name?: string; cupRoundType?: number; };
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

export interface SofascoreLeague {
  name: string;
  uniqueTournamentId: number;
  currentSeasonId: number;
  seasonName: string;
  url: string;
  logoUrl: string; // built client-side
}

export const leagueService = {
  async getLineups(eventId: number): Promise<MatchLineups> {
    return await apiClient.get<MatchLineups>(`/api/Sofascore/lineups?eventId=${eventId}`);
  },

  async getPlayerMatchStatistics(eventId: number, playerId: number): Promise<any> {
    return await apiClient.get<any>(`/api/Sofascore/player-match-statistics?eventId=${eventId}&playerId=${playerId}`);
  },

  async getPlayerMatchStatsByMatch(apiFixtureId: number): Promise<any[]> {
    try {
      const data = await apiClient.get<any[]>(`/api/SofascoreHybrid/player-match-stats-by-match?apiFixtureId=${apiFixtureId}`);
      return Array.isArray(data) ? data : [];
    } catch { return []; }
  },

  async getIncidents(eventId: number): Promise<any> {
    return await apiClient.get<any>(`/api/Sofascore/incidents?eventId=${eventId}`);
  },

  async getVietnameseLeagues(): Promise<SofascoreLeague[]> {
    const result = await apiClient.get<any>('/api/Sofascore/vietnamese-leagues');
    const raw: Omit<SofascoreLeague, 'logoUrl'>[] = result?.leagues ?? [];
    return raw.map((l) => ({
      ...l,
      logoUrl: `https://api.sofascore.app/api/v1/unique-tournament/${l.uniqueTournamentId}/image/dark`,
    }));
  },

  async getTournamentLastMatches(uniqueTournamentId: number, seasonId: number, page = 0): Promise<{ events: SofascoreTeamMatch[]; hasNextPage: boolean }> {
    const result = await apiClient.get<any>(
      `/api/Sofascore/tournament/last-matches?uniqueTournamentId=${uniqueTournamentId}&seasonId=${seasonId}&page=${page}`
    );
    const events: SofascoreTeamMatch[] = Array.isArray(result?.events) ? result.events : Array.isArray(result) ? result : [];
    return { events, hasNextPage: result?.hasNextPage === true };
  },

  async getTournamentNextMatches(uniqueTournamentId: number, seasonId: number, page = 0): Promise<{ events: SofascoreTeamMatch[]; hasNextPage: boolean }> {
    const result = await apiClient.get<any>(
      `/api/Sofascore/tournament/next-matches?uniqueTournamentId=${uniqueTournamentId}&seasonId=${seasonId}&page=${page}`
    );
    const events: SofascoreTeamMatch[] = Array.isArray(result?.events) ? result.events : Array.isArray(result) ? result : [];
    return { events, hasNextPage: result?.hasNextPage === true };
  },

  async getTournamentCupTrees(uniqueTournamentId: number, seasonId: number): Promise<any> {
    // Try DB first (fast), fallback to Sofascore scraper
    try {
      return await apiClient.get<any>(
        `/api/SofascoreHybrid/cuptree?tournamentId=${uniqueTournamentId}&seasonId=${seasonId}`
      );
    } catch {
      return await apiClient.get<any>(
        `/api/Sofascore/tournament/cuptrees?uniqueTournamentId=${uniqueTournamentId}&seasonId=${seasonId}`
      );
    }
  },

  async getTournamentRoundMatches(uniqueTournamentId: number, seasonId: number, round: number): Promise<SofascoreTeamMatch[]> {
    const result = await apiClient.get<any>(
      `/api/Sofascore/tournament/round-matches?uniqueTournamentId=${uniqueTournamentId}&seasonId=${seasonId}&round=${round}`
    );
    const raw = result?.events ?? result?.matches ?? result ?? [];
    return Array.isArray(raw) ? raw : [];
  },

  async getAllMatchesFromDb(tournamentId: number, seasonId: number): Promise<any[]> {
    const data = await apiClient.get<any[]>(
      `/api/SofascoreHybrid/matches-with-teams?tournamentId=${tournamentId}&seasonId=${seasonId}`
    );
    return Array.isArray(data) ? data : [];
  },

  async getTeamLastMatchesFromDb(apiTeamId: number, count = 5): Promise<SofascoreTeamMatch[]> {
    const data = await apiClient.get<any[]>(
      `/api/SofascoreHybrid/team-last-matches-db?apiTeamId=${apiTeamId}&count=${count}`
    );
    if (!Array.isArray(data)) return [];
    return data.map((x) => ({
      id: x.apiFixtureId ?? x.matchId,
      homeTeam: { id: x.homeTeam?.apiTeamId ?? 0, name: x.homeTeam?.teamName ?? '' },
      awayTeam: { id: x.awayTeam?.apiTeamId ?? 0, name: x.awayTeam?.teamName ?? '' },
      homeScore: { current: x.homeGoals ?? 0 },
      awayScore: { current: x.awayGoals ?? 0 },
      startTimestamp: x.matchDate ? Math.floor(new Date(x.matchDate).getTime() / 1000) : 0,
      status: { type: x.status ?? 'finished' },
    }));
  },

  async getTeamLastMatches(teamId: number, page = 0): Promise<SofascoreTeamMatch[]> {
    const result = await apiClient.get<any>(
      `/api/Sofascore/team/last-matches?teamId=${teamId}&page=${page}`
    );
    const raw = result?.events ?? result?.matches ?? result ?? [];
    return Array.isArray(raw) ? raw : [];
  },

  async getTeamNextMatches(teamId: number, page = 0): Promise<SofascoreTeamMatch[]> {
    const result = await apiClient.get<any>(
      `/api/Sofascore/team/next-matches?teamId=${teamId}&page=${page}`
    );
    const raw = result?.events ?? result?.matches ?? result ?? [];
    return Array.isArray(raw) ? raw : [];
  },

  async getHybridStandings(tournamentId: number, seasonId: number): Promise<SofascoreStandingRow[]> {
    const data = await apiClient.get<any[]>(
      `/api/SofascoreHybrid/standings?tournamentId=${tournamentId}&seasonId=${seasonId}`
    );
    if (!Array.isArray(data) || data.length === 0) return [];
    return data
      .sort((a, b) => (a.rank ?? a.Rank ?? 99) - (b.rank ?? b.Rank ?? 99))
      .map((x) => {
        // Controller returns ApiTeamId (serialized as apiTeamId in camelCase)
        const apiTeamId = x.apiTeamId ?? x.ApiTeamId ?? 0;
        const dbTeamId = x.teamId ?? x.TeamId ?? 0;
        return {
          id: x.standingId ?? x.StandingId,
          position: x.rank ?? x.Rank ?? 0,
          team: {
            id: apiTeamId,
            dbTeamId,
            name: x.teamName ?? x.TeamName ?? '',
            logo: x.teamLogo ?? x.TeamLogo ?? (apiTeamId > 0 ? `https://api.sofascore.app/api/v1/team/${apiTeamId}/image` : ''),
          },
          matches: x.played ?? x.Played ?? 0,
          wins: x.win ?? x.Win ?? 0,
          draws: x.draw ?? x.Draw ?? 0,
          losses: x.loss ?? x.Loss ?? 0,
          scoresFor: x.goalsFor ?? x.GoalsFor ?? 0,
          scoresAgainst: x.goalsAgainst ?? x.GoalsAgainst ?? 0,
          points: x.points ?? x.Points ?? 0,
          form: x.form ?? x.Form ?? '',
        };
      });
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
    const raw = await apiClient.get<any[]>(`/api/Football/seasons?leagueId=${leagueId}`);
    if (!Array.isArray(raw)) return [];
    return raw.map((x) => ({
      seasonId: x.SeasonId ?? x.seasonId,
      leagueId: x.LeagueId ?? x.leagueId,
      year: x.Year ?? x.year,
      startDate: x.StartDate ?? x.startDate,
      endDate: x.EndDate ?? x.endDate,
      current: x.IsCurrent ?? x.IsCurrentSeason ?? x.current ?? false,
    }));
  },

  async getTeams(): Promise<Team[]> {
    return await apiClient.get<Team[]>('/api/Football/teams');
  },

  async getTeamById(teamId: number): Promise<Team> {
    return await apiClient.get<Team>(`/api/Football/teams/${teamId}`);
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
      saves: x.Saves ?? x.saves ?? null,
      savesInsideBox: x.SavesInsideBox ?? x.savesInsideBox ?? null,
      cleanSheets: x.CleanSheets ?? x.cleanSheets ?? null,
      goalsConceded: x.GoalsConceded ?? x.goalsConceded ?? null,
      penaltiesSaved: x.PenaltiesSaved ?? x.penaltiesSaved ?? null,
      punches: x.Punches ?? x.punches ?? null,
      runsOut: x.RunsOut ?? x.runsOut ?? null,
      runsOutSuccessful: x.RunsOutSuccessful ?? x.runsOutSuccessful ?? null,
      highClaims: x.HighClaims ?? x.highClaims ?? null,
    }));
  },

  async getAllPlayerSeasonRatings(): Promise<Record<number, number>> {
    try {
      const cached = sessionStorage.getItem('player-season-ratings');
      if (cached) return JSON.parse(cached);
      const raw = await apiClient.get<any[]>('/api/SofascoreHybrid/player-season-statistics');
      if (!Array.isArray(raw)) return {};
      const map: Record<number, number> = {};
      for (const x of raw) {
        const pid = x.playerId ?? x.PlayerId;
        const r = x.rating ?? x.Rating;
        if (pid && r != null && (map[pid] == null || r > map[pid])) map[pid] = r;
      }
      sessionStorage.setItem('player-season-ratings', JSON.stringify(map));
      return map;
    } catch { return {}; }
  },

  async getPlayers(teamId: number): Promise<PlayerFromAPI[]> {
    return await apiClient.get<PlayerFromAPI[]>(`/api/Football/players?teamId=${teamId}`);
  },

  async getAllPlayers(): Promise<PlayerFromAPI[]> {
    const raw = await apiClient.get<any[]>('/api/Football/players');
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
      team: p.Team ?? p.team,
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

  async getMatchEvents(): Promise<MatchEvent[]> {
    return await apiClient.get<MatchEvent[]>('/api/Football/match-events');
  },

  async getMatchStatistics(): Promise<MatchStat[]> {
    return await apiClient.get<MatchStat[]>('/api/SofascoreHybrid/match-statistics');
  },

  async getTeamContracts(tournamentId: number, seasonId: number): Promise<any> {
    return await apiClient.get<any>(`/api/SofascoreHybrid/contracts?tournamentId=${tournamentId}&seasonId=${seasonId}`);
  },

  async getLeagueTransfers(tournamentId: number, seasonId: number): Promise<any> {
    return await apiClient.get<any>(`/api/SofascoreHybrid/transfers?tournamentId=${tournamentId}&seasonId=${seasonId}`);
  },

  async getTransfers(): Promise<Transfer[]> {
    return await apiClient.get<Transfer[]>('/api/Football/transfers');
  },

  async getTeamStatistics(): Promise<TeamStatistic[]> {
    return await apiClient.get<TeamStatistic[]>('/api/Football/team-statistics');
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
