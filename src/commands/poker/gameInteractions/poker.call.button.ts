import { MessagePayload } from 'discord.js';
import { PokerGame } from '$commands/poker/modules/pokerGame';
import { XButtonInteraction, XOptions } from '$core/coreTypes';

export const options: XOptions = {
    isUpdate: true
}

export { validate } from './isCurrentActionPlayer';

export async function execute(interaction: XButtonInteraction, gameID: string) {
    const pokerGame = await PokerGame.getFromDatabase(gameID);
    
    if (!pokerGame)
        throw `pokerGame wasn't valid`;
        
    pokerGame.doCall();
    
    await pokerGame.saveToDatabase();
    
    await interaction.editReply((await pokerGame.generateInteractionUpdate() as MessagePayload));
}
