import { Challenge } from '../models/challenge';
import { format } from 'date-fns';

export class ChallengeService {
  constructor() {
    this.challenges = new Map();
  }

  createChallenge(data) {
    const challenge = new Challenge({
      ...data,
      id: Date.now().toString(),
      createdAt: new Date()
    });
    this.challenges.set(challenge.id, challenge);
    return challenge;
  }

  getChallenges(userId) {
    return Array.from(this.challenges.values()).filter(challenge => 
      challenge.challengerId === userId || challenge.challengeeId === userId
    );
  }

  getPendingChallenges(userId) {
    return this.getChallenges(userId).filter(challenge => 
      challenge.status === 'pending'
    );
  }

  updateChallengeStatus(challengeId, status, result = null) {
    const challenge = this.challenges.get(challengeId);
    if (challenge) {
      challenge.status = status;
      if (result) {
        challenge.result = result;
      }
      this.challenges.set(challengeId, challenge);
    }
    return challenge;
  }

  formatChallengeDate(date) {
    return format(date, 'MMM d, yyyy h:mm a');
  }
}