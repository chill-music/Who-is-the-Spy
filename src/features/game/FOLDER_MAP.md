# Folder: Core Game Engine (src/features/game)

## Overview
This directory contains the core rules and round management logic for the "Who is the Spy" game cycle.

## Files

### [GameLogic.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/game/GameLogic.js)
- **Purpose**: Word & Role Assignment.
- **Logic**: Handles the randomized selection of categories (Spy Word vs. Civ Word) and the assignment of the "Spy" or "Civilian" role to players. It also coordinates the logic for when a round ends and when winners are declared based on the remaining player counts.
- **Dependencies**: Reacts to state transitions within a Room document.
