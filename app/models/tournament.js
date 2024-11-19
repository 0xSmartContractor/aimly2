export class Tournament {
    constructor(data = {}) {
        // ... (previous properties remain)
        
        // Enhanced money management
        this.moneyManagement = {
            entryFee: data.moneyManagement?.entryFee || 0,
            totalPrizePool: data.moneyManagement?.totalPrizePool || 0,
            housePercentage: data.moneyManagement?.housePercentage || 0, // Percentage for pool hall
            directorPercentage: data.moneyManagement?.directorPercentage || 0, // Percentage for director
            payoutStructure: data.moneyManagement?.payoutStructure || {
                first: 50,
                second: 30,
                third: 20
            },
            addedMoney: data.moneyManagement?.addedMoney || 0, // Sponsorship or added money
            greensFees: data.moneyManagement?.greensFees || 0, // Table fees if applicable
            payoutPositions: data.moneyManagement?.payoutPositions || 3
        };

        // Director controls
        this.directorControls = {
            directorId: data.directorControls?.directorId || '',
            coDirectors: data.directorControls?.coDirectors || [],
            canEditRules: data.directorControls?.canEditRules !== false,
            canModifyBracket: data.directorControls?.canModifyBracket !== false,
            canOverridePrizes: data.directorControls?.canOverridePrizes !== false,
            canManageDisputes: data.directorControls?.canManageDisputes !== false
        };

        // Money tracking
        this.moneyTracking = {
            entriesCollected: new Map(), // Map of playerIds to entry fee status
            prizesDistributed: new Map(), // Map of playerIds to prizes paid
            houseFeePaid: false,
            directorFeePaid: false,
            totalCollected: 0,
            totalDistributed: 0
        };
    }

    calculatePrizeDistribution() {
        const totalPool = this.calculateTotalPrizePool();
        const houseAmount = (totalPool * this.moneyManagement.housePercentage) / 100;
        const directorAmount = (totalPool * this.moneyManagement.directorPercentage) / 100;
        const playerPool = totalPool - houseAmount - directorAmount;

        return {
            total: totalPool,
            house: {
                percentage: this.moneyManagement.housePercentage,
                amount: houseAmount
            },
            director: {
                percentage: this.moneyManagement.directorPercentage,
                amount: directorAmount
            },
            players: {
                total: playerPool,
                positions: this.calculatePlayerPrizes(playerPool)
            }
        };
    }

    calculateTotalPrizePool() {
        return (this.moneyManagement.entryFee * this.players.length) +
               this.moneyManagement.addedMoney;
    }

    calculatePlayerPrizes(playerPool) {
        const prizes = {};
        Object.entries(this.moneyManagement.payoutStructure).forEach(([position, percentage]) => {
            prizes[position] = (playerPool * percentage) / 100;
        });
        return prizes;
    }

    recordEntryFee(playerId, amount) {
        this.moneyTracking.entriesCollected.set(playerId, {
            amount,
            timestamp: new Date(),
            collected: true
        });
        this.moneyTracking.totalCollected += amount;
    }

    recordPrizePayout(playerId, amount, position) {
        this.moneyTracking.prizesDistributed.set(playerId, {
            amount,
            position,
            timestamp: new Date(),
            paid: true
        });
        this.moneyTracking.totalDistributed += amount;
    }

    getFinancialSummary() {
        const distribution = this.calculatePrizeDistribution();
        return {
            ...distribution,
            tracking: {
                collected: this.moneyTracking.totalCollected,
                distributed: this.moneyTracking.totalDistributed,
                remaining: this.moneyTracking.totalCollected - this.moneyTracking.totalDistributed,
                entriesCollected: Array.from(this.moneyTracking.entriesCollected.entries()),
                prizesPaid: Array.from(this.moneyTracking.prizesDistributed.entries())
            }
        };
    }
}