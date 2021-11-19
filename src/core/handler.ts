import { Interaction, InteractionReplyOptions } from 'discord.js';
import * as config from '$config';
import { useTryAsync } from 'no-try';
import { commands } from '$core/loadCommands';
import { XBase, XInteractionFactory, XCommandInteraction, XButtonInteraction, XSelectMenuInteraction } from '$core/coreTypes';

export type ValidatorType = 'isCommand' | 'isButton' | 'isSelectMenu';

export default class InteractionHandler<T> {
    validator: ValidatorType;
    
    constructor(validator: ValidatorType) {
        this.validator = validator;
    }
    
    async #tryUseHandler(handler: (interaction: unknown, ...args: String[]) => Promise<void> | Promise<boolean>, interaction: XCommandInteraction | XButtonInteraction | XSelectMenuInteraction, args: string[]): Promise<[boolean, boolean]> {
        const [err, res] = await useTryAsync(async () => {
            if (typeof handler != 'function') {
                await interaction.deleteDeferReplyOrFollowUp('Invalid interaction (Not implemented)', 'error');
                return false;
            }
            
            return ((await handler(interaction, ...args)) ? true : false);
        });
        
        if (!err)
            return [false, res];
        
        console.error(err);
        await interaction.deleteDeferReplyOrFollowUp('There was an error while executing your interaction', 'error');
        
        return [true, res];
    }
    
    async #executeFromBase(handlers: XBase<any>, interaction: XCommandInteraction | XButtonInteraction | XSelectMenuInteraction, args: string[]): Promise<void> {
        if (!handlers.options.skipValidate) {
            const [err, res] = await this.#tryUseHandler(handlers.validate, interaction, args);
            // If the validation check failed, we can give a default error if one hasn't already been sent
            if (err || !res) {
                if (err) {
                    console.error(err);
                    await useTryAsync(() => interaction.replyError('Interaction failed (Error)'));
                }
                
                if (!interaction.replied)
                    await useTryAsync(() => interaction.replyError('Interaction failed (Invalid input)'));
                
                return;
            }
        }
        
        const options: InteractionReplyOptions = { ephemeral: handlers.options.ephemeral };
        await (!interaction.isCommand() && handlers.options.isUpdate ? interaction.deferUpdate : interaction.deferReply).apply(interaction, [options]);
        
        await this.#tryUseHandler(handlers.execute, interaction, args);
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
            
            return this.#executeFromBase(command.handlers, XInteractionFactory(interaction.commandName, interaction, command.handlers.options), []);
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
        
        this.#executeFromBase(handlers, XInteractionFactory(cmdName, interaction, handlers.options), args);
    }
}
