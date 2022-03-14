import { SlashCommandBuilder } from '@discordjs/builders';
import { XCommandInteraction, XOptions } from '$core/coreTypes';
import { embed } from '$modules/embedUtil';
import { UserModel } from '$models/users/users.model';

export const data = new SlashCommandBuilder()
	.setName('ctop')
	.setDescription('Leaderboard for Doink Coins');

export const options: XOptions = {
	ephemeral: true,
	skipValidate: true
};

export async function execute(interaction: XCommandInteraction) {
    let allUsers = await UserModel.find();
    
    let userObjs: {username: string, coins: number}[] = [];
    
    await allUsers.forEach(user => {
        userObjs.push({ username: user.username ? user.username : 'Missing Name', coins: user.coins ? user.coins : 0 });
    });
    
    userObjs.sort((a, b) => b.coins - a.coins);
    
    let fields = [];
    for (let i = 0; i < userObjs.length; i++) {
        const user = userObjs[i];
        if (!user) continue;
        fields.push({ name: `#${i + 1}`, value: `${user.username}: ${user.coins}` });
    }
    
    const embedOut = embed(`__Coin Leaderboard__`, fields);
    await interaction.editReply({ embeds: [embedOut], components: [] });
}
