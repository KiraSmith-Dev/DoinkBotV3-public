import { XButtonInteraction, XCommandInteraction, XSelectMenuInteraction } from '$core/coreTypes';
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
    isInPokerGame: (this: IUserDocument) => Promise<boolean>;
    /*forceAddToBalance: (this: IUserDocument, amount: number) => Promise<IUserDocument>;*/
    addToBalance: (this: IUserDocument, amount: number) => Promise<IUserDocument>;
    validateCoins: (this: IUserDocument, interaction: XCommandInteraction | XButtonInteraction | XSelectMenuInteraction, amount: number, userText: string) => Promise<boolean>;
    canGiveGold(this: IUserDocument): Promise<boolean>;
}

export interface IUserModel extends Omit<GlobalModel<IUserDocument>, 'findOneOrCreate'> {
    findOneOrCreate: (uid: string) => Promise<IUserDocument>;
}
