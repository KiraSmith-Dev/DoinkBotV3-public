import { MessageModel } from '$models/messages/messages.model';
import { UserModel } from '$models/users/users.model';
import { Message, MessageReaction, PartialMessage, PartialMessageReaction, User } from 'discord.js';
import { DateTime } from 'luxon';

export async function fetchReactionPartial(partial: MessageReaction | PartialMessageReaction): Promise<MessageReaction | null> {
    if (!partial.partial)
        return partial;
    
    // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
    try {
        return await partial.fetch();
    } catch (error) {
        console.error('Something went wrong when fetching a reaction: ', error);
        return null;
    }
}

export async function fetchMessagePartial(partial: Message | PartialMessage): Promise<Message | null> {
    if (!partial.partial)
        return partial;
    
    // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
    try {
        return await partial.fetch();
    } catch (error) {
        console.error('Something went wrong when fetching a message: ', error);
        return null;
    }
}

export async function reactionIsQuote(reaction: MessageReaction): Promise<boolean> {
    if (reaction.message.channel.id != '597114467205251082')
        return false;
    
    let message: Message | null = null;
    if (!(message = await fetchMessagePartial(reaction.message)))
        return false;
    
    if (message.author.id == '332737714900434946' && message.content.includes('-'))
        return true;
    
    let quoteIndex = message.content.indexOf('"');
    if (quoteIndex == -1 || quoteIndex == message.content.lastIndexOf('"'))
        return false;
    
    return true;
}

export async function tryGiveDoinkGold(reaction: MessageReaction, innerReaction: MessageReaction, discordUser: User): Promise<boolean> {
    const local = DateTime.local();
    const user = await UserModel.findOneOrCreate(discordUser.id)
                
    const msg = await MessageModel.findOneOrCreate({ uid: reaction.message.id });
    const isAGoldGiver = msg && msg.goldGivers && msg.goldGivers.includes(discordUser.id);
    
    if (!(await user.canGiveGold()) && !isAGoldGiver) {
        innerReaction.users.remove(discordUser.id);
        return false;
    }
    
    user.username = discordUser.username;
    user.lastGoldGive = `${local.year}-${local.month}`;
    
    if (msg.goldGivers)
        msg.goldGivers.push(discordUser.id);
    else
        msg.goldGivers = [ discordUser.id ];
    
    await Promise.all([user.save(), msg.save()]);
    
    return true;
}
