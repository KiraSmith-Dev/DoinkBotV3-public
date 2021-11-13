import { Collection } from 'discord.js';
import recursiveReadDir from 'recursive-readdir';
import pathAlias from 'path-alias';
import { Command, CBase } from '$core/coreTypes';

function loadInteractionFile(type: 'buttons' | 'selectMenus', commands: Collection<string, Command>, file: string): void {
    const interactionPath = file.split('\\');
    const interactionArgs = interactionPath[interactionPath.length - 1]?.split('.');
    
    if (!interactionArgs)
        throw 'Interaction args should always be defined - path may be invalid';

    if (interactionArgs.length < 4)
        throw `Invalid (Malformed) select menu file name: ${file}`;

    const [ cmdName, interactionName ] = interactionArgs;
    
    if (!cmdName || !interactionName)
        throw 'Should be impossible for cmdName || interactionName to be undefined';
    
    const command = commands.get(cmdName);
    
    if (!command)
        throw `Invalid (Command not found) interaction file name: ${file}`;
    
    let list = command[type];
    
    if (!list)
        list = command[type] = {};
    
    if (!list)
        throw 'List undefined - impossible at runtime';
    
    if (list[interactionName])
        throw `Multiple definitions of button: ${file}`;
    
    const interaction: CBase<unknown> = require(file);
    
    // Would rather get hit with runtime errors, since it's faster to test stuff if we can load empty files without issues
    /*
    if (!interaction.validate)
        throw `Interaction missing validate: ${file}`;
    
    if (!interaction.execute)
        throw `Interaction missing execute: ${file}`;
    */
    
    if (!interaction.options)
            interaction.options = {};
    
    list[interactionName] = interaction;
}

async function loadInteractionType(type: 'buttons' | 'selectMenus', suffix: string, ) {
    if (!commands)
        throw 'Tried to load type of interaction before creating commands Collection';
    
    const files = await recursiveReadDir(pathAlias.resolve('$commands'), [(file, stats) => !(file.endsWith(`.${suffix}.js`) || stats.isDirectory())]);
    
    for (const file of files) 
        loadInteractionFile(type, commands, file);
}

export let commands: Collection<string, Command> | null = null;

export async function loadCommands(): Promise<Collection<string, Command>> {
    if (commands)
        return commands;
    
    commands = new Collection();
    const commandFiles = await recursiveReadDir(pathAlias.resolve('$commands'), [(file, stats) => !(file.endsWith('.command.js') || stats.isDirectory())]);

    for (const file of commandFiles) {
        const command: Command = require(file);
        
        if (!command.data || !command.data.name)
            continue;
        
        // Lift validate/execute/options from the base of command to handlers
        command.handlers = {
            validate: (command as any).validate,
            execute: (command as any).execute,
            options: (command as any).options,
        };
        
        delete (command as any).validate
        delete (command as any).execute
        delete (command as any).options
        
        if (!command.handlers.options)
            command.handlers.options = {};
        
        commands.set(command.data.name, command);
    }
    
    await Promise.all([loadInteractionType('buttons', 'button'), loadInteractionType('selectMenus', 'select')]);
    
    return commands;
}