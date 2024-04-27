// https://emojipedia.org/nature
const animalSorter = (a, b) => {
    if (a.tier != b.tier) return b.tier - a.tier;
    return a.name.localeCompare(b.name);
};
const animals = 
`🐌 Snail 1
🦋 Butterfly 2
🐜 Ant 1
🐝 Bee 2
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
🐸 Frog 2
🐊 Crocodile 2
🐢 Turtle 2
🦎 Lizard 1
🐍 Snake 2
🐉 Dragon 3
🦕 Sauropod 3
🦖 T-Rex 3
🐋 Whale 2
🐬 Dolphin 3
🦭 Seal 2
🐟 Fish 1
🐠 Tropical Fish 2
🐡 Blowfish 2
🦈 Shark 3
🐙 Octopus 2
🪸 Coral 1
🪼 Jellyfish 1
🦀 Crab 2
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
🦩 Flamingo 2
🦚 Peacock 3
🦜 Parrot 2
🐦‍⬛ Blackbird 1
🪿 Goose 1
🐒 Monkey 2
🦍 Gorilla 3
🦧 Orangutan 2
🐕 Dog 1
🐩 Poodle 1
🐺 Wolf 3
🦊 Fox 2
🦝 Raccoon 2
🐈 Cat 1
🐈‍⬛ Black Cat 2
🦁 Lion 3
🐅 Tiger 3
🐆 Leopard 3
🫎 Moose 3
🫏 Donkey 1
🐎 Horse 2
🦄 Unicorn 3
🦓 Zebra 2
🦌 Deer 1
🦬 Bison 2
🐂 Ox 2
🐃 Water Buffalo 2
🐄 Cow 1
🐖 Pig 1
🐗 Boar 2
🐏 Ram 1
🐑 Ewe 1
🐐 Goat 1
🐪 One-Hump Camel 2
🐫 Two-Hump Camel 2
🦙 Llama 3
🦒 Giraffe 2
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
🐻 Bear 2
🐻‍❄️ Polar Bear 3
🐨 Koala 2
🐼 Panda 3
🦥 Sloth 2
🦦 Otter 2
🦨 Skunk 1
🦘 Kangaroo 2
🦡 Badger 1
⛄ Snowman 2
😈 Devil 3
👽 Alien 3
👹 Red Ogre 2
🧌 Troll 2
💩 Poop 2
👻 Ghost 2
👾 Space Invader 3
🤖 Robot 2`.split("\n").map(str => {
    str = str.split(" ");
    return {icon: str[0], name: str.slice(1, str.length - 1).join(" "), tier: str[str.length - 1] - 1};
})
animals.sort(animalSorter);
animals.forEach((o, i) => o.id = i);

const ANIMAL_TIERS = {
    COMMON: 0,
    RARE: 1,
    EPIC: 2
};
const animalTiers = [[], [], []];
animals.forEach(a => {
    animalTiers[a.tier].push(a);
});

class PetCollectionTrait extends Trait {
    name = "pets"

    makePetBox(pet, shaded = false) {
        const box = document.createElement("div");
        box.classList.add("pet-box");
        if (shaded) {
            box.classList.add("pet-shaded");
        }

        const icon = document.createElement("span");
        icon.classList.add("center-text", "pet-icon");
        icon.innerText = pet.icon;

        box.appendChild(icon);

        if (pet.tier == ANIMAL_TIERS.COMMON) {
            box.classList.add("pet-common");
        } else if (pet.tier == ANIMAL_TIERS.RARE) {
            box.classList.add("pet-rare");
        } else if (pet.tier == ANIMAL_TIERS.EPIC) {
            box.classList.add("pet-epic");
        }

        return box;
    }

    makeEmptyPetBox(question = false) {
        const box = document.createElement("div");
        if (question) {
            const icon = document.createElement("span");
            icon.classList.add("center-text", "pet-icon");
            icon.innerText = "❔";
            box.appendChild(icon);
            box.classList.add("pet-shaded");
        }
        box.classList.add("pet-box", "pet-none");

        return box;
    }

    reloadCollection(state) {
        const stg = this.stg(state);

        const boxbox = stg.displayBox;
        boxbox.innerHTML = "";
        const box = stg.collectionBox;
        box.innerHTML = "";

        const MAX_DISPLAY = 3;
        let selected = stg.pets.filter(p => p == 2).length;

        for (let i = 0; i < animals.length; i++) {
            const pet = animals[i];
            const j = i;

            if (stg.pets[i] == 2) {
                let petBox = this.makePetBox(pet);
                petBox.addEventListener("click", () => {
                    stg.pets[j] = 1;
                    state.save();
                    this.reloadCollection(state);
                })
                boxbox.appendChild(petBox);

                petBox = this.makePetBox(pet, true);
                box.appendChild(petBox);
            } else if (stg.pets[i] == 1) {
                const petBox = this.makePetBox(pet);
                if (selected < MAX_DISPLAY) {
                    petBox.addEventListener("click", () => {
                        stg.pets[j] = 2;
                        state.save();
                        this.reloadCollection(state);
                    });
                }
                box.appendChild(petBox);
            } else {
                box.appendChild(this.makeEmptyPetBox(true));
            }

        }
        for (let j = selected; j < MAX_DISPLAY; j++) {
            boxbox.appendChild(this.makeEmptyPetBox());
        }
    }

