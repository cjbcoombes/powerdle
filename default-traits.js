class Trait {
    name = "default"

    stg(obj, trait) {
        return obj.traits[trait ? trait : this.name];
    }

    onReload(state) {
        if (state.data.traits[this.name] == undefined) {
            state.data.traits[this.name] = {};
        }
        if (state.stats.traits[this.name] == undefined) {
            state.stats.traits[this.name] = {};
        }
        if (state.interactions.traits[this.name] == undefined) {
            state.interactions.traits[this.name] = {};
        }
        if (state.components.traits[this.name] == undefined) {
            state.components.traits[this.name] = {};
        }
        return this.stg(state.data);
    }

    onStart(state) {
        state.data.traits[this.name] = {};
        state.interactions.traits[this.name] = {};
        state.components.traits[this.name] = {};
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

    onPreReveal(state, rowId, judge) {

    }

    onReveal(state, rowId, judge) {

    }

    onRevealCell(state, cell, judge) {
        
    }

    onPreShare(state) {
    }

    onShareCell(state, cell) {
    }

    onShareRow(state, row) {
    }

    onShare(state) {
    }
}

class CorrectnessColoringTrait extends Trait {
    name = "correctness"
    anims = [
        "reveal-flip",
        "reveal-slide",
        "reveal-fade",
        "reveal-spin",
        "reveal-shift",
        "reveal-center"
    ]

    onStartCell(state, cell) {
        const stg = super.onStartCell(state, cell);
    }

    onReloadCell(state, cell) {
        const stg = super.onReloadCell(state, cell);

        if (cell.status.judged) {
            this.onRevealCell(state, cell, null);
        }
    }

    onRevealCell(state, cell, judge) {
        if (!state.interactions.cellHidden(cell)) {
            if (cell.status.correctness == GUESS_TYPES.GREEN) {
                cell.component.style.setProperty("--bg-color", "var(--wordle-green)");
            } else if (cell.status.correctness == GUESS_TYPES.YELLOW) {
                cell.component.style.setProperty("--bg-color", "var(--wordle-yellow)");
            } else if (cell.status.correctness == GUESS_TYPES.GRAY) {
                cell.component.style.setProperty("--bg-color", "var(--wordle-gray)");
            }
            cell.component.style["animation-delay"] = `${200 * cell.col}ms`;
            cell.component.classList.add(this.anims[cell.row % this.anims.length]);
        }
    }

    onShareCell(state, cell) {
        // 🟥 🟧 🟨 🟩 🟦 🟪 🟫 ⬛ ⬜ ❔
        if (state.interactions.cellHidden(cell)) {
            return "❔";
        } else if (cell.status.judged) {
            const correctness = cell.status.correctness;
            if (correctness == GUESS_TYPES.GREEN) {
                return "🟩";
            } else if (correctness == GUESS_TYPES.YELLOW) {
                return "🟨";
            } else if (correctness == GUESS_TYPES.GRAY) {
                return "🟫";
            } 
        } else {
            return "⬛";
        }
    }
}

class StreakTrait extends Trait {
    name = "streak"

    onStart(state) {
        const stg = super.onStart(state);
        const stats = this.stg(state.stats);

        stg.streak = withDef(stats.streak, 0);
        stg.lastDayWon = withDef(stats.lastDayWon, -2);

        if (stg.lastDayWon < state.day - 1) {
            stg.streak = 0;
        }

        stg.startStreak = stg.streak;
    }

    onReveal(state, rowId, judge) {
        const stg = this.stg(state.data);

        if (judge.allCorrect) {
            stg.streak++;
            stg.lastDayWon = state.data.status.day;    
        }
    }

    onSave(state) {
        const stg = this.stg(state.data);
        const stats = this.stg(state.stats);

        stats.streak = stg.streak;
        stats.lastDayWon = stg.lastDayWon;
    }

    onPreShare(state) {
        const streak = this.stg(state.data).streak
        return `Streak: ${streak} day${streak == 1 ? "" : "s"}\n`;
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
    greenComboPoints = [
        0,
        100,
        400,
        900,
        1600,
        2500
    ]
    yellowPoints = 50
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
        docId("prestige-icon").innerText = this.prestigeIcons[level];
        docId("prestige-bounds").innerText = Math.round(value) + " / " + Math.round(high2);

        const pct = 100 * Math.max(value, 0) / high1;
        docId("prestige-bar-inner").style["width"] = pct + "%";
    }

    onStart(state) {
        const stg = super.onStart(state);
        stg.saved = withDef(this.stg(state.stats).saved, 0);
        stg.mult = this.stg(state.data, "streak").streak;
        stg.mult = 1 + Math.log2(stg.mult + 1) / 4;
        stg.mult = Math.round(stg.mult * 100) / 100;
        stg.total = stg.saved;
        stg.delta = 0;
        stg.dayDelta = 0;
        stg.rowDeltas = [];
        
        this.onReload(state);
    }

    onReload(state) {
        const stg = super.onReload(state);

        docId("points-total").innerText = signNum(stg.dayDelta);
        docId("points-mult").innerText = `x${stg.mult.toFixed(2)}`;

        for (let i = 0; i < stg.rowDeltas.length; i++) {
            state.interactions.popups.sidebars[i].add(makeTextPopup(signNum(stg.rowDeltas[i]), "white", null, "fade-in"), Infinity);
        }

        const level = this.calcLevel(stg.total);
        this.showPrestige(stg, level, stg.total, this.prestigeLevels[level]);
    }

    doCombos(state, row) {
        const pointStg = this.stg(state.data);

        let comboSize = 0;
        const endCombo = () => {
            state.interactions.popups.addToRow(
                makeTextPopup(
                    comboSize == 1 ? `GREEN +${this.greenComboPoints[comboSize]}` : 
                        `COMBO x${comboSize} +${this.greenComboPoints[comboSize]}`, 
                    "var(--wordle-green)"
                )
            );
            pointStg.delta += this.greenComboPoints[comboSize];
            comboSize = 0;
        };

        for (let i = 0; i < WORDLE_COLS; i++) {
            if (state.interactions.cellHidden(row[i])) {
                if (comboSize != 0) endCombo();
            }

            if (row[i].status.correctness == GUESS_TYPES.GREEN) {
                comboSize++;
            } else if (comboSize != 0) {
                endCombo();
            }

            if (row[i].status.correctness == GUESS_TYPES.YELLOW) {
                state.interactions.popups.addToRow(
                    makeTextPopup(
                        `YELLOW +${this.yellowPoints}`, 
                        "var(--wordle-yellow)"
                    )
                );
                pointStg.delta += this.yellowPoints;
            }
        }

        if (comboSize != 0) {
            endCombo();
        }
    }

    onReveal(state, rowId, judge) {
        const stg = this.stg(state.data);
        const turn = state.data.status.turn;

        this.doCombos(state, state.data.cellRows[rowId]);

        if (judge.allCorrect) {
            state.interactions.popups.addToRow(
                makeTextPopup(`${makeOrdinal(turn + 1)} Guess ${signNum(this.moveBonusPoints[turn])}`, "var(--wordle-green)"));
            stg.delta += this.moveBonusPoints[turn];
        }

        state.interactions.popups.addToRow(makeTextPopup(signNum(stg.delta), "white", null, "fade-in"), Infinity);

        let drop1 = Math.floor(stg.delta * stg.mult);
        stg.total += drop1;
        stg.dayDelta += drop1;
        stg.rowDeltas.push(drop1);
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

            if (drop1 <= 0 && currLevel >= tgtLevel && currVal >= tgt && upperVal >= this.prestigeLevels[currLevel]) {
                clearInterval(this.intId);
            }

            docId("points-total").innerText = signNum(stg.dayDelta - drop1);
            this.showPrestige(stg, currLevel, currVal, upperVal, this.prestigeLevels[currLevel]);
        }, 10);
    }

    onSave(state) {
        this.stg(state.stats).saved = this.stg(state.data).total;
    }

    onShareRow(state, row) {
        const stg = this.stg(state.data);

        if (row < stg.rowDeltas.length && stg.rowDeltas[row] != 0) {
            return signNum(stg.rowDeltas[row]) + " ";
        }
    }

    onShare(state) {
        // ▰▱
        // 🟪⬜
        const stg = this.stg(state.data);
        let str = `Total Points: ${signNum(stg.dayDelta)}\n\n`;

        const level = this.calcLevel(stg.total);
        str += `Prestige Level:${this.prestigeIcons[level]}\n${stg.total}/${this.prestigeLevels[level]}\n`;

        const len = 8;
        const filled = Math.floor(len * stg.total / this.prestigeLevels[level]);
        str += `${"🟪".repeat(filled)}${"⬜".repeat(len - filled)}\n`;

        return str;
    }
}