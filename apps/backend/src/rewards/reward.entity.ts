export interface UserAction {
  id: string;
  userId: string;
  type: UserActionType;
  createdAt: Date;
  metadata?: any;
}

export enum UserActionType {
  SCAN = 'SCAN',
  SHARE = 'SHARE',
  GAME = 'GAME',
}

export interface UserCoinBalance {
  id: string;
  userId: string;
  totalCoins: number;
  lastUpdated: Date;
}

export interface UserEligibility {
  id: string;
  userId: string;
  giftEligible: boolean;
  challengeEligible: boolean;
  lastGiftEligibility?: Date;
  lastChallengeEligibility?: Date;
  monthlyScans: number;
  monthlyShares: number;
  monthlyGames: number;
  weeklyScans: number;
  weeklyShares: number;
  weeklyGames: number;
  lastResetMonth?: Date;
  lastResetWeek?: Date;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  totalScore: number;
  position?: number;
  lastUpdated: Date;
}

export interface CreateUserActionDto {
  userId: string;
  type: UserActionType;
  metadata?: any;
}

export interface EligibilityStatus {
  giftEligible: boolean;
  challengeEligible: boolean;
  monthlyProgress: {
    scans: number;
    shares: number;
    games: number;
    requiredScans: number;
    requiredShares: number;
    requiredGames: number;
  };
  weeklyProgress: {
    scans: number;
    shares: number;
    games: number;
    requiredScans: number;
    requiredShares: number;
    requiredGames: number;
  };
}

export interface UserRewardSummary {
  userId: string;
  totalCoins: number;
  totalScore: number;
  position?: number;
  eligibilityStatus: EligibilityStatus;
  recentActions: UserAction[];
}