import { getImage } from './cards';
import { Canvas, createCanvas } from 'canvas';

const displayCardWidth = 100;
const displayCardHeight = Math.round(1056 * (displayCardWidth / 691));
const displayCardPadding = 10;
const displayCardTotalSpace = displayCardWidth + displayCardPadding;

export async function generateHandCanvas(cards: string[]): Promise<Canvas> {
	const canvas = createCanvas((displayCardTotalSpace * cards.length) - displayCardPadding, displayCardHeight);
	const ctx = canvas.getContext('2d');
	
	for (let i = 0; i < cards.length; i++) {
		let card = cards[i];
		
		if (!card)
			throw 'Invalid card when generating image'; // Show never happen at runtime because of typescript checks
		
		ctx.drawImage(await getImage(card), i * displayCardTotalSpace, 0, displayCardWidth, displayCardHeight);
	}
	
    return canvas;
}

export default async function (cards: string[]): Promise<Buffer> {
    return (await generateHandCanvas(cards)).toBuffer();
}
