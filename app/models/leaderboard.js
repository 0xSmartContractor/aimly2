export class LeaderboardEntry {
  constructor(data = {}) {
    this.userId = data.userId || '';
    this.displayName = data.displayName || '';
    this.photoUrl = data.photoUrl || '';
    this.skillLevels = {
      apa: data.skillLevels?.apa || 0,
      bca: data.skillLevels?.bca || 0,
      tap: data.skillLevels?.tap || 0
    };
    this.stats = {
      wins: data.stats?.wins || 0,
      losses: data.stats?.losses || 0,
      winRate: data.stats?.wins ? (data.stats.wins / (data.stats.wins + data.stats.losses) * 100).toFixed(1) : '0.0'
    };
  }
}