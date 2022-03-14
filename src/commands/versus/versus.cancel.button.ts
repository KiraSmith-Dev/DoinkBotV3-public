import { XButtonInteraction, XOptions } from '$core/coreTypes';
import { VersusModel } from '$models/versus/versus.model';
import { embedSingle } from '$modules/embedUtil';
import { genCoinLabel } from '$modules/genCoinLabel';
import { colors } from '$config';

export const options: XOptions = {
    isUpdate: true
};

export async function validate(interaction: XButtonInteraction, gameID: string): Promise<boolean> {
    const versusGame = await VersusModel.findOne({ _id: gameID });
    
    if (!versusGame)
        return await interaction.replyError('Versus expired');
    
    if (versusGame.targetID !== interaction.user.id && versusGame.hostID !== interaction.user.id)
        return await interaction.replyError(`You can't cancel a versus for someone else`);
    
    return true;
}

export async function execute(interaction: XButtonInteraction, gameID: string) {
    const versusGame = await VersusModel.findOne({ _id: gameID });
    
    if (!versusGame)
        throw `pokerGame wasn't valid`;
    
    await versusGame.remove();
    
    const callingUser = interaction.user.id;
    const nonCallingUser = interaction.user.id === versusGame.hostID ? versusGame.targetID : versusGame.hostID;
    
    const embed = embedSingle('Versus Result', `Versus for ${genCoinLabel(versusGame.amount)} with <@${nonCallingUser}> canceled by <@${callingUser}>`, colors.error);
    
    await interaction.editReply({ embeds: [embed], components: [] });
}
