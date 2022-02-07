import { model } from 'mongoose';
import { IMessageDocument, IMessageModel } from './messages.types';
import MessageSchema from './messages.schema';

export const MessageModel = model<IMessageDocument>('messages', MessageSchema) as unknown as IMessageModel;
