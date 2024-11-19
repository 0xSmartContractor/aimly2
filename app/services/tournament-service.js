import { Tournament } from '../models/tournament';
import { format } from 'date-fns';

export class TournamentService {
    constructor() {
        this.tournaments = new Map();
        this.bracketThemes = this.getDefaultThemes();
    }

    getDefaultThemes() {
        return {
            classic: {
                primary: '#4CAF50',
                secondary: '#2196F3',
                accent: '#FFC107',
                background: '#FFFFFF',
                text: '#000000'
            },
            dark: {
                primary: '#BB86FC',
                secondary: '#03DAC6',
                accent: '#CF6679',
                background: '#121212',
                text: '#FFFFFF'
            },
            retro: {
                primary: '#E91E63',
                secondary: '#9C27B0',
                accent: '#FF9800',
                background: '#F5F5F5',
                text: '#212121'
            },
            poolHall: {
                primary: '#1B5E20',
                secondary: '#006064',
                accent: '#FF6F00',
                background: '#263238',
                text: '#ECEFF1'
            }
        };
    }

    createTournament(data) {
        const tournament = new Tournament(data);
        tournament.id = Date.now().toString();
        this.tournaments.set(tournament.id, tournament);
        return tournament;
    }

    generateBracket(tournament) {
        const players = [...tournament.players];
        const matches = [];
        const rounds = Math.ceil(Math.log2(players.length));

        // Seed players based on ranking if available
        players.sort((a, b) => {
            if (tournament.handicapSystem) {
                return b.skillLevels[tournament.handicapSystem] - 
                       a.skillLevels[tournament.handicapSystem];
            }
            return b.ranking - a.ranking;
        });

        // Generate first round matches with scheduled times
        const matchDuration = 45; // minutes
        let currentTime = new Date(tournament.startDate);
        
        for (let i = 0; i < players.length; i += 2) {
            matches.push({
                id: `R1-M${i/2+1}`,
                round: 1,
                player1: players[i],
                player2: players[i + 1] || null,
                winner: null,
                score: null,
                scheduledTime: new Date(currentTime),
                table: null,
                referee: null,
                status: 'scheduled'
            });
            
            currentTime = new Date(currentTime.getTime() + matchDuration * 60000);
        }

        // Generate subsequent rounds
        let matchesInRound = Math.ceil(players.length / 2);
        for (let round = 2; round <= rounds; round++) {
            matchesInRound = Math.ceil(matchesInRound / 2);
            for (let i = 0; i < matchesInRound; i++) {
                matches.push({
                    id: `R${round}-M${i+1}`,
                    round: round,
                    player1: null,
                    player2: null,
                    winner: null,
                    score: null,
                    scheduledTime: null,
                    table: null,
                    referee: null,
                    status: 'pending'
                });
            }
        }

        tournament.bracketData = matches;
        this.tournaments.set(tournament.id, tournament);
        return matches;
    }

    assignTables(tournament, tables) {
        const availableTables = [...tables];
        tournament.bracketData.forEach(match => {
            if (match.status === 'scheduled' && !match.table) {
                const table = availableTables.shift();
                if (table) {
                    match.table = table;
                }
            }
        });
        return tournament;
    }

    assignReferees(tournament, referees) {
        const availableReferees = [...referees];
        tournament.bracketData.forEach(match => {
            if (match.status === 'scheduled' && !match.referee) {
                const referee = availableReferees.shift();
                if (referee) {
                    match.referee = referee;
                }
            }
        });
        return tournament;
    }

