import { FilterQuery } from 'mongoose';
import { GlobalModel } from './global.types';

export async function findOneOrCreate<T>(this: GlobalModel<T>, query: FilterQuery<T>): Promise<T> {
    const record = await this.findOne(query);
    return record ? record : this.create(query);
}
