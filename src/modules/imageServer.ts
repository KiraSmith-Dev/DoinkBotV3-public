import express from 'express';
import { getDB } from '$modules/rawDatabase';
import * as config from '$config';
import { Binary, ObjectId } from 'bson';
import { useTryAsync } from 'no-try';

export function listen(): Promise<void> {
    const app = express();
    
    const db = getDB();
    const images = db.collection('images');
    
    app.get('*', async (req, res) => {
        useTryAsync(async () => {
            const image = (await images.findOne({ _id: ObjectId.createFromHexString(req.url.substr(1)) }));
            //const doc = image.value as { data: Binary } | null;
            const doc = image as { data: Binary } | null;
            
            if (//!image.ok || 
            !doc)
                return res.end();
            
            res.type('image/png');
            res.send(doc.data.buffer);
        });
    });
    
    return new Promise<void>(resolve => {
        app.listen(config.imageServerPort, () => {
            console.log(`Image server listening at http://localhost:${config.imageServerPort}`);
            resolve();
        });
    });
}

export async function store(data: Buffer): Promise<string> {
    const db = getDB();
    const images = db.collection('images');
    
    return `${config.imageServerURL}:${config.imageServerPort}/` + (await images.insertOne({ data: data })).insertedId.toHexString();
}
