import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserActionType, EligibilityStatus } from './reward.entity';

@Injectable()
export class EligibilityService {
  private readonly logger = new Logger(EligibilityService.name);

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
   * Update user eligibility after an action
   */
  async updateEligibility(userId: string, actionType: UserActionType): Promise<void> {
    try {
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentWeek = this.getStartOfWeek(now);

      // In production, this would use Prisma to update eligibility
      // const eligibility = await this.prisma.userEligibility.upsert({
      //   where: { userId },
      //   update: this.buildUpdateData(actionType, currentMonth, currentWeek),
      //   create: this.buildCreateData(userId, actionType, currentMonth, currentWeek)
      // });

      this.logger.log(`Updated eligibility for user ${userId} after ${actionType} action`);
      
      // Check and update eligibility status
      await this.checkAndUpdateEligibilityStatus(userId);
    } catch (error) {
      this.logger.error(`Failed to update eligibility for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Check current eligibility status for a user
   */
  async getEligibilityStatus(userId: string): Promise<EligibilityStatus> {
    try {
      // In production, this would fetch from database
      // const eligibility = await this.prisma.userEligibility.findUnique({
      //   where: { userId }
      // });

      // Mock data for now - use default values if no eligibility record exists
      const eligibility = {
        monthlyScans: 0,
        monthlyShares: 0,
        monthlyGames: 0,
        weeklyScans: 0,
        weeklyShares: 0,
        weeklyGames: 0,
        giftEligible: false,
        challengeEligible: false
      };

      const giftEligible = this.checkGiftEligibility(
        eligibility.monthlyScans,
        eligibility.monthlyShares,
        eligibility.monthlyGames
      );

      const challengeEligible = this.checkChallengeEligibility(
        eligibility.weeklyScans,
        eligibility.weeklyShares,
        eligibility.weeklyGames
      );

      return {
        giftEligible,
        challengeEligible,
        monthlyProgress: {
          scans: eligibility.monthlyScans,
          shares: eligibility.monthlyShares,
          games: eligibility.monthlyGames,
          requiredScans: this.GIFT_MONTHLY_SCANS,
          requiredShares: this.GIFT_MONTHLY_SHARES,
          requiredGames: this.GIFT_MONTHLY_GAMES,
        },
        weeklyProgress: {
          scans: eligibility.weeklyScans,
          shares: eligibility.weeklyShares,
          games: eligibility.weeklyGames,
          requiredScans: this.CHALLENGE_WEEKLY_SCANS,
          requiredShares: this.CHALLENGE_WEEKLY_SHARES,
          requiredGames: this.CHALLENGE_WEEKLY_GAMES,
        }
      };
    } catch (error) {
      this.logger.error(`Failed to get eligibility status for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Reset weekly counters for all users
   */
  async resetWeeklyCounters(): Promise<void> {
    try {
      const now = new Date();
      // In production, this would reset weekly counters for all users
      // await this.prisma.userEligibility.updateMany({
      //   data: {
      //     weeklyScans: 0,
      //     weeklyShares: 0,
      //     weeklyGames: 0,
      //     lastResetWeek: now
      //   }
      // });

      this.logger.log('Weekly counters reset completed');
    } catch (error) {
      this.logger.error('Failed to reset weekly counters:', error);
      throw error;
    }
  }

  /**
   * Reset monthly counters for all users
   */
  async resetMonthlyCounters(): Promise<void> {
    try {
      const now = new Date();
      // In production, this would reset monthly counters for all users
      // await this.prisma.userEligibility.updateMany({
      //   data: {
      //     monthlyScans: 0,
      //     monthlyShares: 0,
      //     monthlyGames: 0,
      //     lastResetMonth: now
      //   }
      // });

      this.logger.log('Monthly counters reset completed');
    } catch (error) {
      this.logger.error('Failed to reset monthly counters:', error);
      throw error;
    }
  }

  /**
   * Get users eligible for gifts
   */
  async getGiftEligibleUsers(): Promise<string[]> {
    try {
      // In production, this would query the database
      // const eligibleUsers = await this.prisma.userEligibility.findMany({
      //   where: { giftEligible: true },
      //   select: { userId: true }
      // });
      // return eligibleUsers.map(u => u.userId);

      this.logger.log('Fetched gift-eligible users');
      return []; // Mock implementation
    } catch (error) {
      this.logger.error('Failed to get gift-eligible users:', error);
      throw error;
    }
  }

  /**
   * Get users eligible for challenges
   */
  async getChallengeEligibleUsers(): Promise<string[]> {
    try {
      // In production, this would query the database
      // const eligibleUsers = await this.prisma.userEligibility.findMany({
      //   where: { challengeEligible: true },
      //   select: { userId: true }
      // });
      // return eligibleUsers.map(u => u.userId);

      this.logger.log('Fetched challenge-eligible users');
      return []; // Mock implementation
    } catch (error) {
      this.logger.error('Failed to get challenge-eligible users:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private async checkAndUpdateEligibilityStatus(userId: string): Promise<void> {
    try {
      const status = await this.getEligibilityStatus(userId);
      
      // In production, this would update the eligibility flags
      // await this.prisma.userEligibility.update({
      //   where: { userId },
      //   data: {
      //     giftEligible: status.giftEligible,
      //     challengeEligible: status.challengeEligible,
      //     lastGiftEligibility: status.giftEligible ? new Date() : undefined,
      //     lastChallengeEligibility: status.challengeEligible ? new Date() : undefined,
      //   }
      // });

      if (status.giftEligible) {
        this.logger.log(`User ${userId} is now eligible for gifts!`);
      }
      
      if (status.challengeEligible) {
        this.logger.log(`User ${userId} is now eligible for challenges!`);
      }
    } catch (error) {
      this.logger.error(`Failed to check eligibility status for user ${userId}:`, error);
    }
  }

  private checkGiftEligibility(scans: number, shares: number, games: number): boolean {
    return scans >= this.GIFT_MONTHLY_SCANS &&
           shares >= this.GIFT_MONTHLY_SHARES &&
           games >= this.GIFT_MONTHLY_GAMES;
  }

  private checkChallengeEligibility(scans: number, shares: number, games: number): boolean {
    return scans >= this.CHALLENGE_WEEKLY_SCANS &&
           shares >= this.CHALLENGE_WEEKLY_SHARES &&
           games >= this.CHALLENGE_WEEKLY_GAMES;
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  private buildUpdateData(actionType: UserActionType, currentMonth: Date, currentWeek: Date): any {
    const updateData: any = {};

    // Reset counters if needed
    updateData.lastResetMonth = currentMonth;
    updateData.lastResetWeek = currentWeek;

    // Increment appropriate counters
    switch (actionType) {
      case UserActionType.SCAN:
        updateData.monthlyScans = { increment: 1 };
        updateData.weeklyScans = { increment: 1 };
        break;
      case UserActionType.SHARE:
        updateData.monthlyShares = { increment: 1 };
        updateData.weeklyShares = { increment: 1 };
        break;
      case UserActionType.GAME:
        updateData.monthlyGames = { increment: 1 };
        updateData.weeklyGames = { increment: 1 };
        break;
    }

    return updateData;
  }

  private buildCreateData(userId: string, actionType: UserActionType, currentMonth: Date, currentWeek: Date): any {
    const createData: any = {
      userId,
      lastResetMonth: currentMonth,
      lastResetWeek: currentWeek,
      monthlyScans: 0,
      monthlyShares: 0,
      monthlyGames: 0,
      weeklyScans: 0,
      weeklyShares: 0,
      weeklyGames: 0,
    };

    // Set initial count based on action type
    switch (actionType) {
      case UserActionType.SCAN:
        createData.monthlyScans = 1;
        createData.weeklyScans = 1;
        break;
      case UserActionType.SHARE:
        createData.monthlyShares = 1;
        createData.weeklyShares = 1;
        break;
      case UserActionType.GAME:
        createData.monthlyGames = 1;
        createData.weeklyGames = 1;
        break;
    }

    return createData;
  }
}