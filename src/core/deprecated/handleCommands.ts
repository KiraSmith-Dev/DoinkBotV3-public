import * as config from '$config';
import { Interaction } from "discord.js";
import { useTryAsync } from 'no-try';
import { commands } from '$core/loadCommands';
import handleInteractionError from '$core/handleInteractionError';

export default async (interaction: Interaction) => {
    if (!interaction.isCommand())
        return;
        
    if (!config.devIDs.includes(interaction.user.id) && config.devOnlyMode) {
        useTryAsync(() => interaction.reply({ content: 'Currently only usable by dev (int3nse). Lmao get trolled', ephemeral: true }));
        return;
    }
    
    if (!commands) {
        useTryAsync(() => {
            interaction.reply({ content: 'Interaction happened before commands were loaded <@243512754541953024>' });
            throw Error('Interaction happened before commands were loaded');
        });
        return;
    }
    
    const command = commands.get(interaction.commandName);
    if (!command) {
        useTryAsync(() => {
            interaction.reply({ content: 'Something went really wrong... <@243512754541953024>' });
            throw Error('Command definition missing');
        });
        return;
    }
    
    const [err, res] = await useTryAsync(() => command.handlers.execute(interaction));
    if (await handleInteractionError(err, command, interaction))
        return;
    
    //interaction.deferReply({ ephemeral: command.ephemeral });
    
    const [err2, res2] = await useTryAsync(() => command.handlers.execute(interaction));
    
    await handleInteractionError(err2, command, interaction);
};
