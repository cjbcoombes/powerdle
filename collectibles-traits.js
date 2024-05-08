// https://emojipedia.org/nature
const petSorter = (a, b) => {
    if (a.tier != b.tier) return b.tier - a.tier;
    return a.name.localeCompare(b.name);
};
const pets = 
`🐌 Snail 1
🦋 Butterfly 1
🐜 Ant 1
🐝 Bee 1
🪲 Beetle 1
🐞 Ladybug 1
🦗 Cricket 1
🪳 Cockroach 1
🕷️ Spider 1
🦂 Scorpion 2
🦟 Mosquito 1
🪰 Fly 1
🪱 Worm 1
🦠 Microbe 3
🐸 Frog 1
🐊 Crocodile 2
🐢 Turtle 2
🦎 Lizard 1
🐍 Snake 2
🐉 Dragon 3
🦕 Sauropod 2
🦖 T-Rex 3
🐋 Whale 2
🐬 Dolphin 3
🦭 Seal 1
🐟 Fish 1
🐠 Tropical Fish 1
🐡 Blowfish 2
🦈 Shark 3
🐙 Octopus 2
🪸 Coral 1
🪼 Jellyfish 1
🦀 Crab 1
🦞 Lobster 2
🦐 Shrimp 1
🦑 Squid 2
🦪 Oyster 1
🦃 Turkey 1
🐔 Chicken 1
🐓 Rooster 1
🐤 Chick 1
🐦 Bird 1
🐧 Penguin 2
🕊️ Dove 1
🦅 Eagle 2
🦆 Duck 1
🦢 Swan 2
🦉 Owl 2
🦤 Dodo 3
🦩 Flamingo 1
🦚 Peacock 3
🦜 Parrot 1
🐦‍⬛ Blackbird 1
🪿 Goose 1
🐒 Monkey 2
🦍 Gorilla 2
🦧 Orangutan 2
🐕 Dog 1
🐩 Poodle 1
🐺 Wolf 3
🦊 Fox 2
🦝 Raccoon 1
🐈 Cat 1
🐈‍⬛ Black Cat 2
🦁 Lion 3
🐅 Tiger 2
🐆 Leopard 2
🫎 Moose 3
🫏 Donkey 1
🐎 Horse 2
🦄 Unicorn 3
🦓 Zebra 2
🦌 Deer 1
🦬 Bison 2
🐂 Ox 2
🐃 Water Buffalo 1
🐄 Cow 1
🐖 Pig 1
🐗 Boar 2
🐏 Ram 1
🐑 Ewe 1
🐐 Goat 1
🐪 One-Hump Camel 2
🐫 Two-Hump Camel 2
🦙 Llama 3
🦒 Giraffe 1
🐘 Elephant 2
🦣 Mammoth 3
🦏 Rhino 2
🦛 Hippo 2
🐁 Mouse 1
🐀 Rat 1
🐹 Hamster 1
🐇 Rabbit 1
🐿️ Chipmunk 1
🦫 Beaver 1
🦔 Hedgehog 1
🦇 Bat 1
🐻 Bear 1
🐻‍❄️ Polar Bear 2
🐨 Koala 2
🐼 Panda 3
🦥 Sloth 1
🦦 Otter 1
🦨 Skunk 1
🦘 Kangaroo 2
🦡 Badger 1
⛄ Snowman 2
😈 Devil 3
👽 Alien 3
👹 Red Ogre 1
🧌 Troll 1
💩 Poop 2
👻 Ghost 2
👾 Space Invader 3
🤖 Robot 2`.split("\n").map(str => {
    str = str.split(" ");
    return {icon: str[0], name: str.slice(1, str.length - 1).join(" "), tier: str[str.length - 1] - 1};
})
pets.sort(petSorter);
pets.forEach((o, i) => o.id = i);

const PET_TIERS = {
    COMMON: 0,
    RARE: 1,
    EPIC: 2
};
const petTiers = [[], [], []];
pets.forEach(a => {
    petTiers[a.tier].push(a);
});

class PetCollectionTrait extends Trait {
    name = "pets"
    DISPLAY_COUNT = 3
    SHOP_COUNT = 4

    /*
    0 = not owned
    1 = owned, not equipped
    2 = first slot
    3 = second slot
    4 = third slot

    */

