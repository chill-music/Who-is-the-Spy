# Research: Spy Game Technical Solutions

This document resolves technical unknowns for the "Who is the Spy?" rebuild, ensuring compliance with the "no npm" and "high-fidelity" constraints.

## Decision: Fuzzy Word Matching (Levenshtein Distance ≤ 1)

**Decision**: Implement a specialized O(N) iterative function instead of a full O(N*M) dynamic programming matrix.

**Rationale**: For a party game guess, we only care if the word is exactly correct or has one minor typo (insertion/deletion/substitution). A full Levenshtein matrix is overkill.

**Specialized Implementation**:
```javascript
function checkFuzzyMatch(a, b) {
  const s1 = a.toLowerCase().trim().replace(/\s+/g, '');
  const s2 = b.toLowerCase().trim().replace(/\s+/g, '');
  if (s1 === s2) return true;
  if (Math.abs(s1.length - s2.length) > 1) return false;

  let i = 0, j = 0, diffs = 0;
  while (i < s1.length && j < s2.length) {
    if (s1[i] !== s2[j]) {
      diffs++;
      if (diffs > 1) return false;
      if (s1.length > s2.length) i++;
      else if (s1.length < s2.length) j++;
      else { i++; j++; }
    } else {
      i++; j++;
    }
  }
  return diffs + (s1.length - i) + (s2.length - j) <= 1;
}
```

## Decision: Audio Synthesis (Web Audio API)

**Decision**: Use a basic Sine Wave oscillator with a 500ms exponential decay envelope for UI feedback.

**Rationale**: External audio files increase load time and break the "single JS file" concept. Synthesis is instant and perfectly controllable.

**Chime Logic**:
- Frequency: 880Hz (A5)
- Waveform: Sine
- Envelope: 0.5 gain -> 0.01 exponential ramp over 500ms.

## Decision: Arabic RTL Layout (Tailwind CSS)

**Decision**: Exclusively use **Logical Properties** (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) and the `dir="rtl"` attribute.

**Rationale**: Modern Tailwind (v3+) supports these out of the box. It ensures the layout mirrors correctly without needing separate CSS files or complex overrides like `rtl:ml-0`.

## Decision: Confetti System (Canvas API)

**Decision**: A lightweight particle system written in raw Canvas 2D.

**Rationale**: Avoids DOM bloat (too many elements) and satisfies the "no library" constraint. Will be implemented as a `Confetti` component that creates and manages its own internal animation loop.
