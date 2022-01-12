import { GlobalModel, GlobalDocument } from '$models/global/global.types';
import { Date } from 'mongoose';

export interface IVersus {
    createdAt: Date;
    hostID: string;
    targetID: string;
    amount: number;
}

export interface IVersusDocument extends IVersus, GlobalDocument {}

export interface IVersusModel extends GlobalModel<IVersusDocument> {}
