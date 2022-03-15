import { SlashCommandBuilder } from '@discordjs/builders';
import { XCommandInteraction, XOptions } from '$core/coreTypes';
import { embed } from '$modules/embedUtil';
import { MessageModel } from '$models/messages/messages.model';

export const data = new SlashCommandBuilder()
	.setName('setvalid')
	.setDescription('Admin Command')
    .addBooleanOption(option =>
        option.setName('state')
            .setDescription('State to set')
            .setRequired(true))
    .addStringOption(option => 
        option.setName('messageurl')
            .setDescription('Message to set state of')
            .setRequired(true));

export const options: XOptions = {
	ephemeral: true
};

export async function validate(interaction: XCommandInteraction): Promise<boolean> {
    const url = interaction.options.getString('messageurl', true);
    
    if (!url.startsWith('https://discord.com/channels/428000566426468353/'))
        return await interaction.replyError('Invalid message URL');
    
    let guild = interaction.guild;
    
    if (!guild) {
        try {
            guild = await interaction.client.guilds.fetch('428000566426468353');
        } catch {
            return await interaction.replyError('Failed to fetch guild...');
        }
    }
    
    const [ channelID, messageID ] = url.substring('https://discord.com/channels/428000566426468353/'.length).split('/');
    
    if (!channelID || !messageID)
        return await interaction.replyError('Invalid message URL');
    
    let targetChannel;
    let targetMessage;
    let targetMember;
    try {
        targetChannel = await guild.channels.fetch(channelID);
        if (!targetChannel || !targetChannel.isText())
            throw 'failed';
        
        targetMessage = await targetChannel.messages.fetch(messageID);
        targetMember = await guild.members.fetch(interaction.user.id);
    } catch {
        return await interaction.replyError('Failed to fetch message...');
    }
    
    if (!targetMember.permissionsIn(targetChannel).has('MANAGE_MESSAGES'))
        return await interaction.replyError('You don\'t have premission to do that');
    
    return true;
}

export async function execute(interaction: XCommandInteraction) {
    const state = interaction.options.getBoolean('state', true);
    const url = interaction.options.getString('messageurl', true);

    let guild = interaction.guild;
    
    if (!guild) {
        try {
            guild = await interaction.client.guilds.fetch('428000566426468353');
        } catch {
            throw 'Fetch failed even though validator was able to fetch...';
        }
    }
    
    const [ channelID, messageID ] = url.substring('https://discord.com/channels/428000566426468353/'.length).split('/');
    
    if (!channelID || !messageID)
        throw 'Invalid message URL after validator succeeded';
    
    let targetChannel;
    let targetMessage;
    let targetMember;
    try {
        targetChannel = await guild.channels.fetch(channelID);
        if (!targetChannel || !targetChannel.isText())
            throw 'failed';
        
        targetMessage = await targetChannel.messages.fetch(messageID);
        targetMember = await guild.members.fetch(interaction.user.id);
    } catch {
        throw 'Failed to fetch message even though validator was able to fetch...';
    }
    
    const message = await MessageModel.findOne({ uid: targetMessage.id });
    
    if (!message)
        return await interaction.replyError('Database failed to invalidate message!?');
    
    message.invalid = !state;
    message.save();
    
    const outEmbed = embed(`${state ? 'V' : 'Inv'}alidated`, { name: targetMessage.author.username, value: targetMessage.content.length ? targetMessage.content : '(attachment only)' }, undefined, 0x2dfc9f);
    if (targetMessage.attachments.size)
        outEmbed.setImage(targetMessage.attachments.entries().next().value[1].url);
        
    await interaction.editReply({ embeds: [outEmbed], components: [] });
}
