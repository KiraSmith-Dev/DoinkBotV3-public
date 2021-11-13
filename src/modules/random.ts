import random from 'random';
export { random };

let characters = 'abcdefghjkmnpqrstuvwxyz23456789';
export function randomString(length: number) {
    let result = '';
    for (let i = 0; i < length; i++ ) {
        result += characters[random.int(0, characters.length - 1)];
    }
    
    return result;
}
