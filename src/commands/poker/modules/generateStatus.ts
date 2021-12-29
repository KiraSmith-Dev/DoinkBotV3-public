import { Canvas, createCanvas } from 'canvas';
import { generateHandCanvas } from './generateHandImage';
import { generatePlayerInfoCanvas } from './generatePlayerInfo';
import { generateRoundInfoCanvas } from './generateRoundInfo';
import { PokerRound } from './pokerRound';

export async function generateStatusCanvas(round: PokerRound): Promise<Canvas> {
    let gameInfoCanvas = await generateRoundInfoCanvas(round);
    let playerInfoCanvasArr = await Promise.all(round.roundPlayers.map(roundPlayer => generatePlayerInfoCanvas(round.bettingRound.getPlayer(roundPlayer.id))));
    
    let canvasWidth = Math.max(playerInfoCanvasArr.map(canvas => canvas.width).reduce((prev, cur) => prev + cur), gameInfoCanvas.width);
    
	const canvas = createCanvas(canvasWidth, gameInfoCanvas.height + (playerInfoCanvasArr[0]?.height ?? 0));
	const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    let handCanvas = await generateHandCanvas(round.cardRound.communityCards);
    ctx.drawImage(handCanvas, canvas.width/2 - handCanvas.width/2, canvas.height/2 - handCanvas.height/2);
    
    ctx.drawImage(gameInfoCanvas, 0, 0);
    
    let xPos = 0;
    for (let i = 0; i < playerInfoCanvasArr.length; i++) {
        const infoCanvas = playerInfoCanvasArr[i];
        
        if (!infoCanvas)
            continue;
        
        ctx.drawImage(infoCanvas, xPos, gameInfoCanvas.height);
        xPos += infoCanvas.width * ((i == 0) ? 2 : 1);
    }
	
    return canvas;
}

export default async function (round: PokerRound): Promise<Buffer> {
    return (await generateStatusCanvas(round)).toBuffer();
}
