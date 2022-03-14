import { SlashCommandBuilder } from '@discordjs/builders';
import { XCommandInteraction, XOptions } from '$core/coreTypes';
import { embed } from '$modules/embedUtil';
import { UserModel } from '$models/users/users.model';
import { weeklyAmount } from '$config';
import { DateTime, DurationObjectUnits, Settings } from 'luxon';
import { genCoinLabel } from '$modules/genCoinLabel';
Settings.defaultZone = 'America/New_York';

export const data = new SlashCommandBuilder()
	.setName('weekly')
	.setDescription('Claim your weekly Doink Coins');

export const options: XOptions = {
	ephemeral: true,
	skipValidate: true
};

function formatTimeProperty(duration: DurationObjectUnits, property: string) {
    let value = duration[property as 'days' | 'hours' | 'minutes'];
    if (!value) return '';
    
    let output = `${value} ${property}`;
    
    if (value < 2) output = output.substring(0, output.length - 1);
    
    return output;
}

function formatTimeToNextReset(local: DateTime) {
    let duration = local.until(local.endOf('week'))
        .toDuration(['days', 'hours', 'minutes'])
        .toObject();
    
    // Round minutes up, if we reach the next hour, increment hours
    duration.minutes = Math.ceil(duration.minutes ? duration.minutes : 0);
    if (duration.minutes == 60) {
        duration.minutes = 0;
        duration.hours ? ++duration.hours : duration.hours = 1;
    }
    
    // Convert object -> ['5 days', '1 hour'] / ect...
    let i = 0;
    let output = [];
    for (const [key, value] of Object.entries(duration)) {
        output.push(formatTimeProperty(duration, key));
        i++;
    }
    
    // Remove empty strings, ex: 0 hours
    output = output.filter(item => item.length);
    
    let didAddComma = false;
    // Only need comma seperation when 3 elements exist
    if (output.length >= 3) {
        didAddComma = true;
        output = output.join(', ').split(' ');
    }
    
    // Only use 'and' if there are 2 or more elements
    if (output.length >= 2)
        output.splice(output.length - (didAddComma ? 2 : 1), 0, 'and');
    
    // Join it together nicely...
    return output.length ? `Weekly resets in ${output.join(' ')}` : 'Weekly resets now';    
}

export async function execute(interaction: XCommandInteraction) {
	const user = await UserModel.findOneOrCreate(interaction.user.id);
    
    const local = DateTime.local();
    
    let currentWeek = local.year + '-' + local.weekNumber;
    if (!user.lastWeeklyClaim || user.lastWeeklyClaim != currentWeek) {
        user.lastWeeklyClaim = currentWeek
        await user.save();
    }
    
    if (user && user.lastWeeklyClaim == currentWeek)
        return await interaction.replyError(`You've already claimed your weekly Doink Coins\n${formatTimeToNextReset(local)}`);
    
    user.username = interaction.user.username;
    await user.addToBalance(weeklyAmount);
	
    const embedOut = embed(`Success`, { name: `Claimed ${weeklyAmount} Doink Coin`, value: `You now have ${genCoinLabel(user.coins ? user.coins : 0)}` });
	await interaction.editReply({ embeds: [embedOut], components: [] });
}
