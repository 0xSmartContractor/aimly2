import { ShotAnalysisService } from '../../services/shot-analysis-service';

describe('ShotAnalysisService', () => {
  let service;

  beforeEach(() => {
    service = new ShotAnalysisService();
  });

  test('calculateConsistencyScore returns value between 0 and 100', () => {
    const tempoData = {
      backswingDuration: 1000,
      pauseDuration: 500,
      forwardStrokeDuration: 500,
      followThroughDuration: 750
    };

    const score = service.calculateConsistencyScore(tempoData);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('determinePhase correctly identifies stroke phases', () => {
    const movement = 0.1;
    const prevMovement = 0.05;

    expect(service.determinePhase(0, 0, 'setup')).toBe('setup');
    expect(service.determinePhase(0.2, 0.1, 'setup')).toBe('backswing');
    expect(service.determinePhase(0.01, 0.2, 'backswing')).toBe('pause');
    expect(service.determinePhase(0.3, 0.01, 'pause')).toBe('forward_stroke');
  });

  test('analyzeStrokeTempo returns valid tempo metrics', () => {
    const frames = [
      { timestamp: 0, pose: { keypoints: [] } },
      { timestamp: 500, pose: { keypoints: [] } },
      { timestamp: 1000, pose: { keypoints: [] } }
    ];

    const analysis = service.analyzeStrokeTempo(frames);
    expect(analysis).toHaveProperty('phases');
    expect(analysis).toHaveProperty('metrics');
    expect(analysis).toHaveProperty('feedback');
  });
});