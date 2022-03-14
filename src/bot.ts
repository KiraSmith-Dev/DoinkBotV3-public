import 'path-alias/register';

// For class-transformer
import 'reflect-metadata';
import 'es6-shim';

import * as Discord from 'discord.js';
import { token } from '$config';
import InteractionHandler, { ValidatorType } from '$core/handler';
//import handleCommands from '$core/handleCommands';
//import handleButtons from '$core/handleButtons';
//import handleSelectMenus from '$core/handleSelectMenus';

import { loadCommands } from '$core/loadCommands';
import { connectToDB } from '$modules/database';
import { connectToRawDB } from '$modules/rawDatabase';
import * as imageServer from '$modules/imageServer';

(async () => {
    await Promise.all([connectToDB(), connectToRawDB()]); // Connect to DB first to be avaliable for commands
    await Promise.all([imageServer.listen(), loadCommands()]); // Load commands before logging into discord to ensure requests are possible to fulfill
    
    const client = new Discord.Client({ intents: [
        Discord.Intents.FLAGS.GUILDS, 
        Discord.Intents.FLAGS.GUILD_MESSAGES, 
        Discord.Intents.FLAGS.DIRECT_MESSAGES, 
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ], partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

    client.on('ready', () => {
        console.log('Bot Online');
        
        if (client.user)
            client.user.setActivity(`/help for info`);
    });
    
    (['isCommand', 'isButton', 'isSelectMenu'] as ValidatorType[]).forEach(type => {
        const handler = new InteractionHandler(type);
        client.on('interactionCreate', (interaction) => { handler.handle(interaction) });
    });
    
    const handleReactions: (reaction: Discord.MessageReaction | Discord.PartialMessageReaction) => Promise<void> = require('$handlers/handleReaction/handleReactions').handleReactions;
    
    client.on('messageReactionAdd', handleReactions);
    client.on('messageReactionRemove', handleReactions);

    client.login(token);
})();
