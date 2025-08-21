/**
 * Array manipulation utilities
 * Consolidated from various scattered implementations across the codebase
 */

/**
 * Get unique values from array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Get unique values by key function
 */
export function uniqueBy<T, K>(array: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Remove duplicates from array of objects by property
 */
export function uniqueByProperty<T extends Record<string, unknown>>(
  array: T[],
  property: keyof T
): T[] {
  return uniqueBy(array, item => item[property]);
}

/**
 * Chunk array into smaller arrays of specified size
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (size <= 0) throw new Error('Size must be greater than 0');
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Flatten nested arrays
 */
export function flatten<T>(arrays: T[][]): T[] {
  return arrays.reduce((flat, array) => flat.concat(array), []);
}

/**
 * Deep flatten nested arrays
 */
export function flattenDeep<T>(arrays: unknown[]): T[] {
  const result: T[] = [];

  function flattenHelper(arr: unknown[]): void {
    for (const item of arr) {
      if (Array.isArray(item)) {
        flattenHelper(item);
      } else {
        result.push(item as T);
      }
    }
  }

  flattenHelper(arrays);
  return result;
}

/**
 * Group array items by key function
 */
export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

/**
 * Partition array into two arrays based on predicate
 */
export function partition<T>(
  array: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  const truthy: T[] = [];
  const falsy: T[] = [];

  array.forEach(item => {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  });

  return [truthy, falsy];
}

/**
 * Find intersection of multiple arrays
 */
export function intersection<T>(...arrays: T[][]): T[] {
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return arrays[0];

  return arrays.reduce((intersection, array) => {
    return intersection.filter(item => array.includes(item));
  });
}

/**
 * Find difference between arrays
 */
export function difference<T>(array1: T[], array2: T[]): T[] {
  return array1.filter(item => !array2.includes(item));
}

/**
 * Remove falsy values from array
 */
export function compact<T>(array: (T | null | undefined | false | 0 | '')[]): T[] {
  return array.filter(Boolean) as T[];
}

/**
 * Get random item from array
 */
export function sample<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

/**
 * Get random items from array
 */
export function sampleSize<T>(array: T[], size: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, size);
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get first n items from array
 */
export function take<T>(array: T[], n: number): T[] {
  return array.slice(0, n);
}

/**
 * Get last n items from array
 */
export function takeRight<T>(array: T[], n: number): T[] {
  return array.slice(-n);
}

/**
 * Remove items from array
 */
export function remove<T>(array: T[], predicate: (item: T) => boolean): T[] {
  return array.filter(item => !predicate(item));
}

/**
 * Find index of item that matches predicate
 */
export function findIndex<T>(array: T[], predicate: (item: T) => boolean): number {
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i])) {
      return i;
    }
  }
  return -1;
}

/**
 * Check if array contains all values
 */
export function containsAll<T>(array: T[], values: T[]): boolean {
  return values.every(value => array.includes(value));
}

/**
 * Check if array contains any values
 */
export function containsAny<T>(array: T[], values: T[]): boolean {
  return values.some(value => array.includes(value));
}

/**
 * Sort array by property
 */
export function sortBy<T>(array: T[], iteratee: (item: T) => unknown): T[] {
  return [...array].sort((a, b) => {
    const aVal = iteratee(a);
    const bVal = iteratee(b);

    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;
    return 0;
  });
}

/**
 * Create array of numbers in range
 */
export function range(start: number, end: number, step = 1): number[] {
  const result: number[] = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}