    static makePetBox(pet, ex = []) {
        return docMake("div", ["pet-box", ...ex], null, box => {
            if (pet) {
                if (pet.tier == PET_TIERS.COMMON) {
                    box.classList.add("pet-common");
                } else if (pet.tier == PET_TIERS.RARE) {
                    box.classList.add("pet-rare");
                } else if (pet.tier == PET_TIERS.EPIC) {
                    box.classList.add("pet-epic");
                }
            } else {
                box.classList.add("pet-none");
            }

            docMake("div", ["pet-icon"], box, icon => {
                icon.innerText = pet ? pet.icon : "X";
            });

            docMake("div", ["pet-question"], box, icon => {
                icon.innerText = "❔";
            });
        });

        /*

        Content: none, ? / pet,      pet
        Border:  gray, color-shaded, color-bright
        Shadow:  none, none,         color-bright

        */
    }

    reloadCollection(state) {
        const stg = this.stg(state.data);

        for (let i = 0; i < this.DISPLAY_COUNT; i++) {
            docId(`pet-display-${i}`).innerHTML = "";
            docId(`pet-display-${i}`).appendChild(PetCollectionTrait.makePetBox());
        }

        const container = docId("pet-collection");
        for (let i = 0; i < pets.length; i++) {
            const pet = pets[i];
            const box = PetCollectionTrait.makePetBox(pet);
            box.id = `pet-box-${i}`;
            box.addEventListener("click", e => {
                this.selectPet(state, pet.id);
                state.interactions.save();
            });
            container.appendChild(box);
        }

        for (let i = 0; i < pets.length; i++) {
            this.setPetStatus(state, i, stg.pets[i]);
        }
    }

    reloadShop(state) {
        const stg = this.stg(state.data);

        const shopPets = [];
        for (let i = 0; i < this.SHOP_COUNT; i++) {
            let r = state.interactions.rand.at(9213 + i * 191, pets.length);
            while (shopPets.includes(r)) {
                r = (r + 1) % pets.length; 
            }
            shopPets.push(r);

            
            const box = PetCollectionTrait.makePetBox(pets[r], ["pet-show-icon"]);
            
            docId(`pet-shop-${i}`).innerHTML = "";
            docId(`pet-shop-${i}`).appendChild(box);
            
            if (stg.pets[r] != 0) {
                box.classList.add("pet-show-shaded");
                docId(`pet-price-${i}`).innerText = "OWNED";
                docId(`pet-price-${i}`).classList.add("owned");
            } else if (pets[r].tier == PET_TIERS.COMMON) {
                docId(`pet-price-${i}`).innerText = "⚙️20";
                box.addEventListener("click", e => {
                    const ints = this.stg(state.interactions, "currency");
                    if (ints.hasQuantities(0, 0, 20)) {
                        ints.updateQuantities(0, 0, -20);
                        this.buyPet(state, r);
                        state.interactions.save();
                    }
                });
            } else if (pets[r].tier == PET_TIERS.RARE) {
                docId(`pet-price-${i}`).innerText = "🪙20";
                box.addEventListener("click", e => {
                    const ints = this.stg(state.interactions, "currency");
                    if (ints.hasQuantities(0, 20, 0)) {
                        ints.updateQuantities(0, -20, 0);
                        this.buyPet(state, r);
                        state.interactions.save();
                    }
                });
            } else if (pets[r].tier == PET_TIERS.EPIC) {
                docId(`pet-price-${i}`).innerText = "💎20";
                box.addEventListener("click", e => {
                    const ints = this.stg(state.interactions, "currency");
                    if (ints.hasQuantities(20, 0, 0)) {
                        ints.updateQuantities(-20, 0, 0);
                        this.buyPet(state, r);
                        state.interactions.save();
                    }
                });
            }
        }
    }

    buyPet(state, id) {
        const stg = this.stg(state.data);

        if (stg.pets[id] != 0) return;

        if (pets[id].name == "Alien") {
            this.stg(state.interactions, "achievements").give("alien");
        }
        this.setPetStatus(state, id, 1);
        this.reloadShop(state);
    }

