import mongoose from 'mongoose';
import { databaseURL } from '$config'

export async function connectToDB() {
    await mongoose.connect(`${databaseURL}}`);
}
