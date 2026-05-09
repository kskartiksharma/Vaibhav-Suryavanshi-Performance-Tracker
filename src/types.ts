/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Ball {
  ballNumber: number;
  runs: number;
  isBoundary: boolean;
  isSix: boolean;
  isFour: boolean;
  isDot: boolean;
  phase: 'Powerplay' | 'Middle' | 'Death';
  bowlerType?: string;
  zone?: string; // e.g., 'Long On', 'Deep Mid-Wicket'
}

export interface Innings {
  id: string;
  matchDate: string;
  matchNumber: number;
  opposition: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  dotBallPct: number;
  dismissal?: string;
  ballsData: Ball[];
  scoutingNote?: string;
  phases: {
    Powerplay: PhaseStats;
    Middle: PhaseStats;
    Death: PhaseStats;
  };
}

export interface PhaseStats {
  runs: number;
  balls: number;
  sr: number;
  boundaries: number;
  boundaryPct: number;
}

export const BASELINE = {
  totalRuns: 252,
  matches: 7,
  strikeRate: 206.56,
  average: 36, // Derived (252 / 7)
  topScore: "101 (38) vs GT",
  youngestCentury: true,
};

export const INITIAL_INNINGS: Innings[] = [
  {
    id: '1',
    matchDate: '2025-04-15',
    matchNumber: 1,
    opposition: 'Gujarat Titans',
    runs: 101,
    balls: 38,
    fours: 8,
    sixes: 10,
    strikeRate: 265.79,
    dotBallPct: 15.7,
    dismissal: 'Caught at Long Off',
    ballsData: [], // Sample summary for now
    scoutingNote: 'Absolute carnage in the Powerplay. Targeted the spinners with elite horizontal bat shots.',
    phases: {
      Powerplay: { runs: 65, balls: 22, sr: 295.45, boundaries: 12, boundaryPct: 54.5 },
      Middle: { runs: 36, balls: 16, sr: 225, boundaries: 6, boundaryPct: 37.5 },
      Death: { runs: 0, balls: 0, sr: 0, boundaries: 0, boundaryPct: 0 }
    }
  }
];
