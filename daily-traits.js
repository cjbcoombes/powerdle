class DailyGiftTrait extends Trait {
    name = "dailygift"

    onStart(state) {
        const stg = super.onStart(state);
        const stat = this.stat(state);

        stg.giftDay = this.stg(state, "streak").streak % 5;
        stg.giftsClaimed = withDef(
            stg.giftDay == 0 ? undefined : stat.giftsClaimed,
            [false, false, false, false, false]
        );

        this.onReload(state);
    }

    onSave(state) {
        this.stat(state).giftsClaimed = this.stg(state).giftsClaimed;
    }

    onReload(state) {
        const stg = super.onReload(state);

        if (!stg.giftsClaimed[stg.giftDay]) {
            const box = document.createElement("div");
            box.classList.add("center-box", "gift-box");
            box.classList.add("scale-font");

            const table = document.createElement("table");
            for (let i = 0; i < 5; i++) {
                const row = document.createElement("tr");
                if (i == stg.giftDay) row.classList.add("current-day");

                let elem = document.createElement("td");
                elem.innerText = `Day ${i + 1}`;
                row.appendChild(elem);

                elem = document.createElement("td");
                const gift = document.createElement("div");
                gift.classList.add("gift-gift");
                const centerbox = document.createElement("div");
                centerbox.classList.add("center-text", "gift-icon");
                switch (i) {
                    case 0:
                        centerbox.innerText = "⚙️";
                        break;
                    case 1:
                        centerbox.innerText = "🪙";
                        break;
                    case 2:
                        centerbox.innerText = "💎";
                        break;
                    case 3:
                        centerbox.innerText = "💰";
                        break;
                    case 4:
                        centerbox.innerText = "❓";
                        break;
                }
                gift.appendChild(centerbox);
                if (i == stg.giftDay) {
                    const rays = makeLightRays(1, 50, "em");
                    rays.style["z-index"] = -1;
                    gift.appendChild(rays);
                }
                elem.appendChild(gift);
                row.appendChild(elem);

                elem = document.createElement("td");
                if (i > stg.giftDay) {
                    elem.innerText = "LOCKED";
                    elem.classList.add("color-red");
                } else if (stg.giftsClaimed[i]) {
                    elem.innerText = "CLAIMED";
                    elem.classList.add("color-green");
                } else if (i == stg.giftDay) {
                    const button = document.createElement("button");
                    button.classList.add("gift-button");
                    button.innerText = "Claim Gift";
                    const elemRef = elem;
                    button.addEventListener("click", e => {
                        stg.giftsClaimed[stg.giftDay] = true;
                        elemRef.innerHTML = "";
                        elem.innerText = "CLAIMED";
                        elem.classList.add("color-green");
                        state.save();
                    });
                    elem.appendChild(button);
                } else {
                    elem.innerText = "UNCLAIMED";
                    elem.classList.add("color-yellow");
                }
                row.appendChild(elem);

                table.appendChild(row);
            }
            box.appendChild(table);

            const button = document.createElement("button");
            button.classList.add("gift-button");
            button.innerText = "Close";
            button.addEventListener("click", e => {
                box.style["display"] = "none";
                gameState.popups.closeTopOverlay();
            });
            box.appendChild(button);

            gameState.popups.addToOverlay(box, Infinity, true);
        }
    }
}