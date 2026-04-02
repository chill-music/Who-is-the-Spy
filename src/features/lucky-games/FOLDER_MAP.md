# Folder: Mini-Games (src/features/lucky-games)

## Overview
This directory contains standalone "Lucky" games designed for player engagement and currency consumption. These games are interactive and use custom CSS for high-status animations.

## Main Hub

### [LuckyGamesHub.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/lucky-games/LuckyGamesHub.js)
- **Purpose**: Games Navigator.
- **Logic**: Orchestrates the entry points for all mini-games, tracking the user's available currency before allowing play.
- **Dependencies**: Interacts with the `users` collection for currency transactions.

## Individual Games

- **[GreedyCatGame.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/lucky-games/GreedyCatGame.js)**: A cat-themed reward game.
- **[LuckyFruitGame.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/lucky-games/LuckyFruitGame.js)**: Classic fruit-slot mechanics.
- **[SoccerStarGame.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/lucky-games/SoccerStarGame.js)**: Football-themed prediction reward game.
- **[Super777Game.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/lucky-games/Super777Game.js)**: Premium slot-machine logic.

## Styling
- Each game has its own dedicated CSS file (`greedy-cat.css`, `lucky-fruit.css`, etc.) to ensure encapsulated design.
