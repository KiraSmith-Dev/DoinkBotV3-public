import { SlashCommandBuilder } from '@discordjs/builders';
import { XButtonInteraction, XCommandInteraction, XOptions } from '$core/coreTypes';
import { embedSingle } from '$modules/embedUtil';

export const data = new SlashCommandBuilder()
	.setName('leaderboard')
	.setDescription('Shows the leaderboard of the specified type');

export const options: XOptions = {
	ephemeral: true,
    skipValidate: true
};

export async function execute(interaction: XCommandInteraction) {
    const embed = embedSingle(`__Leaderboard__`, 'Leaderboard currently disabled (and not even implemented in v3 yet!)');
    await interaction.editReply({ embeds: [embed], components: [] });
}
