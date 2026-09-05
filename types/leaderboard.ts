export type SenatorialDistrict =
  | "Uyo (Akwa Ibom North-East)"
  | "Ikot Ekpene (Akwa Ibom North-West)"
  | "Eket (Akwa Ibom South)";

export interface LgaLeaderboardEntry {
  rank: number;
  lga: string;
  senatorialDistrict: SenatorialDistrict;
  participantCount: number;
  averageScore: number; // e.g. 13.4 / 15
  averagePercentage: number; // e.g. 89.3%
  totalPoints: number; // sum of scores
  powerScore: number; // Heritage Power Index
  badgeStatus: "Grand Champion Pace" | "Top 5 Contender" | "Rising Contender" | "Mobilizing";
}

export interface DiasporaLeaderboardEntry {
  rank: number;
  country: string;
  flag: string;
  code: string;
  participantCount: number;
  averageScore: number;
  averagePercentage: number;
  totalPoints: number;
  powerScore: number;
  chapters: string[];
}

export interface DistrictAnalytics {
  name: SenatorialDistrict;
  shortName: "Uyo" | "Ikot Ekpene" | "Eket";
  lgaCount: number;
  participantCount: number;
  totalPoints: number;
  averagePercentage: number;
  averageScore: number;
  topLga: string;
}

export interface FullLeaderboardData {
  homeLgas: LgaLeaderboardEntry[];
  diasporaCountries: DiasporaLeaderboardEntry[];
  districtAnalytics: DistrictAnalytics[];
  summary: {
    totalParticipants: number;
    homeParticipants: number;
    diasporaParticipants: number;
    topLga: string;
    topLgaPowerScore: number;
    topDiasporaCountry: string;
    topDiasporaFlag: string;
    topDiasporaCountryPowerScore: number;
    highestAccuracyLga: { name: string; pct: number };
    mostMobilizedLga: { name: string; count: number };
    stateAverageAccuracy: number;
  };
}
