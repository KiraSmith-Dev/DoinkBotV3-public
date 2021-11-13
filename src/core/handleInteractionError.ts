import { ButtonInteraction, CommandInteraction, Interaction, SelectMenuInteraction } from 'discord.js';
import { useTryAsync } from 'no-try';
import { Command } from '$core/coreTypes';

export default async function (err: Error | null, command: Command, interaction: CommandInteraction | ButtonInteraction | SelectMenuInteraction): Promise<boolean> {
    if (!err)
        return false;
    
    console.error(err);
    await useTryAsync(() => (interaction.replied ? interaction.followUp : interaction.reply).apply(interaction, [{ content: 'There was an error while executing your interaction', ephemeral: true }]));
    return true;
}
