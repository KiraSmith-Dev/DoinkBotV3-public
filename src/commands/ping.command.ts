import { SlashCommandBuilder } from '@discordjs/builders';
import { XCommandInteraction, XOptions } from '$core/coreTypes';

export const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Replies with Pong!');

export const options: XOptions = {
	ephemeral: true,
	skipValidate: true
}

export async function execute(interaction: XCommandInteraction) {
	await interaction.editReply({ content: 'Pong!' });
}
