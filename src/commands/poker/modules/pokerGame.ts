import { random } from '$modules/random';
import generateHandImage from './generateHandImage';
import { User, MessageActionRow, MessageButton, MessageSelectMenu, WebhookEditMessageOptions } from 'discord.js';
import { Type, classToPlain, plainToClass } from 'class-transformer';
import { getDB } from '$modules/database';
import { DeleteResult, UpdateResult, ObjectId } from 'mongodb';
import { PokerGamePlayer, PokerGameType } from './pokerTypes';
import { PokerRound } from './pokerRound';
const db = getDB();
const pokerGames = db.collection('pokerGames');

export class PokerGame {
    _id: string = new ObjectId().toHexString();
    deleted: boolean = false;
    
    buyInCost: number;
    maxRaise: number;
    
    @Type(() => PokerGamePlayer)
    players: PokerGamePlayer[];
    playerIDs: string[];
    
    dealerButtonIndex: number;
    
    type: PokerGameType;
    
    started: boolean = false;
    roundNumber: number = 0;
    
    @Type(() => PokerRound)
    round: PokerRound | null = null;
    
    constructor(type: PokerGameType | undefined, buyInCost: number | undefined, host: User | undefined, guests: User[] | undefined) {
        if (!type || !buyInCost || !host || !guests) {
            this.type = PokerGameType.TOURNAMENT
            this.buyInCost = 0;
            this.maxRaise = 0;
            this.players = [];
            this.playerIDs = [];
            this.dealerButtonIndex = 0;
            return;
        }
        
        this.type = type;
        this.buyInCost = buyInCost;
        this.maxRaise = Math.round(buyInCost * 1.5);
        
        this.players = [new PokerGamePlayer(host, this.buyInCost), ...guests.map(guest => new PokerGamePlayer(guest, this.buyInCost).ready())]; // TODO: Swap ready() to other player, this is for deving only
        this.playerIDs = this.players.map(player => player.id);
        
        this.dealerButtonIndex = random.integer(0, this.players.length - 1);
    }
    
    generateHandImage(playerID: string): Promise<Buffer> {
        let player = this.getPlayer(playerID);
        
        if (!this.round)
            throw `Tried to generate hand image outside of round`;
        
        let hand = this.round.cardRound.getHand(player.id);
        
        if (!hand.cards.length)
            throw `PlayerID doesn't have hand: ${playerID}`;
        
        return generateHandImage(hand.cards);
    }
    
    includesPlayer(playerID: string): boolean {
        return this.playerIDs.includes(playerID);
    }
    
    getPlayer(playerID: string): PokerGamePlayer {
        let player = this.players.find(player => player.id == playerID);
        
        if (!player)
            throw `PlayerID not in game: ${playerID}`;
        
        return player;
    }
    
    isEveryoneReady(): boolean {
        for (const player of this.players)
            if (!player.isReady) return false;
        
        return true;
    }
    
    start(): void {
        if (this.started)
            throw 'Tried to start poker game twice';
        
        if (!this.isEveryoneReady())
            throw 'Tried to start poker game without everyone accepting';
        
        this.started = true;
        
        this.#startNewRound();
    }
    
    getRound(): PokerRound {
        if (!this.round)
            throw 'Tried get round outside of poker round';
        
        return this.round;
    }
    
    #startNewRound(): void {
        if (!this.started)
            throw 'Tried to start a poker round before poker game started';
        
        ++this.roundNumber;
        this.round = new PokerRound(this);
        
        // Dealer acts first in 2 player game, but only on the first betting round,
        // otherwise it's the player after the dealer
        this.getRound().currentActionIndex = this.players.length == 2 ? this.dealerButtonIndex : (this.dealerButtonIndex + 1) % this.players.length;
        
