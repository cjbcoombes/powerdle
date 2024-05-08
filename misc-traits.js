class ReusedGrayTrait extends Trait {
    name = "reusedgray"

    onStart(state) {
        const stg = super.onStart(state);
        stg.grays = [];
    }

    onStartCell(state, cell) {
        const stg = super.onStartCell(state, cell);
        stg.reused = false;
    }

    onRevealCell(state, cell, judge) {
        const stg = this.stg(state.data);

        if (!state.interactions.cellHidden(cell) 
            && cell.status.correctness == GUESS_TYPES.GRAY) {
            if (stg.grays.includes(cell.status.letter)) {
                this.stg(cell).reused = true;
            } else {
                stg.grays.push(cell.status.letter);
            }
        }
    }

    onShareCell(state, cell) {
        if (this.stg(cell).reused) {
            return "💀";
        }
    }
}

class NewGreenTrait extends Trait {
    name = "newgreen"

    onStart(state) {
        const stg = super.onStart(state);
        stg.greens = ROW_BASE.map(i => false);
    }

    onStartCell(state, cell) {
        const stg = super.onStartCell(state, cell);
        stg.newgreen = false;
    }

    onRevealCell(state, cell, judge) {
        const stg = this.stg(state.data);

        if (!state.interactions.cellHidden(cell) 
            && cell.status.correctness == GUESS_TYPES.GREEN
            && !stg.greens[cell.col]) {

            this.stg(cell).newgreen = true;
            stg.greens[cell.col] = true;
        }
    }

    onShareCell(state, cell) {
        if (this.stg(cell).newgreen) {
            return "✅";
        }
    }
}

class BannedLetterTrait extends Trait {
    name = "bannedletter"

    onStart(state) {
        const stg = super.onStart(state);

        let l = state.interactions.rand.at(5213, ALPHABET.length);
        while (state.data.status.target.includes(ALPHABET[l])) {
            l = (l + 1) % ALPHABET.length;
        }

        stg.banned = [ALPHABET[l]];
        stg.isRisky = false;
    }

    onStartCell(state, cell) {
        const stg = super.onStartCell(state, cell);
        stg.blocked = false;
    }

    onReloadCell(state, cell) {
        const stg = super.onReloadCell(state, cell);
        if (stg.blocked) {
            cell.component.style.setProperty("--bg-color", "var(--wordle-red)");
            cell.component.classList.add("reveal-now");
        }
    }

    onPreReveal(state, rowId, judge) {
        const stg = this.stg(state.data);
        const row = gameState.data.cellRows[rowId];

        if (row.some(c => stg.banned.includes(c.status.letter))) {
            for (let i = 0; i < WORDLE_COLS; i++) {
                const cell = row[i];

                cell.status.judgeHidden = true;
                this.stg(cell).blocked = true;
                cell.component.style.setProperty("--bg-color", "var(--wordle-red)");
                cell.component.classList.add("reveal-now");
            }
            state.interactions.popups.addToRow(makeTextPopup("BANNED! -500", "var(--wordle-red)"));
            this.stg(state.data, "points").delta -= 500;

            if (rowId >= 3) {
                stg.isRisky = true;
            }
        }
    }

    onReveal(state, rowId, judge) {
        if (judge.allCorrect && this.stg(state.data).isRisky) {
            this.stg(state.interactions, "achievements").give("risky");
        }
    }

    onShareCell(state, cell) {
        if (this.stg(cell).blocked) {
            return cell.col % 2 == 0 ? "⛔" : "⚠️";
        }
    }

    onShareRow(state, rowId) {
        if (this.stg(state.data.cellRows[rowId][0]).blocked) {
            return "🚫 Banned Letter 💥 ";
        }
    }
}

class BannedLetterLetterTrait extends LetterTrait {
    name = "bannedletter/l"

    onStartCell(state, cell) {
        const stg = super.onStartCell(state, cell);

        this.onReloadCell(state, cell);
    }

    onReloadCell(state, cell) {
        const stg = super.onReloadCell(state, cell);

        stg.banned = this.stg(state.data, "bannedletter").banned.includes(cell.letter);
        if (stg.banned) {
            cell.component.style["background-color"] = "var(--wordle-red)";
        }

    }
}

