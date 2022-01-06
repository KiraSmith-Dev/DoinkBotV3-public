import { Schema } from 'mongoose';
import * as statics from './users.statics';
import * as methods from './users.methods';
import setFunctions from '$models/global/global.setFunctions';

const UserSchema = new Schema({
    uid: {
        type: String,
        required: true
    },
    username: String,
    coins: Number,
    avatarURL: String,
    lastGoldGive: String,
    lastWeeklyClaim: String,
    lastStreakClaim: String,
    streak: Number
});

setFunctions(UserSchema, statics, methods);

export default UserSchema;
