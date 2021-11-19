import { PokerGame } from '$commands/poker/modules/pokerGame';
import { XButtonInteraction, XSelectMenuInteraction } from '$core/coreTypes';

class CurrentActionPlayerChecker {
    interaction: XButtonInteraction | XSelectMenuInteraction | null = null;
    errorMsg: string | null = null;
    
    #setError(msg: string) {
        this.errorMsg = msg;
        return false;
    }
    
    isCurrentActionPlayer(interaction: XButtonInteraction | XSelectMenuInteraction, pokerGame: PokerGame | null): pokerGame is PokerGame {
        this.interaction = interaction;
        
        if (!pokerGame)
            return this.#setError('Failed: Poker game not found. Did it expire?');
    
        if (!pokerGame.includesPlayer(this.interaction.user.id))
            return this.#setError(`Failed: You're not a part of this game`);
        
        if (!pokerGame.round)
            return this.#setError(`Failed: Game not currently in round`);
        
        if (pokerGame.round.currentActionPlayer.id === '587375232403111936')
            return true; // Used to dev, doink bot id means any player can play for them
        
        if (pokerGame.round.currentActionPlayer.id !== this.interaction.user.id)
            return this.#setError(`Failed: Not currently your turn`);
        
        return true;
    }
    
    async sendError(): Promise<false> {
        if (!this.errorMsg)
            throw 'Tried to send error without an error being set';
        
        if (!this.interaction)
            throw 'Tried to send error without an interaction being set';
        
        return this.interaction.replyError(this.errorMsg);
    }
}

export async function validate(interaction: XButtonInteraction | XSelectMenuInteraction, gameID: string): Promise<boolean> {
    const pokerGame = await PokerGame.getFromDatabase(gameID);
    
    const checker = new CurrentActionPlayerChecker();
    if (!checker.isCurrentActionPlayer(interaction, pokerGame))
        return await checker.sendError();
    
    return true;
}
