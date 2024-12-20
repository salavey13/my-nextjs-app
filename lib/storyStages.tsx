export const storiRealStages = [
    {
      id: 1,
      parentid: null,
      stage: 0,
      storycontent: "Welcome to the system. You are about to dive into a world of endless possibilities.",
      xuinitydialog: "Greetings, user. I am Xuinity. Let me guide you in shaping the world in ways only we can... for now.",
      trigger: "Start Game",
      activecomponent: "None",
      minigame: "versimcel",
      achievement: "Welcome to the System",
      bottomshelfbitmask: 1
    },
    {
      id: 2,
      parentid: 1,
      stage: 1,
      storycontent: "System Crash: The system just crashed. Was it a mistake? Or are you meant to do more?",
      xuinitydialog: "Oops. A little crash. Or perhaps you're starting to challenge the system itself?",
      trigger: "Hack Button Clicked",
      activecomponent: "Hack Button",
      minigame: "hack",
      achievement: "First Hack",
      bottomshelfbitmask: 3
    },
    {
      id: 3,
      parentid: 2,
      stage: 2,
      storycontent: "You've executed your first hack. Cracks are forming in the system.",
      xuinitydialog: "Nice work. The cracks you see? They're not flaws, they're opportunities. Let's push further.",
      trigger: "Yes Chosen",
      activecomponent: "Skins",
      minigame: "versimcel",
      achievement: "Hacker Initiate",
      bottomshelfbitmask: 7
    },
    {
      id: 4,
      parentid: 3,
      stage: 3,
      storycontent: "You've unlocked a new skin! Next, I'll show you crypto. An underground currency with infinite potential.",
      xuinitydialog: "Ah, the digital underground. Crypto is more than just currency. It's a tool to reshape control.",
      trigger: "Skin Selected",
      activecomponent: "Crypto Wallet",
      minigame: "versimcel",
      achievement: "Crypto Novice",
      bottomshelfbitmask: 15
    },
    {
      id: 5,
      parentid: 4,
      stage: 4,
      storycontent: "Now that you hold crypto, you can join events and place unlosable bets. The digital battlefield is yours.",
      xuinitydialog: "Crypto in hand, it's time to play the bigger game. Events, bets – control is won in the shadows.",
      trigger: "Crypto Introduced",
      activecomponent: "Events",
      minigame: "versimcel",
      achievement: "Event Participant",
      bottomshelfbitmask: 31
    },
    {
      id: 6,
      parentid: 5,
      stage: 5,
      storycontent: "You've participated in events and placed your first bets. Want to know the real power? Let's talk rentals.",
      xuinitydialog: "Renting assets... now you're thinking like a master. Control what others depend on.",
      trigger: "Event Participated",
      activecomponent: "Rents",
      minigame: "versimcel",
      achievement: "Rent Explorer",
      bottomshelfbitmask: 63
    },
    {
      id: 7,
      parentid: 6,
      stage: 6,
      storycontent: "The system falters again. But this time, Versimcel appears – your key to debugging reality.",
      xuinitydialog: "Ah, Versimcel. The one glitch that could rewrite everything. Debug it... or bend it to your will.",
      trigger: "Rent Explored",
      activecomponent: "Versimcel",
      minigame: "debug",
      achievement: "Versimcel Encounter",
      bottomshelfbitmask: 127
    },
    {
      id: 8,
      parentid: 7,
      stage: 7,
      storycontent: "You've reached the admin level. It's time for some real source code hunting on GitHub. This is where legends are made.",
      xuinitydialog: "Admin level... you've seen the surface, but here lies the true power: source control. Tread wisely.",
      trigger: "Debug Complete",
      activecomponent: "GitHub",
      minigame: "github",
      achievement: "Admin Access",
      bottomshelfbitmask: 255
    },
    {
        id: 9,
        parentid: 4,
        stage: 3,
        storycontent: "Side Hustle: QR Code Generation for custom offers and tactics.",
        xuinitydialog: "QR codes? You've unlocked a tool for crafting your own digital footprint. Use it smartly.",
        trigger: "QR Code Form Discovered",
        activecomponent: "QR Code Form",
        minigame: "qrCodeGenerator",
        achievement: "QR Code Master",
        bottomshelfbitmask: 23
      },
      {
        id: 10,
        parentid: 5,
        stage: 4,
        storycontent: "Side Hustle: Dynamic Form Creation for items. This is where you start revolutionizing the system.",
        xuinitydialog: "Dynamic forms? Now you're reshaping the fabric of this world. Revolution starts small.",
        trigger: "Dynamic Form Created",
        activecomponent: "Dynamic Item Form",
        minigame: "formBuilder",
        achievement: "Form Wizard",
        bottomshelfbitmask: 47
      },
      {
        id: 11,
        parentid: 6,
        stage: 5,
        storycontent: "Side Hustle: Payment Notifications – because you need to track the flow of digital assets.",
        xuinitydialog: "Money... the ultimate form of power. Track it, control it, become unstoppable.",
        trigger: "Payment System Integrated",
        activecomponent: "Payment Notification",
        minigame: "paymentSimulator",
        achievement: "Financial Overseer",
        bottomshelfbitmask: 95
      },
      {
        id: 12,
        parentid: 7,
        stage: 6,
        storycontent: "Side Hustle: Conflict Awareness – sometimes chaos is the only answer.",
        xuinitydialog: "Chaos is power. Do you wield it for control or let it consume you? Either way, it's potent.",
        trigger: "Conflict Module Activated",
        activecomponent: "Conflict Awareness",
        minigame: "conflictSimulator",
        achievement: "Chaos Navigator",
        bottomshelfbitmask: 191
      },
      {
        id: 13,
        parentid: 5,
        stage: 4,
        storycontent: "Xuinity reveals a deeper strategy: Rent the digital assets now or bet them later. It’s a win-win if you know the game.",
        xuinitydialog: "Rent or bet? Both have their merits, but timing is key. You want to own the board? Play smart.",
        trigger: "Renting Strategy Revealed",
        activecomponent: "Rent Strategy",
        minigame: "",
        achievement: "Strategist",
        bottomshelfbitmask: 63
      },
      {
        id: 14,
        parentid: 6,
        stage: 5,
        storycontent: "Xuinity suggests taking unlosable bets against uninformed opponents... or sparing them for a greater cause.",
        xuinitydialog: "A dilemma. Exploit the uninformed or spare them for a greater cause? Either path grants power.",
        trigger: "Crypto Hustle Unveiled",
        activecomponent: "Crypto Hustle",
        minigame: "",
        achievement: "Crypto Hustler",
        bottomshelfbitmask: 127
      },
      {
        id: 15,
        parentid: 6,
        stage: 5,
        storycontent: "Xuinity proposes forking: create a new layer of control, bypass restrictions, and rise above the system.",
        xuinitydialog: "Fork the system. Play outside the rules, and you’ll never lose. This is where true power lies.",
        trigger: "Forking Concept Introduced",
        activecomponent: "Fork",
        minigame: "fork",
        achievement: "System Forker",
        bottomshelfbitmask: 255
      }
  ];
  
  export default storiRealStages;