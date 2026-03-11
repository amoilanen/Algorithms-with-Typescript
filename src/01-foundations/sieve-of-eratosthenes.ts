/**
 * Finds all prime numbers up to a given number using trial division.
 *
 * Time complexity: O(n * sqrt(n)) approximately
 * Space complexity: O(n) for the result array
 */
export function primesUpToSlow(number: number): number[] {
  const primes: number[] = [];

  for (let current = 2; current <= number; current++) {
    if (isPrime(current)) {
      primes.push(current);
    }
  }
  return primes;
}

function isPrime(number: number): boolean {
  for (let i = 2; i < number; i++) {
    if (number % i === 0) {
      return false;
    }
  }
  return true;
}

/**
 * Finds all prime numbers up to a given number using the Sieve of Eratosthenes.
 *
 * Time complexity: O(n log log n)
 * Space complexity: O(n)
 */
export function primesUpTo(number: number): number[] {
  const isPrimeNumber: boolean[] = [];
  const primes: number[] = [];
  let current = 2;

  for (let i = 2; i <= number; i++) {
    isPrimeNumber[i] = true;
  }

  while (current <= number) {
    if (isPrimeNumber[current]) {
      primes.push(current);
      for (let j = 2 * current; j <= number; j += current) {
        isPrimeNumber[j] = false;
      }
    }
    current++;
  }
  return primes;
}
