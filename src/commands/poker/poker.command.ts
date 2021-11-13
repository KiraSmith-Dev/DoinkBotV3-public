import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageActionRow, MessageButton, Collection, CommandInteraction } from 'discord.js';
import { PokerGame } from '$commands/poker/modules/pokerGame';
import { PokerGameType } from '$commands/poker/modules/pokerTypes';

export const data = new SlashCommandBuilder()
        .setName('poker')
        .setDescription('Play poker')
        .addUserOption(option => 
            option.setName('opponent')
                .setDescription('The user to play against')
                .setRequired(true));

export async function execute(interaction: CommandInteraction) {
    const opponent = interaction.options.getUser('opponent', true);
    if (opponent.id == interaction.user.id)
        return interaction.reply({ content: `Failed: Can't start a poker game with yourself`, ephemeral: true });
    
    if (await PokerGame.anyGameIncludePlayer(interaction.user.id))
        return interaction.reply({ content: `Failed: You're already in a poker game`, ephemeral: true });
    
    if (await PokerGame.anyGameIncludePlayer(opponent.id))
        return interaction.reply({ content: `Failed: They're already in a poker game`, ephemeral: true });
    
    // TODO: Make buyin a command option, and display how much it is
    const pokerGame = new PokerGame(PokerGameType.SINGLE, 10, interaction.user, [opponent]);
    
    await pokerGame.saveToDatabase();
    
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId(`poker:accept:${pokerGame._id}`)
                .setLabel('Accept')
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId(`poker:cancel:${pokerGame._id}`)
                .setLabel('Cancel')
                .setStyle('DANGER'),
        );
    
    await interaction.reply({ content: `Poker game: Waiting for ${opponent.username}`, components: [row] });
}
