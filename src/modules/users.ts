import { getDB } from '$modules/database';
import { User } from 'discord.js';
import { Document, FindCursor } from 'mongodb';
import { DataUser } from './dataTypes';
const db = getDB();
const users = db.collection('users');
const pokerGames = db.collection('pokerGames');

export async function tryModifyBalance(id: string, amount: number) : Promise<void> {
    let pokerGameCount = await pokerGames.countDocuments({ playerIDs: id }, { limit: 1 });
    
    if (pokerGameCount !== 0)
        throw 'Tried to modifiy balance while in a poker game';
    
    await users.updateOne({ id: id }, { $inc: { coins: amount }, $set: { id: id } }, { upsert: true });
}

export async function modifyBalance(id: string, amount: number): Promise<void> {
    await users.updateOne({ id: id }, { $inc: { coins: amount }, $set: { id: id } }, { upsert: true });
}

export async function getBalance(id: string): Promise<number> {
    let user = await users.findOne({ id: id });
    
    if (!user)
        return 0;
    
    return user.coins;
}

export async function getAllUsers(): Promise<DataUser[]> {
    //const allUserDocs = await users.find().toArray() as DataUser[];
    
    //return allUserDocs;
}