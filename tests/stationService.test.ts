import { stationService } from '../src/services/stationService';

test('suggest finds Leipzig when querying Leip', () => {
  const results = stationService.suggest('Leip', 5);
  expect(results.some(r => r.name.includes('Leipzig'))).toBe(true);
});
