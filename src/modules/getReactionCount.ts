import { MessageModel } from '$models/messages/messages.model';
import { IReaction } from '$models/messages/messages.types';

const blacklist = { from: 1634527712483, to: 1634527712483 - (10 * 24 * 60 * 60 * 1000), author: '230169510072549378', reactor: '486529574046269444', type: 'Downvotes' };

function typeToDisplayName(type: string) {
    if (!type.length)
        return '';
    
    type = (type[0] as string).toUpperCase() + type.toLowerCase().substr(1);
    if (type.endsWith('s')) type = type.substring(0, type.length -  1);
    
    if (!['Heart', 'Downvote', 'Gold'].includes(type))
        return 'invalid';
    
    return type + (type == 'Gold' ? '' : 's');
}

export async function getUserReactionCount(userID: string, _type: string, timestampMin = 0) {
    const type = typeToDisplayName(_type);
    
    if (type == 'invalid') throw `Invalid reaction type: ${_type}`;
    
    let allMessagess = await MessageModel.find({ author: userID });
    
    let totalCount = 0;
    await allMessagess.forEach(item => {
        if (item.invalid || !((item as any)[`total${type}`] as string | undefined) || item.timestamp <= timestampMin)
            return;
        
        let mod = 0;
        
        // Blacklisting
        if (item.timestamp < blacklist.from && item.timestamp > blacklist.to && userID == blacklist.author && type == blacklist.type) {
            for (let i = 0; i < item.reactions.length; i++) {
                const reactItem = item.reactions[i] as IReaction;
                if (reactItem.name.includes(_type) && reactItem.ids.includes(blacklist.reactor)) mod -= 1;
            }
        }
        
        totalCount += (item as any)[`total${type}`] + mod;
    });
    
    return totalCount;
}
