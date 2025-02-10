import { GlobalState } from '../../GlobalState';
import { fetchMatchedUserID } from './matchHelper';

// a hash function that is consistent for the same input
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit int
  }
  return hash >>> 0; // Must be positive
};

// gets a random number
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Deterministic shuffle (Fisher-Yates)
const shuffleWithSeed = <T>(array: T[], seed: number): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = hashString(`${seed}${i}`); // Update seed for each iteration
    const j = Math.floor(seededRandom(seed) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Want: A user in a match should always get the same "random" groups. Different users in the same match don't need to be the same.

type AttributeMapping = [string, string | string[] | Set<string>][];  
type Group = [string, string | string[] | Set<string> | Set<number>][];

export const getRandomGroups = (
  attributes: AttributeMapping,
  groupCount: number = 3
): Group[] => {

  if (groupCount <= 0) {
    console.error("Group count must be greater than 0.");
    return [];
  }

  const groups: Group[] = Array.from({ length: groupCount }, () => []);

  // create a unique seed from the user and match ids
  const uniqueKey = `${GlobalState.userID}-${GlobalState.matchID}`;
  let seed = hashString(uniqueKey);

  // shuffle
  // const shuffled = [...attributes].sort(
  //   () => seededRandom(seed++) - 0.5
  // );
  const shuffled = shuffleWithSeed([...attributes], seed);

  // create groups
  shuffled.forEach((attribute, index) => {
    groups[index % groupCount].push(attribute);
  });

  return groups;
};


// Want: Users in a match should always get the same "random" prompt.

export const getRandomPrompts = (
  prompts: string[],
): string[] => {
    // create a unique seed from the user and match ids
    const uniqueKey = `${GlobalState.matchID}`;
    let seed = hashString(uniqueKey);

    return shuffleWithSeed(prompts, seed);
};

export default { getRandomPrompts, getRandomGroups };