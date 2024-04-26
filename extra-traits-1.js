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

class InfoScoreTrait extends Trait {
    /*
    New grays +10, old +0
    New greens +100, old +0
    New yellow +50, new spot +30, old +0

    [0,50) : Boring
    [50,250) : nothing
    [250,350) : Epic Strike!
    [350,500) : Critical Hit!
    500 : Knockout!

    Boring 🥱
    Epic Strike!⚡️
    Critical Hit! ☄️
    Knockout! 🥊🤜😵
    */

    makeMessage(state, emoji, color, text, anim, time) {
        const box = document.createElement("div");
        box.classList.add("center-box", "scale-font", "hit-popup-box", anim);
        box.style["color"] = color;

        const emojiBox = document.createElement("span");
        emojiBox.innerText = emoji;
        emojiBox.classList.add("hit-popup-emoji");

        const textBox = document.createElement("span");
        textBox.innerText = text;
        textBox.classList.add("hit-popup-text");

        box.appendChild(emojiBox);
        box.appendChild(textBox);

        state.popups.addToOverlay(box, time, false);
    }

    onStart(state) {
        const stg = super.onStart(state);

        stg.grays = [];
        stg.yellows = [];
        stg.yellowCols = ROW_BASE.map(i => []);
        stg.greenCols = ROW_BASE.map(i => false);
        stg.rowMessages = [];
    }

    onReveal(state, row, judge) {
        const stg = this.stg(state);
        let score = 0;
        let someHidden = false;

        for (let i = 0; i < NUM_COLS; i++) {
            if (row[i].judge.hidden) {
                someHidden = true;
                continue;
            }

            if (row[i].judge.correctness == GUESS_TYPES.GRAY) {
                if (!stg.grays.includes(row[i].judge.guess)) {
                    score += 10;
                    stg.grays.push(row[i].judge.guess);
                }
            } else if (row[i].judge.correctness == GUESS_TYPES.YELLOW) {
                if (!stg.yellows.includes(row[i].judge.guess)) {
                    score += 50;
                    stg.yellows.push(row[i].judge.guess);
                    stg.yellowCols[i].push(row[i].judge.guess);
                } else if (!stg.yellowCols[i].includes(row[i].judge.guess)) {
                    score += 30;
                    stg.yellowCols[i].push(row[i].judge.guess);
                }
            } else if (row[i].judge.correctness == GUESS_TYPES.GREEN) {
                if (!stg.greenCols[i]) {
                    score += 100;
                    stg.greenCols[i] = true;
                }
            }
        }

        if (someHidden) return;

        if (score < 50) {
            this.makeMessage(state, "🥱", "yellow", "Boring...", "hit-slide", 6000);
            stg.rowMessages.push("🥱 Boring...");
        } else if (score < 250) {
            stg.rowMessages.push(null);
        } else if (score < 350) {
            this.makeMessage(state, "⚡️", "orange", "Epic Strike!", "hit-bounce", 4000);
            stg.rowMessages.push("⚡️ Epic Strike!");
        } else if (score < 500) {
            this.makeMessage(state, "☄️", "red", "Critical Hit!", "hit-slam", 4000);
            stg.rowMessages.push("☄️ Critical Hit!");
        } else {
            this.makeMessage(state, "🤜😵", "red", "Knockout!", "hit-slam", 4000);
            stg.rowMessages.push("🤜😵 Knockout!");
        }
    }

    onShareRow(state, row) {
        const stg = this.stg(state);
        if (stg.rowMessages[row]) {
            state.shareText += stg.rowMessages[row] + " ";
        }
    }
}