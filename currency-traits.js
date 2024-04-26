// 💎 💵 🪙 ⚙️ 💣 💰
class CurrencyTrait extends Trait {
    name = "currency"
    intId = -1

    onStart(state) {
        const stg = super.onStart(state);
        stg.savedGems = withDef(this.stat(state).savedGems, 0);
        stg.savedCoins = withDef(this.stat(state).savedCoins, 0);
        stg.savedGears = withDef(this.stat(state).savedGears, 0);
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
        
        const box = document.createElement("span");
        box.classList.add("center-text");

        let word = document.createElement("span");
        word.classList.add("currency-img");
        word.innerText = "💎";
        box.appendChild(word);

        let value = document.createElement("span");
        value.classList.add("currency-text");
        value.innerText = stg.totalGems;
        box.appendChild(value);
        stg.gemsElem = value;

        word = document.createElement("span");
        word.classList.add("currency-img");
        word.classList.add("space");
        word.innerText = "🪙";
        box.appendChild(word);

        value = document.createElement("span");
        value.classList.add("currency-text");
        value.innerText = stg.totalCoins;
        box.appendChild(value);
        stg.coinsElem = value;

        word = document.createElement("span");
        word.classList.add("currency-img");
        word.classList.add("space");
        word.innerText = "⚙️";
        box.appendChild(word);

        value = document.createElement("span");
        value.classList.add("currency-text");
        value.innerText = stg.totalGears;
        box.appendChild(value);
        stg.gearsElem = value;

        state.popups.infoBoxes.center.appendChild(box);
    }

    onStartCell(state, cell) {
        const stg = super.onStartCell(state, cell);
        const off = cell.row * 5 + cell.col * 17;

        const gems = Math.max(0, state.randAt(1823 + off, 7) - 6 + 1);
        const coins = Math.max(0, state.randAt(8130 + off, 14) - 7 + 1);
        const gears = Math.max(0, state.randAt(7422 + off, 20) - 10 + 1);
        stg.gems = gems;
        stg.coins = coins;
        stg.gears = gears;
    }

    onRevealCell(state, cell, judge) {
        if (cell.judge.hidden) return;

        const stg = this.stg(cell);
        const stateStg = this.stg(state);

        if (cell.judge.correctness == GUESS_TYPES.GRAY && stg.gears > 0) {
            stateStg.deltaGears += stg.gears;
            cell.popups.add(
                makeGrowingPopup("⚙️", p => {
                    p.style["animation-delay"] = (100 * cell.col) + "ms";
                    p.classList.add("currency-popup");
                }),
                2400
            );
        }
        if (cell.judge.correctness == GUESS_TYPES.YELLOW && stg.coins > 0) {
            stateStg.deltaCoins += stg.coins;
            cell.popups.add(
                makeGrowingPopup("🪙", p => {
                    p.style["animation-delay"] = (100 * cell.col) + "ms";
                    p.classList.add("currency-popup");
                }),
                2400
            );
        }
        if (cell.judge.correctness == GUESS_TYPES.GREEN && stg.gems > 0) {
            stateStg.deltaGems += stg.gems;
            cell.popups.add(
                makeGrowingPopup("💎", p => {
                    p.style["animation-delay"] = (100 * cell.col) + "ms";
                    p.classList.add("currency-popup");
                }),
                2400
            );
        }
    }

    onReveal(state, row, judge) {
        const stg = this.stg(state);
        const stat = this.stat(state);

        let dropGems = stg.deltaGems;
        let diffGems = Math.max(1, Math.floor(dropGems / 100));
        stg.totalGems += stg.deltaGems;
        stg.deltaGems = 0;
        stat.savedGems = stg.totalGems;

        let dropCoins = stg.deltaCoins;
        let diffCoins = Math.max(1, Math.floor(dropCoins / 100));
        stg.totalCoins += stg.deltaCoins;
        stg.deltaCoins = 0;
        stat.savedCoins = stg.totalCoins;

        let dropGears = stg.deltaGears;
        let diffGears = Math.max(1, Math.floor(dropGears / 10));
        stg.totalGears += stg.deltaGears;
        stg.deltaGears = 0;
        stat.savedGears = stg.totalGears;

        clearInterval(this.intId);
        this.intId = setInterval(() => {
            if (dropGems > 0) dropGems -= diffGems;
            if (dropGems <= 0) dropGems = 0;
            stg.gemsElem.innerText = stg.totalGems - dropGems;
            
            if (dropCoins > 0) dropCoins -= diffCoins;
            if (dropCoins <= 0) dropCoins = 0;
            stg.coinsElem.innerText = stg.totalCoins - dropCoins;
            
            if (dropGears > 0) dropGears -= diffGears;
            if (dropGears <= 0) dropGears = 0;
            stg.gearsElem.innerText = stg.totalGears - dropGears;

            if (dropGems <= 0 && dropCoins <= 0 && dropGears <= 0) clearInterval(this.intId);
        }, 100);
    }

    onShareCell(state, cell) {
        if (cell.judge.hidden) return;
        const stg = this.stg(cell);

        if (cell.judge.correctness == GUESS_TYPES.GRAY && stg.gears > 0) {
            cell.shareText = "⚙️";
        }
        if (cell.judge.correctness == GUESS_TYPES.YELLOW && stg.coins > 0) {
            cell.shareText = "🪙";
        }
        if (cell.judge.correctness == GUESS_TYPES.GREEN && stg.gems > 0) {
            cell.shareText = "💎";
        }
    }

    onShare(state) {
        const stg = this.stg(state);

        state.shareText += `💎 ${stg.totalGems} (+${stg.totalGems - stg.savedGems})\n`;
        state.shareText += `🪙 ${stg.totalCoins} (+${stg.totalCoins - stg.savedCoins})\n`;
        state.shareText += `⚙️ ${stg.totalGears} (+${stg.totalGears - stg.savedGears})\n\n`;
    }
}