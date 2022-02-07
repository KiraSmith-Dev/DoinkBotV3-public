import { XButtonInteraction, XCommandInteraction, XSelectMenuInteraction } from '$core/coreTypes';
import { GlobalModel, GlobalDocument } from '$models/global/global.types';

export interface IReaction {
    name: string,
    ids: string[]
}

export interface IMessage {
    uid: string,
    author: string,
    channel: string,
    goldGivers: string[],
    reactions: IReaction[],
    timestamp: number,
    totalDownvotes: number,
    totalGold: number,
    totalHearts: number,
    invalid?: boolean
}

export interface IMessageDocument extends IMessage, GlobalDocument {}

export interface IMessageModel extends GlobalModel<IMessageDocument> {}
