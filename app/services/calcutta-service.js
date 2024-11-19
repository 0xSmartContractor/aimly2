import { Calcutta } from '../models/calcutta';

export class CalcuttaService {
    constructor() {
        this.calcuttas = new Map();
    }

    createCalcutta(tournamentId, settings) {
        const calcutta = new Calcutta({
            tournamentId,
            settings,
            status: 'pending'
        });
        
        this.calcuttas.set(calcutta.id, calcutta);
        return calcutta;
    }

    processBuyback(calcuttaId, buybackData) {
        const calcutta = this.calcuttas.get(calcuttaId);
        if (!calcutta) return false;

        const success = calcutta.addBuyback({
            ...buybackData,
            timestamp: new Date()
        });

        if (success) {
            this.calcuttas.set(calcuttaId, calcutta);
        }

        return success;
    }

    calculateFinalPrizes(calcuttaId, tournamentResults) {
        const calcutta = this.calcuttas.get(calcuttaId);
        if (!calcutta) return null;

        return calcutta.calculateFinalPrizes(tournamentResults);
    }

    getPlayerFinancialSummary(calcuttaId, playerId) {
        const calcutta = this.calcuttas.get(calcuttaId);
        if (!calcutta) return null;

        const summary = calcutta.getPlayerSummary(playerId);
        const prizes = calcutta.calculateFinalPrizes();

        let totalWinnings = 0;
        let totalInvestment = summary.buybackAmount;

        // Add winnings from owned players
        summary.ownedPlayers.forEach(owned => {
            const playerPrize = prizes[owned.playerId];
            if (playerPrize) {
                totalWinnings += playerPrize.calcuttaPrize.owner;
            }
            totalInvestment += owned.amount;
        });

        // Add player's own prize money
        const playerPrize = prizes[playerId];
        if (playerPrize) {
            totalWinnings += playerPrize.calcuttaPrize.player;
        }

        return {
            ...summary,
            totalWinnings,
            totalInvestment,
            netProfit: totalWinnings - totalInvestment
        };
    }

    // ... (previous methods remain the same)

    getDetailedPayoutReport(calcuttaId, tournamentResults) {
        const calcutta = this.calcuttas.get(calcuttaId);
        if (!calcutta) return null;

        const prizes = calcutta.calculateFinalPrizes(tournamentResults);
        const payouts = [];

        Object.entries(prizes).forEach(([position, prize]) => {
            // Tournament prize payout
            payouts.push({
                recipient: prize.playerId,
                amount: prize.tournamentPrize,
                type: 'tournament',
                position,
                description: `Tournament ${position} place prize`
            });

            // Calcutta prize payouts
            if (prize.calcuttaPrize.player > 0) {
                payouts.push({
                    recipient: prize.playerId,
                    amount: prize.calcuttaPrize.player,
                    type: 'calcutta_player',
                    position,
                    description: `Calcutta ${position} place prize (${prize.buybackPercentage * 100}% buyback)`
                });
            }

            if (prize.calcuttaPrize.owner > 0) {
                payouts.push({
                    recipient: prize.ownerId,
                    amount: prize.calcuttaPrize.owner,
                    type: 'calcutta_owner',
                    position,
                    description: `Calcutta ${position} place prize (owner's share)`
                });
            }
        });

        return payouts;
    }
}</content>