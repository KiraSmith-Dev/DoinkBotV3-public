import { GlobalModel, GlobalDocument } from '$models/global/global.types';

export interface IUser {
    uid: string;
    username?: string;
    coins?: number;
    avatarURL?: string;
    lastGoldGive?: string;
    lastWeeklyClaim?: string;
    lastStreakClaim?: string;
    streak?: number;
}

export interface IUserDocument extends IUser, GlobalDocument {
    forceAddToBalance: (this: IUserDocument, amount: number) => Promise<IUserDocument>;
    addToBalance: (this: IUserDocument, amount: number) => Promise<IUserDocument>;
}

export interface IUserModel extends Omit<GlobalModel<IUserDocument>, 'findOneOrCreate'> {
    findOneOrCreate: (uid: string) => Promise<IUserDocument>;
}
