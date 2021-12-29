import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { PokerGame } from '$commands/poker/modules/pokerGame';
import { XCommandInteraction } from '$root/core/coreTypes';
import { getBalance } from '$modules/users';
import { colors } from '$config';

export const data = new SlashCommandBuilder()
        .setName('poker')
        .setDescription('Play poker')
        .addUserOption(option => 
            option.setName('opponent')
                .setDescription('The user to play against')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('buyin')
                .setDescription('Amount of coins to start the bet with')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('maxbet')
                .setDescription('Maximum amount of coins to win/lose')
                .setRequired(true))

export async function validate(interaction: XCommandInteraction): Promise<boolean> {
    const opponent = interaction.options.getUser('opponent', true);
    const buyIn = interaction.options.getInteger('buyin', true);
    const maxBet = interaction.options.getInteger('maxbet', true);
    
    if (buyIn < 0)
        return await interaction.replyError(`Failed: Buy In can't be less than zero`);
        
    if (maxBet < 1)
        return await interaction.replyError(`Failed: Max Bet can't be less than 1`);
    
    if (buyIn > maxBet)
        return await interaction.replyError(`Failed: Buy In can't be more than max bet`);
    
    if (opponent.id == interaction.user.id)
        return await interaction.replyError(`Failed: Can't start a poker game with yourself`);
    
    if (await PokerGame.anyGameIncludePlayer(interaction.user.id))
        return await interaction.replyError(`Failed: You're already in a poker game`);
    
    if (await PokerGame.anyGameIncludePlayer(opponent.id))
        return await interaction.replyError(`Failed: They're already in a poker game`);
    
    return true;
}

export async function execute(interaction: XCommandInteraction) {
    const opponent = interaction.options.getUser('opponent', true);
    const buyIn = interaction.options.getInteger('buyin', true);
    const maxBet = interaction.options.getInteger('maxbet', true);
    
    const balances = await Promise.all([getBalance(interaction.user.id), getBalance(opponent.id)]);
    
    const pokerGame = new PokerGame(buyIn, maxBet, interaction.user, [opponent], balances);
    
    await pokerGame.saveToDatabase();
    
    const embed = new MessageEmbed()
        .setTitle(`Poker game - Buy in: ${buyIn} - Max bet: ${maxBet}`)
        .setDescription(`Waiting for <@${opponent.id}>`)
        .setColor(colors.poker);
    
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId(interaction.genButtonID('accept', pokerGame._id))
                .setLabel('Accept')
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId(interaction.genButtonID('cancel', pokerGame._id))
                .setLabel('Cancel')
                .setStyle('DANGER')
        );
    
    await interaction.editReply({ embeds: [embed], components: [row] });
}
