class ReusedGrayTrait extends Trait {
    name = "reusedgray"
    grays = []

    onStartCell(state, cell) {
        const stg = super.onStartCell(state, cell);
        stg.reused = false;
    }

    onRevealCell(state, cell, judge) {
        if (!cell.judge.hidden && cell.judge.correctness == GUESS_TYPES.GRAY) {
            if (this.grays.includes(cell.judge.guess)) {
                this.stg(cell).reused = true;
            } else {
                this.grays.push(cell.judge.guess);
            }
        }
    }

    onShareCell(state, cell) {
        if (this.stg(cell).reused) {
            cell.shareText = "💀";
        }
    }
}

class NewGreenTrait extends Trait {
    name = "newgreen"
    greens = ROW_BASE.map(i => false)

    onStartCell(state, cell) {
        const stg = super.onStartCell(state, cell);
        stg.newgreen = false;
    }

    onRevealCell(state, cell, judge) {
        if (!cell.judge.hidden && cell.judge.correctness == GUESS_TYPES.GREEN && !this.greens[cell.col]) {
            this.stg(cell).newgreen = true;
            this.greens[cell.col] = true;
        }
    }

    onShareCell(state, cell) {
        if (this.stg(cell).newgreen) {
            cell.shareText = "✅";
        }
    }
}

class BannedLetterTrait extends Trait {
    name = "bannedletter"

    onStart(state) {
        const stg = super.onStart(state);

        let l = state.randAt(5213, ALPHABET.length);
        while (state.target.includes(ALPHABET[l])) {
            l = (l + 1) % ALPHABET.length;
        }

        stg.banned = [ALPHABET[l]];
    }

    onStartCell(state, cell) {
        const stg = super.onStartCell(state, cell);
        stg.blocked = false;
    }

    onReloadCell(state, cell) {
        const stg = super.onReloadCell(state, cell);
        if (stg.blocked) {
            cell.element.classList.add("reveal-red");
        }
    }

    onPreReveal(state, row, judge) {
        const stg = this.stg(state);
        if (row.some(c => stg.banned.includes(c.judge.guess))) {
            for (let i = 0; i < NUM_COLS; i++) {
                const cell = row[i];

                cell.judge.hidden = true;
                this.stg(cell).blocked = true;
                cell.element.classList.add("reveal-red");
            }
            const popup = makeFadingPopup("BANNED! -500");
            this.stg(state, "points").delta -= 500;
            popup.classList.add("color-red");
            state.popups.addToRow(popup);
        }
    }

    onShareCell(state, cell) {
        if (this.stg(cell).blocked) {
            cell.shareText = cell.col % 2 == 0 ? "⛔" : "⚠️";
        }
    }

    onShareRow(state, row) {
        if (this.stg(state.rowData[row][0]).blocked) {
            state.shareText += "🚫 Banned Letter 💥";
        }
    }
}

class BannedLetterLetterTrait extends LetterTrait {
    name = "bannedletter/l"

    onStartCell(state, cell) {
        this.onReloadCell(state, cell);
    }

    onReloadCell(state, cell) {
        const stg = super.onStartCell(state, cell);
        stg.banned = this.stg(state, "bannedletter").banned.includes(cell.letter);
        if (stg.banned) {
            cell.element.classList.add("reveal-red");
        }

    }
}