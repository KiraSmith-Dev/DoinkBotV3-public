import { Document } from 'mongoose';
import { IUserDocument, IUserModel } from './users.types';

// Legacy imports to interact with poker
import { getDB } from '$modules/rawDatabase';
import { XButtonInteraction, XCommandInteraction, XSelectMenuInteraction } from '$core/coreTypes';
const db = getDB();
const pokerGames = db.collection('pokerGames');

export async function isInPokerGame(this: IUserDocument): Promise<boolean> {
    return (await pokerGames.countDocuments({ playerIDs: this.uid }, { limit: 1 })) !== 0 ? true : false;
}

/*
export async function forceAddToBalance(this: IUserDocument, amount: number): Promise<IUserDocument> {
    this.coins ? this.coins += amount : this.coins = amount;

    return this.save();
}
*/

export async function addToBalance(this: IUserDocument, amount: number): Promise<IUserDocument> {
    if (await this.isInPokerGame())
        throw 'Tried to modifiy balance while in a poker game';
    
    this.coins ? this.coins += amount : this.coins = amount;

    return this.save();
}

export async function validateCoins(this: IUserDocument, interaction: XCommandInteraction | XButtonInteraction | XSelectMenuInteraction, amount: number, userText: string): Promise<boolean> {
    if (!this.coins)
        this.coins = 0;
    
    if (this.coins < amount)
        return await interaction.replyError(`${userText} can't afford to make that bet`);
    
    if (await this.isInPokerGame())
        return await interaction.replyError(`${userText} can't versus while in a poker game`);
    
    return true;
}
