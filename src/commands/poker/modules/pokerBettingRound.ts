import { Type, Exclude } from 'class-transformer';
import { PokerRoundPlayer } from './pokerTypes';

export class PokerBettingPlayer {
    id: string;
    @Exclude()
    roundPlayer: PokerRoundPlayer;
    
    bet: number;
    didActionForThisBet: boolean = false;
    
    constructor(roundPlayer: PokerRoundPlayer | undefined, startBet: number | undefined) {
        if (!roundPlayer || !startBet) {
            this.roundPlayer = new PokerRoundPlayer(undefined);
            this.id = '0';
            this.bet = 0;
            return;
        }
        
        this.roundPlayer = roundPlayer;
        this.id = this.roundPlayer.id;
        this.bet = startBet;
        this.roundPlayer.gamePlayer.balance -= startBet;
    }
}

export type BettingPot = {
    ids: string[];
    amount: number;
}

export class PokerBettingRound {
    @Type(() => PokerBettingPlayer)
    bettingPlayers: PokerBettingPlayer[] = [];
    // For tracking if it's considered a "bet" or a "raise", and to disable folding before a bet
    anyBets: boolean = false;
    
    currentHighBet: number = 0;
    endOfRound: boolean = false;
    
    constructor(players: PokerRoundPlayer[] | undefined, startBet: number | undefined) {
        if (!players || !startBet) {
            this.bettingPlayers = [];
            return;
        }
        
        this.currentHighBet = startBet;
        this.bettingPlayers = players.map(player => new PokerBettingPlayer(player, startBet));
    }
    
    getPlayer(playerID: string): PokerBettingPlayer {
        const player = this.bettingPlayers.find(player => player.id == playerID);
        
        if (!player)
            throw `PlayerID not in Betting Round: ${playerID}`;
        
        return player;
    }
    
    getAmountRequiredToCall(playerID: string): { amount: number, allIn: boolean } {
        const player = this.getPlayer(playerID);
        
        if (player.bet > this.currentHighBet)
            throw 'Tried to call for a player with more than the current bet?'; // Sanity check
        
        const amountToMatch = this.currentHighBet - player.bet;
        const allIn = player.roundPlayer.gamePlayer.balance <= amountToMatch;
        return { amount: allIn ? player.roundPlayer.gamePlayer.balance : amountToMatch, allIn: allIn };
    }
    
    checkForEndOfRound(): void {
        // If any unfolded players haven't done their action, not end of betting round
        if (this.bettingPlayers.some(bettingPlayer => !bettingPlayer.didActionForThisBet && !bettingPlayer.roundPlayer.folded))
            return;
        
        this.endOfRound = true;
        this.anyBets = false;
        this.bettingPlayers.forEach(player => player.didActionForThisBet = false);
    }
    
    doBet(playerID: string, amount: number): void {
        const player = this.getPlayer(playerID);
        if (player.bet + amount <= this.currentHighBet)
            throw 'Tried to make bet lower than current high bet';
        
        // Any other bet is now considered a raise
        this.anyBets = true;
        
        // No player can have done an action for this bet since it was just made...
        this.bettingPlayers.forEach(player => player.didActionForThisBet = false);
        
        player.didActionForThisBet = true;
        player.bet += amount;
        player.roundPlayer.gamePlayer.balance -= amount;
        this.currentHighBet = player.bet;
        
        this.checkForEndOfRound();
    }
    
    doCall(playerID: string): void {
        const player = this.getPlayer(playerID);
        
        if (player.bet > this.currentHighBet)
            throw 'Tried to call for a player with more than the current bet?'; // Sanity check
        
        const amountToMatch = this.getAmountRequiredToCall(playerID);
        
        player.bet += amountToMatch.amount;
        player.roundPlayer.gamePlayer.balance -= amountToMatch.amount;
        player.didActionForThisBet = true;
        
        this.checkForEndOfRound();
    }
    
    determinePots(): BettingPot[] {
        // Remove empty bets, sort so that the order is lowest bet to make the algorithm easier
        let players = [...this.bettingPlayers].filter(player => player.bet).sort((a, b) => a.bet - b.bet);
        
        const pots = [];
        // Instead of a for loop since multiple players can be removed in one cycle if they bet the same amount
        while (players.length > 0) {
            if (!players[0])
                throw 'Impossibe runtime error: players[0] evals false even though players.length > 0';
            
            // Save first player's bet, since it's subtracted from later
            const betAmount = players[0].bet;
            
            const eligiblePlayersForPot = players.filter(player => !player.roundPlayer.folded).map(player => player.id);
            
            // Save amount put into this pot by all players
            if (eligiblePlayersForPot.length)
                pots.push({ ids: eligiblePlayersForPot, amount: betAmount * players.length });
            
            // Remove amount put into pot from player bet amounts for next pot
            players.forEach(player => player.bet -= betAmount);
            
            // Remove bets that were reduced to 0, which always includes players[0],
            // and may include other players of the same bet amount
            players = players.filter(player => player.bet);
        }
        
        return pots;
    }
}
