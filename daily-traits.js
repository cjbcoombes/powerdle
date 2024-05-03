class DailyGiftTrait extends Trait {
    name = "dailygift"
    gifts = [
        {
            icon: "⚙️", 
            fill: (state, reward) => docMake("div", ["header-text", "smaller"], null, e => e.innerText = signNum(reward)),
            reward: state => {
                const amount = state.interactions.rand.at(5555, 4) + 8;
                this.stg(state.interactions, "currency").updateQuantities(0, 0, amount); 
                return amount;
            }
        },
        {
            icon: "🪙", 
            fill: (state, reward) => docMake("div", ["header-text", "smaller"], null, e => e.innerText = signNum(reward)),
            reward: state => {
                const amount = state.interactions.rand.at(7411, 3) + 4;
                this.stg(state.interactions, "currency").updateQuantities(0, amount, 0);
                return amount;
            }
        },
        {
            icon: "💎", 
            fill: (state, reward) => docMake("div", ["header-text", "smaller"], null, e => e.innerText = signNum(reward)),
            reward: state => {
                const amount = state.interactions.rand.at(9010, 2) + 1;
                this.stg(state.interactions, "currency").updateQuantities(amount, 0, 0);
                return amount;
            }
        },
        {
            icon: "🐕",
            extraTime: 10000,
            fill: (state, reward, container) => {
                let arr = [reward];
                for (let i = 0; i < 25; i++) {
                    let r = Math.floor(Math.random() * pets.length);
                    while (arr.includes(r)) {
                        r = (r + 1) % pets.length; 
                    }
                    arr.push(r);
                }
                const div = docMake("div", []);
                div.style["font-size"] = "0.4em";

                let thres = null;
                const f = t => {
                    if (!thres) {
                        thres = t;
                    }

                    if (arr.length > 0) {
                        if (t >= thres) {
                            if (div.firstChild) div.removeChild(div.firstChild);
                            const box = PetCollectionTrait.makePetBox(pets[arr.pop()], ["pet-show-icon"]);
                            div.appendChild(box);
                            if (arr.length == 0) {
                                container.appendChild(makeLightRays(1, 50, "em"));
                            }

                            thres += (30 - arr.length)**2;
                        }

                        requestAnimationFrame(f);
                    }
                };
                requestAnimationFrame(f);

                return div;
            },
            reward: state => {
                const op = state.interactions.rand.at(1012, pets.length);
                let p = op;
                while (this.stg(state.interactions, "pets").hasPet(p)) {
                    p = (p + 1) % pets.length;
                    if (p == op) return -1;
                }

                this.stg(state.interactions, "pets").buyPet(p);
                return p;
            }
        },
        {
            icon: "💸",
            fill: state => docMake("img", [], null, img => {
                img.style["width"] = img.style["height"] = "1.5em";
                img.src = "https://upload.wikimedia.org/wikipedia/en/9/9a/Trollface_non-free.png";
            }),
            reward: state => {}
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

            docMake("div", ["header-text", "gift-title"], box, e => {
                e.innerText = "Daily Streak Gifts";
                e.style["grid-column"] = "1 / 4";
                e.style["grid-row"] = 1;
            });

            for (let i = 0; i < this.gifts.length; i++) {
                const j = i;
                docMake("div", ["header-text", "gift-day"], box, e => {
                    e.style["grid-column"] = 1;
                    e.style["grid-row"] = i + 2;
                    
                    if (stg.giftDay == i) e.classList.add("selected");
                    e.innerText = `Day ${i + 1}`;
                });
                const inner = docMake("div", ["gift-gift", "inside"], box, e => {
                    e.style["grid-column"] = 2;
                    e.style["grid-row"] = i + 2;

                    if (stg.giftDay == i) {
                        e.classList.add("selected");
                    }
                });
                docMake("div", ["gift-gift"], box, e => {
                    e.style["grid-column"] = 2;
                    e.style["grid-row"] = i + 2;

                    if (stg.giftDay == i) {
                        e.classList.add("selected");
                        e.appendChild(makeLightRays(1, 50, "em"));
                        e.addEventListener("click", _e => {
                            if (stg.giftClaimed) return;
                            stg.giftClaimed = true;
                            const reward = this.gifts[j].reward(state);
                            inner.appendChild(this.gifts[j].fill(state, reward, inner));
                            state.interactions.save();

                            e.classList.add("revealed");
                            box.classList.add("vanish");
                            box.style["animation-delay"] = (3000 + (this.gifts[j].extraTime ? this.gifts[j].extraTime : 0)) + "ms";
                            setTimeout(() => state.interactions.popups.overlay.pop(), 4500 + (this.gifts[j].extraTime ? this.gifts[j].extraTime : 0));
                        });
                    }
                    docMake("div", ["gift-icon"], e, icon => {
                        icon.innerText = this.gifts[i].icon;
                    })
                });
                docMake("div", ["gift-status"], box, e => {
                    e.style["grid-column"] = 3;
                    e.style["grid-row"] = i + 2;

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