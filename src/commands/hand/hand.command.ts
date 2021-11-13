import { CommandInteraction, MessageActionRow, MessageAttachment, MessageButton, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Dealer, cardsToSolveFormat } from '$commands/poker/modules/cards';
import { generateHandCanvas } from '$commands/poker/modules/generateHandImage';
import { createCanvas, loadImage } from 'canvas';
import pathAlias from 'path-alias';

export const data = new SlashCommandBuilder()
		.setName('hand')
		.setDescription('Generate and show a poker hand');

const dealer = new Dealer();

const pokerTableImage = loadImage(pathAlias.resolve('$resources/cards/PokerTable.png'));

export async function execute(interaction: CommandInteraction) {
	await interaction.deferReply();
	
	const cards = cardsToSolveFormat(dealer.shuffle().draw(5));
	
	const canvas = createCanvas(2560, 1440);
	const ctx = canvas.getContext('2d');
	
	ctx.drawImage(await pokerTableImage, 0, 0);
	
	const handCanvas = await generateHandCanvas(cards);
	
	ctx.drawImage(await generateHandCanvas(cards), (2560/2) - (handCanvas.width/2), (1440/2) - (handCanvas.height/2));
	
	const attachment = new MessageAttachment(canvas.toBuffer(), 'image.png');
	const embed = new MessageEmbed()
			.setImage(`https://media.discordapp.net/attachments/894032349468168203/906289929322127410/image.png?width=1618&height=910`);
			
	const button = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId(`hand:update`)
				.setLabel('Update')
				.setStyle('PRIMARY')
		);
	
	await interaction.editReply({ embeds: [embed], components: [button] });
	/*
	await interaction.reply({
		files: [ canvas.toBuffer() ],
		ephemeral: true
	});
	*/
}
