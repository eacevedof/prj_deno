
export class Randomizer {
    public static getInstance(): Randomizer {
        return new Randomizer();
    }

    public getRandomNumberBetweenMinAndMx(min: number = 0, max: number = 100): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}