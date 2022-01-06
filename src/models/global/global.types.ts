import { Document, Model } from 'mongoose';

export interface GlobalDocument extends Document {}

export interface GlobalModel<T> extends Model<T> {
    findOneOrCreate: (
        {
        firstName,
        lastName,
        age,
        }: { firstName: string; lastName: string; age: number }
    ) => Promise<T>;
}
