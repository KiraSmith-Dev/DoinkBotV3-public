import { getImage } from './cards';
import { Canvas, createCanvas, NodeCanvasRenderingContext2D } from 'canvas';
import { trimTransparency } from '$modules/canvasUtil';

const displayCardWidth = 100;
const displayCardHeight = Math.round(1056 * (displayCardWidth / 691));
const displayCardPadding = 10;
//const displayCardTotalSpace = displayCardWidth + displayCardPadding;

const amountToRotate = (60 / 4);
const widthRotationPadding = displayCardWidth / 3;
const centerXY = 200;

function degToRad(degrees: number) {
    return degrees * Math.PI / 180;
}

function rotateAtPoint(ctx: NodeCanvasRenderingContext2D, x: number, y: number, degrees: number) {
    ctx.translate(x, y)
    ctx.rotate(degToRad(degrees));
    ctx.translate(x * -1, y * -1);
}

export async function generateHandFanCanvas(cards: string[]): Promise<Canvas> {
    const canvas = createCanvas(centerXY * 2, centerXY * 2);
	const ctx = canvas.getContext('2d');
	
    const totalRotation = (cards.length - 1) * amountToRotate;
    
    rotateAtPoint(ctx, centerXY, centerXY, (totalRotation / 2) * -1);
    
	for (let i = 0; i < cards.length; i++) {
		let card = cards[i];
		
		if (!card)
			throw 'Invalid card when generating image'; // Should never happen at runtime because of typescript checks
		
        ctx.save();
        
        rotateAtPoint(ctx, centerXY, centerXY, i  * amountToRotate);
        //ctx.translate(displayCardWidth * -1, displayCardHeight * -1);
        
		ctx.drawImage(await getImage(card), centerXY - displayCardWidth + widthRotationPadding + ((i / 4) * (displayCardWidth - (widthRotationPadding * 2))), centerXY - displayCardHeight + (displayCardHeight / 12), displayCardWidth, displayCardHeight);
        
        ctx.restore();
	}
	
    trimTransparency(ctx);
    
    return canvas;
}

export default async function (cards: string[]): Promise<Buffer> {
    return (await generateHandFanCanvas(cards)).toBuffer();
}
