
import { selectRandomIndex } from '../../functions/selectRandomIndex';

describe('selectRandomIndex', () => {
  it('Deve retornar um índice válido', () => {
    const array = [1, 2, 3, 4, 5];
    const index = selectRandomIndex(array);
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(array.length);
  });

  it('Deve lançar um erro caso o array seja vazio', () => {
    const array: number[] = [];
    expect(() => selectRandomIndex(array)).toThrow('Cannot select a random index from an empty array');
  });

  it('Deve retornar índices diferentes quando chamado várias vezes', () => {
    const array = [1, 2, 3, 4, 5];
    const indices = new Set<number>();
    for (let i = 0; i < 100; i++) {
      indices.add(selectRandomIndex(array));
    }
    // Since there are 5 possible indices, we expect to see multiple unique indices in 100 calls
    expect(indices.size).toBeGreaterThan(1);
  });

  it('Deve gerar índices em uma distribuição uniforme', () => {
    const array = [1, 2, 3, 4, 5];
    const indexCounts = [0, 0, 0, 0, 0];
    const numberOfCalls = 10000;

    for (let i = 0; i < numberOfCalls; i++) {
      const index = selectRandomIndex(array);
      indexCounts[index]++;
    }

    const averageCount = numberOfCalls / array.length;
    const tolerance = 0.1 * averageCount;
    for (const count of indexCounts) {
      expect(count).toBeGreaterThanOrEqual(averageCount - tolerance);
      expect(count).toBeLessThanOrEqual(averageCount + tolerance);
    }
  });
});
