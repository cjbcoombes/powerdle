// https://emojipedia.org/nature
const petSorter = (a, b) => {
    if (a.tier != b.tier) return b.tier - a.tier;
    return a.name.localeCompare(b.name);
};
const pets = 
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
    DISPLAY_COUNT = 4

    /*
    0 = not owned
    1 = owned, not equipped
    2 = first slot
    3 = second slot
    4 = third slot

    */

    makePetBox(pet, ex = []) {
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
            docId(`pet-display-${i}`).appendChild(this.makePetBox());
        }

        const container = docId("pet-collection");
        for (let i = 0; i < pets.length; i++) {
            const pet = pets[i];
            const box = this.makePetBox(pet);
            box.id = `pet-box-${i}`;
            box.addEventListener("click", e => {
                this.selectPet(state, pet.id);
            });
            container.appendChild(box);
        }

        for (let i = 0; i < pets.length; i++) {
            this.setPetStatus(state, i, stg.pets[i]);
        }
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
            docId(`pet-display-${oldStatus - 2}`).appendChild(this.makePetBox());
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
            const newbox = this.makePetBox(pets[id], ["pet-show-icon"]);
            newbox.addEventListener("click", e => {
                this.setPetStatus(state, id, 1);
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
            a[97] = 1;
            return a;
        })(pets.map(a => 0)));

        this.onReload(state);
    }

    onReload(state) {
        const stg = super.onReload(state);

        const shopPets = [
            state.interactions.rand.at(9213, pets.length),
            state.interactions.rand.at(9644, pets.length),
            state.interactions.rand.at(2285, pets.length)
        ];
        while (shopPets[1] == shopPets[0]) {
            shopPets[1] = (shopPets[1] + 1) % shopPets.length;
        }
        while (shopPets[2] == shopPets[0] || shopPets[2] == shopPets[1]) {
            shopPets[2] = (shopPets[2] + 1) % shopPets.length;
        }

        for (let i = 0; i < this.DISPLAY_COUNT; i++) {
            docMake("div", [], docId("pet-display"), e => e.id = `pet-display-${i}`);
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