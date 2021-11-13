import { ButtonInteraction, MessagePayload } from 'discord.js';

import { CommandInteraction, MessageActionRow, MessageAttachment, MessageButton, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Dealer, cardsToSolveFormat } from '$commands/poker/modules/cards';
import { generateHandCanvas } from '$root/commands/poker/modules/generateHandImage';
import { createCanvas, loadImage } from 'canvas';
import pathAlias from 'path-alias';
import { randomString } from '$modules/random';
import { store } from '$modules/imageServer';
import { getDB } from '$modules/database';
import { XButtonInteraction } from '$root/core/coreTypes';

const db = getDB();
const images = db.collection('images');

const dealer = new Dealer();

const pokerTableImage = loadImage(pathAlias.resolve('$resources/cards/PokerTable.png'));

export async function validate(interaction: ButtonInteraction): Promise<boolean> {
    return true;
}

export default async function (interaction: XButtonInteraction) {
    await interaction.deferUpdate();
    
    const cards = cardsToSolveFormat(dealer.reset().shuffle().draw(5));
    
    const canvas = createCanvas(1280, 720);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(await pokerTableImage, 0, 0, canvas.width, canvas.height);
    
    const handCanvas = await generateHandCanvas(cards);
    
    ctx.drawImage(handCanvas, (canvas.width/2) - (handCanvas.width/2), (canvas.height/2) - (handCanvas.height/2));
    
    const url = await store(canvas.toBuffer('image/png'));
    const embed = new MessageEmbed()
            .setImage(url);
    
    const button = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId(`hand:update`)
                .setLabel('Update')
                .setStyle('PRIMARY')
        );
    
    await interaction.editReply({ embeds: [embed], components: [button] });
}
