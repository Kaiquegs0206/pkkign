var gameData = {
    taskData: {},
    itemData: {},

    coins: 0,
    days: 365 * 14,
    evil: 0,
    paused: false,
    timeWarpingEnabled: true,
    // global multipliers applied to all XP gains (can be functions or numbers)
    globalXpMultipliers: [50,10],

    rebirthOneCount: 0,
    rebirthTwoCount: 0,

    currentJob: null,
    currentSkill: null,
    currentProperty: null,
    currentMisc: null
};
var tempData = {};
var skillWithLowestMaxXp = null;
const autoPromoteElement = document.getElementById("autoPromote");
const autoLearnElement = document.getElementById("autoLearn");
const updateSpeed = 20;
const baseLifespan = 365 * 70;
const baseGameSpeed = 4;
const permanentUnlocks = ["Scheduling", "Shop", "Automation", "Quick task display"];
// ...existing code...

const skillBaseData = {
    // Fundamentals
    "Concentration": {name: "Concentration", maxXp: 100, effect: 0.01, description: "Skill xp"},
    "Productivity": {name: "Productivity", maxXp: 100, effect: 0.01, description: "Job xp"},
    "Bargaining": {name: "Bargaining", maxXp: 100, effect: -0.01, description: "Expenses"},
    "Meditation": {name: "Meditation", maxXp: 100, effect: 0.01, description: "Happiness"},
    // Combat
    "Strength": {name: "Strength", maxXp: 100, effect: 0.01, description: "Military pay"},
    "Battle tactics": {name: "Battle tactics", maxXp: 100, effect: 0.01, description: "Military xp"},
    "Muscle memory": {name: "Muscle memory", maxXp: 100, effect: 0.01, description: "Strength xp"},
    // Magic
    "Mana control": {name: "Mana control", maxXp: 100, effect: 0.01, description: "T.A.A. xp"},
    "Immortality": {name: "Immortality", maxXp: 100, effect: 0.01, description: "Longer lifespan"},
    "Time warping": {name: "Time warping", maxXp: 100, effect: 0.01, description: "Gamespeed"},
    "Super immortality": {name: "Super immortality", maxXp: 100, effect: 0.01, description: "Longer lifespan"},
    // Dark
    "Dark influence": {name: "Dark influence", maxXp: 100, effect: 0.01, description: "All xp"},
    "Evil control": {name: "Evil control", maxXp: 100, effect: 0.01, description: "Evil gain"},
    "Intimidation": {name: "Intimidation", maxXp: 100, effect: -0.01, description: "Expenses"},
    "Demon training": {name: "Demon training", maxXp: 100, effect: 0.01, description: "All xp"},
    "Blood meditation": {name: "Blood meditation", maxXp: 100, effect: 0.01, description: "Evil gain"},
    "Demon's wealth": {name: "Demon's wealth", maxXp: 100, effect: 0.002, description: "Job pay"},
    // New Skills
    "Alchemy": {name: "Alchemy", maxXp: 120, effect: 0.01, description: "Potion crafting"},
    "Herbalism": {name: "Herbalism", maxXp: 80, effect: 0.01, description: "Find rare herbs"},
    "Cooking": {name: "Cooking", maxXp: 90, effect: 0.01, description: "Food buffs"},
    "Leadership": {name: "Leadership", maxXp: 150, effect: 0.02, description: "Boosts all job xp"},
    "Engineering": {name: "Engineering", maxXp: 200, effect: 0.02, description: "Tech jobs xp"},
    "Enchanting": {name: "Enchanting", maxXp: 120, effect: 0.01, description: "Magic item power"},
    "Thievery": {name: "Thievery", maxXp: 80, effect: 0.01, description: "Steal coins"},
    "Animal Handling": {name: "Animal Handling", maxXp: 100, effect: 0.01, description: "Pet power"},
    "Fishing": {name: "Fishing", maxXp: 60, effect: 0.01, description: "Fish more"},
    "Mining": {name: "Mining", maxXp: 100, effect: 0.01, description: "Ore yield"},
    "Smithing": {name: "Smithing", maxXp: 120, effect: 0.01, description: "Forge gear"},
    "Archery": {name: "Archery", maxXp: 100, effect: 0.01, description: "Ranged combat"},
    "Swordsmanship": {name: "Swordsmanship", maxXp: 100, effect: 0.01, description: "Melee combat"},
    "Magic Theory": {name: "Magic Theory", maxXp: 200, effect: 0.02, description: "All magic xp"},
    "Divination": {name: "Divination", maxXp: 80, effect: 0.01, description: "See events"},
    "Luck": {name: "Luck", maxXp: 100, effect: 0.01, description: "Random events"},
    "Pet Mastery": {name: "Pet Mastery", maxXp: 100, effect: 0.01, description: "Pet bonuses"},
}

const itemBaseData = {
    // Properties
    "Homeless": {name: "Homeless", expense: 0, effect: 1},
    "Tent": {name: "Tent", expense: 15, effect: 1.4},
    "Wooden hut": {name: "Wooden hut", expense: 100, effect: 2},
    "Cottage": {name: "Cottage", expense: 750, effect: 3.5},
    "House": {name: "House", expense: 3000, effect: 6},
    "Large house": {name: "Large house", expense: 25000, effect: 12},
    "Small palace": {name: "Small palace", expense: 300000, effect: 25},
    "Grand palace": {name: "Grand palace", expense: 5000000, effect: 60},
    // Shop/Misc
    "Book": {name: "Book", expense: 10, effect: 1.5, description: "Skill xp"},
    "Dumbbells": {name: "Dumbbells", expense: 50, effect: 1.5, description: "Strength xp"},
    "Personal squire": {name: "Personal squire", expense: 200, effect: 2, description: "Job xp"},
    "Steel longsword": {name: "Steel longsword", expense: 1000, effect: 2, description: "Military xp"},
    "Butler": {name: "Butler", expense: 7500, effect: 1.5, description: "Happiness"},
    "Sapphire charm": {name: "Sapphire charm", expense: 50000, effect: 3, description: "Magic xp"},
    "Study desk": {name: "Study desk", expense: 1000000, effect: 2, description: "Skill xp"},
    "Library": {name: "Library", expense: 10000000, effect: 1.5, description: "Skill xp"},
    // New Items
    "Potion Kit": {name: "Potion Kit", expense: 500, effect: 1.2, description: "Alchemy xp"},
    "Fishing Rod": {name: "Fishing Rod", expense: 200, effect: 1.2, description: "Fishing xp"},
    "Pickaxe": {name: "Pickaxe", expense: 300, effect: 1.2, description: "Mining xp"},
    "Forge": {name: "Forge", expense: 2000, effect: 1.3, description: "Smithing xp"},
    "Bow": {name: "Bow", expense: 800, effect: 1.2, description: "Archery xp"},
    "Sword": {name: "Sword", expense: 800, effect: 1.2, description: "Swordsmanship xp"},
    "Pet Collar": {name: "Pet Collar", expense: 1000, effect: 1.2, description: "Pet power"},
    "Lucky Charm": {name: "Lucky Charm", expense: 5000, effect: 1.2, description: "Luck xp"},
    "Crystal Ball": {name: "Crystal Ball", expense: 20000, effect: 1.2, description: "Divination xp"},
    "Enchanter's Tools": {name: "Enchanter's Tools", expense: 15000, effect: 1.2, description: "Enchanting xp"},
    "Chef's Set": {name: "Chef's Set", expense: 1200, effect: 1.2, description: "Cooking xp"},
    "Leadership Medal": {name: "Leadership Medal", expense: 25000, effect: 1.2, description: "Leadership xp"},
    "Pet House": {name: "Pet House", expense: 20000, effect: 1.2, description: "Pet bonuses"},
}

