import { SlashCommandBuilder } from '@discordjs/builders';
import { XCommandInteraction, XOptions } from '$core/coreTypes';
import { embedOK } from '$modules/embedUtil';
import { UserModel } from '$models/users/users.model';
import { DateTime, Settings } from 'luxon';
Settings.defaultZone = 'America/New_York';

export const data = new SlashCommandBuilder()
	.setName('daily')
	.setDescription('Increment your daily counter');

export const options: XOptions = {
	ephemeral: true,
	skipValidate: true
};

export async function execute(interaction: XCommandInteraction) {
	const user = await UserModel.findOneOrCreate(interaction.user.id);
    
    const local = DateTime.local();
    const currentDay = local.day + '-' + local.month + '-' + local.year;
    
    if (!user || !user.lastStreakClaim || user.lastStreakClaim != currentDay) 
        user.lastStreakClaim = currentDay;
    
    if (user && user.lastStreakClaim == currentDay)
        return await interaction.replyError(`You've already incremented your daily\nYou're at ${user.streak} day${(user.streak && user.streak > 1) ? 's' : ''}`);
    
    let streakFailed = false;
    let currentStreak = user && user.streak ? user.streak + 1 : 1;
    
    if (user && user.lastStreakClaim) {
        let yesterdayTime = local.minus({ days: 1 });
        let yesterday = yesterdayTime.day + '-' + yesterdayTime.month + '-' + yesterdayTime.year;
        if (user.lastStreakClaim != yesterday) {
            streakFailed = true;
            currentStreak = 1;
        }
    }
    
    if (streakFailed) user.streak = 1;
    else if (user.streak) user.streak += 1;
    
    await user.save();
	
    const embed = embedOK(`You're at ${currentStreak} day${currentStreak > 1 ? 's' : ''}${streakFailed ? '\n(You missed a day, reset to 1)' : ''}`);
	await interaction.editReply({ embeds: [embed], components: [] });
}
