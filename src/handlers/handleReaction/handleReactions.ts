import { MessageModel } from '$models/messages/messages.model';
import { UserModel } from '$models/users/users.model';
import { Message, MessageReaction, PartialMessageReaction } from 'discord.js';
import { countReactions, countWithoutDuplicates } from './countReactions';
import { fetchMessagePartial, fetchReactionPartial, reactionIsQuote } from './utility';

export async function handleReactions(_reaction: MessageReaction | PartialMessageReaction) {
    let reaction: MessageReaction | null = null;
    if (!(reaction = await fetchReactionPartial(_reaction)))
        return;
    
    let message: Message | null = null;
    if (!(message = await fetchMessagePartial(reaction.message)))
        return;
    
    let author = message.author;
    
    
    if (!author) {
        console.log('Message somehow had no author')
    }
    
    // reaction.message.createdTimestamp < 1613772319478
    
    if (!('guild' in reaction.message.channel) || reaction.message.channel.guild.id != '428000566426468353') return;
    
    if (await reactionIsQuote(reaction)) {
        if (reaction.message.mentions.users.size != 1) return;
        author = reaction.message.mentions.users.entries().next().value[1];
    }
    
    let reactions = await countReactions(reaction, author, ['heart', 'downvote', 'gold']);
    let totalHearts = countWithoutDuplicates(reactions, 'heart', author.id);
    let totalDownvotes = countWithoutDuplicates(reactions, 'downvote', author.id);
    
    let msg = await MessageModel.findOneOrCreate({ uid: reaction.message.id });
    let totalGold = msg ? msg.goldGivers ? msg.goldGivers.length : 0 : 0;
    
    const user = await UserModel.findOneOrCreate(author.id);
    user.username = author.username;
    
    msg.author = author.id;
    msg.channel = reaction.message.channel.id;
    msg.uid = reaction.message.id;
    msg.timestamp = reaction.message.createdTimestamp;
    msg.reactions = reactions;
    msg.totalHearts = totalHearts;
    msg.totalDownvotes = totalDownvotes;
    msg.totalGold = totalGold;
    
    if (!msg.goldGivers)
        msg.goldGivers = [];
    
    await Promise.all([user.save(), msg.save()]);
}