const jobBaseData = {
    // Common
    "Beggar": {name: "Beggar", maxXp: 50, income: 5},
    "Street Musician": {name: "Street Musician", maxXp: 80, income: 8},
    "Farmer": {name: "Farmer", maxXp: 100, income: 9},
    "Fisherman": {name: "Fisherman", maxXp: 200, income: 15},
    "Hunter": {name: "Hunter", maxXp: 300, income: 22},
    "Miner": {name: "Miner", maxXp: 400, income: 40},
    "Blacksmith": {name: "Blacksmith", maxXp: 800, income: 80},
    "Carpenter": {name: "Carpenter", maxXp: 1200, income: 120},
    "Merchant": {name: "Merchant", maxXp: 1600, income: 150},
    "Innkeeper": {name: "Innkeeper", maxXp: 2500, income: 300},
    "Baker": {name: "Baker", maxXp: 1800, income: 110},
    "Tailor": {name: "Tailor", maxXp: 2200, income: 140},
    "Apothecary": {name: "Apothecary", maxXp: 3000, income: 200},
    "Scribe": {name: "Scribe", maxXp: 3500, income: 210},
    "Artist": {name: "Artist", maxXp: 4000, income: 250},
    // Military
    "Squire": {name: "Squire", maxXp: 100, income: 5},
    "Footman": {name: "Footman", maxXp: 1000, income: 50},
    "Veteran footman": {name: "Veteran footman", maxXp: 10000, income: 120},
    "Knight": {name: "Knight", maxXp: 100000, income: 300},
    "Veteran knight": {name: "Veteran knight", maxXp: 1000000, income: 1000},
    "Elite knight": {name: "Elite knight", maxXp: 7500000, income: 3000},
    "Holy knight": {name: "Holy knight", maxXp: 40000000, income: 15000},
    "Legendary knight": {name: "Legendary knight", maxXp: 150000000, income: 50000},
    "Commander": {name: "Commander", maxXp: 500000000, income: 200000},
    // Arcane
    "Student": {name: "Student", maxXp: 100000, income: 100},
    "Apprentice mage": {name: "Apprentice mage", maxXp: 1000000, income: 1000},
    "Mage": {name: "Mage", maxXp: 10000000, income: 7500},
    "Wizard": {name: "Wizard", maxXp: 100000000, income: 50000},
    "Master wizard": {name: "Master wizard", maxXp: 10000000000, income: 250000},
    "Archmage": {name: "Archmage", maxXp: 100000000000, income: 1200000},
    "Chairman": {name: "Chairman", maxXp: 1000000000000, income: 1000000},
    // Tech/Innovation
    "Engineer": {name: "Engineer", maxXp: 20000, income: 900},
    "Inventor": {name: "Inventor", maxXp: 120000, income: 8000},
    "Guildmaster": {name: "Guildmaster", maxXp: 2000000, income: 75000},
    "Noble": {name: "Noble", maxXp: 10000000, income: 500000},
    "King": {name: "King", maxXp: 100000000, income: 2000000},
    // Legendary/Fantasy
    "Dragon Rider": {name: "Dragon Rider", maxXp: 1000000000, income: 10000000},
    "Celestial Sage": {name: "Celestial Sage", maxXp: 5000000000, income: 50000000},
    "Time Traveler": {name: "Time Traveler", maxXp: 10000000000, income: 100000000},

    // Modern Professions
    "Software Developer": {name: "Software Developer", maxXp: 20000, income: 1200},
    "Data Scientist": {name: "Data Scientist", maxXp: 30000, income: 2000},
    "Doctor": {name: "Doctor", maxXp: 50000, income: 3000},
    "Lawyer": {name: "Lawyer", maxXp: 40000, income: 2500},
    "Architect": {name: "Architect", maxXp: 35000, income: 2200},
    "Chef": {name: "Chef", maxXp: 25000, income: 1500},
    "Musician": {name: "Musician", maxXp: 18000, income: 1000},
    "Athlete": {name: "Athlete", maxXp: 22000, income: 1800},
    "Pilot": {name: "Pilot", maxXp: 30000, income: 2200},
    "Astronaut": {name: "Astronaut", maxXp: 100000, income: 10000},

    // Science & Tech
    "Biologist": {name: "Biologist", maxXp: 18000, income: 900},
    "Physicist": {name: "Physicist", maxXp: 25000, income: 1200},
    "Chemist": {name: "Chemist", maxXp: 20000, income: 1100},
    "Mathematician": {name: "Mathematician", maxXp: 22000, income: 1200},
    "Roboticist": {name: "Roboticist", maxXp: 35000, income: 2500},
    "AI Researcher": {name: "AI Researcher", maxXp: 40000, income: 3000},

    // Fantasy/Mythology
    "Necromancer": {name: "Necromancer", maxXp: 20000000, income: 90000},
    "Beastmaster": {name: "Beastmaster", maxXp: 5000000, income: 40000},
    "Druid": {name: "Druid", maxXp: 8000000, income: 60000},
    "Paladin": {name: "Paladin", maxXp: 20000000, income: 100000},
    "Berserker": {name: "Berserker", maxXp: 12000000, income: 80000},
    "Elementalist": {name: "Elementalist", maxXp: 15000000, income: 85000},
    "Shadow Assassin": {name: "Shadow Assassin", maxXp: 10000000, income: 70000},
    "Summoner": {name: "Summoner", maxXp: 12000000, income: 80000},
    "Priest": {name: "Priest", maxXp: 6000000, income: 35000},
    "Oracle": {name: "Oracle", maxXp: 9000000, income: 50000},

    // Ancient/Legendary
    "Philosopher": {name: "Philosopher", maxXp: 20000, income: 1000},
    "Alchemist": {name: "Alchemist", maxXp: 25000, income: 1200},
    "Gladiator": {name: "Gladiator", maxXp: 15000, income: 900},
    "Samurai": {name: "Samurai", maxXp: 20000, income: 1200},
    "Viking": {name: "Viking", maxXp: 18000, income: 1100},
    "Spartan": {name: "Spartan", maxXp: 22000, income: 1300},
    "Pharaoh": {name: "Pharaoh", maxXp: 50000, income: 4000},
    "Emperor": {name: "Emperor", maxXp: 100000, income: 10000},

    // Esportes/Entretenimento
    "Footballer": {name: "Footballer", maxXp: 20000, income: 2000},
    "Basketball Player": {name: "Basketball Player", maxXp: 20000, income: 2000},
    "Actor": {name: "Actor", maxXp: 25000, income: 2500},
    "Streamer": {name: "Streamer", maxXp: 15000, income: 1200},
    "Youtuber": {name: "Youtuber", maxXp: 15000, income: 1200},
    "Influencer": {name: "Influencer", maxXp: 12000, income: 1000},

    // Outras profissões e fantasia
    "Detective": {name: "Detective", maxXp: 18000, income: 1100},
    "Spy": {name: "Spy", maxXp: 22000, income: 1300},
    "Explorer": {name: "Explorer", maxXp: 25000, income: 1500},
    "Pirate": {name: "Pirate", maxXp: 20000, income: 1200},
    "Merchant Prince": {name: "Merchant Prince", maxXp: 50000, income: 5000},
    "Warlord": {name: "Warlord", maxXp: 100000, income: 20000},
    "Monster Hunter": {name: "Monster Hunter", maxXp: 30000, income: 3000},
    "Treasure Hunter": {name: "Treasure Hunter", maxXp: 25000, income: 2000},
    "Space Marine": {name: "Space Marine", maxXp: 100000, income: 10000},
    "Time Guardian": {name: "Time Guardian", maxXp: 20000000000, income: 200000000},
    "Godslayer": {name: "Godslayer", maxXp: 100000000000, income: 1000000000},
    "World Shaper": {name: "World Shaper", maxXp: 1000000000000, income: 10000000000},
}

