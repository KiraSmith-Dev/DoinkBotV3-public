import { PokerBettingRound } from './pokerBettingRound';
import { PokerCardRound, SolvedHand } from './pokerCardRound';
import { Type, Exclude } from 'class-transformer';
import { PokerGamePlayer, PokerGameType, PokerRoundPlayer } from './pokerTypes';
import { PokerGame } from './pokerGame';
import { rotate } from '$modules/arrayUtil';
import { random } from '$modules/random';
import { InteractionUpdateOptions, MessageActionRow, MessageButton, MessageSelectMenu } from 'discord.js';
import generateHandImage from './generateHandImage';
import { Hand } from './cards';
import { genCoinLabel } from '$modules/genCoinLabel';

export class PokerRound {
    @Type(() => PokerCardRound)
    cardRound: PokerCardRound;
    @Type(() => PokerBettingRound)
    bettingRound: PokerBettingRound;
    
    @Type(() => PokerRoundPlayer)
    roundPlayers: PokerRoundPlayer[];
    @Exclude()
    baseGame: PokerGame;
    
    currentActionIndex: number;
    
    finished: boolean = false;
    endStatus: string = '';
    
    get currentActionPlayer(): PokerRoundPlayer {
        const player = this.roundPlayers[this.currentActionIndex];
        
        if (!player)
            throw 'Unable to get current action player';
        
        return player;
    }
    
    calcDefaultActionIndex(): number {
        return this.roundPlayers.length == 2 ? this.baseGame.dealerButtonIndex : (this.baseGame.dealerButtonIndex + 1) % this.roundPlayers.length;
    }
    
    constructor(baseGame: PokerGame | undefined, startBet: number | undefined) {
        if (baseGame == undefined) {
            this.cardRound = new PokerCardRound(undefined);
            this.bettingRound = new PokerBettingRound(undefined, undefined, undefined);
            this.roundPlayers = [];
            this.baseGame = new PokerGame(undefined, undefined, undefined, undefined, undefined);
            this.currentActionIndex = 0;
            return;
        }
        
        this.roundPlayers = baseGame.players.map(gamePlayer => new PokerRoundPlayer(gamePlayer));
        this.baseGame = baseGame;
        this.cardRound = new PokerCardRound(this.roundPlayers);
        this.bettingRound = new PokerBettingRound(this.roundPlayers, startBet, baseGame.maxBet);
        // In a 2 player game, pre-flop (first round of betting) the dealer gets to act first, otherwise the dealer acts last (+ 1 to dealer index)
        this.currentActionIndex = this.calcDefaultActionIndex();
    }
    
    getPlayer(ownerID: string): PokerRoundPlayer {
        let roundPlayer = this.roundPlayers.find(roundPlayer => roundPlayer.id == ownerID);
        
        if (!roundPlayer)
            throw `PlayerID not in round: ${ownerID}`;
        
        return roundPlayer;
    }
    
    nextAction(): void {
        // Check if only one player not folded
        if (this.roundPlayers.filter(player => !player.folded).length == 1) {
            // Round over! Everyone else folded
            this.#endRoundFromFold();
            return;
        }
        
        //if (this.roundPlayers.filter(player => !player.folded))
        
        // If all unfolded players have done their action, end of betting round - 
        if (this.bettingRound.endOfRound) {
            this.bettingRound.endOfRound = false;
            
            if (this.cardRound.finished)
                return this.#endRoundFromShowdown();
            
            this.cardRound.advanceStep();
            this.currentActionIndex = this.calcDefaultActionIndex();
        } else {
            this.currentActionIndex = (this.currentActionIndex + 1) % this.roundPlayers.length;
        }
        
        // if nobody can act, advance to the next action
        const playersWhoCanAct = this.bettingRound.bettingPlayers.filter(player => !player.roundPlayer.folded && player.roundPlayer.gamePlayer.balance > 0 && player.bet < this.baseGame.maxBet);
        if (playersWhoCanAct.length == 0 || (playersWhoCanAct.length == 1  && playersWhoCanAct[0]?.bet === this.bettingRound.currentHighBet)) {
            this.bettingRound.endOfRound = true;
            this.nextAction();
        }
        
        // Make currentActionIndex/Player === the next player in order that can act - we're promised that at least 2 of these can act, so it won't infinite loop
        while (this.currentActionPlayer.folded || this.currentActionPlayer.gamePlayer.balance <= 0 || this.bettingRound.getPlayer(this.currentActionPlayer.id).bet >= this.baseGame.maxBet) {
            this.currentActionIndex = (this.currentActionIndex + 1) % this.roundPlayers.length;
        }
    }
    
    #endRoundFromFold(): void {
        let unfoldedHands = this.roundPlayers.filter(player => !player.folded);
        
        if (unfoldedHands.length !== 1)
            throw 'Tried to end poker round (fold) when more than 1 player remained';
        
        let winningHand = unfoldedHands[0];
        
        if (!winningHand)
            throw 'Unfolded hand not found after length check - should be impossible'; // Shouldn't ever hit at runtime
        
        let winner = this.getPlayer(winningHand.id);
        
        const potBalance = this.bettingRound.bettingPlayers.map(player => player.bet).reduce((pervious, current) => pervious + current);
        
        winner.gamePlayer.balance += potBalance;
        
        this.finished = true;
        this.endStatus = `<@${winner.gamePlayer.id}> won ${potBalance} Doink Coin`;
    }
    
    #endRoundFromShowdown(): void {
        this.cardRound.advanceToEnd();
        
        let potTexts: string[] = [];
        
        let pots = this.bettingRound.determinePots();
        for (const pot of pots) {
            let winners = this.cardRound.determineWinners(pot.ids);
            winners = rotate(winners, random.integer(0, winners.length - 1));
            
            let winnerIDs = winners.map(winner => winner.hand.roundPlayer.gamePlayer.id);
            let publicLosingHands: { solved: SolvedHand, cards: string[] }[] = pot.ids.filter(id => !winnerIDs.includes(id) && !this.getPlayer(id).folded).map(id => {
                let hand = this.cardRound.getHand(id);
                let solvedHand = Hand.solve(hand.cards.concat(this.cardRound.communityCards))
                solvedHand.ownerID = hand.id;
                return { solved: solvedHand, cards: hand.cards };
            });
            
            const remainder = pot.amount % winners.length;
            const sharePerWinner = (pot.amount - remainder) / winners.length;
            
            let winnerNames = winners.map(winner => `<@${winner.hand.roundPlayer.gamePlayer.id}> (${winner.hand.cards.join(', ')} / ${winner.description})`);
            let winnerText = winnerNames.join('\n');
            
            let losingNames = publicLosingHands.map(losingHand => `<@${losingHand.solved.ownerID}> (${losingHand.cards.join(', ')} / ${losingHand.solved.descr})`);
            let losingText = losingNames.join('\n');
            
            potTexts.push(`${genCoinLabel(sharePerWinner)} go to the Winner${winners.length > 1 ? 's' : ''}:\n${winnerText}\n\nLosing hands:\n${losingText}`);
            
            winners.forEach((winner, i) => this.baseGame.getPlayer(winner.hand.id).balance += sharePerWinner + (i < remainder ? 1 : 0));
        }
        
        this.finished = true;
        this.endStatus = potTexts.join('\n\n');
    }
}
