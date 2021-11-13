import { ButtonInteraction, MessageActionRow, MessageButton, SelectMenuInteraction } from 'discord.js';

export function disableButton(interaction: ButtonInteraction | SelectMenuInteraction) {
    return interaction.update({ components: [] });
}

export async function failOut(interaction: ButtonInteraction | SelectMenuInteraction, message: string): Promise<boolean> {
    await (interaction.replied ? interaction.followUp : interaction.reply).apply(interaction, [({ content: message, ephemeral: true })]);
    return false;
}
