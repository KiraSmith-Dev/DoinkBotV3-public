import { ButtonInteraction } from 'discord.js';
import { failOut } from '$modules/interaction-util';
import { PokerGame } from '$commands/poker/modules/pokerGame';

export default async function (interaction: ButtonInteraction, gameID: string) {
    const pokerGame = await PokerGame.getFromDatabase(gameID);
    
    console.log(pokerGame);
    
    if (!pokerGame)
        return await failOut(interaction, 'Failed: Poker game not found. Did it expire?');
    
    if (!pokerGame.includesPlayer(interaction.user.id))
        return await failOut(interaction, `Failed: You're not a part of this game`);
    
    let player = pokerGame.getPlayer(interaction.user.id);
    
    if (player.isReady)
        return await failOut(interaction, `You're already ready`);
    
    player.ready();
    
    if (!pokerGame.isEveryoneReady())
        return await failOut(interaction, `You're ready, waiting for other players`);
    
    //await disableButton(interaction);
    
    pokerGame.start();
    
    await pokerGame.saveToDatabase();
    
    await interaction.update(await pokerGame.generateInteractionUpdate());
}
