# Data Model: Defuse Master Localization

## Entities

### `TranslationSchema`
Represents the bilingual mapping structure.
- **`keys`**: (String) Unique identifier for a UI element or game log.
- **`ar`**: (String) Arabic translation.
- **`en`**: (String) English translation.

### `ComponentState`
Persistent state during a match.
- **`lang`**: (String) Current active language. Options: `ar`, `en`. Defaults to `ar`.
- **`t`**: (Function) Mapping function returning the string for the current `lang`.

## State Transitions
1. **Initial**: Component mounts, checks `lang` (default 'ar').
2. **Toggle Click**: User clicks `AR/EN` button -> `setLang(prev => prev === 'ar' ? 'en' : 'ar')`.
3. **Re-render**: UI re-renders instantly using localized strings; `GameLogic` state remains unchanged.
