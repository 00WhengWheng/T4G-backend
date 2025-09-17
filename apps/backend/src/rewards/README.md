# Reward Service Documentation

## Overview

The Reward Service is a comprehensive system designed to track user actions, award coins, and manage eligibility for gifts and challenges. It includes real-time scoring, leaderboard management, and automatic eligibility tracking.

## Features

### 🎯 Core Functionality

- **Action Tracking**: Log user actions (scans, shares, games) with metadata
- **Coin System**: Automatic coin distribution (1 coin per qualifying action)
- **Eligibility Management**: Track progress toward gift and challenge eligibility
- **Leaderboard System**: Real-time scoring and ranking of users
- **Progress Monitoring**: Detailed progress tracking with notifications

### 📊 Eligibility Requirements

#### Gift Eligibility (Monthly)
- **8 scans** per month
- **3 shares** per month  
- **8 games** per month

#### Challenge Participation (Weekly)
- **3 scans** per week
- **1 share** per week
- **3 games** per week

## API Endpoints

### 🎮 Action Logging

#### POST `/api/rewards/actions`
Log a user action and award coins.

**Request Body:**
```json
{
  "userId": "user-123",
  "type": "SCAN|SHARE|GAME",
  "metadata": {
    "qrCode": "test-qr",
    "platform": "facebook",
    "gameId": "puzzle-1",
    "score": 1500
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Action SCAN logged successfully",
  "coinsAwarded": 1
}
```

### 👤 User Information

#### GET `/api/rewards/users/:userId/summary`
Get comprehensive user reward summary.

**Response:**
```json
{
  "userId": "user-123",
  "totalCoins": 150,
  "totalScore": 200,
  "position": 5,
  "eligibilityStatus": {
    "giftEligible": true,
    "challengeEligible": false,
    "monthlyProgress": {
      "scans": 8,
      "shares": 3,
      "games": 8,
      "requiredScans": 8,
      "requiredShares": 3,
      "requiredGames": 8
    },
    "weeklyProgress": {
      "scans": 2,
      "shares": 0,
      "games": 1,
      "requiredScans": 3,
      "requiredShares": 1,
      "requiredGames": 3
    }
  },
  "recentActions": []
}
```

#### GET `/api/rewards/users/:userId/eligibility`
Get user's current eligibility status.

#### GET `/api/rewards/users/:userId/score`
Get user's score and leaderboard position.

**Response:**
```json
{
  "totalScore": 250,
  "position": 3
}
```

### 🏆 Leaderboard

#### GET `/api/rewards/leaderboard`
Get global leaderboard.

**Query Parameters:**
- `limit` (1-100): Number of results (default: 10)
- `offset` (≥0): Pagination offset (default: 0)

#### GET `/api/rewards/leaderboard/users/:userId/context`
Get leaderboard around a specific user.

**Query Parameters:**
- `range` (1-20): Number of users above/below (default: 5)

#### GET `/api/rewards/leaderboard/actions/:actionType`
Get top performers by action type (SCAN, SHARE, GAME).

**Query Parameters:**
- `limit` (1-50): Number of results (default: 10)

#### GET `/api/rewards/leaderboard/stats`
Get leaderboard statistics.

**Response:**
```json
{
  "totalUsers": 100,
  "averageScore": 125.5,
  "topScore": 500
}
```

### 🎁 Eligibility Management

#### GET `/api/rewards/eligibility/gifts`
Get users eligible for gifts.

**Response:**
```json
{
  "eligibleUsers": ["user-1", "user-2", "user-3"],
  "count": 3
}
```

#### GET `/api/rewards/eligibility/challenges`
Get users eligible for challenges.

### 🔧 Admin Endpoints

#### POST `/api/rewards/admin/reset/weekly`
Reset weekly counters for all users.

#### POST `/api/rewards/admin/reset/monthly`
Reset monthly counters for all users.

### 🏥 Health Check

#### GET `/api/rewards/health`
Check service health status.

## Database Schema

### UserAction
Tracks individual user actions.
```sql
- id: string (CUID)
- userId: string
- type: SCAN|SHARE|GAME
- createdAt: DateTime
- metadata: JSON
```

