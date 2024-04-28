# powerdle

### *The wordle, with every possible reward system.*

## What the heck?

That is the intended reaction. Some games are simple and fun at their core, and they could be just that, but over time they get crammed full of reward systems and prizes to keep people engaged (or perhaps addicted) so they keep coming back and keep spending money. Now, **Powerdle** isn't monetized, but it's meant to be a mockery of how a lovely simple game like Wordle could get butchered by reward systems.

### The Share Screen
It's all meaningless if you can't share with your friends, right?  
Here's an example:
```
Powerdle #3 6/6

Pets: 💜👽💜🤎🦔🤎

Optimal Comparison: 95%
🟫🟫🟫🪙🪙 +100 
🟫🪙🟫⚙️🟫 +50 
⚙️💀💀🟫⚙️ 🥱 Boring... 
⛔⚠️⛔⚠️⛔ -500 🚫 Banned Letter 💥
⚙️⚙️💀⚙️💀 🥱 Boring... 
✅💎✅✅✅ +3000 🤜😵 Knockout!

Total Points: +2650

Prestige Level:🍈
2650/5000
🟪🟪🟪🟪⬜⬜⬜⬜

💎1(+1)  🪙10(+10)  ⚙️34(+34)
```

## Features
### v1.0, 4/28/24
#### Gameplay
 - **Playable Wordle.** If you don't know what that is, it's a cool game Josh Wardle made for his girlfriend. It got bought by the NY Times and you can play it [here](https://www.nytimes.com/games/wordle/index.html).
 - **Points.** They are gained from yellow letters, green letters (with bonuses for multiple greens in a row), and winning (more points for fewer guesses). They are lost by using the banned letter.
 - **Prestige.** There are prestige rankings, determined by cumulative points across days.
 - **Currencies.** There are 💎,🪙, and ⚙️ "hidden" under the letter boxes. When a letter is revealed, you will gain the hidden 💎 (if any) for a green letter, 🪙 (if any) for a yellow letter, or ⚙️ (if any) for a gray letter.
 - **Pets.** There are collectible "pets" (animal emojis) in epic, rare, and common rarities. Each day, three are on sale, and can be purchased with the currencies (epic pets cost 💎, rares cost 🪙, commons cost ⚙️). Up to three can be "equipped" at a time.
 - **Banned Letter.** Each day, one letter (not in the target word) is "banned". Use of this letter deducts points and does not reveal any information.
 - **Word Judging.** By some evaluation of how much information a guess revealed, certain messages may appear, such as "Boring...", "Epic Strike", "Critical Hit", and "Knockout".
 - **Optimal Comparison.** It loads for a while when a word is guessed, then shows a percentage score as the "optimal comparison". What does the percentage mean? Nobody knows!
#### Sharing
 - **Normal Colors.** Letters are shown as ⬛,🟫,🟨, or 🟩 for no guess, gray, yellow, and green, respectively.
 - **Points.** Points are shown at the end of each row, and the total at the bottom.
 - **Prestige.** The current prestige ranking is shown, with a progress bar.
 - **Currencies.** The amount of each currency is shown, along with the difference since the previous day.
 - **Pets.** The currently equipped pets are shown.
 - **Banned Letter.** A banned letter message is shown and the row is shown as ⛔⚠️⛔⚠️⛔.
 - **Word Judging.** Word judging messages are shown.
 - **Reused Gray.** Reused gray letters show up as 💀 in the share text.
 - **First Green.** The first green letter in each column shows up as ✅ in the share text.



## Inspiration

These three artistic "share screens" provided inspiration for what chaos the **Powerdle** could be.

```
Powerdle www.powerdle.com 6/8 🔆

Optimal Comparison: 38.22%
☢️⛔🟨🟩🆒
💀🟥🛑✳️🟨✨ Critical Hit
☠️❎🟪✅🚼
🦴✅🟩✅❇️❗Invaded ❗ 
🈺✅❎✅💹
✅✅✅✅✅
⬛⬛⬛⬛⬛
⬛⬛⬛⬛⬛
8 🧭 2💡 6💰

Gained 💷 x4 🎖️ x1
Bonus: 💎 x2
Rating: ⭐⭐⭐⭐

Power Up Meter
🟪🟪⬜⬜⬜ 👾
XP : 961🟠
+1 Prestige 👑 Prestige Level: 14
19,210 🟠 to prestige 👑

+39 Reputation 💠
```
```
Powerdle 7/8 💥

🟩🟦🈶⬜🈲
🟩🟨💀🟨🟥
🟩🔷💀✅🟦
✅⬜⬜✅❎
✅💟🟥✅❎
✅💣🟨✅🟩
✅✅✅✅✅
7🧨4⌛19📦 5🔫
Gained 🎁x3 🥈x1

Power Up Meter
🟪🟪🟪🟪⬜ 👾 
XP : 479 🟠
954 🟠 to prestige 👑
```
```
Powerdle www.powerdle.com 9/8 ⚡ 

Optimal Comparison: 21.77%
📴🟨🟥♿🚫
🕉️🆚📵🟨💹
⚠️⚠️☠️ ⚠️⚠️ Critical Error 📛 
🟩🟧🟨❎🔠
✅🈺🚸✅🕞
✅🛐🈸✅🕟 
✅🈯🚼✅💥
✅✅❎✅📴
✅✅✅✅✅ Lightning Round ⚡ 
2📝4💀 19 🪖

Gained: 🍊 x3 🪙 x7
Rating: ⭐⭐

Power Up Meter
🟪🟪🟪🟪🟪 👁️ 
XP : 761🟠
18,449 🟠 to prestige 👑

+21 Reputation 💠
Reputation Up! 📈 Unlocked: 🪄
Next Unlock: 🎸 492 Reputation Remaining
```

