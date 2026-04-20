import { createHmac } from 'node:crypto';
import { ClassConstructor, plainToInstance } from 'class-transformer';

export function generateRandomValue(min: number, max: number, numAfterDigit = 0) {
  return +((Math.random() * (max - min)) + min).toFixed(numAfterDigit);
}

export function getRandomItems<T>(items: T[], count: number): T[] {
  const startPosition = generateRandomValue(0, items.length - 1);
  const endPosition = startPosition + count;
  return items.slice(startPosition, endPosition);
}

export function getRandomItem<T>(items: T[]): T {
  return items[generateRandomValue(0, items.length - 1)];
}

export function createSHA256(line: string, salt: string): string {
  const sha256Hasher = createHmac('sha256', salt);
  return sha256Hasher.update(line).digest('hex');
}

export function fillDTO<T, V>(someDto: ClassConstructor<T>, plainObject: V) {
  return plainToInstance(someDto, plainObject, { excludeExtraneousValues: true });
}
