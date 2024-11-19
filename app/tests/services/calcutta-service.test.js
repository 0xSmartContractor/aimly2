import { CalcuttaService } from '../../services/calcutta-service';

describe('CalcuttaService', () => {
  let service;

  beforeEach(() => {
    service = new CalcuttaService();
  });

  test('processBuyback calculates correct amounts', () => {
    const calcutta = service.createCalcutta('tournament1', {
      buybackRules: {
        singles: 0.5,
        doubles: 0.667
      }
    });

    const buybackData = {
      playerId: 'player1',
      format: 'singles',
      auctionAmount: 1000
    };

    const result = service.processBuyback(calcutta.id, buybackData);
    expect(result).toBe(true);
    
    const summary = service.getPlayerFinancialSummary(calcutta.id, 'player1');
    expect(summary.buybackAmount).toBe(500); // 50% of 1000
  });

  test('calculateFinalPrizes distributes winnings correctly', () => {
    const calcutta = service.createCalcutta('tournament1', {
      payoutStructure: {
        first: 70,
        second: 30
      }
    });

    // Add some auction results
    calcutta.auctionResults = [
      { playerId: 'player1', ownerId: 'owner1', amount: 1000 },
      { playerId: 'player2', ownerId: 'owner2', amount: 500 }
    ];

    const tournamentResults = {
      first: 'player1',
      second: 'player2'
    };

    const prizes = service.calculateFinalPrizes(calcutta.id, tournamentResults);
    expect(prizes.player1.calcuttaPrize.owner).toBe(1050); // 70% of 1500
    expect(prizes.player2.calcuttaPrize.owner).toBe(450); // 30% of 1500
  });
});