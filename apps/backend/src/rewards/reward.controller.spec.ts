import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';
import { EligibilityService } from './eligibility.service';
import { LeaderboardService } from './leaderboard.service';
import { UserActionType, CreateUserActionDto } from './reward.entity';

describe('RewardController', () => {
  let controller: RewardController;
  let rewardService: RewardService;
  let eligibilityService: EligibilityService;
  let leaderboardService: LeaderboardService;

  const mockRewardService = {
    logUserAction: jest.fn(),
    getUserRewardSummary: jest.fn(),
    calculateEligibilityStatus: jest.fn(),
    getLeaderboard: jest.fn(),
  };

  const mockEligibilityService = {
    getEligibilityStatus: jest.fn(),
    getGiftEligibleUsers: jest.fn(),
    getChallengeEligibleUsers: jest.fn(),
    resetWeeklyCounters: jest.fn(),
    resetMonthlyCounters: jest.fn(),
  };

  const mockLeaderboardService = {
    getUserScore: jest.fn(),
    getLeaderboard: jest.fn(),
    getLeaderboardAroundUser: jest.fn(),
    getTopPerformersByAction: jest.fn(),
    getLeaderboardStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RewardController],
      providers: [
        { provide: RewardService, useValue: mockRewardService },
        { provide: EligibilityService, useValue: mockEligibilityService },
        { provide: LeaderboardService, useValue: mockLeaderboardService },
      ],
    }).compile();

    controller = module.get<RewardController>(RewardController);
    rewardService = module.get<RewardService>(RewardService);
    eligibilityService = module.get<EligibilityService>(EligibilityService);
    leaderboardService = module.get<LeaderboardService>(LeaderboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('logAction', () => {
    it('should log a scan action successfully', async () => {
      const actionDto: CreateUserActionDto = {
        userId: 'user-123',
        type: UserActionType.SCAN,
        metadata: { qrCode: 'test-qr' },
      };

      const result = await controller.logAction(actionDto);

      expect(rewardService.logUserAction).toHaveBeenCalledWith(actionDto);
      expect(result).toEqual({
        success: true,
        message: 'Action SCAN logged successfully',
        coinsAwarded: 1,
      });
    });

    it('should log a share action successfully', async () => {
      const actionDto: CreateUserActionDto = {
        userId: 'user-123',
        type: UserActionType.SHARE,
        metadata: { platform: 'facebook' },
      };

      const result = await controller.logAction(actionDto);

      expect(rewardService.logUserAction).toHaveBeenCalledWith(actionDto);
      expect(result).toEqual({
        success: true,
        message: 'Action SHARE logged successfully',
        coinsAwarded: 1,
      });
    });

    it('should log a game action successfully', async () => {
      const actionDto: CreateUserActionDto = {
        userId: 'user-123',
        type: UserActionType.GAME,
        metadata: { gameId: 'puzzle-1', score: 1500 },
      };

      const result = await controller.logAction(actionDto);

      expect(rewardService.logUserAction).toHaveBeenCalledWith(actionDto);
      expect(result).toEqual({
        success: true,
        message: 'Action GAME logged successfully',
        coinsAwarded: 1,
      });
    });

    it('should throw BadRequestException for invalid action type', async () => {
      const actionDto: any = {
        userId: 'user-123',
        type: 'INVALID_ACTION',
      };

      await expect(controller.logAction(actionDto)).rejects.toThrow(BadRequestException);
      expect(rewardService.logUserAction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for missing userId', async () => {
      const actionDto: any = {
        type: UserActionType.SCAN,
      };

      await expect(controller.logAction(actionDto)).rejects.toThrow(BadRequestException);
      expect(rewardService.logUserAction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for empty userId', async () => {
      const actionDto: CreateUserActionDto = {
        userId: '',
        type: UserActionType.SCAN,
      };

      await expect(controller.logAction(actionDto)).rejects.toThrow(BadRequestException);
      expect(rewardService.logUserAction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for non-string userId', async () => {
      const actionDto: any = {
        userId: 123,
        type: UserActionType.SCAN,
      };

      await expect(controller.logAction(actionDto)).rejects.toThrow(BadRequestException);
      expect(rewardService.logUserAction).not.toHaveBeenCalled();
    });
  });

  describe('getUserRewardSummary', () => {
    it('should return user reward summary', async () => {
      const userId = 'user-123';
      const mockSummary = {
        userId,
        totalCoins: 150,
        totalScore: 200,
        position: 5,
        eligibilityStatus: {
          giftEligible: true,
          challengeEligible: false,
          monthlyProgress: { scans: 8, shares: 3, games: 8, requiredScans: 8, requiredShares: 3, requiredGames: 8 },
          weeklyProgress: { scans: 2, shares: 0, games: 1, requiredScans: 3, requiredShares: 1, requiredGames: 3 },
        },
        recentActions: [],
      };

      mockRewardService.getUserRewardSummary.mockResolvedValue(mockSummary);

      const result = await controller.getUserRewardSummary(userId);

      expect(rewardService.getUserRewardSummary).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockSummary);
    });

    it('should throw BadRequestException for missing userId', async () => {
      await expect(controller.getUserRewardSummary('')).rejects.toThrow(BadRequestException);
      expect(rewardService.getUserRewardSummary).not.toHaveBeenCalled();
    });
  });

  describe('getUserEligibility', () => {
    it('should return user eligibility status', async () => {
      const userId = 'user-123';
      const mockEligibility = {
        giftEligible: false,
        challengeEligible: true,
        monthlyProgress: { scans: 4, shares: 1, games: 6, requiredScans: 8, requiredShares: 3, requiredGames: 8 },
        weeklyProgress: { scans: 3, shares: 1, games: 3, requiredScans: 3, requiredShares: 1, requiredGames: 3 },
      };

      mockEligibilityService.getEligibilityStatus.mockResolvedValue(mockEligibility);

      const result = await controller.getUserEligibility(userId);

      expect(eligibilityService.getEligibilityStatus).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockEligibility);
    });

    it('should throw BadRequestException for missing userId', async () => {
      await expect(controller.getUserEligibility('')).rejects.toThrow(BadRequestException);
      expect(eligibilityService.getEligibilityStatus).not.toHaveBeenCalled();
    });
  });

  describe('getUserScore', () => {
    it('should return user score and position', async () => {
      const userId = 'user-123';
      const mockScore = { totalScore: 250, position: 3 };

      mockLeaderboardService.getUserScore.mockResolvedValue(mockScore);

      const result = await controller.getUserScore(userId);

      expect(leaderboardService.getUserScore).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockScore);
    });

    it('should throw BadRequestException for missing userId', async () => {
      await expect(controller.getUserScore('')).rejects.toThrow(BadRequestException);
      expect(leaderboardService.getUserScore).not.toHaveBeenCalled();
    });
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard with default parameters', async () => {
      const mockLeaderboard = [
        { id: 'lb-1', userId: 'user-1', totalScore: 500, position: 1 },
        { id: 'lb-2', userId: 'user-2', totalScore: 450, position: 2 },
      ];

      mockLeaderboardService.getLeaderboard.mockResolvedValue(mockLeaderboard);

      const result = await controller.getLeaderboard();

      expect(leaderboardService.getLeaderboard).toHaveBeenCalledWith(10, 0);
      expect(result).toEqual(mockLeaderboard);
    });

    it('should return leaderboard with custom parameters', async () => {
      const mockLeaderboard = [];
      mockLeaderboardService.getLeaderboard.mockResolvedValue(mockLeaderboard);

      const result = await controller.getLeaderboard('5', '20');

      expect(leaderboardService.getLeaderboard).toHaveBeenCalledWith(5, 20);
      expect(result).toEqual(mockLeaderboard);
    });

    it('should throw BadRequestException for invalid limit', async () => {
      await expect(controller.getLeaderboard('0')).rejects.toThrow(BadRequestException);
      await expect(controller.getLeaderboard('101')).rejects.toThrow(BadRequestException);
      expect(leaderboardService.getLeaderboard).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for negative offset', async () => {
      await expect(controller.getLeaderboard('10', '-1')).rejects.toThrow(BadRequestException);
      expect(leaderboardService.getLeaderboard).not.toHaveBeenCalled();
    });
  });

  describe('getLeaderboardAroundUser', () => {
    it('should return leaderboard around user with default range', async () => {
      const userId = 'user-123';
      const mockLeaderboard = [];

      mockLeaderboardService.getLeaderboardAroundUser.mockResolvedValue(mockLeaderboard);

      const result = await controller.getLeaderboardAroundUser(userId);

      expect(leaderboardService.getLeaderboardAroundUser).toHaveBeenCalledWith(userId, 5);
      expect(result).toEqual(mockLeaderboard);
    });

    it('should return leaderboard around user with custom range', async () => {
      const userId = 'user-123';
      const mockLeaderboard = [];

      mockLeaderboardService.getLeaderboardAroundUser.mockResolvedValue(mockLeaderboard);

      const result = await controller.getLeaderboardAroundUser(userId, '3');

      expect(leaderboardService.getLeaderboardAroundUser).toHaveBeenCalledWith(userId, 3);
      expect(result).toEqual(mockLeaderboard);
    });

    it('should throw BadRequestException for missing userId', async () => {
      await expect(controller.getLeaderboardAroundUser('')).rejects.toThrow(BadRequestException);
      expect(leaderboardService.getLeaderboardAroundUser).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid range', async () => {
      const userId = 'user-123';
      
      await expect(controller.getLeaderboardAroundUser(userId, '0')).rejects.toThrow(BadRequestException);
      await expect(controller.getLeaderboardAroundUser(userId, '21')).rejects.toThrow(BadRequestException);
      expect(leaderboardService.getLeaderboardAroundUser).not.toHaveBeenCalled();
    });
  });

  describe('getGiftEligibleUsers', () => {
    it('should return gift-eligible users', async () => {
      const mockUsers = ['user-1', 'user-2', 'user-3'];
      mockEligibilityService.getGiftEligibleUsers.mockResolvedValue(mockUsers);

      const result = await controller.getGiftEligibleUsers();

      expect(eligibilityService.getGiftEligibleUsers).toHaveBeenCalled();
      expect(result).toEqual({
        eligibleUsers: mockUsers,
        count: 3,
      });
    });
  });

  describe('getChallengeEligibleUsers', () => {
    it('should return challenge-eligible users', async () => {
      const mockUsers = ['user-4', 'user-5'];
      mockEligibilityService.getChallengeEligibleUsers.mockResolvedValue(mockUsers);

      const result = await controller.getChallengeEligibleUsers();

      expect(eligibilityService.getChallengeEligibleUsers).toHaveBeenCalled();
      expect(result).toEqual({
        eligibleUsers: mockUsers,
        count: 2,
      });
    });
  });

  describe('getTopPerformersByAction', () => {
    it('should return top performers for valid action type', async () => {
      const actionType = 'SCAN';
      const mockPerformers = [];

      mockLeaderboardService.getTopPerformersByAction.mockResolvedValue(mockPerformers);

      const result = await controller.getTopPerformersByAction(actionType);

      expect(leaderboardService.getTopPerformersByAction).toHaveBeenCalledWith(actionType, 10);
      expect(result).toEqual(mockPerformers);
    });

    it('should return top performers with custom limit', async () => {
      const actionType = 'SHARE';
      const mockPerformers = [];

      mockLeaderboardService.getTopPerformersByAction.mockResolvedValue(mockPerformers);

      const result = await controller.getTopPerformersByAction(actionType, '5');

      expect(leaderboardService.getTopPerformersByAction).toHaveBeenCalledWith(actionType, 5);
      expect(result).toEqual(mockPerformers);
    });

    it('should throw BadRequestException for invalid action type', async () => {
      await expect(controller.getTopPerformersByAction('INVALID_ACTION')).rejects.toThrow(BadRequestException);
      expect(leaderboardService.getTopPerformersByAction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid limit', async () => {
      await expect(controller.getTopPerformersByAction('SCAN', '0')).rejects.toThrow(BadRequestException);
      await expect(controller.getTopPerformersByAction('SCAN', '51')).rejects.toThrow(BadRequestException);
      expect(leaderboardService.getTopPerformersByAction).not.toHaveBeenCalled();
    });
  });

  describe('getLeaderboardStats', () => {
    it('should return leaderboard statistics', async () => {
      const mockStats = {
        totalUsers: 100,
        averageScore: 125.5,
        topScore: 500,
      };

      mockLeaderboardService.getLeaderboardStats.mockResolvedValue(mockStats);

      const result = await controller.getLeaderboardStats();

      expect(leaderboardService.getLeaderboardStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });

  describe('resetWeeklyCounters', () => {
    it('should reset weekly counters successfully', async () => {
      const result = await controller.resetWeeklyCounters();

      expect(eligibilityService.resetWeeklyCounters).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        message: 'Weekly counters reset successfully',
      });
    });
  });

  describe('resetMonthlyCounters', () => {
    it('should reset monthly counters successfully', async () => {
      const result = await controller.resetMonthlyCounters();

      expect(eligibilityService.resetMonthlyCounters).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        message: 'Monthly counters reset successfully',
      });
    });
  });

  describe('healthCheck', () => {
    it('should return health status', async () => {
      const result = await controller.healthCheck();

      expect(result.status).toBe('healthy');
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });
});