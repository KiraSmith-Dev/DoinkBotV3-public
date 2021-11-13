import * as config from '$config';
import { Interaction } from "discord.js";
import { useTryAsync } from 'no-try';
import { commands } from '$core/loadCommands';
import handleInteractionError from '$core/handleInteractionError';

export default async (interaction: Interaction) => {
    if (!interaction.isButton())
        return;
    
    if (interaction.customId === 'disabled')
        return;
    
    if (!config.devIDs.includes(interaction.user.id) && config.devOnlyMode) {
        useTryAsync(() => interaction.reply({ content: 'Currently only usable by dev (int3nse). Lmao get trolled', ephemeral: true }));
        return;
    }
    
    let args = interaction.customId.split(':');
    if (args.length < 2) {
        useTryAsync(() => interaction.reply({ content: 'Invalid button (Malformed)', ephemeral: true }));
        return;
    }
    
    let [ cmdName, btnName ] = args.splice(0, 2);
    
    if (!cmdName || !btnName || !commands)
        return;
    
    const command = commands.get(cmdName);
    if (!command || !command.buttons) {
        useTryAsync(() => interaction.reply({ content: 'Invalid button (Not found)', ephemeral: true }));
        return;
    }
    
    //if (command.shouldDefer)
    //    interaction.deferReply({ ephemeral: command.ephemeral });
    
    const validate = command.buttons[btnName]?.validate;
    const execute = command.buttons[btnName]?.execute;
    
    const [err, res] = await useTryAsync(async () => {
        if (typeof execute != 'function') {
            useTryAsync(() => interaction.reply({ content: 'Invalid button (Not implemented)', ephemeral: true }));
            return;
        }
        
        return execute(interaction, ...args);
    });
    
    await handleInteractionError(err, command, interaction);
};
