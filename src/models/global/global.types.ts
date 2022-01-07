import { Document, FilterQuery, Model } from 'mongoose';

export interface GlobalDocument extends Document {}

export interface GlobalModel<T> extends Model<T> {
    findOneOrCreate: (query: FilterQuery<T>) => Promise<T>;
}