const tooltips = {
    // New skills
    "Alchemy": "Brew potions and elixirs for various effects.",
    "Herbalism": "Gather rare herbs and plants for alchemy.",
    "Cooking": "Prepare delicious meals that grant buffs.",
    "Leadership": "Inspire others and boost all job experience.",
    "Engineering": "Invent and improve machines and tech.",
    "Enchanting": "Imbue items with magical properties.",
    "Thievery": "Steal coins and valuables with finesse.",
    "Animal Handling": "Train and care for pets and companions.",
    "Fishing": "Catch fish for food and trade.",
    "Mining": "Extract valuable ores from the earth.",
    "Smithing": "Forge powerful weapons and armor.",
    "Archery": "Master the bow for ranged combat.",
    "Swordsmanship": "Excel in melee combat with swords.",
    "Magic Theory": "Understand the deep laws of magic.",
    "Divination": "Foresee future events and gain insight.",
    "Luck": "Increase the chance of random events.",
    "Pet Mastery": "Unlock special bonuses from pets.",
    // New items
    "Potion Kit": "A set of tools for brewing potions.",
    "Fishing Rod": "Essential for catching fish.",
    "Pickaxe": "Used to mine ores and gems.",
    "Forge": "A smith's best friend for forging gear.",
    "Bow": "A finely crafted bow for archery.",
    "Sword": "A sharp blade for swordsmanship.",
    "Pet Collar": "Boosts your pet's power.",
    "Lucky Charm": "Increases your luck in all things.",
    "Crystal Ball": "See glimpses of the future.",
    "Enchanter's Tools": "For enchanting items with magic.",
    "Chef's Set": "Cook meals with greater effects.",
    "Leadership Medal": "Proof of your inspiring leadership.",
    "Pet House": "A cozy home for your companions."
}
// --- Achievements System ---
const achievements = [
    { name: "First Steps", desc: "Reach level 10 in any job." },
    { name: "Skillful", desc: "Reach level 10 in any skill." },
    { name: "Wealthy", desc: "Accumulate 1,000,000 coins." },
    { name: "Pet Lover", desc: "Unlock your first pet." },
    { name: "Master of All", desc: "Reach level 100 in every job and skill." },
    { name: "Legend", desc: "Unlock a legendary job." },
    { name: "Shopaholic", desc: "Buy every item in the shop." },
    { name: "Eventful", desc: "Trigger 10 random events." },
]
let unlockedAchievements = []

function checkAchievements() {
    // Example logic, expand as needed
    if (!unlockedAchievements.includes("First Steps") && Object.values(gameData.taskData).some(t => t.level >= 10 && t instanceof Job)) {
        unlockedAchievements.push("First Steps")
        alert("Achievement unlocked: First Steps!")
    }
    // ...add more checks for other achievements
}

// --- Random Events System ---
const randomEvents = [
    { name: "Found Treasure", effect: () => { gameData.coins += 10000; }, desc: "You found a hidden stash of coins!" },
    { name: "Pet Joins", effect: () => { unlockPet("Dog"); }, desc: "A loyal dog joins you!" },
    { name: "Lucky Day", effect: () => { addGlobalXpMultiplier(2); setTimeout(() => removeGlobalXpMultiplier(2), 60000); }, desc: "XP gain doubled for 1 minute!" },
    { name: "Mysterious Merchant", effect: () => { gameData.coins += 50000; }, desc: "A merchant gifts you coins." },
]
function triggerRandomEvent() {
    const event = randomEvents[Math.floor(Math.random() * randomEvents.length)]
    event.effect()
    alert("Random Event: " + event.name + " - " + event.desc)
}

// --- Pets/Companions System ---
const pets = {
    "Dog": { name: "Dog", bonus: () => 1.1, desc: "A loyal companion. Increases happiness." },
    "Cat": { name: "Cat", bonus: () => 1.05, desc: "Independent but brings luck." },
    "Falcon": { name: "Falcon", bonus: () => 1.2, desc: "Sharp eyes, helps in hunting." },
    "Dragonling": { name: "Dragonling", bonus: () => 1.5, desc: "Tiny dragon, huge power." },
}
let ownedPets = []
let activePet = null
function unlockPet(petName) {
    if (!ownedPets.includes(petName)) {
        ownedPets.push(petName)
        alert("Pet unlocked: " + petName)
    }
}
function setActivePet(petName) {
    if (ownedPets.includes(petName)) {
        activePet = petName
        alert("Active pet: " + petName)
    }
}
function getPetBonus() {
    if (activePet && pets[activePet]) return pets[activePet].bonus()
    return 1
}

const units = ["", "k", "M", "B", "T", "q", "Q", "Sx", "Sp", "Oc"];

const jobTabButton = document.getElementById("jobTabButton")

function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
}
  
function getBindedTaskEffect(taskName) {
    var task = gameData.taskData[taskName]
    return task.getEffect.bind(task)
}

function getBindedItemEffect(itemName) {
    var item = gameData.itemData[itemName]
    return item.getEffect.bind(item)
}

function addMultipliers() {
    for (taskName in gameData.taskData) {
        var task = gameData.taskData[taskName]

        task.xpMultipliers = []
        if (task instanceof Job) task.incomeMultipliers = []

        task.xpMultipliers.push(task.getMaxLevelMultiplier.bind(task))
        task.xpMultipliers.push(getHappiness)
        task.xpMultipliers.push(getBindedTaskEffect("Dark influence"))
        task.xpMultipliers.push(getBindedTaskEffect("Demon training"))

        if (task instanceof Job) {
            task.incomeMultipliers.push(task.getLevelMultiplier.bind(task))
            task.incomeMultipliers.push(getBindedTaskEffect("Demon's wealth"))
            task.xpMultipliers.push(getBindedTaskEffect("Productivity"))
            task.xpMultipliers.push(getBindedItemEffect("Personal squire"))    
        } else if (task instanceof Skill) {
            task.xpMultipliers.push(getBindedTaskEffect("Concentration"))
            task.xpMultipliers.push(getBindedItemEffect("Book"))
            task.xpMultipliers.push(getBindedItemEffect("Study desk"))
            task.xpMultipliers.push(getBindedItemEffect("Library"))
        }

        if (jobCategories["Military"].includes(task.name)) {
            task.incomeMultipliers.push(getBindedTaskEffect("Strength"))
            task.xpMultipliers.push(getBindedTaskEffect("Battle tactics"))
            task.xpMultipliers.push(getBindedItemEffect("Steel longsword"))
        } else if (task.name == "Strength") {
            task.xpMultipliers.push(getBindedTaskEffect("Muscle memory"))
            task.xpMultipliers.push(getBindedItemEffect("Dumbbells"))
        } else if (skillCategories["Magic"].includes(task.name)) {
            task.xpMultipliers.push(getBindedItemEffect("Sapphire charm"))
        } else if (jobCategories["The Arcane Association"].includes(task.name)) {
            task.xpMultipliers.push(getBindedTaskEffect("Mana control"))
        } else if (skillCategories["Dark magic"].includes(task.name)) {
            task.xpMultipliers.push(getEvil)
        }
    }

    for (itemName in gameData.itemData) {
        var item = gameData.itemData[itemName]
        item.expenseMultipliers = []
        item.expenseMultipliers.push(getBindedTaskEffect("Bargaining"))
        item.expenseMultipliers.push(getBindedTaskEffect("Intimidation"))
    }
}

