import { MessageReaction, User } from 'discord.js';
import emoji from 'node-emoji';
import { tryGiveDoinkGold } from './utility';

type ReactionCount = {
    name: string;
    ids: string[];
}

export async function countReactions(reaction: MessageReaction, author: User, authorFilter: string[]): Promise<ReactionCount[]> {
    let reactions = [];
    
    for (let [snowflake, innerReaction] of reaction.message.reactions.cache) {
        let emoteName = emoji.unemojify(innerReaction.emoji.toString()).toLowerCase().trim();
        
        let reactionObj: ReactionCount = { name: emoteName, ids: [] };
        
        let reactionUsers = await innerReaction.users.fetch();
        for (let [snowflake, thisUser] of reactionUsers)  {
            let shouldBlockReaction = false;
            
            if (authorFilter.map(filter => emoteName.includes(filter)).includes(true) && thisUser.id == author.id)
                shouldBlockReaction = true;
            
            if (emoteName.includes('downvote') && author.id == '327981414274301954' && thisUser.id == '284447658309976064')
                shouldBlockReaction = true;
            
            if (shouldBlockReaction) {
                innerReaction.users.remove(thisUser.id);
                continue;
            }
            
            if (emoteName.includes('doinkgold') && !(await tryGiveDoinkGold(reaction, innerReaction, thisUser)))
                continue;
            
            reactionObj.ids.push(thisUser.id);
        }
            
        reactions.push(reactionObj);
    }
    
    return reactions;
}

export function countWithoutDuplicates(reactions: ReactionCount[], filterName: string, authorID: string): number {
    reactions = reactions.filter(reaction => reaction.name.includes(filterName));
    
    let alreadyVoted = [authorID];
    let count = 0;
    for (let i = 0; i < reactions.length; i++) {
        const reactionObj = reactions[i];
        if (!reactionObj)
            continue;
        
        for (let i = 0; i < reactionObj.ids.length; i++) {
            const id = reactionObj.ids[i];
            if (!id || alreadyVoted.includes(id)) continue;
            alreadyVoted.push(id);
            ++count;
        }
    }
    
    return count;
}
