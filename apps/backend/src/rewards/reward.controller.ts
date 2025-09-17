import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  Query, 
  BadRequestException,
  NotFoundException,
  Logger
} from '@nestjs/common';
import { RewardService } from './reward.service';
import { EligibilityService } from './eligibility.service';
import { LeaderboardService } from './leaderboard.service';
import { 
  CreateUserActionDto, 
  UserActionType, 
  EligibilityStatus,
  UserRewardSummary 
} from './reward.entity';

@Controller('api/rewards')
export class RewardController {
  private readonly logger = new Logger(RewardController.name);

  constructor(
    private readonly rewardService: RewardService,
    private readonly eligibilityService: EligibilityService,
    private readonly leaderboardService: LeaderboardService,
  ) {}

  /**
   * Log a user action (scan, share, game)
   */
  @Post('actions')
  async logAction(@Body() actionDto: CreateUserActionDto): Promise<{ success: boolean; message: string; coinsAwarded: number }> {
    try {
      // Validate action type
      if (!Object.values(UserActionType).includes(actionDto.type)) {
        throw new BadRequestException('Invalid action type');
      }

      // Validate user ID
      if (!actionDto.userId || typeof actionDto.userId !== 'string') {
        throw new BadRequestException('Valid userId is required');
      }

      await this.rewardService.logUserAction(actionDto);

      this.logger.log(`Action logged: ${actionDto.type} for user ${actionDto.userId}`);

      return {
        success: true,
        message: `Action ${actionDto.type} logged successfully`,
        coinsAwarded: 1 // 1 coin per action
      };
    } catch (error) {
      this.logger.error('Failed to log action:', error);
      throw error;
    }
  }

  /**
   * Get user's reward summary
   */
  @Get('users/:userId/summary')
  async getUserRewardSummary(@Param('userId') userId: string): Promise<UserRewardSummary> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const summary = await this.rewardService.getUserRewardSummary(userId);
      return summary;
    } catch (error) {
      this.logger.error(`Failed to get reward summary for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get user's eligibility status
   */
  @Get('users/:userId/eligibility')
  async getUserEligibility(@Param('userId') userId: string): Promise<EligibilityStatus> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const eligibility = await this.eligibilityService.getEligibilityStatus(userId);
      return eligibility;
    } catch (error) {
      this.logger.error(`Failed to get eligibility for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get user's score and position
   */
  @Get('users/:userId/score')
  async getUserScore(@Param('userId') userId: string): Promise<{ totalScore: number; position: number | null }> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const scoreDetails = await this.leaderboardService.getUserScore(userId);
      return scoreDetails;
    } catch (error) {
      this.logger.error(`Failed to get score for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get leaderboard
   */
  @Get('leaderboard')
  async getLeaderboard(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ): Promise<any[]> {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 10;
      const offsetNum = offset ? parseInt(offset, 10) : 0;

      if (limitNum < 1 || limitNum > 100) {
        throw new BadRequestException('Limit must be between 1 and 100');
      }

      if (offsetNum < 0) {
        throw new BadRequestException('Offset must be non-negative');
      }

      const leaderboard = await this.leaderboardService.getLeaderboard(limitNum, offsetNum);
      return leaderboard;
    } catch (error) {
      this.logger.error('Failed to get leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard around a specific user
   */
  @Get('leaderboard/users/:userId/context')
  async getLeaderboardAroundUser(
    @Param('userId') userId: string,
    @Query('range') range?: string
  ): Promise<any[]> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const rangeNum = range ? parseInt(range, 10) : 5;

      if (rangeNum < 1 || rangeNum > 20) {
        throw new BadRequestException('Range must be between 1 and 20');
      }

      const leaderboard = await this.leaderboardService.getLeaderboardAroundUser(userId, rangeNum);
      return leaderboard;
    } catch (error) {
      this.logger.error(`Failed to get leaderboard around user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get users eligible for gifts
   */
  @Get('eligibility/gifts')
  async getGiftEligibleUsers(): Promise<{ eligibleUsers: string[]; count: number }> {
    try {
      const eligibleUsers = await this.eligibilityService.getGiftEligibleUsers();
      return {
        eligibleUsers,
        count: eligibleUsers.length
      };
    } catch (error) {
      this.logger.error('Failed to get gift-eligible users:', error);
      throw error;
    }
  }

  /**
   * Get users eligible for challenges
   */
  @Get('eligibility/challenges')
  async getChallengeEligibleUsers(): Promise<{ eligibleUsers: string[]; count: number }> {
    try {
      const eligibleUsers = await this.eligibilityService.getChallengeEligibleUsers();
      return {
        eligibleUsers,
        count: eligibleUsers.length
      };
    } catch (error) {
      this.logger.error('Failed to get challenge-eligible users:', error);
      throw error;
    }
  }

  /**
   * Get top performers by action type
   */
  @Get('leaderboard/actions/:actionType')
  async getTopPerformersByAction(
    @Param('actionType') actionType: string,
    @Query('limit') limit?: string
  ): Promise<any[]> {
    try {
      // Validate action type
      if (!Object.values(UserActionType).includes(actionType as UserActionType)) {
        throw new BadRequestException('Invalid action type');
      }

      const limitNum = limit ? parseInt(limit, 10) : 10;

      if (limitNum < 1 || limitNum > 50) {
        throw new BadRequestException('Limit must be between 1 and 50');
      }

      const topPerformers = await this.leaderboardService.getTopPerformersByAction(actionType, limitNum);
      return topPerformers;
    } catch (error) {
      this.logger.error(`Failed to get top performers for ${actionType}:`, error);
      throw error;
    }
  }

  /**
   * Get leaderboard statistics
   */
  @Get('leaderboard/stats')
  async getLeaderboardStats(): Promise<{
    totalUsers: number;
    averageScore: number;
    topScore: number;
  }> {
    try {
      const stats = await this.leaderboardService.getLeaderboardStats();
      return stats;
    } catch (error) {
      this.logger.error('Failed to get leaderboard stats:', error);
      throw error;
    }
  }

  /**
   * Admin endpoint: Reset weekly counters
   */
  @Post('admin/reset/weekly')
  async resetWeeklyCounters(): Promise<{ success: boolean; message: string }> {
    try {
      await this.eligibilityService.resetWeeklyCounters();
      return {
        success: true,
        message: 'Weekly counters reset successfully'
      };
    } catch (error) {
      this.logger.error('Failed to reset weekly counters:', error);
      throw error;
    }
  }

  /**
   * Admin endpoint: Reset monthly counters
   */
  @Post('admin/reset/monthly')
  async resetMonthlyCounters(): Promise<{ success: boolean; message: string }> {
    try {
      await this.eligibilityService.resetMonthlyCounters();
      return {
        success: true,
        message: 'Monthly counters reset successfully'
      };
    } catch (error) {
      this.logger.error('Failed to reset monthly counters:', error);
      throw error;
    }
  }

  /**
   * Health check endpoint
   */
  @Get('health')
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    };
  }
}