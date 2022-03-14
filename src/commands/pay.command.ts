import { SlashCommandBuilder } from '@discordjs/builders';
import { XCommandInteraction, XOptions } from '$core/coreTypes';
import { embedOK } from '$modules/embedUtil';
import { UserModel } from '$models/users/users.model';
import { genCoinLabel } from '$modules/genCoinLabel';

export const data = new SlashCommandBuilder()
	.setName('pay')
	.setDescription('Pay someone Doink Coins')
    .addIntegerOption(option => 
        option.setName('amount')
            .setDescription('Amount of Doink Coins to pay')
            .setRequired(true))
    .addUserOption(option =>
        option.setName('user')
            .setDescription('User to pay')
            .setRequired(true));

export const options: XOptions = {};

export async function validate(interaction: XCommandInteraction): Promise<boolean> {
    const amount = interaction.options.getInteger('amount', true);
    const targetDiscordUser = interaction.options.getUser('user', true);
    
    if (interaction.user.id === targetDiscordUser.id)
        return await interaction.replyError(`You can't pay yourself`);
    
    const hostUser = await UserModel.findOneOrCreate(interaction.user.id);
    
    let res = await hostUser.validateCoins(interaction, amount, 'You');
    if (!res) return res;
    
    return true;
}

export async function execute(interaction: XCommandInteraction) {
    const amount = interaction.options.getInteger('amount', true);
    const targetDiscordUser = interaction.options.getUser('user', true);
    
    const hostUser = await UserModel.findOneOrCreate(interaction.user.id);
    const targetUser = await UserModel.findOneOrCreate(targetDiscordUser.id);
    
    hostUser.username = interaction.user.username;
    targetUser.username = targetDiscordUser.username;
    await hostUser.addToBalance(amount * -1);
    await targetUser.addToBalance(amount);
    
    const embed = embedOK(`<@${hostUser.uid}> paid <@${targetUser.uid}> ${genCoinLabel(amount)}`);
    await interaction.editReply({ embeds: [embed], components: [] });
}
