const achievements = [
    {
        id: "correct_1",
        icon: "1️⃣",
        name: "Hole in 1!",
        desc: "Get the word right on your first guess!"
    },
    {
        id: "correct_2",
        icon: "2️⃣",
        name: "Eagle",
        desc: "Get the word right on your second guess."
    },
    {
        id: "correct_3",
        icon: "3️⃣",
        name: "Birdie",
        desc: "Get the word right on your third guess."
    },
    {
        id: "correct_4",
        icon: "4️⃣",
        name: "Par",
        desc: "Get the word right on your fourth guess."
    },
    {
        id: "correct_5",
        icon: "5️⃣",
        name: "Bogey",
        desc: "Get the word right on your fifth guess."
    },
    {
        id: "correct_6",
        icon: "6️⃣",
        name: "Cutting it Close!",
        desc: "Get the word right on your last guess."
    },
    {
        id: "all_gray",
        icon: "🪦",
        name: "Grayed Out",
        desc: "Make a guess with all gray letters."
    },
    {
        id: "all_yellow",
        icon: "✨",
        name: "Straight Flush",
        desc: "Make a guess with all yellow letters."
    },
    {
        id: "risky",
        icon: "⚠️",
        name: "Risky",
        desc: "Use the banned letter on a 4th or later guess, and still win."
    },
    {
        id: "100_gems",
        icon: "💎",
        name: "Jeweler",
        desc: "Have 100 gems."
    },
    {
        id: "100_coins",
        icon: "🪙",
        name: "Nest Egg",
        desc: "Have 100 coins."
    },
    {
        id: "100_gears",
        icon: "⚙️",
        name: "Mechanic",
        desc: "Have 100 gears."
    },
    {
        id: "streak_10",
        icon: "♿️",
        name: "Streaking",
        desc: "Have a 10-day streak."
    },
    {
        id: "streak_100",
        icon: "🚀",
        name: "Blast Off!",
        desc: "Have a 100-day streak."
    }
];
const achievementsIndex = {};
achievements.forEach((a, i) => {
    achievementsIndex[a.id] = a;
    a.index = i;
});

class AchievementsTrait extends Trait {
    name = "achievements"

    setDisplay(state, ach) {
        const status = ach && this.stg(state.data).achieved.includes(ach.id);
        ach = ach ? ach : {
            icon: "❔",
            name: "???",
            desc: "?????"
        }

        if (status) {
            docId("achievement-display-box").classList.add("achieved");
        } else {
            docId("achievement-display-box").classList.remove("achieved");
        }

        docId("achievement-display-icon").innerText = ach.icon;
        docId("achievement-display-name").innerText = ach.name;
        docId("achievement-display-status").innerText = `${status ? "" : "NOT "}ACHIEVED`;
        docId("achievement-display-status").style["color"] = `var(--wordle-${status ? "green" : "red"})`;
        docId("achievement-display-description").innerText = ach.desc;
    }

    makeOverlay(state, id) {
        const ach = achievements[id];
        state.interactions.popups.overlay.add(
            docMake("div", ["overlay-box", "fade-in-out"], null, elem => {
                elem.style["animation-duration"] = "5s";
                docMake("div", ["header-text"], elem, title => {
                    title.innerText = "Achievement Get!";
                });
                docMake("div", ["header-text", "header-bigger"], elem, icon => {
                    icon.innerText = ach.icon;
                });
                docMake("div", ["header-text", "header-smaller"], elem, name => {
                    name.innerText = ach.name;
                });
                docMake("div", ["normal-text"], elem, desc => {
                    desc.innerText = ach.desc;
                });
            }),
            5000
        );
    }

    give(state, id) {
        const stg = this.stg(state.data);
        const ach = achievementsIndex[id];

        if (stg.achieved.includes(id)) return;

        stg.achieved.push(id);
        stg.newAchieved.push(id);
        docId(`achievement-box-${ach.index}`).classList.add("achieved");

        if (stg.isRevealing) {
            stg.queue.push(ach.index);
        } else {
            this.makeOverlay(state, ach.index);
        }
    }

    onStart(state) {
        const stg = super.onStart(state);

        stg.achieved = withDef(this.stg(state.stats).achieved, []).slice();
        stg.newAchieved = [];
        
        stg.queue = [];
        stg.isRevealing = false;

        this.onReload(state);
    }

    onReload(state) {
        const stg = super.onReload(state);
        this.stg(state.interactions).give = id => this.give(state, id);

        const container = docId("achievement-list");
        for (let i = 0; i < achievements.length; i++) {
            const ach = achievements[i];
            docMake("div", ["achievement-box"], container, box => {
                box.id = `achievement-box-${i}`;

                if (stg.achieved.includes(ach.id)) {
                    box.classList.add("achieved");
                }
                docMake("div", [], box, icon => {
                    icon.innerText = ach.icon;
                });

                box.addEventListener("click", e => {
                    this.setDisplay(state, ach);
                });
            })
        }

        this.setDisplay(state);
    }

    onPreReveal(state, rowId, judge) {
        const stg = this.stg(state.data);
        
        stg.isRevealing = true;
    }

    onReveal(state, rowId, judge) {
        const stg = this.stg(state.data);
        
        stg.queue.forEach(i => this.makeOverlay(state, i));
        stg.queue = [];
        stg.isRevealing = false;
    }

    onSave(state) {
        this.stg(state.stats).achieved = this.stg(state.data).achieved.slice();
    }

    onPreShare(state) {
        let str = "Achievements: ";
        let len = str.length;
        const stg = this.stg(state.data);

        if (stg.achieved.length > 0) {
            const after = stg.achieved.filter(id => !stg.newAchieved.includes(id));
            if (stg.newAchieved.length > 0) {
                str += "+";
                len++;
                stg.newAchieved.forEach((id, i) => {
                    str += achievementsIndex[id].icon;
                    len += 2;
                    if (after.length > 0 && i == stg.newAchieved.length - 1) {
                        str += "|";
                        len++;
                    }

                    if (len >= 20) {
                        str += "\n";
                        len = 0;
                    }
                });
            }
            after.forEach(id => {
                str += achievementsIndex[id].icon;
                len += 2;
                if (len >= 20) {
                    str += "\n";
                    len = 0;
                }
            });
        } else {
            str += "None";
        }
        str += "\n";

        return str;
    }
}