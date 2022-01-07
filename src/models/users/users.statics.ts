import { IUserDocument, IUserModel } from './users.types';

export async function findOneOrCreate<T>(this: IUserModel, uid: string): Promise<IUserDocument> {
    const record = await this.findOne({ uid: uid });
    return record ? record : this.create({ uid: uid });
}
