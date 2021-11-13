import { Dealer, cardsToSolveFormat, Hand } from './cards';
import { Type, Exclude } from 'class-transformer';
import { PokerRoundPlayer } from './pokerTypes';

type SolvedHand = {
    ownerID: string;
    descr: string;
    folded: boolean;
}

class PokerCardPlayer {
    id: string;
    @Exclude()
    roundPlayer: PokerRoundPlayer;
    cards: string[] = [];

    constructor(roundPlayer: PokerRoundPlayer | undefined) {
        if (!roundPlayer) {
            this.roundPlayer = new PokerRoundPlayer(undefined);
            this.id = '0';
            return;
        }
        
        this.roundPlayer = roundPlayer;
        this.id = this.roundPlayer.id;
    }
}

type RoundWinner = {
    hand: PokerCardPlayer;
    description: string;
}

export class PokerCardRound {
    @Type(() => Dealer)
    dealer: Dealer = new Dealer().shuffle();
    
    @Type(() => PokerCardPlayer)
    cardPlayers: PokerCardPlayer[];
    communityCards: string[] = [];
    
    currentStep: number = 0;
    finished: boolean = false;
    
    constructor(players: PokerRoundPlayer[] | undefined) {
        if (!players) {
            this.cardPlayers = [];
            return;
        }
        
        this.cardPlayers = players.map(player => new PokerCardPlayer(player));
        this.advanceStep();
    }
    
    getHand(ownerID: string): PokerCardPlayer {
        let hand = this.cardPlayers.find(cardPlayer => cardPlayer.id == ownerID);
        
        if (!hand)
            throw `PlayerID not in poker card round: ${ownerID}`;
        
        return hand;
    }
    
    advanceStep(): void {
        if (this.finished)
            throw 'Tried to advance poker card round after it was over';
        
        const holdemSteps = [
            () => {
                // Draw hands
                for (let i = 0; i < this.cardPlayers.length; i++)
                    this.cardPlayers[i]?.cards.push(...cardsToSolveFormat(this.dealer.draw(2)));
            },
            () => {
                this.communityCards.push(...cardsToSolveFormat(this.dealer.draw(3)));
            },
            () => {
                this.communityCards.push(...cardsToSolveFormat(this.dealer.draw(1)));
            },
            () => {
                this.communityCards.push(...cardsToSolveFormat(this.dealer.draw(1)));
            }
        ]
        
        const step = holdemSteps[this.currentStep++];
        
        if (!step)
            throw 'Step missing from poker card round'; // Should only be a type guard, in the current state should never happen at runtime
        
        step();
        
        if (this.currentStep >= holdemSteps.length)
            this.finished = true;
    }
    
    advanceToEnd(): void {
        while (!this.finished)
            this.advanceStep();
    }
    
    determineWinners(fromIDs: string[] | null = null): RoundWinner[] {
        if (!this.finished)
            throw 'Tried to determine winner of poker card round before it was over';
        
        // Filter down to just included players, map hands to solved hands
        let solvedHands: SolvedHand[] = this.cardPlayers.filter(hand => !fromIDs || fromIDs.includes(hand.id)).map(hand => {
            //hand.cards.push(...this.communityCards);
            
            let solvedHand = Hand.solve(hand.cards.concat(this.communityCards));
            // Passing if the hand was folded to the solved object, so that we can filter them out before deciding winner
            solvedHand.folded = hand.roundPlayer.folded;
            // and the ID to find the original hand later
            solvedHand.ownerID = hand.id;
            
            return solvedHand;
        });
        
        let winningHands: SolvedHand[] = Hand.winners(solvedHands.filter(hand => !hand.folded));
        
        let winners: RoundWinner[] = [];
        
        for (let i = 0; i < winningHands.length; i++) {
            const winningHand = winningHands[i];
            if (!winningHand)
                continue;
            
            winners.push({ hand: this.getHand(winningHand.ownerID), description: winningHand.descr });
        }
        
        return winners;
    }
}
