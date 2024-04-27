class Trait {
    name = "default"

    stg(obj, trait) {
        return obj.traits[trait ? trait : this.name];
    }

    stat(obj, trait) {
        return obj.stats[trait ? trait : this.name];
    }

    onReload(state) {
        if (state.traits[this.name] == undefined) {
            state.traits[this.name] = {};
        }
        if (state.stats[this.name] == undefined) {
            state.stats[this.name] = {};
        }
        return this.stg(state);
    }

    onStart(state) {
        state.traits[this.name] = {};
        if (state.stats[this.name] == undefined) {
            state.stats[this.name] = {};
        }
        return this.stg(state);
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

    onPreReveal(state, row, judge) {

    }

    onReveal(state, row, judge) {

    }

    onRevealCell(state, cell, judge) {
        
    }

    onPreShare(state) {
        
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
        const stg = this.stg(cell);
        stg.letterbox.innerText = letter.toUpperCase();
        stg.letter = letter;
    }

    onRevealCell(state, cell, judge) {
        this.onTypeCell(state, cell, cell.judge.guess);
    }

    onStartCell(state, cell) {
        const stg = super.onStartCell(state, cell);
        stg.letter = "";

        this.onReloadCell(state, cell);
    }

    onReloadCell(state, cell) {
        const stg = super.onReloadCell(state, cell);

        const letterbox = document.createElement("span");
        letterbox.classList.add("center-text");
        cell.element.appendChild(letterbox);

        stg.letterbox = letterbox;
        letterbox.innerText = stg.letter.toUpperCase();
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

    onReveal(state, row, judge) {
        const pointStg = this.stg(state, "points");

        let comboSize = 0;
        for (let i = 0; i < NUM_COLS; i++) {
            if (row[i].judge.hidden) continue;

            if (row[i].judge.correctness == GUESS_TYPES.GREEN) {
                comboSize++;
            } else if (comboSize != 0) {
                const popup = makeFadingPopup(
                    comboSize == 1 ? `GREEN +${this.greenComboPoints[comboSize]}` : 
                    `COMBO x${comboSize} +${this.greenComboPoints[comboSize]}`,
                    p => p.classList.add("color-green")
                );
                pointStg.delta += this.greenComboPoints[comboSize];
                state.popups.addToRow(popup);
                comboSize = 0;
            }

            if (row[i].judge.correctness == GUESS_TYPES.YELLOW) {
                const popup = makeFadingPopup(`YELLOW +${this.yellowPoints}`, p => p.classList.add("color-yellow"));
                pointStg.delta += this.yellowPoints;
                state.popups.addToRow(popup);
            }
        }

        if (comboSize != 0) {
            const popup = makeFadingPopup(
                comboSize == 1 ? `GREEN +${this.greenComboPoints[comboSize]}` : 
                `COMBO x${comboSize} +${this.greenComboPoints[comboSize]}`,
                p => p.classList.add("color-green")
            );
            pointStg.delta += this.greenComboPoints[comboSize];
            state.popups.addToRow(popup);
            comboSize = 0;
        }
    }

    onRevealCell(state, cell, judge) {
        if (!cell.judge.hidden) {
            if (cell.judge.correctness == GUESS_TYPES.GREEN) {
                cell.element.classList.add("reveal-green");
            } else if (cell.judge.correctness == GUESS_TYPES.YELLOW) {
                cell.element.classList.add("reveal-yellow");
            } else if (cell.judge.correctness == GUESS_TYPES.GRAY) {
                cell.element.classList.add("reveal-gray");
            }
        }
        this.stg(cell).correctness = cell.judge.correctness;
    }

    onStartCell(state, cell) {
        const stg = super.onStartCell(state, cell);
        stg.correctness = GUESS_TYPES.NONE;
    }

    onReloadCell(state, cell) {
        const stg = super.onReloadCell(state, cell);
        if (cell.judge.judged) {
            this.onRevealCell(state, cell, null);
        }
    }

    onShareCell(state, cell) {
        // 🟥 🟧 🟨 🟩 🟦 🟪 🟫 ⬛ ⬜ ❔
        if (cell.judge.hidden) {
            cell.shareText = "❔";
        } else if (cell.judge.judged) {
            const correctness = cell.judge.correctness;
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
    // [1,2,3,...].map(e => 1000 * Math.floor(5 * ((1 + e)**(1 + e / 8))))
    prestigeLevels = [
        5000,10000,19000,33000,55000,91000,150000,246000,405000,666000,1101000,1828000,3046000,5099000,Infinity
    ]
    prestigeIcons = ["🍈","🍋","🍎","🍏","🥝","🍇","🍐","🍊","🍑","🥭","🍍","🍒","🍓","🍉","🍌"];

    calcLevel(points) {
        for (let i = 0; i < this.prestigeLevels.length; i++) {
            if (points < this.prestigeLevels[i]) return i;
        }
        return -1;
    }

    showPrestige(stg, level, value, high1, high2 = high1) {
        stg.levelElem.innerText = this.prestigeIcons[level];
        stg.boundsElem.innerText = Math.round(value) + " / " + Math.round(high2);

        const pct = 100 * Math.max(value, 0) / high1;
        stg.barElem.style["width"] = pct + "%";
    }

    onStart(state) {
        const stg = super.onStart(state);
        stg.saved = withDef(this.stat(state).saved, 0);
        stg.total = 0;
        stg.delta = 0;
        stg.rowDeltas = [];
        
        this.onReload(state);
    }

    onReload(state) {
        const stg = super.onReload(state);

        const box = document.createElement("div");
        const word = document.createElement("span");
        word.innerText = "Total: ";
        box.appendChild(word);
        const value = document.createElement("span");
        value.innerText = stg.total;
        box.appendChild(value);

        stg.element = value;
        state.popups.infoBoxes.right.insertBefore(box, state.popups.infoBoxes.right.firstChild);

        for (let i = 0; i < stg.rowDeltas.length; i++) {
            const popup = document.createElement("span");
            popup.innerText = signNum(stg.rowDeltas[i]);
            popup.classList.add("fade-in");
            state.popups.addToRow(popup, Infinity, i);
        }

        const prestigeBox = document.createElement("div");
        prestigeBox.classList.add("prestige-box");

        let prestigeText = document.createElement("div");
        prestigeText.classList.add("prestige-text");
        prestigeText.style["text-align"] = "left";
        prestigeBox.appendChild(prestigeText);

        let prestigeSubText = document.createElement("span");
        prestigeSubText.innerText = "Prestige Level: ";
        prestigeText.appendChild(prestigeSubText);

        prestigeSubText = document.createElement("span");
        prestigeText.appendChild(prestigeSubText);
        prestigeSubText.classList.add("prestige-icon");
        stg.levelElem = prestigeSubText;

        prestigeText = document.createElement("div");
        prestigeText.classList.add("prestige-text");
        prestigeText.style["text-align"] = "right";
        prestigeBox.appendChild(prestigeText);

        prestigeSubText = document.createElement("span");
        prestigeText.appendChild(prestigeSubText);
        stg.boundsElem = prestigeSubText;
        
        const prestigeBar = document.createElement("div");
        prestigeBar.classList.add("prestige-bar");
        prestigeBox.appendChild(prestigeBar);

        const prestigeBarInner = document.createElement("div");
        prestigeBarInner.classList.add("prestige-bar-inner");
        stg.barElem = prestigeBarInner;
        prestigeBar.appendChild(prestigeBarInner);

        const level = this.calcLevel(stg.total);
        this.showPrestige(stg, level, stg.total, this.prestigeLevels[level]);

        state.popups.infoBoxes.center.appendChild(prestigeBox);
    }

    onReveal(state, row, judge) {
        const stg = this.stg(state);

        if (judge.allCorrect) {
            const popup = makeFadingPopup(`${makeOrdinal(state.turn + 1)} Guess ${signNum(this.moveBonusPoints[state.turn])}`);
            stg.delta += this.moveBonusPoints[state.turn];
            popup.classList.add("color-green");
            state.popups.addToRow(popup);
        }

        const popup = document.createElement("span");
        popup.innerText = signNum(stg.delta);
        popup.classList.add("fade-in");
        state.popups.addToRow(popup, Infinity);

        let drop1 = stg.delta;
        stg.total += stg.delta;
        this.stat(state).saved = stg.total;
        stg.rowDeltas.push(stg.delta);
        stg.delta = 0;

        const tgt = stg.total;
        const tgtLevel = this.calcLevel(stg.total);
        let currLevel = this.calcLevel(stg.total - drop1);
        let currVal = stg.total - drop1;
        let upperVal = this.prestigeLevels[currLevel];

        let diff = Math.max(1, Math.floor(drop1 / 100));
        clearInterval(this.intId);
        this.intId = setInterval(() => {
            drop1 = Math.max(0, drop1 - diff);
            const cap = Math.min(upperVal, tgt);
            currVal = Math.min(cap, currVal + Math.max(1, (cap - currVal) / 10));
            upperVal = Math.min(this.prestigeLevels[currLevel], upperVal + Math.max(1, (this.prestigeLevels[currLevel] - upperVal) / 5));

            if (currVal >= upperVal && currLevel < tgtLevel) {
                currLevel++;
            }

            if (drop1 <= 0 && currLevel >= tgtLevel) {
                clearInterval(this.intId);
            }

            stg.element.innerText = stg.total - drop1;
            this.showPrestige(stg, currLevel, currVal, upperVal, this.prestigeLevels[currLevel]);
        }, 10);
    }

    onShareRow(state, row) {
        const stg = this.stg(state);

        if (row < stg.rowDeltas.length && stg.rowDeltas[row] != 0) {
            state.shareText += signNum(stg.rowDeltas[row]) + " ";
        }
    }

    onShare(state) {
        // ▰▱
        // 🟪⬜
        const stg = this.stg(state);

        state.shareText += `Total Points: ${signNum(this.stg(state).total)}\n\n`;

        const level = this.calcLevel(stg.total);
        state.shareText += `Prestige Level:${this.prestigeIcons[level]}\n${stg.total}/${this.prestigeLevels[level]}\n`;

        const len = 8;
        const filled = Math.floor(len * stg.total / this.prestigeLevels[level]);
        state.shareText += `${"🟪".repeat(filled)}${"⬜".repeat(len - filled)}\n`;

        state.shareText += "\n";
    }
}

// --------------

class LetterTrait {
    name = "default/l"

    stg(obj, trait) {
        return obj.traits[trait ? trait : this.name];
    }

    stat(obj, trait) {
        return obj.stats[trait ? trait : this.name];
    }

    onType(state) {

    }

    onTypeCell(state, cell) {

    }

    onReload(state) {
        if (state.traits[this.name] == undefined) {
            state.traits[this.name] = {};
        }
        if (state.stats[this.name] == undefined) {
            state.stats[this.name] = {};
        }
        return this.stg(state);
    }

    onStart(state) {
        state.traits[this.name] = {};
        if (state.stats[this.name] == undefined) {
            state.stats[this.name] = {};
        }
        return state.traits[this.name];
    }

    onReloadCell(state, cell) {
        if (cell.traits[this.name] == undefined) {
            cell.traits[this.name] = {};
        }
        return this.stg(cell);
    }

    onStartCell(state, cell) {
        cell.traits[this.name] = {};
        return cell.traits[this.name];
    }

    onReveal(state, row, judge) {

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
        for (let i = 0; i < NUM_ROWS; i++) {
            if (state.rowData[i][0].judge.judged) {
                this.onReveal(state, state.rowData[i], null);
            }
        }
    }

    onReveal(state, row, judge) {
        for (let i = 0; i < NUM_COLS; i++) {
            const cell = state.letterData[row[i].judge.guess];
            const stg = this.stg(cell);
            
            if (!row[i].judge.hidden) {
                if (stg.correctness >= row[i].judge.correctness) {
                    stg.correctness = row[i].judge.correctness;
                    cell.element.classList.remove("reveal-green");
                    cell.element.classList.remove("reveal-yellow");
                    cell.element.classList.remove("reveal-gray");
                    if (row[i].judge.correctness == GUESS_TYPES.GREEN) {
                        cell.element.classList.add("reveal-green");
                    } else if (row[i].judge.correctness == GUESS_TYPES.YELLOW) {
                        cell.element.classList.add("reveal-yellow");
                    } else if (row[i].judge.correctness == GUESS_TYPES.GRAY) {
                        cell.element.classList.add("reveal-gray");
                    }
                }
            }
        }
    }
}