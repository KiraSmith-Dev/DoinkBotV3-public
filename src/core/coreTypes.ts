import { Collection, ButtonInteraction, CommandInteraction, SelectMenuInteraction, Interaction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export type COptions = {
    isUpdate?: boolean;
    ephemeral?: boolean;
    skipValidate?: boolean;
}

export type CBase<T> = {
    validate: (interaction: T, ...args: String[]) => Promise<boolean>;
    execute: (interaction: T, ...args: String[]) => Promise<void>;
    options: COptions;
}

export type CButton = CBase<XButtonInteraction>;

export type CSelectMenu = CBase<XSelectMenuInteraction>;

export type Command = {
    handlers: CBase<XCommandInteraction>;
    buttons?: { [key: string]: CButton };
    selectMenus?: { [key: string]: CSelectMenu };
    data: SlashCommandBuilder;
}

export enum CInteractionReplyStage {
    DEFER = 'Defer',
    UPDATE = 'Update',
    EDITREPLY = 'Reply',
    FOLLOWUP = 'Follow up'
}

/*
    -- Updates --
    Defer update
    Edit Reply
    Follow Up -> Ephemeral(?)
*/
/*
    -- Replies --
    Defer reply
    Edit Reply
    Follow Up -> Ephemeral(?)
*/

/*
export class CInteraction {
    interaction: CommandInteraction | ButtonInteraction | SelectMenuInteraction;
    replyStage: CInteractionReplyStage = CInteractionReplyStage.DEFER;
    
    constructor(interaction: CommandInteraction | ButtonInteraction | SelectMenuInteraction) {
        this.interaction = interaction;
    }
}
*/

// Extended version of discord.js interactions
interface XInteraction {
    genButtonID: (buttonName: string, ...args: string[]) => string;
    replyError: (message: string) => false;
}

export interface XCommandInteraction extends CommandInteraction, XInteraction {}
export interface XButtonInteraction extends ButtonInteraction, XInteraction {}
export interface XSelectMenuInteraction extends SelectMenuInteraction, XInteraction {}

export function XInteractionFactory(commandName: string, interaction: CommandInteraction | ButtonInteraction | SelectMenuInteraction): CommandInteraction | ButtonInteraction | SelectMenuInteraction {
    const xInteraction: XInteraction = (interaction as unknown as XInteraction);
    // Usage of any since we'll cast these to XInteractions later, for now they have to stay the same for `isButton()` type calls to work...
    xInteraction.genButtonID = function (buttonName: string, ...args: string[]) {
        return `${commandName}:${buttonName}:${args.join(':')}`;
    };
    
    xInteraction.replyError = function (message: string) {
        interaction.reply({ content: message, ephemeral: true });
        return false;
    };
    
    return interaction;
}
