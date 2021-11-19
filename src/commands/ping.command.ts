import { CommandInteraction, MessageActionRow, MessageButton } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { XOptions } from '$root/core/coreTypes';

export const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Replies with Pong!');

export const options: XOptions = {
	ephemeral: true,
	skipValidate: true
}

export async function execute(interaction: CommandInteraction) {
	await interaction.editReply({ content: 'Pong!' });
}