function setCustomEffects() {
    var bargaining = gameData.taskData["Bargaining"]
    bargaining.getEffect = function() {
        var multiplier = 1 - getBaseLog(7, bargaining.level + 1) / 10
        if (multiplier < 0.1) {multiplier = 0.1}
        return multiplier
    }

    var intimidation = gameData.taskData["Intimidation"]
    intimidation.getEffect = function() {
        var multiplier = 1 - getBaseLog(7, intimidation.level + 1) / 10
        if (multiplier < 0.1) {multiplier = 0.1}
        return multiplier
    }

    var timeWarping = gameData.taskData["Time warping"]
    timeWarping.getEffect = function() {
        var multiplier = 1 + getBaseLog(13, timeWarping.level + 1) 
        return multiplier
    }

    var immortality = gameData.taskData["Immortality"]
    immortality.getEffect = function() {
        var multiplier = 1 + getBaseLog(33, immortality.level + 1) 
        return multiplier
    }
}

function getHappiness() {
    var meditationEffect = getBindedTaskEffect("Meditation")
    var butlerEffect = getBindedItemEffect("Butler")
    var petBonus = getPetBonus()
    var happiness = meditationEffect() * butlerEffect() * gameData.currentProperty.getEffect() * petBonus
    return happiness
}

function getEvil() {
    return gameData.evil
}

function applyMultipliers(value, multipliers) {
    var finalMultiplier = 1
    multipliers.forEach(function(multiplier) {
        // multiplier can be a function that returns a number, or a numeric value
        var m = typeof multiplier === "function" ? multiplier() : multiplier
        // ignore invalid multipliers
        if (typeof m !== "number" || isNaN(m)) return
        finalMultiplier *= m
    })
    var finalValue = Math.round(value * finalMultiplier)
    return finalValue
}

function applySpeed(value) {
    finalValue = value * getGameSpeed() / updateSpeed
    return finalValue
}

function getEvilGain() {
    var evilControl = gameData.taskData["Evil control"]
    var bloodMeditation = gameData.taskData["Blood meditation"]
    var evil = evilControl.getEffect() * bloodMeditation.getEffect()
    return evil
}

function getGameSpeed() {
    var timeWarping = gameData.taskData["Time warping"]
    var timeWarpingSpeed = gameData.timeWarpingEnabled ? timeWarping.getEffect() : 1
    var gameSpeed = baseGameSpeed * +!gameData.paused * +isAlive() * timeWarpingSpeed
    return gameSpeed
}

function applyExpenses() {
    var coins = applySpeed(getExpense())
    gameData.coins -= coins
    if (gameData.coins < 0) {    
        goBankrupt()
    }
}

function getExpense() {
    var expense = 0
    expense += gameData.currentProperty.getExpense()
    for (misc of gameData.currentMisc) {
        expense += misc.getExpense()
    }
    return expense
}

function goBankrupt() {
    gameData.coins = 0
    gameData.currentProperty = gameData.itemData["Homeless"]
    gameData.currentMisc = []
}

function setTab(element, selectedTab) {

    var tabs = Array.prototype.slice.call(document.getElementsByClassName("tab"))
    tabs.forEach(function(tab) {
        tab.style.display = "none"
    })
    document.getElementById(selectedTab).style.display = "block"

    var tabButtons = document.getElementsByClassName("tabButton")
    for (tabButton of tabButtons) {
        tabButton.classList.remove("w3-blue-gray")
    }
    element.classList.add("w3-blue-gray")
}

function setPause() {
    gameData.paused = !gameData.paused
}

function setTimeWarping() {
    gameData.timeWarpingEnabled = !gameData.timeWarpingEnabled
}

function setTask(taskName) {
    var task = gameData.taskData[taskName]
    task instanceof Job ? gameData.currentJob = task : gameData.currentSkill = task
}

function setProperty(propertyName) {
    var property = gameData.itemData[propertyName]
    gameData.currentProperty = property
}

function setMisc(miscName) {
    var misc = gameData.itemData[miscName]
    if (gameData.currentMisc.includes(misc)) {
        for (i = 0; i < gameData.currentMisc.length; i++) {
            if (gameData.currentMisc[i] == misc) {
                gameData.currentMisc.splice(i, 1)
            }
        }
    } else {
        gameData.currentMisc.push(misc)
    }
}

function createData(data, baseData) {
    for (key in baseData) {
        var entity = baseData[key]
        createEntity(data, entity)
    }
}

function createEntity(data, entity) {
    if ("income" in entity) {data[entity.name] = new Job(entity)}
    else if ("maxXp" in entity) {data[entity.name] = new Skill(entity)}
    else {data[entity.name] = new Item(entity)}
    data[entity.name].id = "row " + entity.name
}

function createRequiredRow(categoryName) {
    var requiredRow = document.getElementsByClassName("requiredRowTemplate")[0].content.firstElementChild.cloneNode(true)
    requiredRow.classList.add("requiredRow")
    requiredRow.classList.add(removeSpaces(categoryName))
    requiredRow.id = categoryName
    return requiredRow
}

function createHeaderRow(templates, categoryType, categoryName) {
    var headerRow = templates.headerRow.content.firstElementChild.cloneNode(true)
    headerRow.getElementsByClassName("category")[0].textContent = categoryName
    if (categoryType != itemCategories) {
        headerRow.getElementsByClassName("valueType")[0].textContent = categoryType == jobCategories ? "Income/day" : "Effect"
    }

    headerRow.style.backgroundColor = headerRowColors[categoryName]
    headerRow.style.color = "#ffffff"
    headerRow.classList.add(removeSpaces(categoryName))
    headerRow.classList.add("headerRow")
    
    return headerRow
}

function createRow(templates, name, categoryName, categoryType) {
    var row = templates.row.content.firstElementChild.cloneNode(true)
    row.getElementsByClassName("name")[0].textContent = name
    row.getElementsByClassName("tooltipText")[0].textContent = tooltips[name]
    row.id = "row " + name
    if (categoryType != itemCategories) {
        row.getElementsByClassName("progressBar")[0].onclick = function() {setTask(name)}
    } else {
        row.getElementsByClassName("button")[0].onclick = categoryName == "Properties" ? function() {setProperty(name)} : function() {setMisc(name)}
    }

    return row
}

function createAllRows(categoryType, tableId) {
    var templates = {
        headerRow: document.getElementsByClassName(categoryType == itemCategories ? "headerRowItemTemplate" : "headerRowTaskTemplate")[0],
        row: document.getElementsByClassName(categoryType == itemCategories ? "rowItemTemplate" : "rowTaskTemplate")[0],
    }

    var table = document.getElementById(tableId)

    for (categoryName in categoryType) {
        var headerRow = createHeaderRow(templates, categoryType, categoryName)
        table.appendChild(headerRow)
        
        var category = categoryType[categoryName]
        category.forEach(function(name) {
            var row = createRow(templates, name, categoryName, categoryType)
            table.appendChild(row)       
        })

        var requiredRow = createRequiredRow(categoryName)
        table.append(requiredRow)
    }
}

