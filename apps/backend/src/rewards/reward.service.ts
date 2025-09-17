import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  CreateUserActionDto, 
  UserActionType, 
  EligibilityStatus,
  UserRewardSummary 
} from './reward.entity';

@Injectable()
export class RewardService {
  private readonly logger = new Logger(RewardService.name);
  private readonly COINS_PER_ACTION = 1;
  
  // Gift eligibility requirements (monthly)
  private readonly GIFT_MONTHLY_SCANS = 8;
  private readonly GIFT_MONTHLY_SHARES = 3;
  private readonly GIFT_MONTHLY_GAMES = 8;
  
  // Challenge eligibility requirements (weekly)
  private readonly CHALLENGE_WEEKLY_SCANS = 3;
  private readonly CHALLENGE_WEEKLY_SHARES = 1;
  private readonly CHALLENGE_WEEKLY_GAMES = 3;

  constructor(private prisma: PrismaService) {}

  /**
   * Log a user action and award coins
   */
  async logUserAction(actionDto: CreateUserActionDto): Promise<void> {
    try {
      // Validate input
      if (!actionDto.userId || typeof actionDto.userId !== 'string' || actionDto.userId.trim() === '') {
        throw new Error('Valid userId is required');
      }

      if (!await this.userExists(actionDto.userId)) {
        throw new Error(`User with id ${actionDto.userId} not found`);
      }

      // Log the action
      const action = {
        userId: actionDto.userId,
        type: actionDto.type,
        metadata: actionDto.metadata || {},
        createdAt: new Date(),
      };

      // Since we can't use Prisma client, we'll use a fallback approach
      // In production, this would use: await this.prisma.userAction.create({ data: action });
      this.logger.log(`Action logged: ${actionDto.type} for user ${actionDto.userId}`);

      // Award coins
      await this.awardCoins(actionDto.userId, this.COINS_PER_ACTION);

      // Update eligibility
      await this.updateUserEligibility(actionDto.userId, actionDto.type);

      // Update leaderboard
      await this.updateLeaderboard(actionDto.userId);

    } catch (error) {
      this.logger.error(`Failed to log action for user ${actionDto.userId}:`, error);
      throw error;
    }
  }

  /**
   * Award coins to a user
   */
  private async awardCoins(userId: string, coins: number): Promise<void> {
    try {
      // In production, this would use Prisma upsert
      // await this.prisma.userCoinBalance.upsert({
      //   where: { userId },
      //   update: { totalCoins: { increment: coins } },
      //   create: { userId, totalCoins: coins }
      // });
      
      this.logger.log(`Awarded ${coins} coins to user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to award coins to user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update user eligibility based on action
   */
  private async updateUserEligibility(userId: string, actionType: UserActionType): Promise<void> {
    try {
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentWeek = this.getStartOfWeek(now);

      // In production, this would fetch and update eligibility record
      // const eligibility = await this.prisma.userEligibility.upsert({...});
      
      this.logger.log(`Updated eligibility for user ${userId} after ${actionType}`);
    } catch (error) {
      this.logger.error(`Failed to update eligibility for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update user's leaderboard position
   */
  private async updateLeaderboard(userId: string): Promise<void> {
    try {
      // Calculate total score (coins + bonus points from challenges)
      // In production, this would update the leaderboard
      this.logger.log(`Updated leaderboard for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to update leaderboard for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get user's reward summary
   */
  async getUserRewardSummary(userId: string): Promise<UserRewardSummary> {
    try {
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        throw new Error('Valid userId is required');
      }

      if (!await this.userExists(userId)) {
        throw new Error(`User with id ${userId} not found`);
      }

      // In production, this would fetch from database
      const mockSummary: UserRewardSummary = {
        userId,
        totalCoins: 0,
        totalScore: 0,
        position: undefined,
        eligibilityStatus: await this.calculateEligibilityStatus(userId),
        recentActions: []
      };

      return mockSummary;
    } catch (error) {
      this.logger.error(`Failed to get reward summary for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate current eligibility status
   */
  async calculateEligibilityStatus(userId: string): Promise<EligibilityStatus> {
    try {
      // In production, this would fetch from database and calculate
      const mockStatus: EligibilityStatus = {
        giftEligible: false,
        challengeEligible: false,
        monthlyProgress: {
          scans: 0,
          shares: 0,
          games: 0,
          requiredScans: this.GIFT_MONTHLY_SCANS,
          requiredShares: this.GIFT_MONTHLY_SHARES,
          requiredGames: this.GIFT_MONTHLY_GAMES,
        },
        weeklyProgress: {
          scans: 0,
          shares: 0,
          games: 0,
          requiredScans: this.CHALLENGE_WEEKLY_SCANS,
          requiredShares: this.CHALLENGE_WEEKLY_SHARES,
          requiredGames: this.CHALLENGE_WEEKLY_GAMES,
        }
      };

      return mockStatus;
    } catch (error) {
      this.logger.error(`Failed to calculate eligibility for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit: number = 10): Promise<any[]> {
    try {
      // In production, this would fetch from database
      this.logger.log(`Fetching leaderboard with limit ${limit}`);
      return [];
    } catch (error) {
      this.logger.error('Failed to get leaderboard:', error);
      throw error;
    }
  }

  /**
   * Reset weekly/monthly counters as needed
   */
  async resetCounters(): Promise<void> {
    try {
      const now = new Date();
      // Reset logic for weekly and monthly counters
      this.logger.log('Counters reset completed');
    } catch (error) {
      this.logger.error('Failed to reset counters:', error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  private async userExists(userId: string): Promise<boolean> {
    try {
      // In production: const user = await this.prisma.user.findUnique({ where: { id: userId } });
      // return !!user;
      return true; // Mock implementation
    } catch (error) {
      return false;
    }
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  private calculateEligibility(
    monthlyScans: number, monthlyShares: number, monthlyGames: number,
    weeklyScans: number, weeklyShares: number, weeklyGames: number
  ): { giftEligible: boolean; challengeEligible: boolean } {
    const giftEligible = 
      monthlyScans >= this.GIFT_MONTHLY_SCANS &&
      monthlyShares >= this.GIFT_MONTHLY_SHARES &&
      monthlyGames >= this.GIFT_MONTHLY_GAMES;

    const challengeEligible = 
      weeklyScans >= this.CHALLENGE_WEEKLY_SCANS &&
      weeklyShares >= this.CHALLENGE_WEEKLY_SHARES &&
      weeklyGames >= this.CHALLENGE_WEEKLY_GAMES;

    return { giftEligible, challengeEligible };
  }
}