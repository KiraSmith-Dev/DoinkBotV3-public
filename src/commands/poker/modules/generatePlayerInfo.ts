import { Canvas, createCanvas } from 'canvas';
import { PokerBettingPlayer } from './pokerBettingRound';

const displayWidth = 400;
const displayHeight = 400;
const displayPadding = 10;
const displayTotalSpace = displayWidth + displayPadding;
const displayTextPadding = 30;

export async function generatePlayerInfoCanvas(player: PokerBettingPlayer): Promise<Canvas> {
	const canvas = createCanvas((displayTotalSpace) - displayPadding, displayHeight);
	const ctx = canvas.getContext('2d');
	
	ctx.font = '48px Arial';
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
    
    drawLabel(player.roundPlayer.gamePlayer.username);
    drawLabel(`Bet: ${player.bet}`);
    drawLabel(`Balance: ${player.roundPlayer.gamePlayer.balance}`);
    drawLabel(`Folded: ${player.roundPlayer.folded ? 'Yes' : 'No'}`);
    
	
    return canvas;
}

export default async function (player: PokerBettingPlayer): Promise<Buffer> {
    return (await generatePlayerInfoCanvas(player)).toBuffer();
}
