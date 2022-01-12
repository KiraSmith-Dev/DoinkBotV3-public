import { Schema } from 'mongoose';
//import * as statics from './versus.statics';
//import * as methods from './versus.methods';
import setFunctions from '$models/global/global.setFunctions';

const VersusSchema = new Schema({
    createdAt: { type: Date, expires: '15m', default: Date.now, required: true },
    hostID: { type: String, required: true },
    targetID: { type: String, required: true },
    amount: { type: Number, required: true }
});

setFunctions(VersusSchema, false, false);

export default VersusSchema;
