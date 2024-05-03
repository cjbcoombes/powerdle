// 💎 💵 🪙 ⚙️ 💣 💰
class CurrencyTrait extends Trait {
    name = "currency"
    intId = -1

    onStart(state) {
        const stg = super.onStart(state);
        const stat = this.stg(state.stats);

        stg.savedGems = withDef(stat.savedGems, 0);
        stg.savedCoins = withDef(stat.savedCoins, 0);
        stg.savedGears = withDef(stat.savedGears, 0);
        stg.totalGems = stg.savedGems;
        stg.totalCoins = stg.savedCoins;
        stg.totalGears = stg.savedGears;
        stg.deltaGems = 0;
        stg.deltaCoins = 0;
        stg.deltaGears = 0;

        this.onReload(state);
    }

    onReload(state) {
        const stg = super.onReload(state);
        const ints = this.stg(state.interactions);
        ints.updateQuantities = (gems, coins, gears) => this.updateQuantities(state, gems, coins, gears);
        ints.hasQuantities = (gems, coins, gears) => stg.totalGems >= gems && stg.totalCoins >= coins && stg.totalGears >= gears;

        docId("currency-gems").innerText = stg.totalGems;
        docId("currency-coins").innerText = stg.totalCoins;
        docId("currency-gears").innerText = stg.totalGears;
    }

    onStartCell(state, cell) {
        const stg = super.onStartCell(state, cell);
        const off = cell.row * 5 + cell.col * 17;

        const gems = Math.max(0, state.interactions.rand.at(1823 + off, 9) - 8 + 1);
        const coins = Math.max(0, state.interactions.rand.at(8130 + off, 14) - 7 + 1);
        const gears = Math.max(0, state.interactions.rand.at(7422 + off, 20) - 10 + 1);
        stg.gems = gems;
        stg.coins = coins;
        stg.gears = gears;
    }

    onRevealCell(state, cell, judge) {
        if (state.interactions.cellHidden(cell)) return;

        const stg = this.stg(cell);
        const stateStg = this.stg(state.data);

        const makePopup = t => gameState.interactions.popups.addToCell(
            cell, 
            docMake("div", ["currency-popup"], null, e => {
                e.innerText = t;
                e.style["animation-delay"] = `${100 * cell.col}ms`;
            }), 
            2400
        );

        if (cell.status.correctness == GUESS_TYPES.GRAY && stg.gears > 0) {
            stateStg.deltaGears += stg.gears;
            makePopup("⚙️");
        }
        if (cell.status.correctness == GUESS_TYPES.YELLOW && stg.coins > 0) {
            stateStg.deltaCoins += stg.coins;
            makePopup("🪙");
        }
        if (cell.status.correctness == GUESS_TYPES.GREEN && stg.gems > 0) {
            stateStg.deltaGems += stg.gems;
            makePopup("💎");
        }
    }

    updateQuantities(state, gems, coins, gears) {
        const stg = this.stg(state.data);

        let dropGems = gems;
        let diffGems = Math.max(1, Math.floor(dropGems / 60));
        stg.totalGems += gems;

        let dropCoins = coins;
        let diffCoins = Math.max(1, Math.floor(dropCoins / 60));
        stg.totalCoins += coins;

        let dropGears = gears;
        let diffGears = Math.max(1, Math.floor(dropGears / 30));
        stg.totalGears += gears;

        clearInterval(this.intId);
        this.intId = setInterval(() => {
            if (dropGems > 0) dropGems -= diffGems;
            if (dropGems <= 0) dropGems = 0;
            docId("currency-gems").innerText = stg.totalGems - dropGems;
            
            if (dropCoins > 0) dropCoins -= diffCoins;
            if (dropCoins <= 0) dropCoins = 0;
            docId("currency-coins").innerText = stg.totalCoins - dropCoins;
            
            if (dropGears > 0) dropGears -= diffGears;
            if (dropGears <= 0) dropGears = 0;
            docId("currency-gears").innerText = stg.totalGears - dropGears;

            if (dropGems <= 0 && dropCoins <= 0 && dropGears <= 0) clearInterval(this.intId);
        }, 100);
    }

    onReveal(state, row, judge) {
        const stg = this.stg(state.data);

        this.updateQuantities(state, stg.deltaGems, stg.deltaCoins, stg.deltaGears);
        stg.deltaGems = 0;
        stg.deltaCoins = 0;
        stg.deltaGears = 0;
    }

    onSave(state) {
        const stat = this.stg(state.stats);
        const stg = this.stg(state.data);
        stat.savedGems = stg.totalGems;
        stat.savedCoins = stg.totalCoins;
        stat.savedGears = stg.totalGears;
    }

    onShareCell(state, cell) {
        if (state.interactions.cellHidden(cell)) return;
        const stg = this.stg(cell);

        if (cell.status.correctness == GUESS_TYPES.GRAY && stg.gears > 0) {
            return "⚙️";
        }
        if (cell.status.correctness == GUESS_TYPES.YELLOW && stg.coins > 0) {
            return "🪙";
        }
        if (cell.status.correctness == GUESS_TYPES.GREEN && stg.gems > 0) {
            return "💎";
        }
    }

    onShare(state) {
        const stg = this.stg(state.data);

        return `💎${stg.totalGems}(${signNum(stg.totalGems - stg.savedGems)})  `
         + `🪙${stg.totalCoins}(${signNum(stg.totalCoins - stg.savedCoins)})  `
         + `⚙️${stg.totalGears}(${signNum(stg.totalGears - stg.savedGears)})\n`;
    }
}