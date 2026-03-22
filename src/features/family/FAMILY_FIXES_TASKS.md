# Family system fixes — progress checklist

## Done (this session)

- [x] `01-config.js`: `newsLogCollection` + `window.newsLogCollection` — tribe news can save/load.
- [x] Task rewards (`FamilyService.claimTask`): Intel from tasks → **Family Coins** (pool), not site currency; XP still to user.
- [x] `FamilyConstants` / `FamilyTasks` UI: show combined family-coin reward on cards.
- [x] `FamilyProfile`: “Next level requirements” block moved **inside** ⚡ Activeness card; upgrade uses `FamilyConstants.FAMILY_LEVEL_CONFIG` (fix empty config).
- [x] `FamilyProfile`: Activeness + modal gifts use **Intel** (`currency`), not `familyCoins`.
- [x] `FamilyTreasury`: minimum donate **10** Intel + hint; removed duplicate next-level block.
- [x] `FamilyService.handleGachaRoll`: atomic **batch** (family + user), safe `paidCostPerSpin`, `setSpinning` fixed in `FamilyGacha.js`; `GACHA_CONFIG_BASIC/PREMIUM` on `window` from `19-family.js`.
- [x] `FamilyTasks`: daily chest nodes open **preview** modal; claim from modal when eligible.
- [x] `FamilyNews`: feed limited to `donation`, `level_up`, `settings_change`; `postNews` includes actor fields.
- [x] `FamilyManagement`: `settings_change` news lines include editor name.
- [x] `19-family.js`: news listener runs whenever `family.id` exists (not only on News tab).
- [x] `src/core/config.js`: comment that **`01-config.js` is the one the app loads**.

## Firestore (manual)

- Ensure composite index if query errors: collection `family_news_log` — `familyId` + `timestamp` descending.
- Security rules must allow: `newsLogCollection` create/read for authenticated users in the family (adjust to your policy).

## Config files

| File | Role |
|------|------|
| `src/01-config.js` | **Loaded by `index.html`** — Firebase, collections, `newsLogCollection`, `TS`, etc. |
| `src/core/config.js` | **Not loaded** by the app — duplicate/reference only; see header comment. |