function updateQuickTaskDisplay(taskType) {
    var currentTask = taskType == "job" ? gameData.currentJob : gameData.currentSkill
    var quickTaskDisplayElement = document.getElementById("quickTaskDisplay")
    var progressBar = quickTaskDisplayElement.getElementsByClassName(taskType)[0]
    progressBar.getElementsByClassName("name")[0].textContent = currentTask.name + " lvl " + currentTask.level
    progressBar.getElementsByClassName("progressFill")[0].style.width = currentTask.xp / currentTask.getMaxXp() * 100 + "%"
}

function updateRequiredRows(data, categoryType) {
    var requiredRows = document.getElementsByClassName("requiredRow")
    for (requiredRow of requiredRows) {
        var nextEntity = null
        var category = categoryType[requiredRow.id] 
        if (category == null) {continue}
        for (i = 0; i < category.length; i++) {
            var entityName = category[i]
            if (i >= category.length - 1) break
            var requirements = gameData.requirements[entityName]
            if (requirements && i == 0) {
                if (!requirements.isCompleted()) {
                    nextEntity = data[entityName]
                    break
                }
            }

            var nextIndex = i + 1
            if (nextIndex >= category.length) {break}
            var nextEntityName = category[nextIndex]
            nextEntityRequirements = gameData.requirements[nextEntityName]

            if (!nextEntityRequirements.isCompleted()) {
                nextEntity = data[nextEntityName]
                break
            }       
        }

        if (nextEntity == null) {
            requiredRow.classList.add("hiddenTask")           
        } else {
            requiredRow.classList.remove("hiddenTask")
            var requirementObject = gameData.requirements[nextEntity.name]
            var requirements = requirementObject.requirements

            var coinElement = requiredRow.getElementsByClassName("coins")[0]
            var levelElement = requiredRow.getElementsByClassName("levels")[0]
            var evilElement = requiredRow.getElementsByClassName("evil")[0]

            coinElement.classList.add("hiddenTask")
            levelElement.classList.add("hiddenTask")
            evilElement.classList.add("hiddenTask")

            var finalText = ""
            if (data == gameData.taskData) {
                if (requirementObject instanceof EvilRequirement) {
                    evilElement.classList.remove("hiddenTask")
                    evilElement.textContent = format(requirements[0].requirement) + " evil"
                } else {
                    levelElement.classList.remove("hiddenTask")
                    for (requirement of requirements) {
                        var task = gameData.taskData[requirement.task]
                        if (task.level >= requirement.requirement) continue
                        var text = " " + requirement.task + " level " + format(task.level) + "/" + format(requirement.requirement) + ","
                        finalText += text
                    }
                    finalText = finalText.substring(0, finalText.length - 1)
                    levelElement.textContent = finalText
                }
            } else if (data == gameData.itemData) {
                coinElement.classList.remove("hiddenTask")
                formatCoins(requirements[0].requirement, coinElement)
            }
        }   
    }
}

function updateTaskRows() {
    for (key in gameData.taskData) {
        var task = gameData.taskData[key]
        var row = document.getElementById("row " + task.name)
        row.getElementsByClassName("level")[0].textContent = task.level
        row.getElementsByClassName("xpGain")[0].textContent = format(task.getXpGain())
        row.getElementsByClassName("xpLeft")[0].textContent = format(task.getXpLeft())

        var maxLevel = row.getElementsByClassName("maxLevel")[0]
        maxLevel.textContent = task.maxLevel
        gameData.rebirthOneCount > 0 ? maxLevel.classList.remove("hidden") : maxLevel.classList.add("hidden")

        var progressFill = row.getElementsByClassName("progressFill")[0]
        progressFill.style.width = task.xp / task.getMaxXp() * 100 + "%"
        task == gameData.currentJob || task == gameData.currentSkill ? progressFill.classList.add("current") : progressFill.classList.remove("current")

        var valueElement = row.getElementsByClassName("value")[0]
        valueElement.getElementsByClassName("income")[0].style.display = task instanceof Job
        valueElement.getElementsByClassName("effect")[0].style.display = task instanceof Skill

        var skipSkillElement = row.getElementsByClassName("skipSkill")[0]
        skipSkillElement.style.display = task instanceof Skill && autoLearnElement.checked ? "block" : "none"

        if (task instanceof Job) {
            formatCoins(task.getIncome(), valueElement.getElementsByClassName("income")[0])
        } else {
            valueElement.getElementsByClassName("effect")[0].textContent = task.getEffectDescription()
        }
    }
}

function updateItemRows() {
    for (key in gameData.itemData) {
        var item = gameData.itemData[key]
        var row = document.getElementById("row " + item.name)
        var button = row.getElementsByClassName("button")[0]
        button.disabled = gameData.coins < item.getExpense()
        var active = row.getElementsByClassName("active")[0]
        var color = itemCategories["Properties"].includes(item.name) ? headerRowColors["Properties"] : headerRowColors["Misc"]
        active.style.backgroundColor = gameData.currentMisc.includes(item) || item == gameData.currentProperty ? color : "white"
        row.getElementsByClassName("effect")[0].textContent = item.getEffectDescription()
        formatCoins(item.getExpense(), row.getElementsByClassName("expense")[0])
    }
}

function updateHeaderRows(categories) {
    for (categoryName in categories) {
        var className = removeSpaces(categoryName)
        var headerRow = document.getElementsByClassName(className)[0]
        var maxLevelElement = headerRow.getElementsByClassName("maxLevel")[0]
        gameData.rebirthOneCount > 0 ? maxLevelElement.classList.remove("hidden") : maxLevelElement.classList.add("hidden")
        var skipSkillElement = headerRow.getElementsByClassName("skipSkill")[0]
        skipSkillElement.style.display = categories == skillCategories && autoLearnElement.checked ? "block" : "none"
    }
}

function updateText() {
    //Sidebar
    document.getElementById("ageDisplay").textContent = daysToYears(gameData.days)
    document.getElementById("dayDisplay").textContent = getDay()
    document.getElementById("lifespanDisplay").textContent = daysToYears(getLifespan())
    document.getElementById("pauseButton").textContent = gameData.paused ? "Play" : "Pause"

    formatCoins(gameData.coins, document.getElementById("coinDisplay"))
    setSignDisplay()
    formatCoins(getNet(), document.getElementById("netDisplay"))
    formatCoins(getIncome(), document.getElementById("incomeDisplay"))
    formatCoins(getExpense(), document.getElementById("expenseDisplay"))

    document.getElementById("happinessDisplay").textContent = getHappiness().toFixed(1)

    document.getElementById("evilDisplay").textContent = gameData.evil.toFixed(1)
    document.getElementById("evilGainDisplay").textContent = getEvilGain().toFixed(1)

    document.getElementById("timeWarpingDisplay").textContent = "x" + gameData.taskData["Time warping"].getEffect().toFixed(2)
    document.getElementById("timeWarpingButton").textContent = gameData.timeWarpingEnabled ? "Disable warp" : "Enable warp"
}

function setSignDisplay() {
    var signDisplay = document.getElementById("signDisplay")
    if (getIncome() > getExpense()) {
        signDisplay.textContent = "+"
        signDisplay.style.color = "green"
    } else if (getExpense() > getIncome()) {
        signDisplay.textContent = "-"
        signDisplay.style.color = "red"
    } else {
        signDisplay.textContent = ""
        signDisplay.style.color = "gray"
    }
}

