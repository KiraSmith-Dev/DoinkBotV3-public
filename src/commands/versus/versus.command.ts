import { SlashCommandBuilder } from '@discordjs/builders';
import { XCommandInteraction, XOptions } from '$core/coreTypes';
import { embedSingle } from '$modules/embedUtil';
import { UserModel } from '$models/users/users.model';
import { IUserDocument } from '$models/users/users.types';
import { genCoinLabel } from '$modules/genCoinLabel';
import { VersusModel } from '$models/versus/versus.model';
import { MessageActionRow, MessageButton } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('versus')
	.setDescription('Challenge someone to a 50/50 for Doink Coins')
    .addIntegerOption(option => 
        option.setName('amount')
            .setDescription('Amount of Doink Coins to stake')
            .setRequired(true))
    .addUserOption(option =>
        option.setName('user')
            .setDescription('User to challenge')
            .setRequired(true));

export const options: XOptions = {
	ephemeral: false
};

export async function validate(interaction: XCommandInteraction): Promise<boolean> {
    const amount = interaction.options.getInteger('amount', true);
    const targetDiscordUser = interaction.options.getUser('user', true);
    
    if (interaction.user.id === targetDiscordUser.id)
        return await interaction.replyError(`You can't versus yourself`);
    
    if (amount < 1)
        return await interaction.replyError(`You can't bet less than 1 Doink Coin`);
    
    if (amount % 1 !== 0)
        return await interaction.replyError(`You can't bet a fraction of a Doink Coin`);
    
    const hostUser = await UserModel.findOneOrCreate(interaction.user.id);
    const targetUser = await UserModel.findOneOrCreate(targetDiscordUser.id);
    
    let res = await hostUser.validateCoins(interaction, amount, 'You');
    if (!res) return res;
    
    res = await targetUser.validateCoins(interaction, amount, `<@$${targetUser.uid}>`);
    if (!res) return res;
    
    return true;
}

export async function execute(interaction: XCommandInteraction) {
	const amount = interaction.options.getInteger('amount', true);
    const targetDiscordUser = interaction.options.getUser('user', true);
    
    let versusGame = await new VersusModel({
        hostID: interaction.user.id,
        targetID: targetDiscordUser.id,
        amount: amount
    });
    
    await versusGame.save();
    
    const embed = embedSingle(`Versus Challenge`, `<@${targetDiscordUser.id}> challenged for ${genCoinLabel(amount)}`);
    
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId(interaction.genButtonID('accept', versusGame._id))
                .setLabel('Accept')
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId(interaction.genButtonID('cancel', versusGame._id))
                .setLabel('Cancel')
                .setStyle('DANGER')
        );
    
	await interaction.editReply({ embeds: [embed], components: [row] });
}
