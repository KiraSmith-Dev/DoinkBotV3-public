(async () => {
	const pathAlias = require('path-alias/register');
	const { REST } = require('@discordjs/rest');
	const { Routes } = require('discord-api-types/v9');
	const { token } = require('$config');
	const recursiveReaddir = require("recursive-readdir");
	
	const clientId = '587375232403111936';
	
	const commands = [];
	const commandFiles = (await recursiveReaddir(pathAlias.resolve('$commands'))).filter(file => file.endsWith('.command.js'));
	
	for (const file of commandFiles) {
		const command = require(file);
		commands.push(command.data.toJSON());
	}
	
	const rest = new REST({ version: '9' }).setToken(token);
	
	try {
		console.log('Started refreshing application (/) commands.');
		
		await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);
		
		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();
