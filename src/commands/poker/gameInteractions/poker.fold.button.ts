import { ButtonInteraction } from 'discord.js';
import { PokerGame } from '$commands/poker/modules/pokerGame';
import { currentActionPlayerChecker } from './isCurrentActionPlayer';

export default async function (interaction: ButtonInteraction, gameID: string) {
    const pokerGame = await PokerGame.getFromDatabase(gameID);
    
    const checker = new currentActionPlayerChecker();
    if (!checker.isCurrentActionPlayer(interaction, pokerGame))
        return await checker.sendError();
    
    pokerGame.doFold();
    
    await pokerGame.saveToDatabase();
    
    await interaction.update(await pokerGame.generateInteractionUpdate());
}
