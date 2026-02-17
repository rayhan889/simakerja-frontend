function normalize(str: string) {
  return str
    .toLowerCase()
    .replace(/\bpt\.?\b/g, "")      
    .replace(/[^a-z0-9\s]/g, "")   
    .replace(/\s+/g, " ")           
    .trim();
}

function getTrigrams(str: string) {
  const s = `  ${str}  `;
  const trigrams = [];

  for (let i = 0; i < s.length - 2; i++) {
    trigrams.push(s.substring(i, i + 3));
  }

  return trigrams;
}

export function trigramSimilarity(a: string, b: string) {
  const normA = normalize(a);
  const normB = normalize(b);

  if (!normA.length || !normB.length) return 0;

  const trigramsA = getTrigrams(normA);
  const trigramsB = getTrigrams(normB);

  const setA = new Map();
  const setB = new Map();

  for (const t of trigramsA) {
    setA.set(t, (setA.get(t) || 0) + 1);
  }

  for (const t of trigramsB) {
    setB.set(t, (setB.get(t) || 0) + 1);
  }

  let intersection = 0;

  for (const [key, countA] of setA.entries()) {
    if (setB.has(key)) {
      intersection += Math.min(countA, setB.get(key));
    }
  }

  const total = trigramsA.length + trigramsB.length;

  return (2 * intersection) / total;
}