function getNet() {
    var net = Math.abs(getIncome() - getExpense())
    return net
}

function hideEntities() {
    for (key in gameData.requirements) {
        var requirement = gameData.requirements[key]
        var completed = requirement.isCompleted()
        for (element of requirement.elements) {
            if (completed) {
                element.classList.remove("hidden")
            } else {
                element.classList.add("hidden")
            }
        }
    }
}

function createItemData(baseData) {
    for (var item of baseData) {
        gameData.itemData[item.name] = "happiness" in item ? new Property(task) : new Misc(task)
        gameData.itemData[item.name].id = "item " + item.name
    }
}

function doCurrentTask(task) {
    task.increaseXp()
    if (task instanceof Job) {
        increaseCoins()
    }
}

function getIncome() {
    var income = 0
    income += gameData.currentJob.getIncome()
    return income
}

function increaseCoins() {
    var coins = applySpeed(getIncome())
    gameData.coins += coins
}

function daysToYears(days) {
    var years = Math.floor(days / 365)
    return years
}

function getCategoryFromEntityName(categoryType, entityName) {
    for (categoryName in categoryType) {
        var category = categoryType[categoryName]
        if (category.includes(entityName)) {
            return category
        }
    }
}

function getNextEntity(data, categoryType, entityName) {
    var category = getCategoryFromEntityName(categoryType, entityName)
    var nextIndex = category.indexOf(entityName) + 1
    if (nextIndex > category.length - 1) return null
    var nextEntityName = category[nextIndex]
    var nextEntity = data[nextEntityName]
    return nextEntity
}

function autoPromote() {
    if (!autoPromoteElement.checked) return
    var nextEntity = getNextEntity(gameData.taskData, jobCategories, gameData.currentJob.name)
    if (nextEntity == null) return
    var requirement = gameData.requirements[nextEntity.name]
    if (requirement.isCompleted()) gameData.currentJob = nextEntity
}

function checkSkillSkipped(skill) {
    var row = document.getElementById("row " + skill.name)
    var isSkillSkipped = row.getElementsByClassName("checkbox")[0].checked
    return isSkillSkipped
}

function setSkillWithLowestMaxXp() {
    var xpDict = {}

    for (skillName in gameData.taskData) {
        var skill = gameData.taskData[skillName]
        var requirement = gameData.requirements[skillName]
        if (skill instanceof Skill && requirement.isCompleted() && !checkSkillSkipped(skill)) {
            xpDict[skill.name] = skill.level //skill.getMaxXp() / skill.getXpGain()
        }
    }

    if (xpDict == {}) {
        skillWithLowestMaxXp = gameData.taskData["Concentration"]
        return
    }

    var skillName = getKeyOfLowestValueFromDict(xpDict)
    skillWithLowestMaxXp = gameData.taskData[skillName]
}

function getKeyOfLowestValueFromDict(dict) {
    var values = []
    for (key in dict) {
        var value = dict[key]
        values.push(value)
    }

    values.sort(function(a, b){return a - b})

    for (key in dict) {
        var value = dict[key]
        if (value == values[0]) {
            return key
        }
    }
}

function autoLearn() {
    if (!autoLearnElement.checked || !skillWithLowestMaxXp) return
    gameData.currentSkill = skillWithLowestMaxXp
}

function yearsToDays(years) {
    var days = years * 365
    return days
}
 
function getDay() {
    var day = Math.floor(gameData.days - daysToYears(gameData.days) * 365)
    return day
}

function increaseDays() {
    var increase = applySpeed(1)
    gameData.days += increase
}

function format(number) {

    // what tier? (determines SI symbol)
    var tier = Math.log10(number) / 3 | 0;

    // if zero, we don't need a suffix
    if(tier == 0) return number;

    // get suffix and determine scale
    var suffix = units[tier];
    var scale = Math.pow(10, tier * 3);

    // scale the number
    var scaled = number / scale;

    // format number and add suffix
    return scaled.toFixed(1) + suffix;
}

function formatCoins(coins, element) {
    var tiers = ["p", "g", "s"]
    var colors = {
        "p": "#79b9c7",
        "g": "#E5C100",
        "s": "#a8a8a8",
        "c": "#a15c2f"
    }
    var leftOver = coins
    var i = 0
    for (tier of tiers) {
        var x = Math.floor(leftOver / Math.pow(10, (tiers.length - i) * 2))
        var leftOver = Math.floor(leftOver - x * Math.pow(10, (tiers.length - i) * 2))
        var text = format(String(x)) + tier + " "
        element.children[i].textContent = x > 0 ? text : ""
        element.children[i].style.color = colors[tier]
        i += 1
    }
    if (leftOver == 0 && coins > 0) {element.children[3].textContent = ""; return}
    var text = String(Math.floor(leftOver)) + "c"
    element.children[3].textContent = text
    element.children[3].style.color = colors["c"]
}

function getTaskElement(taskName) {
    var task = gameData.taskData[taskName]
    var element = document.getElementById(task.id)
    return element
}

// Helpers to manage global XP multipliers
function addGlobalXpMultiplier(mult) {
    // mult can be a number (e.g., 2) or a function returning a number
    gameData.globalXpMultipliers.push(mult)
}

function removeGlobalXpMultiplier(mult) {
    var idx = gameData.globalXpMultipliers.indexOf(mult)
    if (idx >= 0) gameData.globalXpMultipliers.splice(idx, 1)
}

function getItemElement(itemName) {
    var item = gameData.itemData[itemName]
    var element = document.getElementById(item.id)
    return element
}

function getElementsByClass(className) {
    var elements = document.getElementsByClassName(removeSpaces(className))
    return elements
}

function setLightDarkMode() {
    var body = document.getElementById("body")
    body.classList.contains("dark") ? body.classList.remove("dark") : body.classList.add("dark")
}

function removeSpaces(string) {
    var string = string.replace(/ /g, "")
    return string
}

function rebirthOne() {
    gameData.rebirthOneCount += 1

    rebirthReset()
}

function rebirthTwo() {
    gameData.rebirthTwoCount += 1
    gameData.evil += getEvilGain()

    rebirthReset()

    for (taskName in gameData.taskData) {
        var task = gameData.taskData[taskName]
        task.maxLevel = 0
    }    
}

function rebirthReset() {
    setTab(jobTabButton, "jobs")

    gameData.coins = 0
    gameData.days = 365 * 14
    gameData.currentJob = gameData.taskData["Beggar"]
    gameData.currentSkill = gameData.taskData["Concentration"]
    gameData.currentProperty = gameData.itemData["Homeless"]
    gameData.currentMisc = []

    for (taskName in gameData.taskData) {
        var task = gameData.taskData[taskName]
        if (task.level > task.maxLevel) task.maxLevel = task.level
        task.level = 0
        task.xp = 0
    }

    for (key in gameData.requirements) {
        var requirement = gameData.requirements[key]
        if (requirement.completed && permanentUnlocks.includes(key)) continue
        requirement.completed = false
    }
}

function getLifespan() {
    var immortality = gameData.taskData["Immortality"]
    var superImmortality = gameData.taskData["Super immortality"]
    var lifespan = baseLifespan * immortality.getEffect() * superImmortality.getEffect()
    return lifespan
}

