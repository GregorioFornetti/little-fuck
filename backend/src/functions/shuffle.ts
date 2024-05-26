
/**
 *  Retorna um array com os elementos embaralhados. É uma cópia rasa do array original (ou seja, os elementos são os mesmos).
 * 
 *  @param array o array a ser embaralhado
 *  @returns o array embaralhado (mesmos elementos, ordem aleatória)
 */
export function shuffle<T>(array: T[]): T[] {
    let shuffledArray = array.slice();
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
}