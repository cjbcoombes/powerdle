class DailyGiftTrait extends Trait {
    name = "dailygift"
    gifts = [
        {
            icon: "⚙️", 
            fill: state => docMake("div", ["header-text", "smaller"], null, e => e.innerText = "+10"),
            reward: state => this.stg(state.interactions, "currency").updateQuantities(0, 0, 10)
        },
        {
            icon: "🪙", 
            fill: state => docMake("div", ["header-text", "smaller"], null, e => e.innerText = "+5"),
            reward: state => this.stg(state.interactions, "currency").updateQuantities(0, 5, 0)
        },
        {
            icon: "💎", 
            fill: state => docMake("div", ["header-text", "smaller"], null, e => e.innerText = "+2"),
            reward: state => this.stg(state.interactions, "currency").updateQuantities(2, 0, 0)
        }
    ]

    onStart(state) {
        const stg = super.onStart(state);

        stg.giftDay = this.stg(state.data, "streak").streak % this.gifts.length;
        stg.giftClaimed = false;

        this.onReload(state);
    }

    onSave(state) {
        this.stg(state.stats).giftClaimed = this.stg(state.data).giftClaimed;
    }

    onReload(state) {
        const stg = super.onReload(state);

        if (!stg.giftClaimed) {
            const box = docMake("div", ["overlay-box", "gift-box", "normal-text"]);

            for (let i = 0; i < this.gifts.length; i++) {
                const j = i;
                docMake("div", ["header-text", "gift-day"], box, e => {
                    e.style["grid-column"] = 1;
                    e.style["grid-row"] = i + 1;
                    
                    if (stg.giftDay == i) e.classList.add("selected");
                    e.innerText = `Day ${i + 1}`;
                });
                docMake("div", ["gift-gift", "inside"], box, e => {
                    e.style["grid-column"] = 2;
                    e.style["grid-row"] = i + 1;

                    if (stg.giftDay == i) {
                        e.classList.add("selected");
                    }
                    e.appendChild(this.gifts[j].fill());
                });
                docMake("div", ["gift-gift"], box, e => {
                    e.style["grid-column"] = 2;
                    e.style["grid-row"] = i + 1;

                    if (stg.giftDay == i) {
                        e.classList.add("selected");
                        e.appendChild(makeLightRays(1, 50, "em"));
                        e.addEventListener("click", _e => {
                            stg.giftClaimed = true;
                            this.gifts[j].reward(state);
                            state.interactions.save();

                            e.classList.add("revealed");
                            box.classList.add("vanish");
                            setTimeout(() => state.interactions.popups.overlay.pop(), 4500);
                        });
                    }
                    docMake("div", ["gift-icon"], e, icon => {
                        icon.innerText = this.gifts[i].icon;
                    })
                });
                docMake("div", ["gift-status"], box, e => {
                    e.style["grid-column"] = 3;
                    e.style["grid-row"] = i + 1;

                    if (stg.giftDay == i) {
                        e.classList.add("selected");
                    }

                    if (i > stg.giftDay) {
                        e.innerText = "LOCKED";
                        e.style["color"] = "var(--wordle-red)";
                    } else if (i < stg.giftDay) {
                        e.innerText = "CLAIMED";
                        e.style["color"] = "var(--wordle-green)";
                    } else {
                        e.innerText = "CLAIM NOW";
                        e.style["color"] = "var(--wordle-yellow)";
                        e.classList.add("claim-now");
                    }
                })
            }

            state.interactions.popups.overlay.add(box, Infinity, true);
        }
    }
}