class LetterTrait {
    name = "default/l"

    stg(obj, trait) {
        return obj.traits[trait ? trait : this.name];
    }

    onType(state, letter) {

    }

    onTypeCell(state, cell) {

    }

    onReload(state) {
        if (state.data.traits[this.name] == undefined) {
            state.data.traits[this.name] = {};
        }
        if (state.stats.traits[this.name] == undefined) {
            state.stats.traits[this.name] = {};
        }
        return this.stg(state.data);
    }

    onStart(state) {
        state.data.traits[this.name] = {};
        if (state.stats.traits[this.name] == undefined) {
            state.stats.traits[this.name] = {};
        }
        return this.stg(state.data);
    }

    onReloadCell(state, cell) {
        if (cell.traits[this.name] == undefined) {
            cell.traits[this.name] = {};
        }
        return this.stg(cell);
    }

    onStartCell(state, cell) {
        cell.traits[this.name] = {};
        return this.stg(cell);
    }

    onSave(state) {

    }

    onReveal(state, rowId, judge) {

    }
}

class CorrectnessColoringLetterTrait extends LetterTrait {
    name = "correctness/l"

    onStartCell(state, cell) {
        const stg = super.onStartCell(state, cell);
        stg.correctness = GUESS_TYPES.NONE;
    }

    onReload(state) {
        const stg = super.onReload(state);
        for (let i = 0; i < WORDLE_ROWS; i++) {
            if (state.data.cellRows[i][0].status.judged) {
                this.onReveal(state, i, null);
            }
        }
    }

    onReveal(state, rowId, judge) {
        for (let i = 0; i < WORDLE_COLS; i++) {
            const cell = state.data.cellRows[rowId][i];
            const letter = state.data.letters[cell.status.letter];
            const stg = this.stg(letter);
            
            if (!state.interactions.cellHidden(cell)) {
                if (stg.correctness >= cell.status.correctness) {
                    stg.correctness = cell.status.correctness;
                    if (cell.status.correctness == GUESS_TYPES.GREEN) {
                        letter.component.style["background-color"] = "var(--wordle-green)";
                    } else if (cell.status.correctness == GUESS_TYPES.YELLOW) {
                        letter.component.style["background-color"] = "var(--wordle-yellow)";
                    } else if (cell.status.correctness == GUESS_TYPES.GRAY) {
                        letter.component.style["background-color"] = "var(--wordle-gray)";
                    }
                }
            }
        }
    }
}