
import { colors } from '$config';
import { MessageEmbed } from 'discord.js';

export function embed(title: string, fields: any, description?: string, color = colors.success): MessageEmbed {
    let embed = new MessageEmbed().setTitle(title).setColor(color);
    
    if (Array.isArray(fields)) {
        for (let i = 0; i < fields.length; i++) {
            embed.addFields(fields[i]);
        }
    } else if (Object.keys(fields).length > 0) embed.addFields(fields);
    
    if (description) embed.setDescription(description);
    
    return embed;
}

export function embedSingle(title: string, description?: string, color?: number): MessageEmbed {
    return embed(title, {}, description, color);
}

export function embedOK(description: string): MessageEmbed {
    return embedSingle('Success', description, colors.success);
}

export function embedError(description: string): MessageEmbed {
    return embedSingle('Error', description, colors.error);
}
