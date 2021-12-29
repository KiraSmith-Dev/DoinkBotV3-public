import { PokerGame } from '$commands/poker/modules/pokerGame';
import { XOptions, XButtonInteraction } from '$core/coreTypes';
import { MessagePayload } from 'discord.js';

export const options: XOptions = {
    isUpdate: true
}

export async function validate(interaction: XButtonInteraction, gameID: string): Promise<boolean> {
    const pokerGame = await PokerGame.getFromDatabase(gameID);
    
    if (!pokerGame)
        return interaction.replyError(`Failed: Poker game not found. Did it expire?`);
    
    if (!pokerGame.playerIDs.includes(interaction.user.id))
        return interaction.replyError(`Failed: You're not a part of this game`);
    
    if (pokerGame.getRound().currentActionPlayer.id == interaction.user.id)
        return interaction.replyError(`Failed: Can't fold yourself for inactivity`);
    
    return true;
}

export async function execute(interaction: XButtonInteraction, gameID: string) {
    const pokerGame = await PokerGame.getFromDatabase(gameID);
    
    if (!pokerGame)
        throw `pokerGame wasn't valid`;
    
    if (Date.now() - pokerGame.lastActivity < 1000 * 60 * 5)
        return await interaction.deleteDeferFollowUp(`Failed to fold player: opponent hasn't been inactive for 5 minutes`, 'error');
    
    pokerGame.doFold();
    
    await interaction.editReply((await pokerGame.generateInteractionUpdate() as MessagePayload));
}
