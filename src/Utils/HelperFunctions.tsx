export const extractTags = (input: string): string[] => {
  // Regex:
  // \[                   = öffnende eckige Klammer
  // (?!                  = Negativ-Lookahead (alles, was nicht zum Muster passt)
  //    [A-Za-z]+4[A-Za-z]+
  //    \]
  // )
  // ([^\]]+)             = Capture group für alles außer ']'
  // \]                   = schließende eckige Klammer
  const regex = /\[(?![A-Za-z]+4[A-Za-z]+\])([^\]]+)\]/g;

  const results: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    results.push(match[1].trim());
  }

  return results;
};

export const extractAudience = (input: string): string[] => {
  // Regex: öffnende Klammer + Capture für Buchstaben+4+Buchstaben + schließende Klammer
  const regex = /\[([A-Za-z]+4[A-Za-z]+)\]/g;

  const results: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    results.push(match[1].trim());
  }

  return results;
};

export const extractTitle = (input: string): string => {
  // 1. Finde die Position des ersten Zeichens, das NICHT in eckigen Klammern ist
  //    also der erste „Titel“-Charakter

  let firstIndex = 0;
  let i = 0;

  while (i < input.length) {
    if (input[i] === "[") {
      // Springe zum Ende der Klammer
      const closeIndex = input.indexOf("]", i);
      if (closeIndex === -1) break; // keine schließende Klammer mehr
      i = closeIndex + 1;
    } else {
      // Gefunden: erstes Zeichen außerhalb der Klammern
      firstIndex = i;
      break;
    }
  }

  // 2. Finde den Index des nächsten Auftretens von '[' nach firstIndex
  const nextBracket = input.indexOf("[", firstIndex);

  // 3. Schneide den Titel aus
  const title =
    nextBracket === -1
      ? input.slice(firstIndex) // keine weitere Klammer, nimm Rest
      : input.slice(firstIndex, nextBracket);

  // 4. Trim und zurückgeben
  return title.trim();
};

export const extractPostType = (input: string): string => {
  const regex = /\b(?:script\s?)?(?:offer|fill|request|ramblefap)\b/gi;
  const results = input.match(regex);

  if (results === null) {
    return "";
  }

  return results[0].trim();
};

export const extractDuration = (input: string): string | undefined => {
  const regex = /\b(?:\d+h\s?\d{1,2}m?)|(?:\d{1,2}m?\s?\d{1,2}s?)|(?:\d{1,2}:\d{2})\b/gi;
  const results = input.match(regex);

  if (results === null) {
    return undefined;
  }

  return results[0].trim();
};