### UserCoinBalance
Stores user coin balances.
```sql
- id: string (CUID)
- userId: string (unique)
- totalCoins: int
- lastUpdated: DateTime
```

### UserEligibility
Tracks eligibility progress.
```sql
- id: string (CUID)
- userId: string (unique)
- giftEligible: boolean
- challengeEligible: boolean
- monthlyScans/Shares/Games: int
- weeklyScans/Shares/Games: int
- lastResetMonth/Week: DateTime
- lastGiftEligibility/ChallengeEligibility: DateTime
```

### Leaderboard
Maintains user rankings.
```sql
- id: string (CUID)
- userId: string (unique)
- totalScore: int
- position: int
- lastUpdated: DateTime
```

## Services Architecture

### RewardService
Core service handling action logging and coin distribution.

**Key Methods:**
- `logUserAction(actionDto)`: Log action and award coins
- `getUserRewardSummary(userId)`: Get user summary
- `calculateEligibilityStatus(userId)`: Calculate eligibility

### EligibilityService
Manages eligibility tracking and requirements.

**Key Methods:**
- `updateEligibility(userId, actionType)`: Update user progress
- `getEligibilityStatus(userId)`: Get current status
- `resetWeeklyCounters()`: Reset weekly progress
- `resetMonthlyCounters()`: Reset monthly progress

### LeaderboardService
Handles scoring and ranking calculations.

**Key Methods:**
- `updateUserScore(userId)`: Update score and position
- `getLeaderboard(limit, offset)`: Get rankings
- `getUserPosition(userId)`: Get user position
- `getLeaderboardAroundUser(userId, range)`: Get context

## Usage Examples

### Log a Scan Action
```typescript
const actionDto = {
  userId: 'user-123',
  type: UserActionType.SCAN,
  metadata: { qrCode: 'product-abc-123' }
};

await rewardService.logUserAction(actionDto);
```

### Check User Eligibility
```typescript
const eligibility = await eligibilityService.getEligibilityStatus('user-123');

if (eligibility.giftEligible) {
  // User is eligible for gifts
  console.log('User can claim a gift!');
}

if (eligibility.challengeEligible) {
  // User can participate in challenges
  console.log('User can join a challenge!');
}
```

### Get User's Leaderboard Position
```typescript
const score = await leaderboardService.getUserScore('user-123');
console.log(`User score: ${score.totalScore}, Position: ${score.position}`);
```

## Error Handling

The service includes comprehensive error handling:

- **Validation Errors**: Invalid input data
- **Not Found Errors**: Non-existent users
- **Database Errors**: Connection and query failures
- **Business Logic Errors**: Eligibility calculation issues

## Testing

The service includes comprehensive tests covering:

- ✅ Action logging functionality
- ✅ Coin distribution accuracy
- ✅ Eligibility calculations
- ✅ Leaderboard operations
- ✅ Error scenarios
- ✅ Edge cases

Run tests:
```bash
npm run test -- --testPathPattern=rewards
```

## Integration

### With Existing Services

The reward service integrates seamlessly with:

- **User Service**: User validation and profile data
- **Prisma Service**: Database operations
- **Health Service**: System monitoring

### Event-Driven Updates

Future enhancements could include:

- Real-time notifications for eligibility changes
- Webhook integrations for external systems
- Scheduled tasks for counter resets
- Analytics and reporting

## Production Deployment

### Environment Variables

```bash
DATABASE_URL=postgresql://...
```

### Database Migrations

```bash
npm run db:migrate
npm run db:deploy
```

### Monitoring

The service provides health check endpoints and comprehensive logging for production monitoring.

## Future Enhancements

1. **Real-time Notifications**: WebSocket support for live updates
2. **Advanced Analytics**: Detailed reporting and insights
3. **Customizable Rules**: Configurable eligibility requirements
4. **Bonus Multipliers**: Special events and promotions
5. **Social Features**: Team challenges and competitions
6. **Mobile Push Notifications**: Achievement alerts
7. **Audit Trails**: Complete action history tracking