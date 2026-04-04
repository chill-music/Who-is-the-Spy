# Data Model: 007-shop-leaderboard-redesign

## Entities
- **SHOP_ITEMS**: Existing data structure in `04-data-game.js`. No changes to the schema.
- **BFF_TOKEN_ITEMS**: Existing data structure in `01-config.js`. No changes to the schema.
- **Leaderboard Data**: Fetched as `wins`, `charisma`, and `family` arrays. No changes to the schema.

## UI Extensions
- **.shop-standard-item**: Global CSS token for item rendering.
- **.portrait-effect-container**: Aspect-ratio wrapper for animated effects.
- **Podium Layout**: Redefined JSX structure in `RankingView.js`.
