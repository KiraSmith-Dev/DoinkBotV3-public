import { model } from 'mongoose';
import { IVersusDocument, IVersusModel } from './versus.types';
import VersusSchema from './versus.schema';

export const VersusModel = model<IVersusDocument>('versus', VersusSchema) as IVersusModel;
