import { IUserDocument, IUserModel } from './users.types';

export async function findOneOrCreate(this: IUserModel, userId: string): Promise<IUserDocument> {
    const record = await this.findOne({ userId });
    
    return record ? record : this.create({ userId });
}

export async function findByAge(this: IUserModel, min?: number, max?: number): Promise<IUserDocument[]> {
    return this.find({ age: { $gte: min || 0, $lte: max || Infinity } });
}
