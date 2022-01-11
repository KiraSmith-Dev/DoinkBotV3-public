import { SlashCommandBuilder } from '@discordjs/builders';
import { XCommandInteraction, XOptions } from '$core/coreTypes';
import pathAlias from 'path-alias';
import recursiveReaddir from 'recursive-readdir';

export const data = new SlashCommandBuilder()
	.setName('help')
	.setDescription('Lists all commands');

export const options: XOptions = {
	ephemeral: true,
	skipValidate: true
}

let commands: null | SlashCommandBuilder[] = null;

export async function execute(interaction: XCommandInteraction) {
	if (!commands)
        commands = (await recursiveReaddir(pathAlias.resolve('$commands'))).filter(file => file.endsWith('.command.js')).map(commandFile => require(commandFile)?.data).filter(data => data);
    
    commands.forEach(console.log);
}
