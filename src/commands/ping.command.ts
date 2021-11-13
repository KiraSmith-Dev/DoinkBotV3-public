import { CommandInteraction, MessageActionRow, MessageButton } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { COptions } from '$root/core/coreTypes';

export const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Replies with Pong!');

export const options: COptions = {
	ephemeral: true,
	skipValidate: true
}

export async function execute(interaction: CommandInteraction) {
	await interaction.editReply({ content: 'Pong!' });
}
