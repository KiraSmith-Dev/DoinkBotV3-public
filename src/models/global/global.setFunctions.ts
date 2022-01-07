import { Schema } from 'mongoose';
import * as globalStatics from '$models/global/global.statics'
import * as globalMethods from '$models/global/global.methods'

export default function setFunctions(schema: Schema, statics: any, methods: any) {
    Object.assign(schema.statics, globalStatics, statics);
    Object.assign(schema.methods, globalMethods, methods);
}
