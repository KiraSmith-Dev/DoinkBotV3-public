
import { XButtonInteraction, XOptions } from '$core/coreTypes';
import { UserModel } from '$models/users/users.model';
import { VersusModel } from '$models/versus/versus.model';
import { rotate } from '$modules/arrayUtil';
import { embedSingle } from '$modules/embedUtil';
import { genCoinLabel } from '$modules/genCoinLabel';
import random from 'random';

export const options: XOptions = {
    isUpdate: true
}

export async function validate(interaction: XButtonInteraction, gameID: string): Promise<boolean> {
    const versusGame = await VersusModel.findOne({ _id: gameID });
    
    if (!versusGame)
        return await interaction.replyError('Versus expired');
    
    if (versusGame.targetID !== interaction.user.id)
        return await interaction.replyError(`You can't accept a versus for someone else`);
        
    const hostUser = await UserModel.findOneOrCreate(versusGame.hostID);
    const targetUser = await UserModel.findOneOrCreate(versusGame.targetID);
    
    let res = await targetUser.validateCoins(interaction, versusGame.amount, 'You');
    if (!res) return res;
    
    res = await hostUser.validateCoins(interaction, versusGame.amount, `<@$${hostUser.uid}>`);
    if (!res) return res;
    
    return true;
}

export async function execute(interaction: XButtonInteraction, gameID: string) {
    const versusGame = await VersusModel.findOne({ _id: gameID });
    
    if (!versusGame)
        throw `pokerGame wasn't valid`;
    
    const result = random.boolean();
    const [winner, loser] = rotate([await UserModel.findOneOrCreate(versusGame.hostID), await UserModel.findOneOrCreate(versusGame.targetID)], result ? 0 : 1);
    
    if (!winner || !loser)
        throw 'Rotate failed ?!';
    
    await winner.addToBalance(versusGame.amount);
    await loser.addToBalance(versusGame.amount * -1);
    
    const embed = embedSingle('Versus Result', `<@${winner.uid}> won ${genCoinLabel(versusGame.amount)} vs. <@${loser.uid}>`);
    
    await interaction.editReply({ embeds: [embed], components: [] });
}
