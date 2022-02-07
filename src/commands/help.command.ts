import { SlashCommandBuilder } from '@discordjs/builders';
import { XCommandInteraction, XOptions } from '$core/coreTypes';
import pathAlias from 'path-alias';
import recursiveReaddir from 'recursive-readdir';
import { embed } from '$modules/embedUtil';

export const data = new SlashCommandBuilder()
	.setName('help')
	.setDescription('Lists all commands');

export const options: XOptions = {
	ephemeral: true,
	skipValidate: true
};

let commands: null | SlashCommandBuilder[] = null;

export async function execute(interaction: XCommandInteraction) {
	if (!commands)
        commands = (await recursiveReaddir(pathAlias.resolve('$commands')))
		.filter(file => file.endsWith('.command.js'))
		.map(commandFile => require(commandFile)?.data)
		.filter(data => data) // Remove falsy/undefined data
		.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);  // Alphabetical sort by name
    
	let embedFields = commands.map(cmd => ({
		name: `/${cmd.name[0]?.toUpperCase()}${cmd.name.slice(1)}`,
		value: cmd.description
	}));
	
	const msgEmbed = embed('Commands', embedFields);
	await interaction.editReply({ embeds: [msgEmbed], components: [] });
}
