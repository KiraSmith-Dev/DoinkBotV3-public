import { SlashCommandBuilder } from '@discordjs/builders';
import { XCommandInteraction, XOptions } from '$core/coreTypes';
import { embedSingle } from '$modules/embedUtil';
import { getUserReactionCount } from '$modules/getReactionCount';

export const data = new SlashCommandBuilder()
	.setName('downvotes')
	.setDescription('Shows how many downvotes you have');

export const options: XOptions = {
	ephemeral: true,
	skipValidate: true
};

export async function execute(interaction: XCommandInteraction) {
	const embed = embedSingle(`Downvote count`, `<@${interaction.user.id}>'s Downvotes: ${await getUserReactionCount(interaction.user.id, 'Downvote')}`);
    await interaction.editReply({ embeds: [embed], components: [] });
}
