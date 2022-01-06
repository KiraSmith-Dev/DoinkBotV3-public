import { GlobalModel } from './global.types';

export async function findOneOrCreate<T>(this: GlobalModel<T>, uid: string): Promise<T> {
    const record = await this.findOne({ uid: uid });
    return record ? record : this.create({ uid: uid });
}