    selectPet(state, id) {
        const stg = this.stg(state.data);

        if (stg.pets[id] != 1) return;

        for (let i = 0; i < this.DISPLAY_COUNT; i++) {
            if (stg.pets.some(p => p == i + 2)) continue;

            this.setPetStatus(state, id, i + 2);

            return;
        }
        
    }

    setPetStatus(state, id, status) {
        const stg = this.stg(state.data);
        const box = docId(`pet-box-${id}`);
        const oldStatus = stg.pets[id];

        if (oldStatus > 1) {
            docId(`pet-display-${oldStatus - 2}`).innerHTML = "";
            docId(`pet-display-${oldStatus - 2}`).appendChild(PetCollectionTrait.makePetBox());
        }
        stg.pets[id] = status;

        if (status == 0) {
            box.classList.remove("pet-show-icon");
            box.classList.add("pet-show-question", "pet-show-shaded");
        } else if (status == 1) {
            box.classList.remove("pet-show-question", "pet-show-shaded");
            box.classList.add("pet-show-icon");
        } else {
            box.classList.remove("pet-show-question");
            box.classList.add("pet-show-icon", "pet-show-shaded");

            for (let i = 0; i < stg.pets.length; i++) {
                if (i != id && stg.pets[i] == status) {
                    this.setPetStatus(state, i, 1);
                }
            }

            docId(`pet-display-${status - 2}`).innerHTML = "";
            const newbox = PetCollectionTrait.makePetBox(pets[id], ["pet-show-icon"]);
            newbox.addEventListener("click", e => {
                this.setPetStatus(state, id, 1);
                state.interactions.save();
            });
            docId(`pet-display-${status - 2}`).appendChild(newbox);
        }
    }

    onStart(state) {
        const stg = super.onStart(state);
        
        stg.pets = withDef(this.stg(state.stats).pets, (a => {
            if (localStorage.getItem("powerdle-creator")) {
                a[0] = 1;
            }
            a[88] = 1;
            return a;
        })(pets.map(a => 0))).slice();

        this.onReload(state);
    }

    onReload(state) {
        const stg = super.onReload(state);
        const ints = this.stg(state.interactions);
        ints.hasPet = id => stg.pets[id] > 0;
        ints.buyPet = id => this.buyPet(state, id); 

        const shopElem = docId("pet-shop");
        shopElem.style["grid-template-columns"] = `repeat(${this.SHOP_COUNT}, 1fr)`;
        for (let i = 0; i < this.SHOP_COUNT; i++) {
            docMake("div", [], shopElem, e => {
                e.id = `pet-shop-${i}`;
            });
            docMake("div", ["pet-price"], shopElem, e => {
                e.id = `pet-price-${i}`;
            });
        }

        this.reloadShop(state);

        const displayElem = docId("pet-display");
        displayElem.style["grid-template-columns"] = `repeat(${this.DISPLAY_COUNT}, 1fr)`;
        for (let i = 0; i < this.DISPLAY_COUNT; i++) {
            docMake("div", [], displayElem, e => e.id = `pet-display-${i}`);
        }

        this.reloadCollection(state);
    }

    onSave(state) {
        this.stg(state.stats).pets = this.stg(state.data).pets.slice();
    }

    onPreShare(state) {
        const stg = this.stg(state.data);

        if (!stg.pets.includes(2)) return;
        /*

        ❤️ Red Heart
        🧡 Orange Heart
        💛 Yellow Heart
        💚 Green Heart
        💙 Blue Heart
        💜 Purple Heart
        🤎 Brown Heart
        🖤 Black Heart
        🤍 White Heart
        */
        let str = "Pets: ";
        let strs = [];
        for (let i = 0; i < pets.length; i++) {
            if (stg.pets[i] < 2) continue;

            const pet = pets[i];
            
            if (pet.tier == PET_TIERS.COMMON) {
                strs[stg.pets[i]] = `🤎${pet.icon}🤎`;
            } else if (pet.tier == PET_TIERS.RARE) {
                strs[stg.pets[i]] = `💙${pet.icon}💙`;
            } else if (pet.tier == PET_TIERS.EPIC) {
                strs[stg.pets[i]] = `💜${pet.icon}💜`;
            }
        }
        strs.forEach(s => s ? (str += s) : null);
        str += "\n";

        return str;
    }
}