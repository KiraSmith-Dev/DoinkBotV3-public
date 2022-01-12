import { PokerGame } from '$commands/poker/modules/pokerGame';
import { XButtonInteraction, XOptions } from '$core/coreTypes';

export const options: XOptions = {
    isUpdate: true
}

export async function validate(interaction: XButtonInteraction, gameID: string): Promise<boolean> {
    const pokerGame = await PokerGame.getFromDatabase(gameID);
    
    if (!pokerGame)
        return await interaction.replyError('Poker game not found. Did it expire?');
    
    if (!pokerGame.includesPlayer(interaction.user.id))
        return await interaction.replyError(`You're not a part of this game`);
    
    let player = pokerGame.getPlayer(interaction.user.id);
    
    if (player.isReady)
        return await interaction.replyError(`You're already ready`);
    
    return true;
}

export async function execute(interaction: XButtonInteraction, gameID: string) {
    const pokerGame = await PokerGame.getFromDatabase(gameID);
    
    if (!pokerGame)
        throw `pokerGame wasn't valid`;
    
    let player = pokerGame.getPlayer(interaction.user.id);
    
    player.ready();
    
    if (!pokerGame.isEveryoneReady())
        return await interaction.deleteDeferFollowUp(`You're ready, waiting for other players`, 'success');
    
    pokerGame.start();
    
    await pokerGame.saveToDatabase();
    
    await interaction.editReply(await pokerGame.generateInteractionUpdate());
}
