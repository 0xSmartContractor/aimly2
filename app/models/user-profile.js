export class UserProfile {
  constructor(data = {}) {
    this.id = data.id || '';
    this.displayName = data.displayName || '';
    this.bio = data.bio || '';
    this.photoUrl = data.photoUrl || '';
    this.skillLevels = {
      apa: data.skillLevels?.apa || 0,
      bca: data.skillLevels?.bca || 0,
      tap: data.skillLevels?.tap || 0
    };
    this.stats = {
      wins: data.stats?.wins || 0,
      losses: data.stats?.losses || 0,
      challengesCompleted: data.stats?.challengesCompleted || 0
    };
  }
}