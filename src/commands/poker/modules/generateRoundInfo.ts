import { Canvas, createCanvas } from 'canvas';
import { PokerBettingPlayer } from './pokerBettingRound';
import { PokerRound } from './pokerRound';

const displayWidth = 1200;
const displayHeight = 300;
const displayPadding = 10;
const displayTotalSpace = displayWidth + displayPadding;
const displayTextPadding = 30;

export async function generateRoundInfoCanvas(round: PokerRound): Promise<Canvas> {
	const canvas = createCanvas((displayTotalSpace) - displayPadding, displayHeight);
	const ctx = canvas.getContext('2d');
	
	ctx.font = '72px Arial';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    let padding = 0;
    function drawLabel(text: string) {
        ctx.fillText(text, canvas.width/2, padding, canvas.width);
        ctx.strokeText(text, canvas.width/2, padding, canvas.width);
        
        let metrics = ctx.measureText(text);
        padding += metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + displayTextPadding; // text height + padding
    }
    
    let currentDealer = round.baseGame.players[round.baseGame.dealerButtonIndex];
        
    if (!currentDealer)
        throw `currentDealer didn't exist while generating status message`;
    
    let currentActionUser = round.baseGame.players[round.baseGame.getRound().currentActionIndex];
    
    if (!currentActionUser)
        throw `currentActionUser didn't exist while generating status message`;
    
    drawLabel(`Poker Game`);
    drawLabel(`Dealer: ${currentDealer.username}`);
    drawLabel(`Current Turn: ${currentActionUser.username}`);
	
    return canvas;
}

export default async function (round: PokerRound): Promise<Buffer> {
    return (await generateRoundInfoCanvas(round)).toBuffer();
}
