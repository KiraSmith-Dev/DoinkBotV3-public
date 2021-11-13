import { ButtonInteraction } from 'discord.js';
import { failOut } from '$modules/interaction-util';
import { PokerGame } from '$commands/poker/modules/pokerGame';

export default async function (interaction: ButtonInteraction, gameID: string) {
    const pokerGame = await PokerGame.getFromDatabase(gameID);
    
    if (!pokerGame)
        return await failOut(interaction, 'Failed: Poker game not found. Did it expire?');
    
    if (!pokerGame.includesPlayer(interaction.user.id))
        return await failOut(interaction, `Failed: You're not a part of this game`);
    
    //pokerGames.splice(pokerGameIndex, 1);
    await pokerGame.deleteFromDatabase();
    
    return interaction.update({ content: `Poker Game: Canceled by ${interaction.user.username}`, components: [] });
}
