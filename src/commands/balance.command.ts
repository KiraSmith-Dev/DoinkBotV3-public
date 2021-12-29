import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { XOptions } from '$root/core/coreTypes';
import { getBalance } from '$modules/users';
import { embedSingle } from '$modules/embedUtil';

export const data = new SlashCommandBuilder()
	.setName('balance')
	.setDescription('Display how many Doink Coins you have');

export const options: XOptions = {
	ephemeral: true,
	skipValidate: true
}

export async function execute(interaction: CommandInteraction) {
    let amount = await getBalance(interaction.user.id)
	await interaction.editReply({ embeds: [embedSingle(`You have ${amount} Doink Coin${amount !== 1 ? 's' : ''}`)] });
}
