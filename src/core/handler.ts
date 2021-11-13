import { ButtonInteraction, CommandInteraction, Interaction, InteractionReplyOptions, InteractionUpdateOptions, SelectMenuInteraction } from 'discord.js';
import * as config from '$config';
import { useTryAsync } from 'no-try';
import { commands } from '$core/loadCommands';
import { CBase, Command, XInteractionFactory } from '$core/coreTypes';
import handleInteractionError from '$core/handleInteractionError';

export type ValidatorType = 'isCommand' | 'isButton' | 'isSelectMenu';

export default class InteractionHandler<T> {
    validator: ValidatorType;
    
    constructor(validator: ValidatorType) {
        this.validator = validator;
    }
    
    async #tryUseHandler(handler: (interaction: unknown, ...args: String[]) => Promise<void> | Promise<boolean>, command: Command, interaction: CommandInteraction | ButtonInteraction | SelectMenuInteraction, args: string[]): Promise<[boolean, boolean]> {
        const [err, res] = await useTryAsync(async () => {
            if (typeof handler != 'function') {
                useTryAsync(() => interaction.reply({ content: 'Invalid interaction (Not implemented)', ephemeral: true }));
                return false;
            }
            
            return ((await handler(interaction, ...args)) ? true : false);
        });
        
        return [await handleInteractionError(err, command, interaction), res];
    }
    
    async #executeFromBase(handlers: CBase<any>, command: Command, interaction: CommandInteraction | ButtonInteraction | SelectMenuInteraction, args: string[]): Promise<void> {
        if (!handlers.options.skipValidate) {
            const [err, res] = await this.#tryUseHandler(handlers.validate, command, interaction, args);
            // We can assume validate() handled sending an error msg to the user if the validation check failed
            if (err || !res)
                return;
        }
        
        const options: InteractionReplyOptions = { ephemeral: handlers.options.ephemeral };
        await (!interaction.isCommand() && handlers.options.isUpdate ? interaction.deferUpdate : interaction.deferReply).apply(interaction, [options]);
        
        await this.#tryUseHandler(handlers.execute, command, interaction, args);
    }
    
    async handle(interaction: Interaction) {
        if ((!interaction.isCommand() && !interaction.isButton() && !interaction.isSelectMenu()) || !interaction[this.validator]())
            return;
        
        if (!interaction.isCommand() && interaction.customId === 'disabled')
            return;
        
        if (!config.devIDs.includes(interaction.user.id) && config.devOnlyMode)
            return useTryAsync(() => interaction.reply({ content: 'Currently only usable by dev (int3nse). Lmao get trolled', ephemeral: true }));
        
        if (!commands)
            return useTryAsync(() => {
                console.error(Error('Interaction happened before commands were loaded'));
                return interaction.reply({ content: 'Interaction happened before commands were loaded <@243512754541953024>' });
            });
        
        if (interaction.isCommand()) {
            const command = commands.get(interaction.commandName);
            
            if (!command)
                return useTryAsync(() => interaction.reply({ content: 'Invalid interaction (Not found)', ephemeral: true }));
            
            return this.#executeFromBase(command.handlers, command, XInteractionFactory(interaction.commandName, interaction), []);
        }
        
        const args = interaction.customId.split(':');
        if (args.length < 2)
            return useTryAsync(() => interaction.reply({ content: 'Invalid interaction (Malformed)', ephemeral: true }));
        
        let [ cmdName, subName ] = args.splice(0, 2);
        
        if (!cmdName || !subName || !commands)
            return;
        
        const command = commands.get(cmdName);
        if (!command || !command.buttons)
            return useTryAsync(() => interaction.reply({ content: 'Invalid interaction (Not found)', ephemeral: true }));
        
        const list = command[interaction.isButton() ? 'buttons' : 'selectMenus'];
        
        if (!list)
            return useTryAsync(() => {
                console.error(Error('List missing'));
                return interaction.reply({ content: 'Something went really wrong... <@243512754541953024>' });
            });
        
        const handlers = list[subName];
        
        if (!handlers)
            return useTryAsync(async () => {
                console.error(Error('Handlers missing'));
                return interaction.reply({ content: 'Something went really wrong... <@243512754541953024>' });
            });
        
        this.#executeFromBase(handlers, command, XInteractionFactory(cmdName, interaction), args);
    }
}
