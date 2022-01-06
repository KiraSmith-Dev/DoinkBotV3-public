export type VersusHistoyItem = {
    with: string;
    amount: number;
    won: boolean;
}

export type DataUser = {
    id: string;
    username?: string;
    coins?: number;
    avatarURL?: string;
    versusHistory?: VersusHistoyItem[];
    lastGoldGive?: string;
    lastWeeklyClaim?: string;
    lastStreakClaim?: string;
    streak?: number;
}
