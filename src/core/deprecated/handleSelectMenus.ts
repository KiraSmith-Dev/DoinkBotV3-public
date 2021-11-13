import * as config from '$config';
import { Interaction } from "discord.js";
import { useTryAsync } from 'no-try';
import { commands } from '$core/loadCommands';
import handleInteractionError from '$core/handleInteractionError';

export default async (interaction: Interaction) => {
    if (!interaction.isSelectMenu())
        return;
    
    if (interaction.customId === 'disabled')
        return;
    
    if (!config.devIDs.includes(interaction.user.id) && config.devOnlyMode) {
        useTryAsync(() => interaction.reply({ content: 'Currently only usable by dev (int3nse). Lmao get trolled', ephemeral: true }));
        return;
    }
    
    let args = interaction.customId.split(':');
    if (args.length < 2) {
        useTryAsync(() => interaction.reply({ content: 'Invalid select menu (Malformed)', ephemeral: true }));
        return;
    }
    
    let [ cmdName, selectName ] = args.splice(0, 2);
    
    if (!cmdName || !selectName || !commands)
        return;
    
    const command = commands.get(cmdName);
    if (!command || !command.selectMenus) {
        useTryAsync(() => interaction.reply({ content: 'Invalid select menu (Not found)', ephemeral: true }));
        return;
    }
    
    let execute = command.selectMenus[selectName]?.execute;
    
    if (typeof execute != 'function') {
        useTryAsync(() => interaction.reply({ content: 'Invalid select menu (Not implemented)', ephemeral: true }));
        return;
    }
    
    //if (command.shouldDefer)
    //    interaction.deferReply({ ephemeral: command.ephemeral });
    
    const [err, res] = await useTryAsync(async () => {
        if (typeof execute == 'function') return execute(interaction, ...args);
    });
    
    await handleInteractionError(err, command, interaction);
};