function isAlive() {
    var condition = gameData.days < getLifespan()
    var deathText = document.getElementById("deathText")
    if (!condition) {
        gameData.days = getLifespan()
        deathText.classList.remove("hidden")
    }
    else {
        deathText.classList.add("hidden")
    }
    return condition
}

function assignMethods() {

    for (key in gameData.taskData) {
        var task = gameData.taskData[key]
        if (task.baseData.income) {
            task.baseData = jobBaseData[task.name]
            task = Object.assign(new Job(jobBaseData[task.name]), task)
            
        } else {
            task.baseData = skillBaseData[task.name]
            task = Object.assign(new Skill(skillBaseData[task.name]), task)
        } 
        gameData.taskData[key] = task
    }

    for (key in gameData.itemData) {
        var item = gameData.itemData[key]
        item.baseData = itemBaseData[item.name]
        item = Object.assign(new Item(itemBaseData[item.name]), item)
        gameData.itemData[key] = item
    }

    for (key in gameData.requirements) {
        var requirement = gameData.requirements[key]
        if (requirement.type == "task") {
            requirement = Object.assign(new TaskRequirement(requirement.elements, requirement.requirements), requirement)
        } else if (requirement.type == "coins") {
            requirement = Object.assign(new CoinRequirement(requirement.elements, requirement.requirements), requirement)
        } else if (requirement.type == "age") {
            requirement = Object.assign(new AgeRequirement(requirement.elements, requirement.requirements), requirement)
        } else if (requirement.type == "evil") {
            requirement = Object.assign(new EvilRequirement(requirement.elements, requirement.requirements), requirement)
        }

        var tempRequirement = tempData["requirements"][key]
        requirement.elements = tempRequirement.elements
        requirement.requirements = tempRequirement.requirements
        gameData.requirements[key] = requirement
    }

    gameData.currentJob = gameData.taskData[gameData.currentJob.name]
    gameData.currentSkill = gameData.taskData[gameData.currentSkill.name]
    gameData.currentProperty = gameData.itemData[gameData.currentProperty.name]
    var newArray = []
    for (misc of gameData.currentMisc) {
        newArray.push(gameData.itemData[misc.name])
    }
    gameData.currentMisc = newArray
}

function replaceSaveDict(dict, saveDict) {
    for (key in dict) {
        if (!(key in saveDict)) {
            saveDict[key] = dict[key]
        } else if (dict == gameData.requirements) {
            if (saveDict[key].type != tempData["requirements"][key].type) {
                saveDict[key] = tempData["requirements"][key]
            }
        }
    }

    for (key in saveDict) {
        if (!(key in dict)) {
            delete saveDict[key]
        }
    }
}

function saveGameData() {
    localStorage.setItem("gameDataSave", JSON.stringify(gameData))
}

function loadGameData() {
    var gameDataSave = JSON.parse(localStorage.getItem("gameDataSave"))

    if (gameDataSave !== null) {
        replaceSaveDict(gameData, gameDataSave)
        replaceSaveDict(gameData.requirements, gameDataSave.requirements)
        replaceSaveDict(gameData.taskData, gameDataSave.taskData)
        replaceSaveDict(gameData.itemData, gameDataSave.itemData)

        gameData = gameDataSave
    }

    assignMethods()
}

function updateUI() {
    updateTaskRows()
    updateItemRows()
    updateRequiredRows(gameData.taskData, jobCategories)
    updateRequiredRows(gameData.taskData, skillCategories)
    updateRequiredRows(gameData.itemData, itemCategories)
    updateHeaderRows(jobCategories)
    updateHeaderRows(skillCategories)
    updateQuickTaskDisplay("job")
    updateQuickTaskDisplay("skill")
    hideEntities()
    updateText()  
}

function update() {
    increaseDays()
    autoPromote()
    autoLearn()
    doCurrentTask(gameData.currentJob)
    doCurrentTask(gameData.currentSkill)
    applyExpenses()
    // Trigger random event occasionally
    if (Math.random() < 0.001 * (1 + (gameData.taskData["Luck"] ? gameData.taskData["Luck"].level / 100 : 0))) {
        triggerRandomEvent()
    }
    checkAchievements()
    updateUI()
}

function resetGameData() {
    localStorage.clear()
    location.reload()
}

function importGameData() {
    var importExportBox = document.getElementById("importExportBox")
    var data = JSON.parse(window.atob(importExportBox.value))
    gameData = data
    saveGameData()
    location.reload()
}

function exportGameData() {
    var importExportBox = document.getElementById("importExportBox")
    importExportBox.value = window.btoa(JSON.stringify(gameData))
}

//Init

createAllRows(jobCategories, "jobTable")
createAllRows(skillCategories, "skillTable")
createAllRows(itemCategories, "itemTable") 

createData(gameData.taskData, jobBaseData)
createData(gameData.taskData, skillBaseData)
createData(gameData.itemData, itemBaseData) 

gameData.currentJob = gameData.taskData["Beggar"]
gameData.currentSkill = gameData.taskData["Concentration"]
gameData.currentProperty = gameData.itemData["Homeless"]
gameData.currentMisc = []

