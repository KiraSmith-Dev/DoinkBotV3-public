import { SelectMenuInteraction } from 'discord.js';
import { PokerGame } from '$commands/poker/modules/pokerGame';
import { currentActionPlayerChecker } from './isCurrentActionPlayer';

export default async function (interaction: SelectMenuInteraction, gameID: string) {
    if (!interaction.values[0])
        throw 'Interaction with select menu had no value';
    
    const amount = parseInt(interaction.values[0], 10);
    
    const pokerGame = await PokerGame.getFromDatabase(gameID);
    
    const checker = new currentActionPlayerChecker();
    if (!checker.isCurrentActionPlayer(interaction, pokerGame))
        return await checker.sendError();
    
    const gamePlayer = pokerGame.getRound().currentActionPlayer.gamePlayer;
    
    if (amount > pokerGame.maxRaise || gamePlayer.balance + pokerGame.getRound().bettingRound.getPlayer(gamePlayer.id).bet < amount + pokerGame.getRound().bettingRound.currentHighBet)
        throw 'Impossible bet'; // Should be impossible at runtime, select menu generation should prevent this from occurring -- can actually happen if select menu is submitted after error
    
    pokerGame.doBet(amount);
    
    await pokerGame.saveToDatabase();
    
    await interaction.update(await pokerGame.generateInteractionUpdate());
}