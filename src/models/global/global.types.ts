import { Document, Model } from 'mongoose';

export interface GlobalDocument extends Document {}

export interface GlobalModel<T> extends Model<T> {
    findOneOrCreate: (uid: string) => Promise<T>;
}
