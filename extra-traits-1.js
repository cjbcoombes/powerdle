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