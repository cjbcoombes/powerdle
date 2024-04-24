class Trait {
    name = "default"

    onStart(state) {

    }

    onStartCell(state, cell) {
        cell.traits[this.name] = {};
        return cell.traits[this.name];
    }

    onReveal(state, judged) {

    }

    onRevealCell(state, cell, judged) {
        
    }
}

class TypedTrait extends Trait {
    name = "typed"

    // This one is special
    onTypeCell(state, cell, letter) {
        cell.traits.typed.letterbox.innerText = letter.toUpperCase();
        cell.traits.typed.letter = letter;
    }

    onRevealCell(state, cell, judged) {
        this.onTypeCell(state, cell, judged.guess);
    }

    onStartCell(state, cell) {
        const storage = super.onStartCell(state, cell);
        const letterbox = document.createElement("span");
        letterbox.classList.add("center-text");
        cell.element.appendChild(letterbox);

        storage.letterbox = letterbox;
        storage.letter = "";
    }
}

class CorrectnessColoringTrait extends Trait {
    name = "correctness"

    onRevealCell(state, cell, judged) {
        if (judged.correctness == GUESS_TYPES.GREEN) {
            cell.element.classList.add("reveal-green");
        } else if (judged.correctness == GUESS_TYPES.YELLOW) {
            cell.element.classList.add("reveal-yellow");
        } else if (judged.correctness == GUESS_TYPES.GRAY) {
            cell.element.classList.add("reveal-gray");
        }
        cell.traits.correctness.correctness = judged.correctness;
    }

    onStartCell(state, cell) {
        const storage = super.onStartCell(state, cell);
        storage.correctness = GUESS_TYPES.NONE;
    }
}

// --------------

class LetterTrait {
    name = "default"

    onType(state) {

    }

    onTypeCell(state, cell) {

    }

    onStart(state) {

    }

    onStartCell(state, cell) {
        cell.traits[this.name] = {};
        return cell.traits[this.name];
    }

    onReveal(state, judged) {

    }
}

class CorrectnessColoringLetterTrait extends LetterTrait {
    name = "correctness"

    onStartCell(state, cell) {
        const storage = super.onStartCell(state, cell);
        storage.correctness = GUESS_TYPES.NONE;
    }

    onReveal(state, judged) {
        for (let i = 0; i < 5; i++) {
            const cell = state.letterData[judged.cells[i].guess];
            if (cell.traits.correctness.correctness > judged.cells[i].correctness) {
                cell.traits.correctness.correctness = judged.cells[i].correctness;
                cell.element.classList.remove("reveal-green");
                cell.element.classList.remove("reveal-yellow");
                cell.element.classList.remove("reveal-gray");
                if (judged.cells[i].correctness == GUESS_TYPES.GREEN) {
                    cell.element.classList.add("reveal-green");
                } else if (judged.cells[i].correctness == GUESS_TYPES.YELLOW) {
                    cell.element.classList.add("reveal-yellow");
                } else if (judged.cells[i].correctness == GUESS_TYPES.GRAY) {
                    cell.element.classList.add("reveal-gray");
                }
            }
        }
    }
}