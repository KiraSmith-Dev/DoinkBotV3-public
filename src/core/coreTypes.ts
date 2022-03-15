import { ButtonInteraction, CommandInteraction, SelectMenuInteraction, InteractionReplyOptions, MessagePayload } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { embedError, embedOK } from '$modules/embedUtil';

export type XOptions = {
    isUpdate?: boolean;
    ephemeral?: boolean;
    skipValidate?: boolean;
}

export type XBase<T> = {
    validate: (interaction: T, ...args: String[]) => Promise<boolean>;
    execute: (interaction: T, ...args: String[]) => Promise<void>;
    options: XOptions;
}

export type XButton = XBase<XButtonInteraction>;

export type XSelectMenu = XBase<XSelectMenuInteraction>;

export type XCommand = {
    handlers: XBase<XCommandInteraction>;
    buttons?: { [key: string]: XButton };
    selectMenus?: { [key: string]: XSelectMenu };
    data: SlashCommandBuilder;
}

export enum XInteractionReplyStage {
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
    xOptions: XOptions;
    genButtonID: (buttonName: string, ...args: string[]) => string;
    replyError: (message: string) => Promise<false>;
    deleteDeferFollowUp: (message: string, type: 'success' | 'error') => Promise<false>;
    deleteDeferReplyOrFollowUp: (message: string, type: 'success' | 'error') => Promise<false>;
}

export interface XCommandInteraction extends CommandInteraction, XInteraction {}
export interface XButtonInteraction extends ButtonInteraction, XInteraction {}
export interface XSelectMenuInteraction extends SelectMenuInteraction, XInteraction {}

function generateSuccessMessage(message: string): InteractionReplyOptions | MessagePayload {
    return { ephemeral: true, embeds: [ embedOK(message) ] };
}

function generateErrorMessage(message: string): InteractionReplyOptions | MessagePayload {
    return { ephemeral: true, embeds: [ embedError(message) ] };
}

export function XInteractionFactory(commandName: string, interaction: CommandInteraction | ButtonInteraction | SelectMenuInteraction, xOptions: XOptions): XCommandInteraction | XButtonInteraction | XSelectMenuInteraction {
    const xInteraction: XInteraction = (interaction as unknown as XInteraction);
    
    xInteraction.xOptions = xOptions;
    
    xInteraction.genButtonID = function (buttonName: string, ...args: string[]) {
        return `${commandName}:${buttonName}:${args.join(':')}`;
    };
    
    xInteraction.replyError = async function (message: string) {
        await interaction.reply(generateErrorMessage(message));
        return false;
    };
    
    xInteraction.deleteDeferReplyOrFollowUp = async function (message: string, type: 'success' | 'error') {
        if (interaction.deferred && !xInteraction.xOptions.isUpdate && !xInteraction.xOptions.ephemeral)
            interaction.deleteReply();
        
        await ((interaction.deferred && !xInteraction.xOptions.isUpdate && xInteraction.xOptions.ephemeral) ? interaction.editReply : (interaction.replied || interaction.deferred) ? interaction.followUp : interaction.reply).apply(interaction, [type == 'success' ? generateSuccessMessage(message) : generateErrorMessage(message)]);
        
        return false;
    }
    
    xInteraction.deleteDeferFollowUp = async function (message: string, type: 'success' | 'error') {
        if (!interaction.deferred)
            throw `Interaction wasn't deferred, but deleteDeferFollowUp was called`;
        
        return xInteraction.deleteDeferReplyOrFollowUp(message, type);
    }
    
    return interaction as any;
}
