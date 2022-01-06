import mongoose from 'mongoose';
import { databaseURL } from '$config'

export async function connectToDB() {
    console.log('Connecting with mongoose...');
    await mongoose.connect(`${databaseURL}`);
    console.log('Mongoose connected');
}
