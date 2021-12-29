import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { XOptions } from '$root/core/coreTypes';
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

export async function execute(interaction: CommandInteraction) {
	if (!commands)
        commands = (await recursiveReaddir(pathAlias.resolve('$commands'))).filter(file => file.endsWith('.command.js')).map(commandFile => require(commandFile)?.data).filter(data => data);
    
    commands.forEach(console.log);
}
