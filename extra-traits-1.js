class ReusedGrayTrait extends Trait {
    name = "reusedgray"
    grays = []

    onStartCell(state, cell) {
        const storage = super.onStartCell(state, cell);
        storage.reused = false;
    }

    onRevealCell(state, cell, judged) {
        if (judged.correctness == GUESS_TYPES.GRAY) {
            if (this.grays.includes(judged.guess)) {
                cell.traits.reusedgray.reused = true;
            } else {
                this.grays.push(judged.guess);
            }
        }
    }

    onShareCell(state, cell) {
        if (cell.traits.reusedgray.reused) {
            cell.shareText = "💀";
        }
    }
}

class NewGreenTrait extends Trait {
    name = "newgreen"
    greens = ROW_BASE.map(i => false)

    onStartCell(state, cell) {
        const storage = super.onStartCell(state, cell);
        storage.newgreen = false;
    }

    onRevealCell(state, cell, judged) {
        if (judged.correctness == GUESS_TYPES.GREEN && !this.greens[cell.col]) {
            cell.traits.newgreen.newgreen = true;
            this.greens[cell.col] = true;
        }
    }

    onShareCell(state, cell) {
        if (cell.traits.newgreen.newgreen) {
            cell.shareText = "✅";
        }
    }
}

class BannedLetterTrait extends Trait {
    name = "bannedletter"

    onStart(state) {
        const storage = super.onStart(state);

        let l = state.randAt(5213, ALPHABET.length);
        while (state.target.includes(ALPHABET[l])) {
            l = (l + 1) % ALPHABET.length;
        }

        storage.banned = [ALPHABET[l]];
    }

    onStartCell(state, cell) {
        const storage = super.onStartCell(state, cell);
        storage.blocked = false;
    }

    onPreReveal(state, row, judged) {
        if (judged.cells.some(c => state.traits.bannedletter.banned.includes(c.guess))) {
            for (let i = 0; i < NUM_COLS; i++) {
                const c = row[i];

                c.traits.correctness.ignored = true;
                c.traits.bannedletter.blocked = true;
                state.letterData[judged.cells[i].guess].traits.correctness.ignored = true;
                c.element.classList.add("reveal-red");
            }
        }
        console.log(state, row, judged, state.traits.bannedletter.banned);
    }

    onShareCell(state, cell) {
        if (cell.traits.bannedletter.blocked) {
            cell.shareText = cell.col % 2 == 0 ? "⛔" : "⚠️";
        }
    }

    onShareRow(state, row) {
        if (state.rowData[row][0].traits.bannedletter.blocked) {
            state.shareText += "🚫 Banned Letter 💥";
        }
    }
}

class BannedLetterLetterTrait extends LetterTrait {
    onStartCell(state, cell) {
        const storage = super.onStartCell(state, cell);
        storage.banned = state.traits.bannedletter.banned.includes(cell.letter);
        if (storage.banned) {
            cell.element.classList.add("reveal-red");
            cell.traits.correctness.ignored = true;
        }
    }

    onReveal(state, row, judged) {
        judged.cells.forEach(c => 
            state.letterData[c.guess].traits.correctness.ignored = state.traits.bannedletter.banned.includes(c.guess));
    }
}