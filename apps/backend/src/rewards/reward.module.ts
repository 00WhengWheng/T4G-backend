import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RewardService } from './reward.service';
import { EligibilityService } from './eligibility.service';
import { LeaderboardService } from './leaderboard.service';
import { RewardController } from './reward.controller';

@Module({
  imports: [PrismaModule],
  controllers: [RewardController],
  providers: [
    RewardService,
    EligibilityService,
    LeaderboardService,
  ],
  exports: [
    RewardService,
    EligibilityService,
    LeaderboardService,
  ],
})
export class RewardModule {}