    onStart(state) {
        const stg = super.onStart(state);
        
        stg.pets = withDef(this.stat(state).pets, (a => {
            if (localStorage.getItem("powerdle-creator")) {
                a[0] = 1;
            }
            a[97] = 1;
            return a;
        })(animals.map(a => 0)));

        this.onReload(state);
    }

    onReload(state) {
        const stg = super.onReload(state);

        const row = document.createElement("tr");
        row.classList.add("scale-font");
        state.appsTable.appendChild(row);

        let box = document.createElement("div");
        box.innerText = "Pet Shop";
        box.classList.add("pet-text");
        row.appendChild(box);

        box = document.createElement("div");
        box.classList.add("pet-text");
        let boxbox = document.createElement("div");
        boxbox.classList.add("pet-shop-box");
        box.appendChild(boxbox);
        row.appendChild(box);

        const pets = [
            state.randAt(9213, animals.length),
            state.randAt(9644, animals.length),
            state.randAt(2285, animals.length)
        ];
        pets[0] = 97;
        while (pets[1] == pets[0]) pets[1] = (pets[1] + 1) % animals.length;
        while (pets[2] == pets[0] || pets[2] == pets[1]) pets[2] = (pets[2] + 1) % animals.length;

        const topBox = document.createElement("div");
        const bottomBox = document.createElement("div");
        for (let i = 0; i < pets.length; i++) {
            const pet = animals[pets[i]];

            topBox.appendChild(this.makePetBox(pet));
            const button = document.createElement("div");
            bottomBox.appendChild(button);
            if (stg.pets[pets[i]] == 0) {
                button.classList.add("pet-shop-button");
                const inner1 = document.createElement("div");
                const inner2 = document.createElement("div");
                if (pet.tier == ANIMAL_TIERS.COMMON) {
                    inner1.innerText = "⚙️";
                    inner2.innerText = "20";
                } else if (pet.tier == ANIMAL_TIERS.RARE) {
                    inner1.innerText = "🪙";
                    inner2.innerText = "20";
                } else if (pet.tier == ANIMAL_TIERS.EPIC) {
                    inner1.innerText = "💎";
                    inner2.innerText = "20";
                }
                button.appendChild(inner1);
                button.appendChild(inner2);
                const j = i;
                button.addEventListener("click", () => {
                    const currStg = this.stg(state, "currency");
                    if (pet.tier == ANIMAL_TIERS.COMMON) {
                        if (currStg.totalGears < 20) return;
                        currStg.updateQuantities(state, 0, 0, -20);
                    } else if (pet.tier == ANIMAL_TIERS.RARE) {
                        if (currStg.totalCoins < 20) return;
                        currStg.updateQuantities(state, 0, -20, 0);
                    } else if (pet.tier == ANIMAL_TIERS.EPIC) {
                        if (currStg.totalGems < 20) return;
                        currStg.updateQuantities(state, -20, 0, 0);
                    }
                    stg.pets[pets[j]] = 1;
                    state.save();
                    this.reloadCollection(state);

                    button.innerHTML = "";
                    button.classList.remove("pet-shop-button");
                    button.classList.add("pet-shop-owned");
                    const inner = document.createElement("div");
                    inner.innerText = "OWNED";
                    button.appendChild(inner);
                });
            } else {
                button.classList.add("pet-shop-owned");
                const inner = document.createElement("div");
                inner.innerText = "OWNED";
                button.appendChild(inner);
            }
        }
        boxbox.appendChild(topBox);
        boxbox.appendChild(bottomBox);

        // ----

        box = document.createElement("div");
        box.innerText = "Pet Collection";
        box.classList.add("pet-text");
        row.appendChild(box);
        
        box = document.createElement("div");
        box.classList.add("pet-text");
        boxbox = document.createElement("div");
        boxbox.classList.add("pet-display-box");
        stg.displayBox = boxbox;
        box.appendChild(boxbox);
        row.appendChild(box);

        box = document.createElement("div");
        box.classList.add("pet-text");
        stg.collectionBox = box;
        row.appendChild(box);

        this.reloadCollection(state);
    }

    onSave(state) {
        this.stat(state).pets = this.stg(state).pets.slice();
    }

    onPreShare(state) {
        const stg = this.stg(state);
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
        state.shareText += "Pets: ";
        for (let i = 0; i < animals.length; i++) {
            if (stg.pets[i] != 2) continue;

            const pet = animals[i];
            
            if (pet.tier == ANIMAL_TIERS.COMMON) {
                state.shareText += `🤎${pet.icon}🤎`;
            } else if (pet.tier == ANIMAL_TIERS.RARE) {
                state.shareText += `💙${pet.icon}💙`;
            } else if (pet.tier == ANIMAL_TIERS.EPIC) {
                state.shareText += `💜${pet.icon}💜`;
            }
        }
        state.shareText += "\n\n";
    }
}