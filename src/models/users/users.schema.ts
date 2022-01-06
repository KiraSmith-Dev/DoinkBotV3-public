import { Schema } from 'mongoose';
import * as statics from './users.statics';
import * as methods from './users.methods';

const UserSchema = new Schema({
    firstName: String,
    lastName: String,
    age: Number,
    dateOfEntry: {
        type: Date,
        default: new Date()
    },
    lastUpdated: {
        type: Date,
        default: new Date()
    }
});

Object.assign(UserSchema.statics, statics);
Object.assign(UserSchema.methods, methods);

export default UserSchema;