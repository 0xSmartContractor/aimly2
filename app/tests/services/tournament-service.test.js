import { TournamentService } from '../../services/tournament-service';

describe('TournamentService', () => {
  let service;

  beforeEach(() => {
    service = new TournamentService();
  });

  test('createTournament generates valid tournament object', () => {
    const tournamentData = {
      name: 'Test Tournament',
      format: 'singles',
      maxPlayers: 32,
      entryFee: 20
    };

    const tournament = service.createTournament(tournamentData);
    expect(tournament.id).toBeDefined();
    expect(tournament.name).toBe(tournamentData.name);
    expect(tournament.format).toBe(tournamentData.format);
  });

  test('generateBracket creates correct number of matches', () => {
    const tournament = service.createTournament({
      name: 'Test Tournament',
      players: Array(16).fill({ id: 1, name: 'Player' })
    });

    const bracket = service.generateBracket(tournament);
    expect(bracket.length).toBe(15); // 16 players = 15 matches
  });

  test('calculatePrizeDistribution handles percentages correctly', () => {
    const tournament = service.createTournament({
      entryFee: 100,
      players: Array(8).fill({ id: 1 }),
      moneyManagement: {
        housePercentage: 10,
        directorPercentage: 5,
        payoutStructure: {
          first: 60,
          second: 30,
          third: 10
        }
      }
    });

    const distribution = service.calculatePrizeDistribution(tournament);
    expect(distribution.total).toBe(800); // 8 players * $100
    expect(distribution.house.amount).toBe(80); // 10% of 800
    expect(distribution.director.amount).toBe(40); // 5% of 800
  });
});