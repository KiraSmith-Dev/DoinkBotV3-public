import { MessageEmbed } from 'discord.js';
import { PokerGame } from '$commands/poker/modules/pokerGame';
import { generateHandFanCanvas } from '$commands/poker/modules/generateHandFan';
import { XButtonInteraction, XOptions } from '$core/coreTypes';
import { createCanvas, loadImage } from 'canvas';
import { store } from '$modules/imageServer';
import pathAlias from 'path-alias';

export const options: XOptions = {
    ephemeral: true
}

export async function validate(interaction: XButtonInteraction, gameID: string): Promise<boolean> {
    const pokerGame = await PokerGame.getFromDatabase(gameID);
    
    if (!pokerGame)
        return interaction.replyError(`Failed: Poker game not found. Did it expire?`);
    
    if (!pokerGame.playerIDs.includes(interaction.user.id))
        return interaction.replyError(`Failed: You're not a part of this game`);
    
    return true;
}

const pokerTableImage = loadImage(pathAlias.resolve('$resources/cards/PokerTable.png'));

export async function execute(interaction: XButtonInteraction, gameID: string) {
    const pokerGame = await PokerGame.getFromDatabase(gameID);
    
    if (!pokerGame)
        throw `pokerGame wasn't valid`;
    
    const cards = pokerGame.getRound().cardRound.getHand(interaction.user.id).cards;
    const canvas = createCanvas(1280, 720);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(await pokerTableImage, 0, 0, canvas.width, canvas.height);
    
    const handCanvas = await generateHandFanCanvas(cards);
    //const handCanvas = await generatePlayerInfoCanvas(pokerGame.getRound().bettingRound.getPlayer(interaction.user.id));
    //const handCanvas = await generateRoundInfoCanvas(pokerGame.getRound());
    //const handCanvas = await generateStatusCanvas(pokerGame.getRound());
    
    ctx.drawImage(handCanvas, (canvas.width/2) - (handCanvas.width/2), (canvas.height/2) - (handCanvas.height/2));
    
    const url = await store(//canvas
        handCanvas
        .toBuffer('image/png')
    );
    
    const embed = new MessageEmbed()
            .setImage(url);
    
    await interaction.editReply({ embeds: [embed] });
}
