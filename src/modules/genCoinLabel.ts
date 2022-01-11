function pluralize(i: number): string {
    return i === 1 ? '' : 's';
}

export function genCoinLabel(amount: number) {
    return `${amount} Doink Coin${amount === 1 ? '' : 's'}`;
}
