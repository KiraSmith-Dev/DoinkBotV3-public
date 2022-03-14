import { Schema } from 'mongoose';
//import * as statics from './messages.statics';
//import * as methods from './messages.methods';
import setFunctions from '$models/global/global.setFunctions';

const MessageSchema = new Schema({
    uid: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    channel: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Number,
        required: true
    },
    reactions: {
        type: [{ 
            name: { 
                type: String,
                required: true
            }, 
            ids: { 
                type: [String],
                required: true
            } 
        }],
        required: true
    },
    goldGivers: {
        type: [String]
    },
    totalGold: {
        type: Number,
        required: true
    },
    totalHearts: {
        type: Number,
        required: true
    },
    totalDownvotes: {
        type: Number,
        required: true
    },
    invalid: Boolean
});

setFunctions(MessageSchema, false, false);

export default MessageSchema;
