class Trait {
    name = "default"

    onStart(state, cell) {
        cell.traits[this.name] = {};
        return cell.traits[this.name];
    }

    onReveal(state, cell, judged) {
        
    }
}

class TypedTrait extends Trait {
    name = "typed"

    // This one is special
    onType(state, cell, letter) {
        cell.traits.typed.letterbox.innerText = letter.toUpperCase();
        cell.traits.typed.letter = letter;
    }

    onReveal(state, cell, judged) {
        this.onType(state, cell, judged.guess);
    }

    onStart(state, cell) {
        const storage = super.onStart(state, cell);
        const letterbox = document.createElement("span");
        letterbox.classList.add("center-text");
        cell.element.appendChild(letterbox);

        storage.letterbox = letterbox;
        storage.letter = "";
    }
}

class CorrectnessColoringTrait extends Trait {
    name = "correctness"

    onReveal(state, cell, judged) {
        if (judged.correctness == GUESS_TYPES.GREEN) {
            cell.element.classList.add("reveal-green");
        } else if (judged.correctness == GUESS_TYPES.YELLOW) {
            cell.element.classList.add("reveal-yellow");
        } else if (judged.correctness == GUESS_TYPES.GRAY) {
            cell.element.classList.add("reveal-gray");
        }
    }

    onStart(state, cell) {
        super.onStart(state, cell);
    }
}