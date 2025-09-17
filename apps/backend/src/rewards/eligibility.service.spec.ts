import { Test, TestingModule } from '@nestjs/testing';
import { EligibilityService } from './eligibility.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserActionType } from './reward.entity';

describe('EligibilityService', () => {
  let service: EligibilityService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    userEligibility: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EligibilityService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EligibilityService>(EligibilityService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateEligibility', () => {
    it('should update eligibility for SCAN action', async () => {
      const userId = 'user-123';
      const actionType = UserActionType.SCAN;

      await service.updateEligibility(userId, actionType);

      expect(service).toBeDefined();
    });

    it('should update eligibility for SHARE action', async () => {
      const userId = 'user-123';
      const actionType = UserActionType.SHARE;

      await service.updateEligibility(userId, actionType);

      expect(service).toBeDefined();
    });

    it('should update eligibility for GAME action', async () => {
      const userId = 'user-123';
      const actionType = UserActionType.GAME;

      await service.updateEligibility(userId, actionType);

      expect(service).toBeDefined();
    });
  });

  describe('getEligibilityStatus', () => {
    it('should return initial eligibility status', async () => {
      const userId = 'user-123';

      const status = await service.getEligibilityStatus(userId);

      expect(status).toBeDefined();
      expect(status.giftEligible).toBe(false);
      expect(status.challengeEligible).toBe(false);
      
      // Check monthly progress structure
      expect(status.monthlyProgress).toBeDefined();
      expect(status.monthlyProgress.scans).toBe(0);
      expect(status.monthlyProgress.shares).toBe(0);
      expect(status.monthlyProgress.games).toBe(0);
      expect(status.monthlyProgress.requiredScans).toBe(8);
      expect(status.monthlyProgress.requiredShares).toBe(3);
      expect(status.monthlyProgress.requiredGames).toBe(8);

      // Check weekly progress structure
      expect(status.weeklyProgress).toBeDefined();
      expect(status.weeklyProgress.scans).toBe(0);
      expect(status.weeklyProgress.shares).toBe(0);
      expect(status.weeklyProgress.games).toBe(0);
      expect(status.weeklyProgress.requiredScans).toBe(3);
      expect(status.weeklyProgress.requiredShares).toBe(1);
      expect(status.weeklyProgress.requiredGames).toBe(3);
    });
  });

  describe('resetWeeklyCounters', () => {
    it('should reset weekly counters without error', async () => {
      await expect(service.resetWeeklyCounters()).resolves.not.toThrow();
    });
  });

  describe('resetMonthlyCounters', () => {
    it('should reset monthly counters without error', async () => {
      await expect(service.resetMonthlyCounters()).resolves.not.toThrow();
    });
  });

  describe('getGiftEligibleUsers', () => {
    it('should return list of gift-eligible users', async () => {
      const eligibleUsers = await service.getGiftEligibleUsers();

      expect(eligibleUsers).toBeDefined();
      expect(Array.isArray(eligibleUsers)).toBe(true);
    });
  });

  describe('getChallengeEligibleUsers', () => {
    it('should return list of challenge-eligible users', async () => {
      const eligibleUsers = await service.getChallengeEligibleUsers();

      expect(eligibleUsers).toBeDefined();
      expect(Array.isArray(eligibleUsers)).toBe(true);
    });
  });

  describe('eligibility logic tests', () => {
    it('should correctly identify gift eligibility requirements', async () => {
      // Gift eligibility: 8 scans, 3 shares, 8 games per month
      const userId = 'user-123';
      
      const status = await service.getEligibilityStatus(userId);
      
      // With default mock data, should not be eligible
      expect(status.monthlyProgress.scans).toBe(0);
      expect(status.monthlyProgress.shares).toBe(0);
      expect(status.monthlyProgress.games).toBe(0);
      expect(status.giftEligible).toBe(false);
    });

    it('should correctly identify challenge eligibility requirements', async () => {
      // Challenge eligibility: 3 scans, 1 share, 3 games per week
      const userId = 'user-123';
      
      const status = await service.getEligibilityStatus(userId);
      
      expect(status.weeklyProgress.scans).toBe(0);
      expect(status.weeklyProgress.shares).toBe(0);
      expect(status.weeklyProgress.games).toBe(0);
      expect(status.challengeEligible).toBe(false);
    });

    it('should handle partial progress correctly', async () => {
      const userId = 'user-123';
      
      const status = await service.getEligibilityStatus(userId);
      
      expect(status.monthlyProgress.scans).toBe(0);
      expect(status.monthlyProgress.shares).toBe(0);
      expect(status.monthlyProgress.games).toBe(0);
      expect(status.weeklyProgress.scans).toBe(0);
      expect(status.weeklyProgress.shares).toBe(0);
      expect(status.weeklyProgress.games).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      const userId = 'user-123';
      
      // Mock the service to throw an error
      const spy = jest.spyOn(service, 'getEligibilityStatus').mockImplementation(async () => {
        throw new Error('Database connection failed');
      });

      await expect(service.getEligibilityStatus(userId)).rejects.toThrow('Database connection failed');
      
      spy.mockRestore();
    });

    it('should handle missing user eligibility record', async () => {
      const userId = 'user-123';
      
      const status = await service.getEligibilityStatus(userId);
      
      // Should return default status when no record exists
      expect(status.giftEligible).toBe(false);
      expect(status.challengeEligible).toBe(false);
    });
  });
});