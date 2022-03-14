import { SlashCommandBuilder } from '@discordjs/builders';
import { XCommandInteraction, XOptions } from '$core/coreTypes';
import { embedOK } from '$modules/embedUtil';

export const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Replies with Pong!');

export const options: XOptions = {
	ephemeral: true,
	skipValidate: true
};

export async function execute(interaction: XCommandInteraction) {
	const embed = embedOK(`Pong!`);
	await interaction.editReply({ embeds: [embed], components: [] });
}
