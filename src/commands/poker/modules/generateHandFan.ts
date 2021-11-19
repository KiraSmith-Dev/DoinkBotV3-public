import { getImage } from './cards';
import { Canvas, createCanvas } from 'canvas';

const displayCardWidth = 100;
const displayCardHeight = Math.round(1056 * (displayCardWidth / 691));
const displayCardPadding = 10;
const displayCardTotalSpace = displayCardWidth + displayCardPadding;

function degToRad(degrees: number) {
    return degrees * Math.PI / 180;
}

export async function generateHandFanCanvas(cards: string[]): Promise<Canvas> {
	const canvas = createCanvas((displayCardTotalSpace * cards.length) - displayCardPadding, displayCardHeight);
	const ctx = canvas.getContext('2d');
	
    const amountToRotate = (90 / 4);
    const totalRotation = (cards.length - 1) * amountToRotate;
    
    ctx.rotate(degToRad((totalRotation / 2) * -1));
    
	for (let i = 0; i < cards.length; i++) {
		let card = cards[i];
		
		if (!card)
			throw 'Invalid card when generating image'; // Should never happen at runtime because of typescript checks
		
		ctx.drawImage(await getImage(card), i * displayCardTotalSpace, 0, displayCardWidth, displayCardHeight);
        ctx.rotate(degToRad(amountToRotate));
	}
	
    return canvas;
}

export default async function (cards: string[]): Promise<Buffer> {
    return (await generateHandFanCanvas(cards)).toBuffer();
}
