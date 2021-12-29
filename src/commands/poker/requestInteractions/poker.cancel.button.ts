import { PokerGame } from '$commands/poker/modules/pokerGame';
import { colors } from '$config';
import { XButtonInteraction, XOptions } from '$core/coreTypes';
import { MessageEmbed } from 'discord.js';

export const options: XOptions = {
    isUpdate: true
}

export async function validate(interaction: XButtonInteraction, gameID: string): Promise<boolean> {
    const pokerGame = await PokerGame.getFromDatabase(gameID);
    
    if (!pokerGame)
        return await interaction.replyError('Failed: Poker game not found. Did it expire?');
    
    if (!pokerGame.includesPlayer(interaction.user.id))
        return await interaction.replyError(`Failed: You're not a part of this game`);
    
    return true
}

export async function execute(interaction: XButtonInteraction, gameID: string) {
    const pokerGame = await PokerGame.getFromDatabase(gameID);
    
    if (!pokerGame)
        throw `pokerGame wasn't valid`;
    
    await pokerGame.deleteFromDatabase();
    
    const embed = new MessageEmbed()
        .setTitle(`Poker Game: Canceled by <@${interaction.user.id}>`)
        .setColor(colors.error);
    
    return interaction.editReply({ embeds: [embed], components: [] });
}
