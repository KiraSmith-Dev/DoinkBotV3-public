import { SlashCommandBuilder } from '@discordjs/builders';
import { XCommandInteraction, XOptions } from '$core/coreTypes';
import { embedSingle } from '$modules/embedUtil';
import { UserModel } from '$models/users/users.model';
import { genCoinLabel } from '$modules/genCoinLabel';

export const data = new SlashCommandBuilder()
	.setName('balance')
	.setDescription('Display how many Doink Coins you have');

export const options: XOptions = {
	ephemeral: true,
	skipValidate: true
};

export async function execute(interaction: XCommandInteraction) {
	const user = await UserModel.findOneOrCreate(interaction.user.id);
	const amount = user.coins ? user.coins : 0;
	
	await interaction.editReply({ embeds: [embedSingle(`You have ${genCoinLabel(amount)}`)] });
}
