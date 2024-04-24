class Trait {
    name = "default"

    onStart(state) {
        state.traits[this.name] = {};
        return state.traits[this.name];
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
    greenComboPoints = [
        0,
        100,
        400,
        900,
        1600,
        2500
    ]
    yellowPoints = 50

    onReveal(state, judged) {
        let comboSize = 0;
        for (let i = 0; i < NUM_COLS; i++) {
            if (judged.cells[i].correctness == GUESS_TYPES.GREEN) {
                comboSize++;
            } else if (comboSize != 0) {
                const popup = makeFadingPopup(
                    comboSize == 1 ? `GREEN +${this.greenComboPoints[comboSize]}` : 
                    `COMBO x${comboSize} +${this.greenComboPoints[comboSize]}`
                );
                state.traits.points.delta += this.greenComboPoints[comboSize];
                popup.classList.add("color-green");
                state.popups.addToRow(popup);
                comboSize = 0;
            }

            if (judged.cells[i].correctness == GUESS_TYPES.YELLOW) {
                const popup = makeFadingPopup(`YELLOW +${this.yellowPoints}`);
                state.traits.points.delta += this.yellowPoints;
                popup.classList.add("color-yellow");
                state.popups.addToRow(popup);
            }
        }

        if (comboSize != 0) {
            const popup = makeFadingPopup(
                comboSize == 1 ? `GREEN +${this.greenComboPoints[comboSize]}` : 
                `COMBO x${comboSize} +${this.greenComboPoints[comboSize]}`
            );
            state.traits.points.delta += this.greenComboPoints[comboSize];
            popup.classList.add("color-green");
            state.popups.addToRow(popup);
            comboSize = 0;
        }
    }

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

class StandardPointsTrait extends Trait {
    name = "points"
    moveBonusPoints = [
        15000,
        10000,
        7000,
        3500,
        1000,
        500
    ]

    onStart(state) {
        const storage = super.onStart(state);
        storage.total = 0;
        storage.delta = 0;
        
        const box = document.createElement("span");
        box.classList.add("center-text");
        const word = document.createElement("span");
        word.innerText = "Total: ";
        box.appendChild(word);
        const value = document.createElement("span");
        value.innerText = "0";
        box.appendChild(value);

        storage.element = value;
        state.popups.infoBoxes.right.appendChild(box);
    }

    onReveal(state, judged) {
        if (judged.allCorrect) {
            const popup = makeFadingPopup(`${makeOrdinal(state.turn + 1)} guess +${this.moveBonusPoints[state.turn]}`);
            state.traits.points.delta += this.moveBonusPoints[state.turn];
            popup.classList.add("color-green");
            state.popups.addToRow(popup);
        }

        const popup = makeCenterText(`+${state.traits.points.delta}`);
        popup.classList.add("fade-in");
        state.popups.addToRow(popup, Infinity);

        let base = state.traits.points.total;
        state.traits.points.total += state.traits.points.delta;
        state.traits.points.delta = 0;

        let diff = Math.max(1, Math.floor((state.traits.points.total - base) / 100));
        let intId = setInterval(() => {
            if (base < state.traits.points.total) {
                base += diff;
            }
            if (base >= state.traits.points.total) {
                base = state.traits.points.total;
                clearInterval(intId);
            }
            state.traits.points.element.innerText = base.toString();
        }, 10);
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
        state.lettertraits[this.name] = {};
        return state.lettertraits[this.name];
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
        for (let i = 0; i < NUM_COLS; i++) {
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