import { SlashCommandBuilder } from '@discordjs/builders';
import { XCommandInteraction, XOptions } from '$core/coreTypes';
import { embedSingle } from '$modules/embedUtil';
import { getUserReactionCount } from '$modules/getReactionCount';

export const data = new SlashCommandBuilder()
	.setName('net')
	.setDescription('Shows your net score (Hearts - Downvotes)');

export const options: XOptions = {
	ephemeral: true,
	skipValidate: true
};

export async function execute(interaction: XCommandInteraction) {
    const netScore = (await getUserReactionCount(interaction.user.id, 'heart')) - (await getUserReactionCount(interaction.user.id, 'downvote'));
    const embed = embedSingle(`<@${interaction.user.id}>'s net score`, String(netScore));
    await interaction.editReply({ embeds: [embed], components: [] });
}
