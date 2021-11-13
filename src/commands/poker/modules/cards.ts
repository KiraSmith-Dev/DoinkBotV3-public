import random from 'random';
import { standardDeck, StandardPlayingCard } from 'card-dealer';
import { Dealer as _Dealer } from 'card-dealer'
import { Image, loadImage } from 'canvas';
import pathAlias from 'path-alias';

export { StandardPlayingCard };

export const { Hand } = require('pokersolver');

export class Dealer extends _Dealer<StandardPlayingCard> {
    /**
     * Instantiates a Dealer instance to play games
     */
    constructor() {
        super(standardDeck.slice());
    }
    
    // Overwrites parent class's shuffer(), this version uses better random
    /**
     * Randomizes the draw pile
     * @chainable
     */
    shuffle() {
        function shuffleDeck(deck: StandardPlayingCard[]) {
            for (let remaining = deck.length - 1; remaining > 0; remaining--) {
                const swap = random.integer(0, remaining);
                
                [deck[remaining], deck[swap]] = [(deck[swap] as StandardPlayingCard), (deck[remaining] as StandardPlayingCard)];
            }
            
            return deck;
        }
        
        (this as any)._drawPile = shuffleDeck((this as any)._deck.slice());
        return this;
    }
}

export function cardsToSolveFormat(cardArr: StandardPlayingCard[]) {
    // Input format: 
    // { suit: 'Hearts', rank: '4' }
    // { suit: 'Clubs', rank: 'queen' }
    // { suit: 'Diamonds', rank: '10' }
    // Target format:
    // 4h
    // Qc
    // 10d
    
    return cardArr.map(card => {
        // If rank name is 3 characters or longer, it's a named card (ex: ace, king) and we take the first letter
        // Otherwise, we can take the full rank. We can't always take the first character of the rank because of 10
        let cardIsNamed = card.rank.length >= 3;
        let rankInitial = card.rank[0]?.toUpperCase();
        let suitInitial = card.suit[0]?.toLowerCase();
        
        if (!rankInitial || !suitInitial)
            throw 'Was passed an invalid card object';
            
        let cardRank = cardIsNamed ? rankInitial : card.rank;
        return cardRank + suitInitial;
    });
}

let cardImages: {[key: string]: Image} = {};
export async function getImage(name: string) {
    let img = cardImages[name];
    
    if (img)
        return img;
    
    cardImages[name] = await loadImage(pathAlias.resolve(`$resources/cards/${name}.png`));
    
    return cardImages[name];
}
