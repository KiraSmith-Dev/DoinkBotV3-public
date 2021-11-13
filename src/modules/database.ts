import { Db, MongoClient } from 'mongodb';
import { databaseURL, databaseName } from '$config'

let db: Db | null = null;

export async function connectToDB() {
    db = (await MongoClient.connect(databaseURL)).db(databaseName);
    
    return db;
}

export function getDB() {
    if (!db)
        throw Error('Tried to get DB before initilizing');
    
    return db;
}
