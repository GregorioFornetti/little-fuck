
import { shuffle } from "../../functions/shuffle";


describe('shuffle', () => {
    it('Deve retornar um array de mesmo tamanho', () => {
        const array = [1, 2, 3, 4, 5];
        const result = shuffle(array);
        expect(result.length).toBe(array.length);
    });

    it('Deve retornar um array com os mesmos elementos do original', () => {
        const array = [1, 2, 3, 4, 5];
        const result = shuffle(array);
        expect(result.sort()).toEqual(array.sort());
    });

    it('Não deve modificar o array original', () => {
        const array = [1, 2, 3, 4, 5];
        const arrayCopy = array.slice();
        shuffle(array);
        expect(array).toEqual(arrayCopy);
    });

    it('Deve retornar um array embaralhado', () => {
        const array = [1, 2, 3, 4, 5];
        const results = new Set();
        for (let i = 0; i < 100; i++) {  // Realizar múltiplos embaralhamentos, para ter maior confiança
            results.add(shuffle(array).join(','));
        }
        expect(results.size).toBeGreaterThan(1);
    });
});