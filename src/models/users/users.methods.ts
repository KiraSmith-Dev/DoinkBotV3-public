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
    
    if (amount % 1 !== 0)
        return await interaction.replyError(`You can't spend a fraction of a Doink Coin`);
    
    if (amount < 1)
        return await interaction.replyError(`You can't spend less than 1 Doink Coin`);
    
    if (this.coins < amount)
        return await interaction.replyError(`${userText} can't afford to spend that much`);
    
    if (await this.isInPokerGame())
        return await interaction.replyError(`${userText} can't spend coins while in a poker game`);
    
    return true;
}
