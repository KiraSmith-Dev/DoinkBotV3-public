import { ButtonInteraction } from 'discord.js';
import { failOut } from '$modules/interaction-util';
import { PokerGame } from '$commands/poker/modules/pokerGame';
import generateHandImage from '$commands/poker/modules/generateHandImage';
import { classToPlain } from 'class-transformer';
import { currentActionPlayerChecker } from './isCurrentActionPlayer';

export default async function (interaction: ButtonInteraction, gameID: string) {
    const pokerGame = await PokerGame.getFromDatabase(gameID);
    
    if (!pokerGame)
        return await failOut(interaction, 'Failed: Poker game not found. Did it expire?');
    
    if (!pokerGame.includesPlayer(interaction.user.id))
        return await failOut(interaction, `Failed: You're not a part of this game`);
    
    const cards = pokerGame.getRound().cardRound.getHand(interaction.user.id).cards;
    
    await interaction.reply({
		files: [ await generateHandImage(cards) ],
		ephemeral: true
	});
}