    updateMatch(tournamentId, matchId, result) {
        const tournament = this.tournaments.get(tournamentId);
        if (!tournament) return null;

        const matchIndex = tournament.bracketData.findIndex(m => m.id === matchId);
        if (matchIndex === -1) return null;

        // Update match result
        tournament.bracketData[matchIndex] = {
            ...tournament.bracketData[matchIndex],
            ...result,
            status: 'completed'
        };

        // Schedule next match
        const nextMatchId = this.getNextMatchId(matchId, tournament.bracketData);
        if (nextMatchId) {
            const nextMatch = tournament.bracketData.find(m => m.id === nextMatchId);
            if (nextMatch) {
                if (!nextMatch.player1) {
                    nextMatch.player1 = result.winner;
                } else {
                    nextMatch.player2 = result.winner;
                }

                // If both players are set, schedule the match
                if (nextMatch.player1 && nextMatch.player2) {
                    nextMatch.status = 'scheduled';
                    nextMatch.scheduledTime = this.calculateNextMatchTime(tournament);
                }
            }
        }

        if (this.isTournamentComplete(tournament)) {
            tournament.status = 'completed';
            tournament.winner = result.winner;
            tournament.completedDate = new Date();
        }

        this.tournaments.set(tournament.id, tournament);
        return tournament;
    }

    calculateNextMatchTime(tournament) {
        const lastScheduledMatch = tournament.bracketData
            .filter(m => m.scheduledTime)
            .sort((a, b) => b.scheduledTime - a.scheduledTime)[0];

        if (!lastScheduledMatch) return new Date();

        // Add 45 minutes to last scheduled match time
        return new Date(lastScheduledMatch.scheduledTime.getTime() + 45 * 60000);
    }

    getNextMatchId(currentMatchId, bracketData) {
        const [round, matchNum] = currentMatchId.split('-');
        const currentRound = parseInt(round.substring(1));
        const currentMatch = parseInt(matchNum.substring(1));
        
        const nextRound = currentRound + 1;
        const nextMatchNum = Math.ceil(currentMatch / 2);
        
        return `R${nextRound}-M${nextMatchNum}`;
    }

    generateShareableContent(tournamentId) {
        const tournament = this.tournaments.get(tournamentId);
        if (!tournament) return null;

        return tournament.getSocialShareContent();
    }

    getTournamentStats(tournamentId) {
        const tournament = this.tournaments.get(tournamentId);
        if (!tournament) return null;

        const completedMatches = tournament.bracketData.filter(m => m.status === 'completed');
        const totalMatches = tournament.bracketData.length;

        return {
            progress: (completedMatches.length / totalMatches) * 100,
            averageMatchDuration: this.calculateAverageMatchDuration(completedMatches),
            highestScore: this.findHighestScore(completedMatches),
            playerStats: this.calculatePlayerStats(tournament)
        };
    }

    calculateAverageMatchDuration(matches) {
        if (!matches.length) return 0;
        
        const durations = matches
            .filter(m => m.startTime && m.endTime)
            .map(m => m.endTime - m.startTime);
            
        return durations.reduce((sum, dur) => sum + dur, 0) / durations.length;
    }

    findHighestScore(matches) {
        return matches.reduce((highest, match) => {
            const maxScore = Math.max(match.score.player1, match.score.player2);
            return Math.max(highest, maxScore);
        }, 0);
    }

    calculatePlayerStats(tournament) {
        const stats = new Map();
        
        tournament.bracketData
            .filter(m => m.status === 'completed')
            .forEach(match => {
                const winner = match.winner;
                const loser = match.player1.id === winner.id ? match.player2 : match.player1;
                
                // Update winner stats
                const winnerStats = stats.get(winner.id) || { wins: 0, losses: 0, points: 0 };
                winnerStats.wins++;
                winnerStats.points += match.score[winner.id];
                stats.set(winner.id, winnerStats);
                
                // Update loser stats
                const loserStats = stats.get(loser.id) || { wins: 0, losses: 0, points: 0 };
                loserStats.losses++;
                loserStats.points += match.score[loser.id];
                stats.set(loser.id, loserStats);
            });
            
        return Array.from(stats.entries()).map(([playerId, playerStats]) => ({
            playerId,
            ...playerStats,
            winRate: (playerStats.wins / (playerStats.wins + playerStats.losses)) * 100
        }));
    }
}