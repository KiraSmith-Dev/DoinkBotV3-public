import { Document } from 'mongoose';
import { IUserDocument, IUserModel } from './users.types';

// Legacy imports to interact with poker
import { getDB } from '$modules/rawDatabase';
const db = getDB();
const pokerGames = db.collection('pokerGames');

export async function forceAddToBalance(this: IUserDocument, amount: number): Promise<IUserDocument> {
    this.coins ? this.coins += amount : this.coins = amount;

    return this.save();
}

export async function addToBalance(this: IUserDocument, amount: number): Promise<IUserDocument> {
    let pokerGameCount = await pokerGames.countDocuments({ playerIDs: this.uid }, { limit: 1 });
    
    if (pokerGameCount !== 0)
        throw 'Tried to modifiy balance while in a poker game';
    
    return this.forceAddToBalance(amount);
}
