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

    onPreReveal(state, row, judged) {

    }

    onReveal(state, row, judged) {

    }

    onRevealCell(state, cell, judged) {
        
    }

    onShare(state) {

    }

    onShareCell(state, cell) {

    }

    onShareRow(state, row) {

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

    onReveal(state, row, judged) {
        let comboSize = 0;
        for (let i = 0; i < NUM_COLS; i++) {
            if (row[i].traits.correctness.ignored) continue;

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
        if (!cell.traits.correctness.ignored) {
            if (judged.correctness == GUESS_TYPES.GREEN) {
                cell.element.classList.add("reveal-green");
            } else if (judged.correctness == GUESS_TYPES.YELLOW) {
                cell.element.classList.add("reveal-yellow");
            } else if (judged.correctness == GUESS_TYPES.GRAY) {
                cell.element.classList.add("reveal-gray");
            }
        }
        cell.traits.correctness.correctness = judged.correctness;
    }

    onStartCell(state, cell) {
        const storage = super.onStartCell(state, cell);
        storage.correctness = GUESS_TYPES.NONE;
        storage.ignored = false;
    }

    onShareCell(state, cell) {
        // 🟥 🟧 🟨 🟩 🟦 🟪 🟫 ⬛ ⬜
        if (cell.row < state.judgeData.length) {
            const correctness = state.judgeData[cell.row].cells[cell.col].correctness;
            if (correctness == GUESS_TYPES.GREEN) {
                cell.shareText = "🟩";
            } else if (correctness == GUESS_TYPES.YELLOW) {
                cell.shareText = "🟨";
            } else if (correctness == GUESS_TYPES.GRAY) {
                cell.shareText = "🟫";
            } 
        } else {
            cell.shareText = "⬛";
        }
    }
}

class StandardPointsTrait extends Trait {
    name = "points"
    intId = -1
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
        storage.rowDeltas = [];
        
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

    onReveal(state, row, judged) {
        if (judged.allCorrect) {
            const popup = makeFadingPopup(`${makeOrdinal(state.turn + 1)} Guess +${this.moveBonusPoints[state.turn]}`);
            state.traits.points.delta += this.moveBonusPoints[state.turn];
            popup.classList.add("color-green");
            state.popups.addToRow(popup);
        }

        const popup = makeCenterText(`+${state.traits.points.delta}`);
        popup.classList.add("fade-in");
        state.popups.addToRow(popup, Infinity);

        let base = state.traits.points.total;
        state.traits.points.total += state.traits.points.delta;
        state.traits.points.rowDeltas.push(state.traits.points.delta);
        state.traits.points.delta = 0;

        let diff = Math.max(1, Math.floor((state.traits.points.total - base) / 100));
        clearInterval(this.intId);
        this.intId = setInterval(() => {
            if (base < state.traits.points.total) {
                base += diff;
            }
            if (base >= state.traits.points.total) {
                base = state.traits.points.total;
                clearInterval(this.intId);
            }
            state.traits.points.element.innerText = base.toString();
        }, 10);
    }

    onShareRow(state, row) {
        if (row < state.traits.points.rowDeltas.length && state.traits.points.rowDeltas[row] != 0) {
            state.shareText += "+" + state.traits.points.rowDeltas[row] + " ";
        }
    }

    onShare(state) {
        state.shareText += "Total Points: +" + state.traits.points.total + "\n\n";
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

    onReveal(state, row, judged) {

    }
}

class CorrectnessColoringLetterTrait extends LetterTrait {
    name = "correctness"

    onStartCell(state, cell) {
        const storage = super.onStartCell(state, cell);
        storage.correctness = GUESS_TYPES.NONE;
        storage.ignored = false;
    }

    onReveal(state, row, judged) {
        for (let i = 0; i < NUM_COLS; i++) {
            const cell = state.letterData[judged.cells[i].guess];
            
            if (!cell.traits.correctness.ignored) {
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
}