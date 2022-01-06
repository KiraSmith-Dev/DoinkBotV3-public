import { Document } from 'mongoose';
import { IUserDocument, IUserModel } from './users.types';

export async function setLastUpdated(this: IUserDocument): Promise<void> {
	const now = new Date();
	if (!this.lastUpdated || this.lastUpdated < now) {
		this.lastUpdated = now;
		await this.save();
	}
}

export async function sameLastName(this: IUserDocument): Promise<Document[]> {
    const UserModel = this.constructor as IUserModel;
    return UserModel.find({ lastName: this.lastName });
}