        // TODO:
        //if (this.type == PokerGameType.SINGLE)
            //this.players.forEach(player => player.bet = player.balance);
        
        
    }
    
    nextAction(): void {
        if (!this.started)
            throw 'Tried to do next action before poker game started';
        
        this.getRound().nextAction();
        
        if (this.getRound().finished)
            this.#startNewRound();
        
        /*
        if (this.baseGame.type == PokerGameType.SINGLE) {
            // Game over
            // Pay payout directly to winner
        } else if (this.baseGame.type == PokerGameType.TOURNAMENT) {
            //winner.balance += potBalance;
            
            if (this.roundPlayers.filter(player => player.balance !== 0).length == 1) {
                // Player won - everyone else out of money
                // Pay payout directly to winner
                
                return;
            }
            
            ++this.roundNumber;
            
            this.#startNewRound();
        }
        */
    }
    
    doFold(): void {
        if (!this.started)
            throw 'Tried to folder player before poker game started';
        
        if (!this.round)
            throw 'Tried to fold outside of poker round';
        
        this.round.currentActionPlayer.folded = true;
        
        this.nextAction();
    }
    
    doBet(amount: number): void {
        if (!this.round)
            throw 'Tried to bet outside of poker round';
        
        this.round.bettingRound.doBet(this.round.currentActionPlayer.id, amount);
        
        this.nextAction();
    }
    
    doCall(): void {
        if (!this.round)
            throw 'Tried to call outside of poker round';
        
        this.round.bettingRound.doCall(this.round.currentActionPlayer.id);
        
        this.nextAction();
    }
    
    getCards(): string[] {
        if (!this.round)
            throw 'Tried to get cards outside of poker round';
        
        return this.round.cardRound.getHand(this.round.currentActionPlayer.id).cards;
    }
    
    endGame() {
        
    }
    
    generateStatusMessage(): string {
        if (!this.started)
            throw 'Tried to generate status before game was started';
        
        let statusContent = '';
        
        statusContent += `Poker Game - ${this.type}\n`
        statusContent += `Players: ${this.players.map(player => player.username).join(', ')}\n`
        statusContent += `Buy In: ${this.buyInCost}\n`
        
        statusContent += `Balances: ${this.players.map(player => `(${player.username}: ${player.balance})`).join(', ')}\n`
        
        statusContent += `Bets: ${this.players.map(player => `(${player.username}: ${this.getRound().bettingRound.getPlayer(player.id).bet})`).join(', ')}\n`
        
        let currentDealer = this.players[this.dealerButtonIndex];
        
        if (!currentDealer)
            throw `currentDealer didn't exist while generating status message`;
        
        let currentActionUser = this.players[this.getRound().currentActionIndex];
        
        if (!currentActionUser)
            throw `currentActionUser didn't exist while generating status message`;
        
        statusContent += `Dealer: ${currentDealer.username}\n`
        statusContent += `Player to do action: ${currentActionUser.username}\n`
        
        return statusContent;
    }
    
    saveToDatabase(): Promise<UpdateResult> | null {
        // Guard against re-insertion after deletion - if we delete, the game is fully over and done
        if (this.deleted)
            return null;
        
        // Can't insert _id property, mongodb will throw an error, we can just delete it - it gets set by the upsert anyway
        let classData = classToPlain(this, { enableCircularCheck: true });
        delete classData._id;
        
        return pokerGames.updateOne({ _id: ObjectId.createFromHexString(this._id) }, { $set: classData }, { upsert: true });
    }
    
    deleteFromDatabase(): Promise<DeleteResult> {
        this.deleted = true;
        return pokerGames.deleteOne({ _id: ObjectId.createFromHexString(this._id) });
    }
    
    static async getFromDatabase(id: string): Promise<PokerGame | null> {
        const foundGame = await pokerGames.findOne({ _id: ObjectId.createFromHexString(id) });
        
        if (!foundGame)
            return null;
        
        foundGame._id = (foundGame._id as ObjectId).toHexString();
        
        let pokerGame = plainToClass(PokerGame, foundGame);
        
        // Load up references - otherwise these are all shallow copies
        if (pokerGame.round) {
            pokerGame.round.baseGame = pokerGame;
            pokerGame.round.roundPlayers.forEach(roundPlayer => roundPlayer.gamePlayer = pokerGame.getPlayer(roundPlayer.id));
            pokerGame.round.cardRound.cardPlayers.forEach(cardPlayer => cardPlayer.roundPlayer = pokerGame.getRound().getPlayer(cardPlayer.id));
            pokerGame.round.bettingRound.bettingPlayers.forEach(bettingPlayer => bettingPlayer.roundPlayer = pokerGame.getRound().getPlayer(bettingPlayer.id));
        }
        
        return pokerGame;
    }
    
    static async anyGameIncludePlayer(id: string): Promise<boolean> {
        return (await pokerGames.findOne({ playerIDs: id })) ? true : false;
    }
    
    generateComponents(): MessageActionRow[] {
        if (!this.round)
            throw 'Tried to generate components outside of poker round';
        
        const currentActionPlayer = this.round.currentActionPlayer;
        const bettingRound = this.round.bettingRound;
        const bettingPlayer = bettingRound.getPlayer(currentActionPlayer.id);
        
        // Todo: determine how much players need to bet to match the bet
        const callAmount = bettingRound.getAmountRequiredToCall(currentActionPlayer.id);
        
        const raiseLabel = bettingRound.anyBets ? { uppercase: 'Raise', lowercase: 'raise' } : { uppercase: 'Bet', lowercase: 'bet' };
        
        const amountOwed = bettingRound.currentHighBet - bettingPlayer.bet;
        const canRaiseByAmount = currentActionPlayer.gamePlayer.balance - amountOwed;
        const canRaise = canRaiseByAmount > 0;
        
        return [
            new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId(`poker:seeHand:${this._id}`)
                        .setLabel('See Hand')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId(`poker:call:${this._id}`)
                        .setLabel(`Call (${callAmount.allIn ? `All In for ${callAmount.amount}` : callAmount.amount})`)
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId(`poker:fold:${this._id}`)
                        .setLabel('Fold')
                        .setStyle('DANGER')
                ),
            new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId(canRaise ? `poker:raise:${this._id}` : 'disabled')
                        .setDisabled(!canRaise)
                        .setPlaceholder(canRaise ? `${raiseLabel.uppercase} (Selecting a value will ${raiseLabel.lowercase})` : `You're unable to raise`)
                        // Generate array of numbers 1 - maxRaise, map to option objects 
                        .addOptions(canRaise ? [...Array(Math.min(this.maxRaise, canRaiseByAmount)).keys()].map(i => i + 1).map(i => ({
                            label: `${i}${(canRaise && canRaiseByAmount == i) ? ' (All In)' : ''}`,
                            description: `Select to ${raiseLabel.lowercase}${bettingRound.anyBets ? ' by' : ''} ${i} (${bettingRound.currentHighBet + i} total)`,
                            value: `${i}`
                        })) : [{
                            label: '0',
                            value: '0'
                        }])
                )
        ]
    }
    
    async generateInteractionUpdate(): Promise<WebhookEditMessageOptions> {
        if (!this.round)
            throw 'Tried to generate interaction update outside of poker round';
        
        return { 
            content: this.generateStatusMessage(),
            components: this.generateComponents(), 
            files: this.round.cardRound.communityCards.length ? [ await generateHandImage(this.round.cardRound.communityCards) ] : undefined
        }
    }
}