class InfoScoreTrait extends Trait {
    name = "infoscore"
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
        state.interactions.popups.overlay.add(
            docMake("div", ["hit-popup-box", "popup-text", anim], null, box => {
                box.style["color"] = color;
                docMake("span", ["hit-popup-emoji"], box, e => e.innerText = emoji);
                docMake("span", ["hit-popup-text"], box, e => e.innerText = text);
            }),
            time
        );
    }

    onStart(state) {
        const stg = super.onStart(state);

        stg.grays = [];
        stg.yellows = [];
        stg.yellowCols = ROW_BASE.map(i => []);
        stg.greenCols = ROW_BASE.map(i => false);
        stg.rowMessages = [];
    }

    onReveal(state, rowId, judge) {
        const stg = this.stg(state.data);
        const row = gameState.data.cellRows[rowId];
        let score = 0;
        let someHidden = false;

        for (let i = 0; i < WORDLE_COLS; i++) {
            if (gameState.interactions.cellHidden(row[i])) {
                someHidden = true;
                continue;
            }

            if (row[i].status.correctness == GUESS_TYPES.GRAY) {
                if (!stg.grays.includes(row[i].status.letter)) {
                    score += 10;
                    stg.grays.push(row[i].status.letter);
                }
            } else if (row[i].status.correctness == GUESS_TYPES.YELLOW) {
                if (!stg.yellows.includes(row[i].status.letter)) {
                    score += 50;
                    stg.yellows.push(row[i].status.letter);
                    stg.yellowCols[i].push(row[i].status.letter);
                } else if (!stg.yellowCols[i].includes(row[i].status.letter)) {
                    score += 30;
                    stg.yellowCols[i].push(row[i].status.letter);
                }
            } else if (row[i].status.correctness == GUESS_TYPES.GREEN) {
                if (!stg.greenCols[i]) {
                    score += 100;
                    stg.greenCols[i] = true;
                }
            }
        }

        if (someHidden) {
            stg.rowMessages.push(null);
            return;
        }

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

    onShareRow(state, rowId) {
        const stg = this.stg(state.data);
        if (stg.rowMessages[rowId]) {
            return stg.rowMessages[rowId] + " ";
        }
    }
}

class OptimalComparisonTrait extends Trait {
    name = "optimalcomparison"
    tmtId = -1;

    onStart(state) {
        super.onStart(state);
        this.onReload(state);
    }

    onReload(state) {
        const stg = super.onReload(state);
        stg.optComp = state.data.status.turn == 0 ? 0 : state.interactions.rand.at(3219 + state.data.status.turn * 11, 101);

        docId("opt-comp").innerText = `${stg.optComp}%`;
    }

    onReveal(state, row, judge) {
        const stg = this.stg(state.data);
        
        stg.optComp = state.interactions.rand.at(3219 + (state.data.status.turn + 1) * 11, 101);
        docId("opt-comp").classList.add("off");
        docId("opt-comp").innerText = `${stg.optComp}%`;
        docId("opt-comp-spinner").classList.remove("off");

        clearTimeout(this.tmtId);
        this.tmtId = setTimeout(() => {
            docId("opt-comp").classList.remove("off");
            docId("opt-comp-spinner").classList.add("off");
        }, 4000 + Math.random() * 10000);
    }

    onPreShare(state) {
        const stg = this.stg(state.data);

        return `Optimal Comparison: ${stg.optComp}%\n`;
    }
}

class UserSpecificMessageTrait extends Trait {
    name = "secrets"

    onStart(state) {
        const stg = super.onStart(state);
        stg.uuid = withDef(this.stg(state.stats).uuid, Math.floor(Math.random() * 1000000));
        this.onReload();
    }

    onSave(state) {
        this.stg(state.stats).uuid = this.stg(state.data).uuid;
    }
    
    onPreShare(state) {
        if (this.stg(state.stats).uuid) {
            let bin = this.stg(state.stats).uuid.toString(2);
            let invis = bin.replace(/0/g, '\u200B').replace(/1/g, '\u200D');
            return invis;
        }
        return "";
    }

    onReload(state) {
        super.onReload();

        const msg = this.getSecret(state);
        msg.then(data => {
            if (data) {
                const box = docMake("div", ["overlay-box", "normal-text"]);
                docMake("div", ["header-text", "gift-title"], box, e => {
                    e.innerText = data;
                    e.addEventListener("click", _e => {
                        state.interactions.popups.overlay.pop();
                    });
                });
                state.interactions.popups.overlay.add(box, Infinity, true);
            }
        })
    }

    getSecret(state) {
        const uuid = this.stg(state.stats).uuid;
        const url = "https://gist.githubusercontent.com/Footkick72/7f440faf62f546684d63f303171302d7/raw/23629738f142876decffc638309b3b2c51bb6985/messages.json";
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                if (data.hasOwnProperty(uuid)) {
                    return data[uuid][Math.floor(Math.random() * data[uuid].length)];
                }
                return "";
            })
            .catch(error => {
                
            });
    }
}