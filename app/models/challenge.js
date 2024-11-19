export class Challenge {
    constructor(data = {}) {
        this.id = data.id || '';
        this.challengerId = data.challengerId || '';
        this.challengerName = data.challengerName || '';
        this.challengerPhoto = data.challengerPhoto || '';
        this.challengeeId = data.challengeeId || '';
        this.challengeeName = data.challengeeName || '';
        this.challengeePhoto = data.challengeePhoto || '';
        this.status = data.status || 'pending'; // pending, accepted, declined, completed
        this.type = data.type || 'singles'; // singles, doubles, team
        this.gameType = data.gameType || '8ball'; // 8ball, 9ball, straight
        this.raceType = data.raceType || 'standard'; // standard, handicap
        this.race = {
            challenger: data.race?.challenger || 5,
            challengee: data.race?.challengee || 5
        };
        
        // Money management
        this.moneyMatch = {
            enabled: data.moneyMatch?.enabled || false,
            amount: data.moneyMatch?.amount || 0,
            sideBets: data.moneyMatch?.sideBets || [], // Additional bets during match
            settled: data.moneyMatch?.settled || false,
            settledTimestamp: data.moneyMatch?.settledTimestamp || null,
            settledBy: data.moneyMatch?.settledBy || null // Player who confirmed settlement
        };

        this.createdAt = data.createdAt || new Date();
        this.scheduledFor = data.scheduledFor || null;
        this.result = data.result || null;
        this.notes = data.notes || '';
    }

    addSideBet(bet) {
        if (!this.moneyMatch.enabled) return false;
        
        this.moneyMatch.sideBets.push({
            ...bet,
            timestamp: new Date(),
            settled: false
        });
        return true;
    }

    calculateTotalStake() {
        if (!this.moneyMatch.enabled) return 0;
        
        const mainStake = this.moneyMatch.amount;
        const sideBetsTotal = this.moneyMatch.sideBets.reduce((total, bet) => total + bet.amount, 0);
        
        return mainStake + sideBetsTotal;
    }

    settleMatch(settlerId) {
        if (!this.moneyMatch.enabled || this.moneyMatch.settled) return false;
        
        this.moneyMatch.settled = true;
        this.moneyMatch.settledTimestamp = new Date();
        this.moneyMatch.settledBy = settlerId;
        return true;
    }

    getMoneyMatchSummary() {
        if (!this.moneyMatch.enabled) return null;

        return {
            mainStake: this.moneyMatch.amount,
            sideBets: this.moneyMatch.sideBets,
            totalStake: this.calculateTotalStake(),
            settled: this.moneyMatch.settled,
            settledTimestamp: this.moneyMatch.settledTimestamp,
            settledBy: this.moneyMatch.settledBy
        };
    }
}