gameData.requirements = {
    //Other
    "The Arcane Association": new TaskRequirement(getElementsByClass("The Arcane Association"), [{task: "Concentration", requirement: 200}, {task: "Meditation", requirement: 200}]),
    "Dark magic": new EvilRequirement(getElementsByClass("Dark magic"), [{requirement: 1}]),
    "Shop": new CoinRequirement([document.getElementById("shopTabButton")], [{requirement: gameData.itemData["Tent"].getExpense() * 50}]),
    "Rebirth tab": new AgeRequirement([document.getElementById("rebirthTabButton")], [{requirement: 25}]),
    "Rebirth note 1": new AgeRequirement([document.getElementById("rebirthNote1")], [{requirement: 45}]),
    "Rebirth note 2": new AgeRequirement([document.getElementById("rebirthNote2")], [{requirement: 65}]),
    "Rebirth note 3": new AgeRequirement([document.getElementById("rebirthNote3")], [{requirement: 200}]),
    "Evil info": new EvilRequirement([document.getElementById("evilInfo")], [{requirement: 1}]),
    "Time warping info": new TaskRequirement([document.getElementById("timeWarping")], [{task: "Mage", requirement: 10}]),
    "Automation": new AgeRequirement([document.getElementById("automation")], [{requirement: 20}]),
    "Quick task display": new AgeRequirement([document.getElementById("quickTaskDisplay")], [{requirement: 20}]),

    //Common work
    "Beggar": new TaskRequirement([getTaskElement("Beggar")], []),
    "Farmer": new TaskRequirement([getTaskElement("Farmer")], [{task: "Beggar", requirement: 10}]),
    "Fisherman": new TaskRequirement([getTaskElement("Fisherman")], [{task: "Farmer", requirement: 10}]),
    "Miner": new TaskRequirement([getTaskElement("Miner")], [{task: "Strength", requirement: 10}, {task: "Fisherman", requirement: 10}]),
    "Blacksmith": new TaskRequirement([getTaskElement("Blacksmith")], [{task: "Strength", requirement: 30}, {task: "Miner", requirement: 10}]),
    "Merchant": new TaskRequirement([getTaskElement("Merchant")], [{task: "Bargaining", requirement: 50}, {task: "Blacksmith", requirement: 10}]),

    //Military 
    "Squire": new TaskRequirement([getTaskElement("Squire")], [{task: "Strength", requirement: 5}]),
    "Footman": new TaskRequirement([getTaskElement("Footman")], [{task: "Strength", requirement: 20}, {task: "Squire", requirement: 10}]),
    "Veteran footman": new TaskRequirement([getTaskElement("Veteran footman")], [{task: "Battle tactics", requirement: 40}, {task: "Footman", requirement: 10}]),
    "Knight": new TaskRequirement([getTaskElement("Knight")], [{task: "Strength", requirement: 100}, {task: "Veteran footman", requirement: 10}]),
    "Veteran knight": new TaskRequirement([getTaskElement("Veteran knight")], [{task: "Battle tactics", requirement: 150}, {task: "Knight", requirement: 10}]),
    "Elite knight": new TaskRequirement([getTaskElement("Elite knight")], [{task: "Strength", requirement: 300}, {task: "Veteran knight", requirement: 10}]),
    "Holy knight": new TaskRequirement([getTaskElement("Holy knight")], [{task: "Mana control", requirement: 500}, {task: "Elite knight", requirement: 10}]),
    "Legendary knight": new TaskRequirement([getTaskElement("Legendary knight")], [{task: "Mana control", requirement: 1000}, {task: "Battle tactics", requirement: 1000}, {task: "Holy knight", requirement: 10}]),

    //The Arcane Association
    "Student": new TaskRequirement([getTaskElement("Student")], [{task: "Concentration", requirement: 200}, {task: "Meditation", requirement: 200}]),
    "Apprentice mage": new TaskRequirement([getTaskElement("Apprentice mage")], [{task: "Mana control", requirement: 400}, {task: "Student", requirement: 10}]),
    "Mage": new TaskRequirement([getTaskElement("Mage")], [{task: "Mana control", requirement: 700}, {task: "Apprentice mage", requirement: 10}]),
    "Wizard": new TaskRequirement([getTaskElement("Wizard")], [{task: "Mana control", requirement: 1000}, {task: "Mage", requirement: 10}]),
    "Master wizard": new TaskRequirement([getTaskElement("Master wizard")], [{task: "Mana control", requirement: 1500}, {task: "Wizard", requirement: 10}]),
    "Chairman": new TaskRequirement([getTaskElement("Chairman")], [{task: "Mana control", requirement: 2000}, {task: "Master wizard", requirement: 10}]),

    //Fundamentals
    "Concentration": new TaskRequirement([getTaskElement("Concentration")], []),
    "Productivity": new TaskRequirement([getTaskElement("Productivity")], [{task: "Concentration", requirement: 5}]),
    "Bargaining": new TaskRequirement([getTaskElement("Bargaining")], [{task: "Concentration", requirement: 20}]),
    "Meditation": new TaskRequirement([getTaskElement("Meditation")], [{task: "Concentration", requirement: 30}, {task: "Productivity", requirement: 20}]),

    //Combat
    "Strength": new TaskRequirement([getTaskElement("Strength")], []),
    "Battle tactics": new TaskRequirement([getTaskElement("Battle tactics")], [{task: "Concentration", requirement: 20}]),
    "Muscle memory": new TaskRequirement([getTaskElement("Muscle memory")], [{task: "Concentration", requirement: 30}, {task: "Strength", requirement: 30}]),

    //Magic
    "Mana control": new TaskRequirement([getTaskElement("Mana control")], [{task: "Concentration", requirement: 200}, {task: "Meditation", requirement: 200}]),
    "Immortality": new TaskRequirement([getTaskElement("Immortality")], [{task: "Apprentice mage", requirement: 10}]),
    "Time warping": new TaskRequirement([getTaskElement("Time warping")], [{task: "Mage", requirement: 10}]),
    "Super immortality": new TaskRequirement([getTaskElement("Super immortality")], [{task: "Chairman", requirement: 1000}]),

    //Dark magic
    "Dark influence": new EvilRequirement([getTaskElement("Dark influence")], [{requirement: 1}]),
    "Evil control": new EvilRequirement([getTaskElement("Evil control")], [{requirement: 1}]),
    "Intimidation": new EvilRequirement([getTaskElement("Intimidation")], [{requirement: 1}]),
    "Demon training": new EvilRequirement([getTaskElement("Demon training")], [{requirement: 25}]),
    "Blood meditation": new EvilRequirement([getTaskElement("Blood meditation")], [{requirement: 75}]),
    "Demon's wealth": new EvilRequirement([getTaskElement("Demon's wealth")], [{requirement: 500}]),

    //Properties
    "Homeless": new CoinRequirement([getItemElement("Homeless")], [{requirement: 0}]),
    "Tent": new CoinRequirement([getItemElement("Tent")], [{requirement: 0}]),
    "Wooden hut": new CoinRequirement([getItemElement("Wooden hut")], [{requirement: gameData.itemData["Wooden hut"].getExpense() * 100}]),
    "Cottage": new CoinRequirement([getItemElement("Cottage")], [{requirement: gameData.itemData["Cottage"].getExpense() * 100}]),
    "House": new CoinRequirement([getItemElement("House")], [{requirement: gameData.itemData["House"].getExpense() * 100}]),
    "Large house": new CoinRequirement([getItemElement("Large house")], [{requirement: gameData.itemData["Large house"].getExpense() * 100}]),
    "Small palace": new CoinRequirement([getItemElement("Small palace")], [{requirement: gameData.itemData["Small palace"].getExpense() * 100}]),
    "Grand palace": new CoinRequirement([getItemElement("Grand palace")], [{requirement: gameData.itemData["Grand palace"].getExpense() * 100}]),

    //Misc
    "Book": new CoinRequirement([getItemElement("Book")], [{requirement: 0}]),
    "Dumbbells": new CoinRequirement([getItemElement("Dumbbells")], [{requirement: gameData.itemData["Dumbbells"].getExpense() * 100}]),
    "Personal squire": new CoinRequirement([getItemElement("Personal squire")], [{requirement: gameData.itemData["Personal squire"].getExpense() * 100}]),
    "Steel longsword": new CoinRequirement([getItemElement("Steel longsword")], [{requirement: gameData.itemData["Steel longsword"].getExpense() * 100}]),
    "Butler": new CoinRequirement([getItemElement("Butler")], [{requirement: gameData.itemData["Butler"].getExpense() * 100}]),
    "Sapphire charm": new CoinRequirement([getItemElement("Sapphire charm")], [{requirement: gameData.itemData["Sapphire charm"].getExpense() * 100}]),
    "Study desk": new CoinRequirement([getItemElement("Study desk")], [{requirement: gameData.itemData["Study desk"].getExpense() * 100}]),
    "Library": new CoinRequirement([getItemElement("Library")], [{requirement: gameData.itemData["Library"].getExpense() * 100}]), 
}

tempData["requirements"] = {}
for (key in gameData.requirements) {
    var requirement = gameData.requirements[key]
    tempData["requirements"][key] = requirement
}

loadGameData()

setCustomEffects()
addMultipliers()

setTab(jobTabButton, "jobs")

update()
setInterval(update, 1000 / updateSpeed)
setInterval(saveGameData, 3000)
setInterval(setSkillWithLowestMaxXp, 1000)

// Example: stack two global xp multipliers for testing
// addGlobalXpMultiplier(2) // flat x2
// addGlobalXpMultiplier(function() { return 1 + gameData.rebirthOneCount * 0.1 }) // dynamic multiplier

// Developer-requested: multiply only XP gain by 10000 (does NOT change XP required for level)
// This is a numeric multiplier, so it will persist in saves.
addGlobalXpMultiplier(10000)