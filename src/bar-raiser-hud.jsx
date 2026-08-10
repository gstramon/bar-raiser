import { useState, useCallback, useEffect, useRef } from "react";

const C = {
  bg:"#0C0E1A", panel:"#131728", panelDeep:"#0A0C18",
  border:"#1E2338", borderMid:"#252A45",
  amber:"#E8A84C", amberDim:"#3D3020",
  teal:"#5B9BB5", cream:"#F0EBE1",
  muted:"#5C6380", mutedLight:"#8A91B0",
  red:"#C0524A", green:"#5BA88A",
  cha:"#6B8FD4", dir:"#6BBF7A", emp:"#C0688A", care:"#A87CC0",
};
const TRAIT_CFG=[{key:"charismatic",label:"Cha",color:"#6B8FD4"},{key:"direct",label:"Dir",color:"#6BBF7A"},{key:"empathetic",label:"Emp",color:"#C0688A"}];
const DC={COMPLICATION:12,INTERACTION:13,SERVE:13};
const DAY_GOAL=7,HAND_SIZE=6;

const ALL_COMPLICATIONS=[
  {name:"Dirty Work Area",desc:"Your utensils are dirty and taking up space, distracting you.",type:["Technical"],vulnerability:"direct",dc:12,dcOnVuln:10,onFail:"You start sorting utensils but keep losing track of which are clean. The thought paralyzes you for a while.",onSuccess:"Slowly but surely you get the pile clean. Almost therapeutic."},
  {name:"Dine and Dash",desc:"Someone is trying to get away without paying their tab.",type:["Social"],vulnerability:"direct",dc:12,dcOnVuln:10,onFail:"They insist they already paid — now you're not sure. Time spent reconciling bills.",onSuccess:"You find a compromise. They pretend they forgot. You get the plutos."},
  {name:"Bachelorette Party",desc:"A bachelorette party takes over. They don't know what they want.",type:["Social"],vulnerability:"empathetic",dc:12,dcOnVuln:10,onFail:"They keep asking each other what they're having. Forever.",onSuccess:"You convince them to be surprised. You read them perfectly — Dry Martinis all around."},
  {name:"Tipsy Bride",desc:"During a bachelorette party, the bride climbs the table. Crowd goes wild.",type:["Social"],vulnerability:"charismatic",dc:12,dcOnVuln:10,onFail:"You avoid clothing removal, but more people have joined the bride.",onSuccess:"You convince the bride to come make a drink behind the counter. Everyone records it."},
  {name:"Get a Room?",desc:"A trio's makeout session is getting out of hand.",type:["Social"],vulnerability:"charismatic",dc:12,dcOnVuln:10,onFail:"Your attempt to defuse only draws more attention to their table.",onSuccess:"A cautionary tale gets their attention. They realise they have work in the morning."},
  {name:"Annoying Flirty Dude",desc:"An annoying customer won't stop hitting on you and is hogging bar space.",type:["Social"],vulnerability:"direct",dc:12,dcOnVuln:10,onFail:"Ignoring, sarcasm, bluntness — nothing works. This man is on a mission.",onSuccess:"A well-timed glass of water to the face sorts it."},
  {name:"Vigorous Hurl",desc:'A customer starts barfing on the floor. Focus on the "starts."',type:["Social"],vulnerability:"empathetic",dc:12,dcOnVuln:10,onFail:"Despite your best efforts, let's say they weren't done.",onSuccess:"You get them outside with water and electrolytes. Hermes handles the rest."},
  {name:"Out of Toilet Paper",desc:"The restroom is out of toilet paper.",type:["Technical"],vulnerability:"empathetic",dc:12,dcOnVuln:10,onFail:"You were sure you saw some in the back. You can't find it.",onSuccess:"You check Fergie's office. Emergency stack of TP found."},
  {name:"Hermes Bullies",desc:"A group of bullies start harassing Hermes.",type:["Social"],vulnerability:"charismatic",dc:12,dcOnVuln:10,onFail:"You try to get between them. Mob mentality is hard to beat alone.",onSuccess:"You get overly protective. A crowd forms by your side. One bully is thrown out. The rest awkwardly leave."},
  {name:"Glasses Everywhere",desc:"Tables overflow with glasses and empty bottles.",type:["Technical"],vulnerability:"empathetic",dc:12,dcOnVuln:10,onFail:"Constant interruptions keep you from making real progress.",onSuccess:"You hit a flow state — dancing through the crowd collecting glasses."},
  {name:"Not Cool at All",desc:"The A/C stops working.",type:["Technical"],vulnerability:"direct",dc:12,dcOnVuln:10,onFail:"You clean compartments and reboot. Nothing happens.",onSuccess:"Last resort: you smack it real good. It works. Engineering is simple sometimes."},
  {name:"Toilet Problems",desc:"Someone is having toilet problems. You've been requested to help.",type:["Social"],vulnerability:"direct",dc:12,dcOnVuln:10,onFail:"Some things are better left unsaid.",onSuccess:"Pragmatic hat on. Sorted like a pro. No questions asked."},
  {name:"Jukebox Dispute",desc:"Two customers fight over who plays next.",type:["Social"],vulnerability:"charismatic",dc:12,dcOnVuln:10,onFail:"You almost defuse it but a third person cuts in. Three people fighting to the Macarena.",onSuccess:"You turn it into a 'who did it best?' situation. The crowd loves it."},
  {name:"Brawling",desc:"A customer gets hit with a glass and a brawl breaks out. Crowd carries on partying.",type:["Social"],vulnerability:"direct",dc:12,dcOnVuln:10,onFail:"You try to get help but nobody's listening. One brawler tries to lift a chair, realises it's heavier than expected.",onSuccess:"They weren't expecting your strength — or Hermes's taser. Both kicked out."},
  {name:"Dancing on the Table",desc:"A loud table gets out of hand as people start dancing on tables.",type:["Social"],vulnerability:"charismatic",dc:12,dcOnVuln:10,onFail:"You and Hermes try to intervene. The crowd is now laughing at you both.",onSuccess:"You climb up too. It banalises the act. The crowd disperses."},
  {name:"A Surprise Party",desc:"A large group hijacks the bar for a surprise party, bringing their own stuff.",type:["Social"],vulnerability:"empathetic",dc:12,dcOnVuln:10,onFail:"They explain Helen had a bad breakup. You're now consoling Helen.",onSuccess:"You meet halfway — they order drinks, you get cake."},
  {name:"Drunk Asshole",desc:"A drunk customer is looking for trouble with anyone who'll take it.",type:["Social"],vulnerability:"empathetic",dc:12,dcOnVuln:10,onFail:"You try to defuse it. Now you're the target.",onSuccess:"You speak to them like a child. It's super effective."},
  {name:"Lights Out",desc:"The bar lights go out.",type:["Technical"],vulnerability:"empathetic",dc:12,dcOnVuln:10,onFail:"You try resetting the circuit breaker. It keeps short-circuiting.",onSuccess:"Someone plugged their blender into an outlet. You find it. Reset. Voilà."},
  {name:"TV Off",desc:"It's sports night. The TVs stopped working.",type:["Technical","Social"],vulnerability:"charismatic",dc:12,dcOnVuln:10,onFail:"12 men shouting instructions at you. Not your first time in this situation.",onSuccess:"You grab a tiny TV from upstairs. It becomes a hit."},
];

const ALL_CARDS=[
  {id:100,name:"Charisma +1",desc:"Charisma +1 modifier on your next roll.",type:"Charismatic",modifier:1,effect:"modifier_next",exclusive:"first_charismatic"},
  {id:101,name:"Direct +1",desc:"Direct +1 modifier on your next roll.",type:"Direct",modifier:1,effect:"modifier_next",exclusive:"first_direct"},
  {id:102,name:"Empathetic +1",desc:"Empathetic +1 modifier on your next roll.",type:"Empathetic",modifier:1,effect:"modifier_next",exclusive:"first_empathetic"},
  {id:103,name:"Darius's disarming charm",desc:"Advantage on Charismatic rolls until end of shift.",type:"Charismatic",modifier:0,effect:"advantage_trait_shift",effectTrait:"charismatic",exclusive:"first_darius"},
  {id:104,name:"Mimi's intimidation",desc:"Advantage on Direct rolls until end of shift.",type:"Direct",modifier:0,effect:"advantage_trait_shift",effectTrait:"direct",exclusive:"first_mimi"},
  {id:105,name:"Cooper's kooky stoicism",desc:"Advantage on Empathetic rolls until end of shift.",type:"Empathetic",modifier:0,effect:"advantage_trait_shift",effectTrait:"empathetic",exclusive:"first_cooper"},
  {id:106,name:"Passionate argument",desc:"Reroll any 1s on next roll. Refill 1 Care slot on success.",type:"Charismatic",modifier:0,effect:"reroll_ones"},
  {id:107,name:"Spill the tea",desc:"Advantage on your next 2d12 roll.",type:"Charismatic",modifier:0,effect:"advantage_next"},
  {id:108,name:"SHOTS SHOTS SHOTS",desc:"Serves all customers with mood ≤ 2. No cash earned.",type:"Charismatic",modifier:0,effect:"shots_instant"},
  {id:109,name:"Release the Jukebox Kraken",desc:"Cancel disadvantage this turn and the next.",type:"Charismatic",modifier:0,effect:"cancel_disadvantage"},
  {id:110,name:"Command",desc:"Guaranteed success with Stress on your next roll.",type:"Direct",modifier:0,effect:"guaranteed_stress"},
  {id:111,name:"Water to the face",desc:"Immediately solves a Social complication (−3 Satisfaction).",type:"Direct",modifier:0,effect:"solve_social_sat"},
  {id:112,name:"On the house",desc:"Immediately solves a Social complication (−₡150 cash).",type:"Empathetic",modifier:0,effect:"solve_social_cash"},
  {id:113,name:"Personal angle",desc:"Draws a new card; your next card use is free.",type:"Empathetic",modifier:0,effect:"personal_angle"},
  {id:114,name:"I love this for you",desc:"After your next roll, reroll one die of your choice.",type:"Empathetic",modifier:0,effect:"reroll_one_die"},
  {id:115,name:"Handy Hermes",desc:"Hermes immediately fixes a Technical complication (costs bonus action).",type:"Utility",modifier:0,effect:"fix_technical"},
  {id:116,name:"Hermes restock run",desc:"Guaranteed success on your next restock bonus action.",type:"Utility",modifier:0,effect:"free_restock"},
  {id:117,name:"Flow state",desc:"You have 2 actions this turn (plus your bonus action).",type:"Care",modifier:0,effect:"two_actions"},
  {id:118,name:"A little extra",desc:"You have 2 actions this turn — but no bonus action.",type:"Care",modifier:0,effect:"two_actions_no_bonus"},
  {id:119,name:"Resilience",desc:"[Coming soon] Next card effect lasts an extra round.",type:"Care",modifier:0,effect:"noop"},
  {id:120,name:"Transmutation",desc:"[Coming soon] Change the trait of your next card.",type:"Care",modifier:0,effect:"noop"},
  {id:121,name:"Mindfulness",desc:"Doubles Care Points gained for the next 2 turns. Drains are unchanged.",type:"Care",modifier:0,effect:"mindfulness"},
];

const DRINKS=[
  {name:"Beer",        price:120, ings:["Beer"],                                              tipBad:120,tipOk:144,tipGood:180},
  {name:"Dry Martini", price:300, ings:["Gin","Vermouth","Orange Bitters","Lemon","Ice"],     tipBad:300,tipOk:360,tipGood:450},
  {name:"Gimlet",      price:250, ings:["Vodka","Syrup","Lemon","Ice"],                       tipBad:250,tipOk:300,tipGood:375},
  {name:"Gin Fizz",    price:300, ings:["Gin","Syrup","Club Soda","Egg White","Lemon","Ice"], tipBad:300,tipOk:360,tipGood:450},
  {name:"Old Fashioned",price:300,ings:["Whiskey","Orange Bitters","Sugar","Orange","Syrup"], tipBad:300,tipOk:360,tipGood:450},
  {name:"Whiskey Sour",price:350, ings:["Whiskey","Orange Bitters","Syrup","Lemon","Egg White","Ice"],tipBad:350,tipOk:420,tipGood:525},
  {name:"Wine",        price:250, ings:["Wine"],                                              tipBad:250,tipOk:300,tipGood:375},
];
const INGREDIENTS={
  "Beer":{stock:5,cost:97},"Club Soda":{stock:5,cost:25},"Egg White":{stock:5,cost:12},
  "Gin":{stock:5,cost:137},"Ice":{stock:5,cost:5},"Lemon":{stock:5,cost:15},
  "Orange":{stock:5,cost:19},"Orange Bitters":{stock:5,cost:10},"Sugar":{stock:5,cost:7},
  "Syrup":{stock:5,cost:24},"Vermouth":{stock:5,cost:48},"Vodka":{stock:5,cost:125},
  "Whiskey":{stock:5,cost:156},"Wine":{stock:5,cost:200},
};
const ALL_INGREDIENTS=Object.keys(INGREDIENTS);
const CUSTOMER_POOL=["Regular — Table 3","New Guest — Bar","Impatient — Table 1","Group — Table 2","Loner — Corner"];
const ALL_NPCS=["Hermes","Cooper","Darius","Mimi","Rekha","Bunk","Bauers","Willis","Genetakis","Maeve"];

// ── Interaction data ──────────────────────────────────────────────
// condition: "first" | "random" | "chained" (chained = only reachable via next pointer)
// type: "trait_gain" | "skill_check"
// options: [{trait, text}] — player's response lines, one per trait
// For trait_gain: outcome (narrative), effect {relIfTrait: trait|null}
// For skill_check: dc, dcIfRel {threshold,dc}, onSuccess, onFailure, successEffect {rel}
// next: null | interactionId
// stub: true — incomplete content, skip in random draw
const INTERACTIONS = [
  // ── Hermes ─────────────────────────────────────────────────────
  {
    id:"hermes_01", condition:"first", type:"trait_gain", npc:"Hermes",
    desc:"Hermes explains that the bar's owner had to leave back to Earth due to a family emergency, putting you in charge of the Arcadian. To add insult to injury, the landlord is putting pressure to pay rent earlier than usual. You have 7 days to make rent.",
    options:[
      {trait:"charismatic", text:"What else? Does he want fries with that?"},
      {trait:"direct",      text:"This is way more than I agreed to."},
      {trait:"empathetic",  text:"You seem worried about the bar closing down."},
    ],
    outcome:"Hermes proposes finding a replacement after this week. You agree to stay at the bar until then and make sure it stays open.",
    effect:{relIfTrait:null},
    next:null,
  },
  {
    id:"hermes_02", condition:"random", type:"trait_gain", npc:"Hermes",
    desc:"Hermes sounds distracted, which worries you they're malfunctioning. After reacting poorly to your observation, they confess to liking art.",
    options:[
      {trait:"charismatic", text:"Is there a droid's book club?"},
      {trait:"direct",      text:"You're scrappy, aren't you?"},
      {trait:"empathetic",  text:"You don't need to hide it."},
    ],
    outcome:"You two slowly start bonding. Focus on the slowly.",
    effect:{relIfTrait:null},
    next:null,
  },
  // ── Cooper ─────────────────────────────────────────────────────
  {
    id:"cooper_01", condition:"first", type:"trait_gain", npc:"Cooper",
    desc:"Cooper watches the news about an activist group causing trouble on Earth, and complains when you turn off the TV, saying it's important to know what's going on down there.",
    options:[
      {trait:"charismatic", text:"Men are obsessed with \"down there\", if you catch my drift."},
      {trait:"direct",      text:"There's not much to gain talking about a dying planet."},
      {trait:"empathetic",  text:"You sound like you miss Earth."},
    ],
    outcome:"You agree to disagree, but you both feel it's nice to have someone to talk to.",
    effect:{relIfTrait:["charismatic","empathetic"]},
    next:"cooper_01_cont_check",
  },
  {
    id:"cooper_01_cont_check", condition:"chained", type:"skill_check", npc:"Cooper",
    desc:"You explain you've just been back on Earth a month ago. Between climate change, never-ending late stage capitalism and denial, you explain the situation is untenable. Cooper retorts that that's one way to change things. You ask what he means.",
    options:[
      {trait:"charismatic", text:"What's the other way? Please don't say the answer is \"love\"."},
      {trait:"direct",      text:"You tell me, and I'll even hand you the TV remote."},
      {trait:"empathetic",  text:"Come on. You seem like you could use someone to talk to."},
    ],
    dc:12, dcIfRel:{threshold:1, dc:10},
    onFailure:"He says you're persistent like someone he used to know. When you ask for the gossip, a wave of arriving customers makes him reluctant.",
    onSuccess:"Cooper compares life to chess — people are trying to solve things in one move, when in practice things take a succession of moves to transpire. He starts to give an example mentioning someone you remind him of, but is cut off by a wave of arriving customers.",
    successEffect:{rel:1},
    next:null,
  },
  {
    id:"cooper_02", condition:"random", type:"trait_gain", npc:"Cooper",
    desc:"Cooper is toying with a gadget the size of a beer can, while muttering something under his breath.",
    options:[
      {trait:"charismatic", text:"I'm pretty sure doing voodoo on bar premises is not allowed, you know."},
      {trait:"direct",      text:"Anything to drink?"},
      {trait:"empathetic",  text:"You look like a kid the day after Christmas."},
    ],
    outcome:"He explains this is a germination pod, used to germinate seeds under specific, programmable circumstances. He gives you the result, something called a \"Bloom Extract\". It smells like lemons from Earth.",
    effect:{relIfTrait:["charismatic","empathetic"]},
    next:null,
  },
  {
    id:"cooper_03", condition:"random", type:"skill_check", npc:"Cooper",
    stub:true,
    desc:"[Content pending]",
    options:[
      {trait:"charismatic", text:"[Option pending]"},
      {trait:"direct",      text:"[Option pending]"},
      {trait:"empathetic",  text:"[Option pending]"},
    ],
    dc:12, dcIfRel:{threshold:1, dc:10},
    onFailure:"[Pending]", onSuccess:"[Pending]", successEffect:{rel:1},
    next:null,
  },
  // ── Darius ─────────────────────────────────────────────────────
  {
    id:"darius_01", condition:"first", type:"trait_gain", npc:"Darius",
    desc:"Upon meeting Darius, you comment under your breath about his six-pack, but Hermes mistakes that for an order of a six-pack of beer. Darius tries to make fun of the situation by saying you can call him Mr. Six-Pack.",
    options:[
      {trait:"charismatic", text:"My very own Knight in Shining Spandex."},
      {trait:"direct",      text:"I think I'll stick with Darius."},
      {trait:"empathetic",  text:"You're begging to get noticed."},
    ],
    outcome:"You two exchange glances, he asks for a drink.",
    effect:{relIfTrait:["charismatic"]},
    next:"darius_01_cont_check",
  },
  {
    id:"darius_01_cont_check", condition:"chained", type:"skill_check", npc:"Darius",
    desc:"You learn Darius is a member of the Spacewalkers program. You plead to know what's going on with the program behind the curtains.",
    options:[
      {trait:"charismatic", text:"I'll share something personal in return."},
      {trait:"direct",      text:"It's high time someone explains what's going on."},
      {trait:"empathetic",  text:"We both want the best for the other Spacewalker members."},
    ],
    dc:12, dcIfRel:{threshold:1, dc:10},
    onFailure:"He seems resistant and says he needs to check in with his crew, going to another table.",
    onSuccess:"He reluctantly explains that it's an initiative by Olympus to have a traveling fleet of 1 million civilians, and that the program will be officially announced in 4 weeks, here on Moon Village.",
    successEffect:{rel:1},
    next:null,
  },
  {
    id:"darius_02", condition:"random", type:"trait_gain", npc:"Darius",
    desc:"You and Darius argue about the poor working conditions of some of the Spacewalkers.",
    options:[
      {trait:"charismatic", text:"You sound just like Olympus."},
      {trait:"direct",      text:"They're stuck in a sweatshop!"},
      {trait:"empathetic",  text:"Try putting yourself in their shoes."},
    ],
    outcome:"Darius calls this their \"trials and tribulations\", that it's important for people that are feeling aimless. You get the sense he's been in a similar condition in the past.",
    effect:{relIfTrait:null},
    next:null,
  },
  // ── Mimi ───────────────────────────────────────────────────────
  {
    id:"mimi_01", condition:"first", type:"trait_gain", npc:"Mimi",
    desc:"You see your ex, Mimi, for the 1st time since you had a falling out. You swallow hard — she looks great with her new hair. Your romantic dry spell doesn't help much. She says you look well.",
    options:[
      {trait:"charismatic", text:"It's the moon glow-up."},
      {trait:"direct",      text:"You don't look so bad yourself."},
      {trait:"empathetic",  text:"New hair, new Mimi?"},
    ],
    outcome:"You two banter for a minute and you serve her a drink.",
    effect:{relIfTrait:["empathetic"]},
    next:"mimi_01_cont_check",
  },
  {
    id:"mimi_01_cont_check", condition:"chained", type:"skill_check", npc:"Mimi",
    desc:"Mimi seems preoccupied, but is reluctant to open up, as a queue forms behind her. She asks if you're sure.",
    options:[
      {trait:"charismatic", text:"These bozos need to sober up anyhow."},
      {trait:"direct",      text:"I can spare a few minutes."},
      {trait:"empathetic",  text:"I want to know what's up with you."},
    ],
    dc:12, dcIfRel:{threshold:1, dc:10},
    onFailure:"She dismisses it as work stuff, and says she needs to respect your decision to leave the company.",
    onSuccess:"Mimi shares her worries about the lack of security with the Spacewalkers Program, which could be exploited by Generation Omega.",
    successEffect:{rel:1},
    next:null,
  },
  {
    id:"mimi_02", condition:"random", type:"trait_gain", npc:"Mimi",
    desc:"Mimi tries to compliment you on your drink by saying \"you're a better bartender than you were a pilot\".",
    options:[
      {trait:"charismatic", text:"Say more, please."},
      {trait:"direct",      text:"Feel free to tip the bartender."},
      {trait:"empathetic",  text:"You're not very good at giving praise, are you?"},
    ],
    outcome:"You two share a laugh.",
    effect:{relIfTrait:null},
    next:null,
  },
  // ── Rekha ──────────────────────────────────────────────────────
  {
    id:"rekha_01", condition:"first", type:"trait_gain", npc:"Rekha",
    desc:"Rekha introduces herself as Moon Village's social worker.",
    options:[
      {trait:"charismatic", text:"So you're the person I should ask about vacation days."},
      {trait:"direct",      text:"I didn't even know we had a social worker."},
      {trait:"empathetic",  text:"You're the entire department?"},
    ],
    outcome:"She immediately starts opening up on how the work keeps piling up and on the excess of bureaucracy.",
    effect:{relIfTrait:null},
    next:null,
  },
  {
    id:"rekha_02", condition:"random", type:"skill_check", npc:"Rekha",
    stub:true,
    desc:"[Content pending]",
    options:[
      {trait:"charismatic", text:"[Option pending]"},
      {trait:"direct",      text:"[Option pending]"},
      {trait:"empathetic",  text:"[Option pending]"},
    ],
    dc:12, dcIfRel:null,
    onFailure:"[Pending]", onSuccess:"[Pending]", successEffect:{rel:1},
    next:null,
  },
  // ── Bunk ───────────────────────────────────────────────────────
  {
    id:"bunk_01", condition:"first", type:"trait_gain", npc:"Bunk",
    desc:"Bunk flips a digital pamphlet back and forth, searching for a birthday present for his little boy, Kevin.",
    options:[
      {trait:"charismatic", text:"How about a flying bike? Like in the movies?"},
      {trait:"direct",      text:"All options suck, buddy. Pick the least sucky one."},
      {trait:"empathetic",  text:"My dad also wasn't around much when I was tiny. You'll be all right."},
    ],
    outcome:"He reveals his partner Diana and Kev are coming to Moon Village to visit, and that he'd like for them to live here.",
    effect:{relIfTrait:["empathetic"]},
    next:null,
  },
  // ── Bauers ─────────────────────────────────────────────────────
  {
    id:"bauers_01", condition:"first", type:"trait_gain", npc:"Bauers",
    desc:"A family shows up at the bar — including their teenage daughter — wearing the Spacewalker uniform. They look beyond exhausted. You notice other patrons staring at them and talking behind their back. You feel protective of them.",
    options:[
      {trait:"charismatic", text:"Y'all famous or something?"},
      {trait:"direct",      text:"As long as the kid stays on soda, I can make an exception for y'all."},
      {trait:"empathetic",  text:"Drinks are on the house."},
    ],
    outcome:"They thank you, but remain behaving as if they're suspicious of everybody.",
    effect:{relIfTrait:["empathetic"]},
    next:"bauers_01_cont_check",
  },
  {
    id:"bauers_01_cont_check", condition:"chained", type:"skill_check", npc:"Bauers",
    desc:"As their small talk only sounds like they're scared to open up, you ask if everything is alright. They seem reluctant.",
    options:[
      {trait:"charismatic", text:"You can trust the bartender-client confidentiality."},
      {trait:"direct",      text:"Help me help you."},
      {trait:"empathetic",  text:"I'd be stressed too, in your place."},
    ],
    dc:15, dcIfRel:{threshold:1, dc:12},
    onFailure:"They swear things are okay and that they're just tired.",
    onSuccess:"They share vague details about the program, and how they're involved in something about Miniaturization of Metallic Hydrogen.",
    successEffect:{rel:1},
    next:null,
  },
  // ── Willis ─────────────────────────────────────────────────────
  {
    id:"willis_01", condition:"first", type:"trait_gain", npc:"Willis",
    desc:"You meet Willis, your beverage supplier.",
    options:[
      {trait:"charismatic", text:"Our beverages are not the best, but can I get ya?"},
      {trait:"direct",      text:"What's your poison?"},
      {trait:"empathetic",  text:"You look tired."},
    ],
    outcome:"You serve her drinks.",
    effect:{relIfTrait:null},
    next:null,
  },
  {
    id:"willis_02", condition:"random", type:"trait_gain", npc:"Willis",
    stub:true,
    desc:"[Content pending]",
    options:[
      {trait:"charismatic", text:"[Option pending]"},
      {trait:"direct",      text:"[Option pending]"},
      {trait:"empathetic",  text:"[Option pending]"},
    ],
    outcome:"[Pending]",
    effect:{relIfTrait:null},
    next:null,
  },
  // ── Genetakis ──────────────────────────────────────────────────
  {
    id:"genetakis_01", condition:"first", type:"trait_gain", npc:"Genetakis",
    desc:"Genetakis looks grumpy and uncomfortable at the bar while his crew is having fun. You ask what he'd like to drink — he says he's not drinking.",
    options:[
      {trait:"charismatic", text:"You're still going to be their boss even if you share a beer with them."},
      {trait:"direct",      text:"We'd appreciate the patronage."},
      {trait:"empathetic",  text:"Look around, Gene: everybody is having a blast. No need to be so serious."},
    ],
    outcome:"Genetakis begrudgingly accepts a beer.",
    effect:{relIfTrait:null},
    next:null,
  },
  // ── Maeve ──────────────────────────────────────────────────────
  {
    id:"maeve_01", condition:"first", type:"trait_gain", npc:"Maeve",
    desc:"Your mother Maeve pays a visit, saying she merely wants to know how you're doing. She asks for just 5 minutes of your time.",
    options:[
      {trait:"charismatic", text:"You made it really hard for me to say \"no\", huh?"},
      {trait:"direct",      text:"Fine. What are you drinking?"},
      {trait:"empathetic",  text:"Fine. I guess this is you making an effort."},
    ],
    outcome:"You serve her wine, but keep your guard up around her. She respects her 5 minutes and stops nagging you soon after.",
    effect:{relIfTrait:null},
    next:null,
  },
];

// NPCs that stop appearing once their interaction pool is exhausted
const POOL_EXHAUSTED_WHEN_DONE = new Set(["Bunk","Bauers","Genetakis","Maeve"]);

// Select next interaction for an NPC given history (completed IDs) and current relationships
const getNextInteraction = (npcName, history=[], relationships={}) => {
  const npcHistory = history[npcName] || [];
  const eligible = INTERACTIONS.filter(i => i.npc === npcName && i.condition !== "chained" && !i.stub);
  const first = eligible.find(i => i.condition === "first");
  if (first && !npcHistory.includes(first.id)) return first;
  const randomPool = eligible.filter(i => i.condition === "random" && !npcHistory.includes(i.id));
  // If pool exhausted, allow reuse for NPCs that have a pool
  const fullRandom = eligible.filter(i => i.condition === "random");
  const pool = randomPool.length > 0 ? randomPool : fullRandom;
  return pool.length > 0 ? randFrom(pool) : null;
};

// Whether an NPC still has interactions available (used to gate arrival)
const npcHasAvailableInteractions = (npcName, history={}) => {
  const npcHistory = history[npcName] || [];
  const eligible = INTERACTIONS.filter(i => i.npc === npcName && i.condition !== "chained" && !i.stub);
  const hasFirst = eligible.some(i => i.condition === "first" && !npcHistory.includes(i.id));
  const hasRandom = eligible.some(i => i.condition === "random");
  return hasFirst || hasRandom;
};

const BONUS_INFO={tips:{icon:"\uD83D\uDCB0",label:"Probe for Tips",desc:"Try to extract a better tip from the current customer."},hermes:{icon:"\uD83D\uDCE6",label:"Send Hermes",desc:"Hermes runs an errand — restock the bar on good roll."},tidy:{icon:"\uD83E\uDDF9",label:"Tidy Up",desc:"Lower odds of a new complication."},freeze:{icon:"\uD83E\uDDCA",label:"Freeze the Room",desc:"Freeze customer moods on Good+."}};
const D20_BANDS=[{min:1,max:5,label:"Bad",color:"#C0524A"},{min:6,max:12,label:"Neutral",color:"#8A91B0"},{min:13,max:18,label:"Good",color:"#5BA88A"},{min:19,max:20,label:"Great",color:"#E8A84C"}];
const OUTCOME_MAP={critical:{label:"Critical! \u2605",color:"#E8A84C",icon:"\u2605",note:"Instant Care slot unlocked"},success_chill:{label:"Success \u00B7 Chill",color:"#5BA88A",icon:"\u2713",note:"Full outcome + +1 Care progress"},success_stress:{label:"Success \u00B7 Stress",color:"#5B9BB5",icon:"\u2713",note:"Full outcome, no bonus"},fail_chill:{label:"Failure \u00B7 Chill",color:"#E8A84C",icon:"\u2717",note:"Miss — but +1 Care progress"},fail_stress:{label:"Failure \u00B7 Stress",color:"#C0524A",icon:"\u2717",note:"Hard fail — \u22121 Care progress"}};

const randFrom=arr=>arr[Math.floor(Math.random()*arr.length)];
const randComplication=()=>({...randFrom(ALL_COMPLICATIONS),stacked:false,turnsActive:0});
const generateCustomers=sat=>{const p=Math.max(0.2,sat/100),out=[];CUSTOMER_POOL.forEach(label=>{if(Math.random()<p)out.push({label,mood:Math.random()<0.5?3:2});});return out.length?out:[{label:CUSTOMER_POOL[0],mood:2}];};
const cardTypeColor=type=>({"Charismatic":"#6B8FD4","Direct":"#6BBF7A","Empathetic":"#C0688A","Utility":"#8A91B0","Care":"#A87CC0","Relationship":"#5B9BB5"}[type]||"#5C6380");
const INIT_CUSTOMERS=[];
const drawHand=deck=>{const s=deck.length<=HAND_SIZE?[...deck]:[...deck].sort(()=>Math.random()-0.5).slice(0,HAND_SIZE);return s.map(c=>({...c,cardState:"available"}));};

// Primitives
function CareToken({state}){const s={available:{background:"radial-gradient(circle at 38% 32%, #F5C86A, #D4923A)",boxShadow:"0 0 14px rgba(232,168,76,.55),inset 0 1px 0 rgba(255,255,255,.18)",border:"1px solid rgba(232,168,76,.7)"},spent:{background:"radial-gradient(circle at 38% 32%, #2A2418, #1C1910)",boxShadow:"0 0 4px rgba(232,168,76,.08)",border:"1px solid #3D3020"},locked:{background:"#0A0C16",boxShadow:"none",border:"1px solid #161828"}};return <div style={{width:34,height:34,borderRadius:"50%",flexShrink:0,...s[state]}}/>;}
function Panel({title,titleColor,children,style,accent}){return(<div style={{background:"#131728",border:`1px solid ${accent||"#1E2338"}`,borderRadius:10,padding:"13px 15px",...style}}>{title&&<div style={{fontSize:9,fontWeight:700,letterSpacing:"0.14em",color:titleColor||"#5C6380",textTransform:"uppercase",marginBottom:11}}>{title}</div>}{children}</div>);}
function MoodDots({level}){const color=level===3?"#5BA88A":level===2?"#E8A84C":"#C0524A";return(<div style={{display:"flex",gap:5}}>{[1,2,3].map(i=>(<div key={i} style={{width:9,height:9,borderRadius:"50%",background:i<=level?color:"transparent",border:`1.5px solid ${i<=level?color:"#5C6380"}`,boxShadow:i<=level?`0 0 6px ${color}70`:"none"}}/>))}</div>);}
function Btn({children,onClick,disabled,color,outline,small,style}){const bg=outline?"transparent":disabled?"#252A45":(color||"#E8A84C"),col=outline?"#5C6380":disabled?"#5C6380":"#0C0E1A";return(<button onClick={onClick} disabled={disabled} style={{background:bg,color:col,border:outline?"1px solid #1E2338":"none",borderRadius:7,padding:small?"6px 12px":"10px 22px",fontSize:small?10:12,fontWeight:700,cursor:disabled?"default":"pointer",letterSpacing:"0.05em",transition:"all .15s",fontFamily:"inherit",...style}}>{children}</button>);}
function Stepper({value,onChange,label}){const bS={background:"#0A0C18",border:"1px solid #1E2338",color:"#F0EBE1",borderRadius:5,width:26,height:26,cursor:"pointer",fontSize:15,fontFamily:"inherit"};return(<div style={{display:"flex",alignItems:"center",gap:7}}>{label&&<span style={{fontSize:10,color:"#5C6380"}}>{label}</span>}<button onClick={()=>onChange(value-1)} style={bS}>-</button><span style={{fontSize:13,fontWeight:700,color:value>0?"#5BA88A":value<0?"#C0524A":"#5C6380",minWidth:30,textAlign:"center"}}>{value>0?`+${value}`:value}</span><button onClick={()=>onChange(value+1)} style={bS}>+</button></div>);}

function DiceRoller({modifier,dc,onRoll,rollMode="normal",rerollOnes=false,canRerollOne=false,guaranteedSuccess=false}){
  const [rawDice,setRawDice]=useState(null),[finalResult,setFinalResult]=useState(null),[awaitReroll,setAwaitReroll]=useState(false),[rerolled,setRerolled]=useState(false);
  const compute=(c,s)=>{const isCrit=c===s&&!guaranteedSuccess,d6=rollMode!=="normal"?Math.ceil(Math.random()*6):0,d6D=rollMode==="advantage"?d6:rollMode==="disadvantage"?-d6:0,sum=c+s+d6D+modifier,dom=c>=s?"chill":"stress",success=guaranteedSuccess||isCrit||sum>=dc,key=guaranteedSuccess?"success_stress":isCrit?"critical":`${success?"success":"fail"}_${dom}`;return{chill:c,stress:s,isCrit,d6,d6Delta:d6D,rollMode,sum,dominant:dom,success,key};};
  const finalise=(c,s)=>{const r=compute(c,s);setFinalResult(r);setAwaitReroll(false);onRoll&&onRoll(r);};
  const roll=()=>{let c=Math.ceil(Math.random()*12),s=Math.ceil(Math.random()*12);if(rerollOnes){if(c===1)c=Math.ceil(Math.random()*12);if(s===1)s=Math.ceil(Math.random()*12);}setRawDice({chill:c,stress:s});if(canRerollOne&&!guaranteedSuccess)setAwaitReroll(true);else finalise(c,s);};
  const doReroll=die=>{if(!rawDice||rerolled)return;const nv=Math.ceil(Math.random()*12),nc=die==="chill"?nv:rawDice.chill,ns=die==="stress"?nv:rawDice.stress;setRawDice({chill:nc,stress:ns});setRerolled(true);finalise(nc,ns);};
  const dd=finalResult||rawDice,outcome=finalResult?OUTCOME_MAP[finalResult.key]:null;
  return(<Panel title={`Skill Check — 2d12${rollMode!=="normal"?` (${rollMode})`:""}`}>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,flexWrap:"wrap"}}>
      <div style={{background:"#E8A84C18",border:"1px solid #E8A84C40",borderRadius:6,padding:"4px 12px",fontSize:10,fontWeight:700,color:"#E8A84C"}}>DC {dc}</div>
      {modifier!==0&&<div style={{fontSize:10,color:"#5BA88A"}}>{modifier>0?"+":""}{modifier} from cards</div>}
      {rollMode==="disadvantage"&&<div style={{background:"#C0524A18",border:"1px solid #C0524A40",borderRadius:6,padding:"4px 10px",fontSize:9,fontWeight:700,color:"#C0524A"}}>⚠ Disadvantage</div>}
      {rollMode==="advantage"&&<div style={{background:"#5BA88A18",border:"1px solid #5BA88A40",borderRadius:6,padding:"4px 10px",fontSize:9,fontWeight:700,color:"#5BA88A"}}>↑ Advantage</div>}
      {guaranteedSuccess&&<div style={{background:"#5B9BB518",border:"1px solid #5B9BB540",borderRadius:6,padding:"4px 10px",fontSize:9,fontWeight:700,color:"#5B9BB5"}}>★ Guaranteed</div>}
    </div>
    <div style={{display:"flex",gap:10,alignItems:"center"}}>
      {[{label:"Chill",color:"#5B9BB5",key:"chill"},{label:"Stress",color:"#C0524A",key:"stress"}].map(({label,color,key})=>{
        const val=dd?.[key],dom=finalResult&&!finalResult.isCrit&&finalResult.dominant===key,click=awaitReroll&&!rerolled;
        return(<div key={key} onClick={()=>click&&doReroll(key)} style={{flex:1,background:"#0A0C18",border:`1px solid ${dom?color+"90":finalResult?.isCrit?"#E8A84C50":color+"30"}`,borderRadius:8,padding:"13px 10px",textAlign:"center",cursor:click?"pointer":"default",boxShadow:click?`0 0 0 2px ${color}40`:"none"}}>
          <div style={{fontSize:9,color:finalResult?.isCrit?"#E8A84C":color,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:8,fontWeight:700}}>{label}{dom?" ★":""}{finalResult?.isCrit?" ★":""}</div>
          <div style={{fontSize:42,fontWeight:700,lineHeight:1,color:val?(finalResult?.isCrit?"#E8A84C":color):"#252A45"}}>{val??"—"}</div>
          {click&&<div style={{fontSize:8,color,marginTop:4,letterSpacing:"0.1em"}}>CLICK TO REROLL</div>}
        </div>);
      })}
      {finalResult&&finalResult.d6!==0&&(<div style={{background:"#0A0C18",border:`1px solid ${finalResult.d6Delta>0?"#5BA88A60":"#C0524A60"}`,borderRadius:8,padding:"13px 10px",textAlign:"center",minWidth:60}}>
        <div style={{fontSize:9,color:finalResult.d6Delta>0?"#5BA88A":"#C0524A",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8,fontWeight:700}}>d6 {finalResult.d6Delta>0?"+":"−"}</div>
        <div style={{fontSize:36,fontWeight:700,lineHeight:1,color:finalResult.d6Delta>0?"#5BA88A":"#C0524A"}}>{finalResult.d6}</div>
      </div>)}
      <div style={{textAlign:"center",flexShrink:0,minWidth:56}}>
        <div style={{fontSize:9,color:"#5C6380",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Total</div>
        <div style={{fontSize:36,fontWeight:700,lineHeight:1,color:finalResult?(finalResult.success?"#5BA88A":"#C0524A"):"#252A45"}}>{finalResult?.sum??"—"}</div>
        {finalResult&&!finalResult.isCrit&&<div style={{fontSize:10,color:"#5C6380",marginTop:2}}>vs DC {dc}</div>}
        {finalResult?.isCrit&&<div style={{fontSize:10,color:"#E8A84C",marginTop:2,fontWeight:700}}>CRITICAL</div>}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:7,flexShrink:0,alignItems:"center"}}>
        <Btn onClick={roll} disabled={!!rawDice}>ROLL</Btn>
        {awaitReroll&&!rerolled&&<Btn small outline onClick={()=>finalise(rawDice.chill,rawDice.stress)}>Keep</Btn>}
        {finalResult&&<Btn small outline onClick={()=>{setRawDice(null);setFinalResult(null);setAwaitReroll(false);setRerolled(false);}}>Clear</Btn>}
      </div>
    </div>
    {awaitReroll&&!rerolled&&<div style={{marginTop:10,padding:"8px 12px",borderRadius:7,background:"#E8A84C10",border:"1px solid #E8A84C40",fontSize:10,color:"#E8A84C"}}>Click a die to reroll it — or Keep to proceed.</div>}
    {outcome&&(<div style={{marginTop:11,padding:"10px 13px",borderRadius:7,background:outcome.color+"12",border:`1px solid ${outcome.color}50`,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:18,color:outcome.color}}>{outcome.icon}</span><div><div style={{fontSize:12,fontWeight:700,color:outcome.color}}>{outcome.label}</div><div style={{fontSize:10,color:"#5C6380",marginTop:2}}>{outcome.note}</div></div></div>)}
  </Panel>);
}

function D20Roller({onResult}){
  const [result,setResult]=useState(null);
  const band=result?D20_BANDS.find(b=>result>=b.min&&result<=b.max):null;
  const roll=()=>{const r=Math.ceil(Math.random()*20),b=D20_BANDS.find(b=>r>=b.min&&r<=b.max);setResult(r);onResult&&onResult(b,r);};
  return(<div style={{display:"flex",gap:12,alignItems:"center"}}>
    <div style={{flex:1,background:"#0A0C18",border:`1px solid ${band?band.color+"60":"#1E2338"}`,borderRadius:8,padding:"11px 10px",textAlign:"center"}}><div style={{fontSize:9,color:"#5C6380",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:6}}>d20</div><div style={{fontSize:32,fontWeight:700,lineHeight:1,color:band?band.color:"#252A45"}}>{result??"—"}</div></div>
    {band&&<div style={{flex:1,background:band.color+"10",border:`1px solid ${band.color}40`,borderRadius:8,padding:"11px 10px",textAlign:"center"}}><div style={{fontSize:9,color:"#5C6380",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:6}}>Outcome</div><div style={{fontSize:18,fontWeight:700,color:band.color}}>{band.label}</div></div>}
    <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}><Btn onClick={roll} disabled={!!result}>ROLL</Btn>{result&&<Btn small outline onClick={()=>setResult(null)}>Clear</Btn>}</div>
  </div>);
}

function BonusActionPanel({bonusKey,onBonusResult,hermesCost=0}){
  const info=BONUS_INFO[bonusKey]||{icon:"?",label:String(bonusKey),desc:""};
  const [bonusResult,setBonusResult]=useState(null);
  const getHermesTier=r=>r===1?"fail":r<11?"delayed":r===20?"half":"immediate";
  const handleResult=(band,rawRoll)=>{const succeeded=band.label==="Good"||band.label==="Great";const isCrit=rawRoll===20;const isZero=rawRoll===1;const hermesTier=bonusKey==="hermes"?getHermesTier(rawRoll):null;setBonusResult({succeeded,label:band.label,isCrit,isZero,roll:rawRoll,hermesTier});onBonusResult&&onBonusResult({bonusKey,band,roll:rawRoll,succeeded});};
  const isHermes=bonusKey==="hermes",isFreeze=bonusKey==="freeze",isTips=bonusKey==="tips",isTidy=bonusKey==="tidy";
  const tidyLabel=bonusResult?.roll>=15?(bonusResult?.roll===20?"🌿 No comp + ✦ Care":"🌿 No comp next turn"):bonusResult?.roll>=10?"🌿 Comp reduced (~20%)":"✗ No effect";
  const hermesColor=bonusResult?.hermesTier==="fail"?C.red:bonusResult?.hermesTier==="delayed"?C.gold:C.green;
  const hermesLabel=bonusResult?.hermesTier==="fail"?"✗ Failed — no restock":bonusResult?.hermesTier==="delayed"?"⏳ Restocking next turn":bonusResult?.hermesTier==="half"?"📦 Restocked (½ cost)":"📦 Restocked";
  const resultColor=bonusResult?.isCrit&&!isHermes?C.gold:isHermes?hermesColor:isTidy?(bonusResult?.roll>=15?C.green:bonusResult?.roll>=10?C.gold:C.red):bonusResult?.succeeded?C.green:C.red;
  const resultLabel=isHermes&&bonusResult?hermesLabel:isFreeze&&bonusResult?.succeeded?"🧊 Frozen":isTidy?tidyLabel:bonusResult?.isZero?"✗ Nothing (rolled 1)":bonusResult?.isCrit?"💰 Good tip!":bonusResult?.succeeded?"✓ Ok tip":"✗ Bad tip";
  return(<Panel title="Bonus Action — Roll for Outcome">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <span style={{fontSize:16}}>{info.icon}</span>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:"#F0EBE1"}}>{info.label}</div>
          <div style={{fontSize:10,color:"#5C6380",marginTop:2}}>{info.desc}</div>
          {isHermes&&<div style={{fontSize:10,color:"#E8A84C",marginTop:3}}>1=fail · 2–10=next turn · 11–19=₡{hermesCost} · 20=½ cost</div>}
          {isTips&&<div style={{fontSize:10,color:"#5C6380",marginTop:3}}>1→nothing · fail→bad · success→ok · 20→good tip</div>}
          {isTidy&&<div style={{fontSize:10,color:"#5C6380",marginTop:3}}>20=no comp+care · 15–19=no comp · 10–14=~20% comp · else no effect</div>}
        </div>
      </div>
      {bonusResult&&<div style={{background:resultColor+"18",border:`1px solid ${resultColor}50`,borderRadius:6,padding:"4px 10px",fontSize:10,fontWeight:700,color:resultColor}}>{resultLabel}</div>}    </div>
    <D20Roller onResult={handleResult}/>
  </Panel>);
}

function Sidebar({care,hand,maxTurns,rollLocked,activeModifier,onToggleCard,onSpendCare,careSpentThisShift}){
  const tokens=Array.from({length:5},(_,i)=>i>=care.limit?"locked":i>=care.current?"spent":"available");
  const isFree=careSpentThisShift===0;
  const hasEmptySlot=care.current<care.limit;
  return(<div style={{width:255,flexShrink:0,display:"flex",flexDirection:"column",gap:11}}>
    <Panel title="Care Pool">
      <div style={{display:"flex",gap:7,marginBottom:11}}>{tokens.map((s,i)=><CareToken key={i} state={s}/>)}</div>
      <div style={{fontSize:11,color:"#5C6380",display:"flex",gap:14,marginBottom:care.current===0?7:0}}>
        <span>Slots <b style={{color:"#F0EBE1"}}>{care.current}/{care.limit}</b></span>
        {hasEmptySlot&&<span style={{color:"#E8A84C",fontSize:10}}>⊙ empty slot</span>}
      </div>
      {care.current===0&&<div style={{fontSize:10,color:"#C0524A",marginBottom:7}}>⚠ No slots — cards locked</div>}
      <div style={{fontSize:10,color:"#5C6380",marginBottom:5,display:"flex",justifyContent:"space-between"}}><span>Care Points</span><b style={{color:"#E8A84C"}}>{care.points}/20</b></div>
      <div style={{height:6,background:"#151829",borderRadius:3,marginBottom:3,position:"relative"}}>
        <div style={{width:`${care.points/20*100}%`,height:"100%",background:"#E8A84C",borderRadius:3,boxShadow:"0 0 6px #E8A84C55",transition:"width .3s"}}/>
        {[5,10,15].map(m=><div key={m} style={{position:"absolute",top:0,bottom:0,left:`${m/20*100}%`,width:"1px",background:care.points>=m?"#E8A84C60":"#252A45"}}/>)}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:"#5C6380",marginBottom:8,paddingRight:2}}>
        {[0,5,10,15,20].map(m=><span key={m} style={{color:care.points>=m&&m>0?"#E8A84C80":"#5C6380"}}>{m}</span>)}
      </div>
      <div style={{marginTop:2,display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:9,color:"#5C6380"}}>Facilitator:</span><button onClick={()=>onSpendCare("gainCare")} style={{background:"#E8A84C20",border:"1px solid #E8A84C40",color:"#E8A84C",borderRadius:5,padding:"3px 9px",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+ Gain Care</button></div>
    </Panel>
    <Panel title={`Hand — ${hand.filter(c=>c.cardState==="available"||c.cardState==="selected").length} cards`}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
        <div style={{background:"#E8A84C20",border:"1px solid #E8A84C50",borderRadius:4,padding:"2px 7px",fontSize:9,fontWeight:700,color:"#E8A84C"}}>-1 slot</div>
        <span style={{fontSize:10,color:"#5C6380"}}>per card played</span>
      </div>
      {hand.length===0
        ?<div style={{fontSize:11,color:"#5C6380",fontStyle:"italic",padding:"8px 0"}}>No cards yet — earn them through interactions and trait gains.</div>
        :<div style={{display:"flex",flexDirection:"column",gap:7}}>
          {hand.map(card=>{
            const accent=cardTypeColor(card.type),isSel=card.cardState==="selected",isAvail=card.cardState==="available",isDis=card.cardState==="discarded";
            const canToggle=!rollLocked&&!isDis&&(isAvail?care.current>0:isSel);
            return(<div key={card.id} onClick={()=>canToggle&&onToggleCard(card.id)} style={{background:isSel?accent+"10":isAvail?"#0C0F1D":"#090B16",border:`1px solid ${isSel?accent+"70":isAvail?accent+"30":"#1E2338"}`,borderTop:`2px solid ${isSel?accent:isAvail?accent:"#1E2338"}`,borderRadius:7,padding:"8px 10px",position:"relative",overflow:"hidden",cursor:canToggle?"pointer":"default",opacity:isDis?.35:1}}>
              {isSel&&<div style={{position:"absolute",top:6,right:8,background:accent,color:"#0C0E1A",fontSize:8,fontWeight:700,letterSpacing:"0.1em",padding:"2px 6px",borderRadius:3}}>✓ SELECTED</div>}
              {isDis&&<div style={{position:"absolute",inset:0,background:"rgba(8,10,20,.55)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:9,fontWeight:700,letterSpacing:"0.18em",color:"#5C6380",border:"1px solid #5C638030",padding:"2px 7px",borderRadius:3,transform:"rotate(-10deg)",display:"block"}}>DISCARDED</span></div>}
              <div style={{fontSize:8,color:(isAvail||isSel)?accent:"#5C6380",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>{card.type}</div>
              <div style={{fontSize:11,color:(isAvail||isSel)?"#F0EBE1":"#5C6380",fontWeight:600,marginBottom:3}}>{card.name}</div>
              <div style={{fontSize:9,color:"#5C6380",lineHeight:1.4}}>{card.desc}</div>
              {card.modifier>0&&(isAvail||isSel)&&<div style={{fontSize:9,color:isSel?accent:"#5BA88A",marginTop:3}}>{isSel?"contributing +":"+"}{card.modifier}</div>}
            </div>);
          })}
        </div>
      }
      {activeModifier!==0&&<div style={{marginTop:9,paddingTop:9,borderTop:"1px solid #1E2338",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:10,color:"#5C6380"}}>Total modifier</span><span style={{fontSize:14,fontWeight:700,color:"#5BA88A"}}>{activeModifier>0?"+":""}{activeModifier}</span></div>}
    </Panel>
    <Panel title="Spend Care">
      <div style={{fontSize:9,marginBottom:9,display:"flex",alignItems:"center",gap:6}}>
        {isFree?<><div style={{background:"#5BA88A25",border:"1px solid #5BA88A50",borderRadius:4,padding:"2px 7px",fontSize:9,fontWeight:700,color:"#5BA88A"}}>FREE</div><span style={{color:"#5C6380"}}>First spend this shift is free</span></>
          :<><div style={{background:"#C0524A20",border:"1px solid #C0524A45",borderRadius:4,padding:"2px 7px",fontSize:9,fontWeight:700,color:"#C0524A"}}>-5 pts</div><span style={{color:"#5C6380"}}>Costs 5 care points</span></>}
      </div>
      {[{key:"redraw",label:"Redraw 2 cards",note:"Refreshes 2 discarded cards",disabled:false},{key:"extraTurn",label:`+1 turn (now ${maxTurns})`,disabled:false},{key:"extraSlot",label:"Activate slot",note:hasEmptySlot?"Make empty slot available":"No empty slots to activate",disabled:!hasEmptySlot}].map(({key,label,note,disabled})=>(
        <div key={key} onClick={()=>!disabled&&onSpendCare(key)} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"7px 0",borderBottom:"1px solid #1E2338",opacity:disabled?.35:1,cursor:disabled?"default":"pointer"}}>
          <div style={{width:18,height:18,borderRadius:"50%",flexShrink:0,background:disabled?"transparent":isFree?"#5BA88A25":"#C0524A25",border:`1px solid ${disabled?"#1E2338":isFree?"#5BA88A55":"#C0524A55"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:disabled?"#5C6380":isFree?"#5BA88A":"#C0524A",marginTop:1}}>{isFree?"★":"5"}</div>
          <div><div style={{fontSize:10,color:disabled?"#5C6380":"#8A91B0"}}>{label}</div>{note&&<div style={{fontSize:9,color:"#5C6380",marginTop:1}}>{note}</div>}</div>
        </div>))}
    </Panel>
  </div>);
}

function PhaseStrip({current,onNavigate,canResolve}){
  const phases=[{key:"assess",label:"Assess",hint:"Review the situation"},{key:"decide",label:"Decide",hint:"Choose your actions"},{key:"resolve",label:"Resolve",hint:"Play it out"}];
  const idx=phases.findIndex(p=>p.key===current);
  return(<div style={{display:"flex",alignItems:"center",gap:0,marginBottom:14,background:"#0A0C18",borderRadius:8,padding:"8px 12px",border:"1px solid #1E2338"}}>
    {phases.map((p,i)=>{const isA=p.key===current,isPast=i<idx,canGo=i<=idx||(p.key==="resolve"&&canResolve);return(<div key={p.key} style={{display:"flex",alignItems:"center"}}><div onClick={()=>canGo&&onNavigate(p.key)} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 14px",borderRadius:6,background:isA?"#E8A84C18":"transparent",border:`1px solid ${isA?"#E8A84C60":"transparent"}`,cursor:canGo?"pointer":"default",opacity:(!canGo&&!isA)?.4:1}}><div style={{width:6,height:6,borderRadius:"50%",background:isA?"#E8A84C":isPast?"#5BA88A":"#5C6380",boxShadow:isA?"0 0 8px #E8A84C":isPast?"0 0 6px #5BA88A":"none"}}/><span style={{fontSize:11,fontWeight:isA?700:500,color:isA?"#E8A84C":isPast?"#F0EBE1":"#5C6380",letterSpacing:"0.05em"}}>{p.label}</span></div>{i<phases.length-1&&<div style={{fontSize:12,color:"#1E2338",margin:"0 2px"}}>&rarr;</div>}</div>);})}
    <div style={{flex:1}}/><div style={{fontSize:10,color:"#5C6380",fontStyle:"italic"}}>{phases.find(p=>p.key===current)?.hint}</div>
  </div>);
}

function AssessPhase({customers,npcs,relationships,complication,moodFrozen,onNext,day,turn,cashGoal,onSetCashGoal,compRate,onSetCompRate,satGain,onSetSatGain,satLoss,onSetSatLoss,satServeMod,onSetSatServeMod,satCompDrain,onSetSatCompDrain,satEndCompPenalty,onSetSatEndCompPenalty,satFloor,onSetSatFloor}){
  const isOnb=day===1&&turn<=2;
  const [settingsOpen,setSettingsOpen]=useState(false);
  return(<div style={{display:"flex",flexDirection:"column",gap:12}}>
    {isOnb&&<div style={{background:"#E8A84C12",border:"1px solid #E8A84C40",borderRadius:8,padding:"10px 14px",display:"flex",gap:10,alignItems:"center"}}><span style={{fontSize:16}}>🌙</span><div><div style={{fontSize:11,fontWeight:700,color:"#E8A84C",marginBottom:2}}>Day 1 — {turn===1?"Turn 1: Meet Hermes":"Turn 2: Meet Cooper"}</div><div style={{fontSize:10,color:"#5C6380"}}>{turn===1?"No customers yet. Interact with Hermes to learn the ropes.":"Still quiet. Spend time with Cooper."}</div></div></div>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <Panel title="Customer Queue" accent={moodFrozen?"#5B9BB550":undefined}>
        {moodFrozen&&<div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10,padding:"5px 9px",background:"#5B9BB515",borderRadius:6,border:"1px solid #5B9BB540"}}><span>🧊</span><span style={{fontSize:10,color:"#5B9BB5",fontWeight:700}}>Moods frozen this turn</span></div>}
        {customers.length===0
          ?<div style={{fontSize:11,color:"#5C6380",padding:"8px 0",fontStyle:"italic"}}>Bar is empty — no customers yet</div>
          :customers.map((c,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<customers.length-1?"1px solid #1E2338":"none"}}><div><div style={{fontSize:11,color:c.mood===1?"#C0524A":"#F0EBE1"}}>{c.label}</div>{c.mood===1&&<div style={{fontSize:9,color:"#C0524A",marginTop:1}}>Leaving if unserved</div>}</div><MoodDots level={c.mood}/></div>))}
      </Panel>
      <div style={{display:"flex",flexDirection:"column",gap:11}}>
        <Panel title="Friends at the Bar">
          {npcs.length===0?<div style={{fontSize:11,color:"#5C6380",fontStyle:"italic"}}>Nobody here yet</div>
            :<div style={{display:"flex",flexDirection:"column",gap:7}}>{npcs.map(n=>(<div key={n} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{background:"#5B9BB518",border:"1px solid #5B9BB540",borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:600,color:"#5B9BB5"}}>{n}</div><div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:9,color:"#5C6380"}}>rel.</span><span style={{fontSize:13,fontWeight:700,color:"#5B9BB5"}}>{relationships[n]||0}</span></div></div>))}</div>}
        </Panel>
        <Panel title="Complication">
          {complication
            ?<div>
              <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                <span style={{fontSize:16}}>⚠</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#C0524A"}}>{complication.name}</div>
                    {complication.type?.map(t=><div key={t} style={{background:t==="Technical"?"#5B9BB520":"#E8A84C20",border:`1px solid ${t==="Technical"?"#5B9BB550":"#E8A84C50"}`,borderRadius:4,padding:"1px 6px",fontSize:8,fontWeight:700,color:t==="Technical"?"#5B9BB5":"#E8A84C"}}>{t}</div>)}
                    {(complication.turnsActive||0)>=1&&<div style={{background:"#C0524A25",border:"1px solid #C0524A60",borderRadius:4,padding:"1px 6px",fontSize:8,fontWeight:700,color:"#C0524A"}}>DC +{(complication.turnsActive||0)*2}</div>}
                  </div>
                  <div style={{fontSize:10,color:"#5C6380"}}>{complication.desc}</div>
                </div>
              </div>
            </div>
            :<div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0"}}><div style={{width:7,height:7,borderRadius:"50%",background:"#5BA88A",boxShadow:"0 0 8px #5BA88A"}}/><span style={{fontSize:11,color:"#5C6380"}}>No active complication</span></div>}
        </Panel>
      </div>
    </div>
    <div style={{display:"flex",justifyContent:"flex-end"}}><Btn onClick={onNext}>Decide &rarr;</Btn></div>
    <div style={{border:"1px solid #252A45",borderRadius:8,overflow:"hidden"}}>
      <div onClick={()=>setSettingsOpen(o=>!o)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 14px",cursor:"pointer",background:"#0C0E1A",userSelect:"none"}}>
        <span style={{fontSize:10,color:"#5C6380",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase"}}>⚙ Scenario Settings</span>
        <span style={{fontSize:13,color:"#5C6380",display:"inline-block",transition:"transform .2s",transform:settingsOpen?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
      </div>
      {settingsOpen&&<div style={{padding:"14px",borderTop:"1px solid #252A45"}}>
        <div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"flex-end"}}>
          {[
            {label:"Cash Goal (₡)",val:cashGoal,set:v=>onSetCashGoal(Math.max(1000,v)),min:1000,max:999999,w:90,col:"#E8A84C"},
            {label:"Comp Rate (%)",val:Math.round(compRate*100),set:v=>onSetCompRate(Math.min(1,Math.max(0,v/100))),min:0,max:100,w:60,col:"#C0524A"},
            {label:"Sat gain/turn",val:satGain,set:onSetSatGain,min:0,max:10,w:55,col:"#5BA88A"},
            {label:"Loss/leaving cust.",val:satLoss,set:onSetSatLoss,min:0,max:20,w:55,col:"#C0524A"},
            {label:"±sat/serve result",val:satServeMod,set:onSetSatServeMod,min:0,max:5,w:55,col:"#E8A84C"},
            {label:"Drain/ignored comp",val:satCompDrain,set:onSetSatCompDrain,min:0,max:20,w:55,col:"#C0524A"},
            {label:"Shift-end comp penalty",val:satEndCompPenalty,set:onSetSatEndCompPenalty,min:0,max:30,w:55,col:"#C0524A"},
            {label:"Arrival floor (%)",val:satFloor,set:onSetSatFloor,min:1,max:100,w:55,col:"#5B9BB5"},
          ].map(({label,val,set,min,max,w,col})=>(
            <div key={label}>
              <div style={{fontSize:9,color:"#5C6380",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>{label}</div>
              <input type="number" value={val} min={min} max={max} onChange={e=>set(Number(e.target.value))} style={{width:w,background:"#0C0E1A",border:`1px solid ${col}40`,color:col,borderRadius:6,padding:"5px 8px",fontSize:12,fontWeight:700,fontFamily:"inherit",outline:"none"}}/>
            </div>
          ))}
        </div>
        <div style={{fontSize:9,color:"#5C6380",fontStyle:"italic",marginTop:10,lineHeight:1.5}}>Changes take effect next turn · Defaults: ₡10k · 66% comp · sat +3/turn −2/leaving ±1/serve · −5/ignored · −5/shift-end · √ gate floor 10%</div>
      </div>}
    </div>
  </div>);
}

function DecidePhase({selAction,selAction2,selBonus,onSelAction,onSelAction2,onSelBonus,complication,customers,turn,maxTurns,onNext,onBack,extraActions,noBonusAction,isOnboarding}){
  const noCust=customers.length===0,noComp=!complication;
  const ACTIONS=[{key:"npc",icon:"🗣",label:"Interact with Friend",desc:"Spend time with a friend — gain traits or relationship points"},{key:"serve",icon:"🍹",label:"Serve Bar",desc:"Serve the customer queue",disabled:noCust||isOnboarding},{key:"comp",icon:"⚠",label:"Deal with Complication",desc:"Resolve the active complication",disabled:noComp||isOnboarding}];
  const BONUS=[{key:"tips",icon:"💰",label:"Probe for Tips",desc:"Increase tip potential"},{key:"hermes",icon:"📦",label:"Send Hermes",desc:"Restock ingredients"},{key:"tidy",icon:"🧹",label:"Tidy Up",desc:"Lower odds of new complication"},{key:"freeze",icon:"🧊",label:"Freeze the Room",desc:"Freeze customer moods on Good+"}];
  const Tile=({item,sel,onSel,sc})=>(<div onClick={()=>!item.disabled&&onSel(item.key)} style={{background:sel?sc+"14":"#0A0C18",border:`1px solid ${sel?sc+"70":item.disabled?"#1E2338":"#252A45"}`,borderRadius:8,padding:"10px 12px",cursor:item.disabled?"default":"pointer",opacity:item.disabled?.35:1,marginBottom:7}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div style={{display:"flex",gap:7,alignItems:"center"}}><span style={{fontSize:14}}>{item.icon}</span><span style={{fontSize:11,fontWeight:700,color:sel?sc:item.disabled?"#5C6380":"#F0EBE1"}}>{item.label}</span></div>{sel&&<span style={{background:sc,color:"#0C0E1A",fontSize:8,fontWeight:700,letterSpacing:"0.1em",padding:"2px 6px",borderRadius:3}}>✓</span>}{item.disabled&&<span style={{fontSize:8,color:"#5C6380"}}>{item.key==="serve"?"no customers":"n/a"}</span>}</div>
    <div style={{fontSize:10,color:"#5C6380",lineHeight:1.45}}>{item.desc}</div>
  </div>);
  const canResolve=!!(selAction&&(noBonusAction||selBonus)&&(extraActions===0||selAction2));
  return(<div style={{display:"flex",flexDirection:"column",gap:12}}>
    {extraActions>0&&<div style={{background:"#A87CC018",border:"1px solid #A87CC050",borderRadius:8,padding:"9px 13px",fontSize:10,color:"#A87CC0",fontWeight:700}}>★ Extra action active{noBonusAction?" — no bonus action":""}</div>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <div style={{display:"flex",flexDirection:"column",gap:11}}>
        <Panel title="Action 1 — choose one">{ACTIONS.map(a=><Tile key={a.key} item={a} sel={selAction===a.key} onSel={onSelAction} sc="#E8A84C"/>)}</Panel>
        {extraActions>0&&<Panel title="Action 2 — choose one" accent="#A87CC050">{ACTIONS.map(a=><Tile key={a.key} item={a} sel={selAction2===a.key} onSel={onSelAction2} sc="#A87CC0"/>)}</Panel>}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:11}}>
        {!noBonusAction&&<Panel title="Bonus Action — choose one">{BONUS.map(a=><Tile key={a.key} item={a} sel={selBonus===a.key} onSel={onSelBonus} sc="#5B9BB5"/>)}</Panel>}
        {noBonusAction&&<Panel><div style={{fontSize:10,color:"#5C6380",fontStyle:"italic",padding:"8px 0"}}>No bonus action this turn (A little extra active)</div></Panel>}
        {turn===maxTurns&&<div style={{background:"#5B9BB512",border:"1px solid #5B9BB540",borderRadius:8,padding:"10px 12px",display:"flex",gap:10,alignItems:"center"}}><span style={{fontSize:16}}>🌙</span><div><div style={{fontSize:10,color:"#5B9BB5",fontWeight:700,marginBottom:2}}>LAST TURN</div><div style={{fontSize:10,color:"#5C6380"}}>Story beat after this turn</div></div></div>}
      </div>
    </div>
    <div style={{display:"flex",justifyContent:"space-between"}}><Btn outline onClick={onBack}>&larr; Assess</Btn><Btn onClick={onNext} disabled={!canResolve} color="#E8A84C">Resolve &rarr;</Btn></div>
  </div>);
}

function ResolveServe({customers,modifier,onComplete,onBack,onDiceResult,onRoll,stock={},rollMode="normal",pendingEffects={}}){
  const queue=customers.slice(0,5);
  const [orders]=useState(()=>queue.map(()=>randFrom(DRINKS)));
  const [idx,setIdx]=useState(0),[served,setServed]=useState([]),[ings,setIngs]=useState([]),[roll,setRoll]=useState(null),[summary,setSummary]=useState(null);
  if(!queue.length)return(<div style={{display:"flex",flexDirection:"column",gap:12}}><Panel><div style={{fontSize:12,color:"#5C6380",padding:"16px 0",textAlign:"center"}}>No customers to serve.</div></Panel><Btn outline onClick={onBack}>&larr; Decide</Btn></div>);
  const cur=queue[idx],ord=orders[idx];
  const moodDC=m=>m===3?8:m===2?10:12;
  const serveDC=cur?moodDC(cur.mood):10;
  const matchedDrink=ings.length>0?DRINKS.find(d=>d.ings.length===ings.length&&d.ings.every(i=>ings.includes(i))):null;
  const isCorrect=matchedDrink?.name===ord?.name;
  const hasIngDisadvantage=ings.length>0&&!matchedDrink;
  const ingMod=ings.length===0?0:isCorrect?1:-1;
  const effectiveRollMode=hasIngDisadvantage?(rollMode==="advantage"?"normal":"disadvantage"):rollMode;
  const oosCount=ings.filter(i=>(stock[i]??5)===0).length;
  const avgRollSoFar=roll?([...served.map(s=>s.roll?.sum||0),roll.sum].reduce((a,b)=>a+b,0)/(served.length+1)):0;
  const nextCust=queue[idx+1];
  const nextDC=nextCust?moodDC(nextCust.mood):99;
  const guaranteedNext=idx<1;
  const canNext=!!roll&&idx+1<queue.length&&(guaranteedNext||avgRollSoFar>=nextDC);
  const canWrap=!!roll&&!canNext;
  const toggle=ing=>{if(roll||(stock[ing]??5)===0)return;setIngs(i=>i.includes(ing)?i.filter(x=>x!==ing):i.length<6?[...i,ing]:i);};
  const handleRoll=r=>{setRoll(r);onDiceResult&&onDiceResult(r,"serve");onRoll&&onRoll();};
  const commit=()=>{const tip=roll?.isCrit?ord.tipGood*2:roll?.success?ord.tipGood:ord.tipBad;return{customer:cur,order:ord,ings:[...ings],roll,tip,matchedDrink:matchedDrink?.name,isCorrect};};
  const doNext=()=>{setServed(s=>[...s,commit()]);setIdx(i=>i+1);setIngs([]);setRoll(null);};
  const doWrap=()=>{const r=commit(),all=[...served,r];setSummary({served:all,tips:all.reduce((s,x)=>s+x.tip,0),rollResults:all.map(s=>s.roll).filter(Boolean),usedIngredients:all.flatMap(s=>s.ings)});};
  if(summary)return(<div style={{display:"flex",flexDirection:"column",gap:12}}>
    <Panel title="Serving Complete" titleColor="#5BA88A" accent="#5BA88A40">
      {summary.served.map((s,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<summary.served.length-1?"1px solid #1E2338":"none"}}><div><div style={{fontSize:11,color:"#F0EBE1"}}>{s.customer.label}</div><div style={{fontSize:9,color:s.isCorrect?"#5BA88A":s.matchedDrink?"#E8A84C":"#C0524A"}}>{s.order.name} · {s.isCorrect?"✓ correct":s.matchedDrink?`Matches: ${s.matchedDrink}`:"no match"}</div></div><div style={{fontSize:13,fontWeight:700,color:s.roll?.success?"#5BA88A":"#C0524A"}}>₡{s.tip}</div></div>))}
      <div style={{marginTop:11,paddingTop:9,borderTop:"1px solid #1E2338",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:11,color:"#5C6380"}}>Total tips</span><span style={{fontSize:16,fontWeight:700,color:"#E8A84C"}}>₡{summary.tips}</span></div>
    </Panel>
    <div style={{display:"flex",justifyContent:"space-between"}}><Btn outline onClick={onBack}>&larr; Decide</Btn><Btn color="#5BA88A" onClick={()=>onComplete({tips:summary.tips,servedCount:summary.served.length,rollResults:summary.rollResults,usedIngredients:summary.usedIngredients})}>Complete Turn &rarr;</Btn></div>
  </div>);
  return(<div style={{display:"flex",flexDirection:"column",gap:12}}>
    <Panel title={`Queue — ${served.length}/${queue.length} served`}><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{queue.map((c,i)=>{const done=i<served.length,act=i===idx;return(<div key={i} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 9px",borderRadius:6,background:act?"#E8A84C15":done?"#5BA88A10":"transparent",border:`1px solid ${act?"#E8A84C40":done?"#5BA88A30":"#1E2338"}`}}><span style={{fontSize:12}}>{done?"✓":act?"→":"○"}</span><span style={{fontSize:10,color:done?"#5BA88A":act?"#E8A84C":"#5C6380"}}>{c.label.split("—")[0].trim()}</span>{done&&<span style={{fontSize:9,color:"#5BA88A"}}>₡{served[i]?.tip}</span>}</div>);})}</div></Panel>
    <Panel title={`Serving — ${cur.label}`} titleColor="#E8A84C" accent="#E8A84C45">
      <div style={{background:"#0A0C18",border:"1px solid #1E2338",borderRadius:7,padding:"10px 13px",marginBottom:11}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}><div style={{fontSize:13,fontWeight:700,color:"#F0EBE1"}}>{ord.name}</div><div style={{display:"flex",gap:10}}><div style={{fontSize:10,color:"#5BA88A"}}>✓ ₡{ord.tipGood}</div><div style={{fontSize:10,color:"#E8A84C"}}>~ ₡{ord.tipOk}</div><div style={{fontSize:10,color:"#C0524A"}}>✗ ₡{ord.tipBad}</div></div></div>
        <div style={{fontSize:9,color:"#5C6380"}}>Required: <span style={{color:"#8A91B0"}}>{ord.ings.join(", ")}</span></div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <span style={{fontSize:10,color:"#5C6380"}}>Ingredients ({ings.length}/6)</span>
        {ings.length>0&&<span style={{fontSize:10,fontWeight:600,color:isCorrect?"#5BA88A":matchedDrink?"#E8A84C":"#C0524A"}}>
          {isCorrect?`✓ ${matchedDrink.name}`:matchedDrink?`Matches: ${matchedDrink.name}`:"No match — disadv."}
        </span>}
      </div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
        {Array.from({length:6}).map((_,i)=><div key={i} style={{height:24,minWidth:52,flex:1,border:`1px dashed ${ings[i]?"#E8A84C70":"#1E2338"}`,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:ings[i]?"#E8A84C":"#3A3F5C",background:ings[i]?"#E8A84C0A":"transparent",padding:"0 5px",overflow:"hidden",whiteSpace:"nowrap"}}>{ings[i]||"—"}</div>)}
      </div>
      {ings.length>0&&<div style={{fontSize:9,marginBottom:7,color:ingMod>0?"#5BA88A":"#C0524A"}}>{ingMod>0?"+1 modifier (correct drink)":hasIngDisadvantage?"-1 modifier + roll with disadvantage":"-1 modifier (different drink)"}</div>}
      {oosCount>0&&<div style={{fontSize:9,color:"#C0524A",marginBottom:7}}>⚠ {oosCount} selected ingredient(s) out of stock</div>}
      <div style={{fontSize:9,color:"#5C6380",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>Pick ingredients (up to 6)</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
        {ALL_INGREDIENTS.map(ing=>{const picked=ings.includes(ing),s=stock[ing]??5,oos=s===0,atCap=!picked&&ings.length>=6;return(<div key={ing} onClick={()=>toggle(ing)} style={{background:picked?"#E8A84C18":oos?"#0A0C16":"#0A0C18",border:`1px solid ${picked?"#E8A84C80":oos?"#1E233440":"#1E2338"}`,borderRadius:20,padding:"4px 11px",fontSize:10,fontWeight:picked?600:400,color:picked?"#E8A84C":oos?"#3A3F5C":"#8A91B0",cursor:(roll||oos||atCap)?"default":"pointer",opacity:(oos||atCap)&&!picked?.35:roll&&!picked?.6:1,textDecoration:oos?"line-through":"none"}}>{ing}{s>0&&s<5?` (${s})`:oos?" ✗":""}</div>);})}
      </div>
    </Panel>
    <DiceRoller key={idx} modifier={modifier+ingMod} dc={serveDC} onRoll={handleRoll} rollMode={effectiveRollMode} rerollOnes={pendingEffects.rerollOnes||false} canRerollOne={pendingEffects.canRerollOneDie||false} guaranteedSuccess={pendingEffects.guaranteedSuccess||false}/>
    {roll&&canNext&&<div style={{fontSize:9,color:"#5BA88A",marginTop:-4,padding:"4px 8px"}}>Avg roll {Math.round(avgRollSoFar)} ≥ DC {nextDC} — next customer available</div>}
    {roll&&!canNext&&idx+1<queue.length&&<div style={{fontSize:9,color:"#5C6380",marginTop:-4,padding:"4px 8px"}}>Avg roll {Math.round(avgRollSoFar)} &lt; DC {nextDC} — can't serve next customer</div>}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><Btn outline onClick={onBack}>&larr; Decide</Btn>{roll&&<div style={{display:"flex",gap:8}}>{canWrap&&<Btn onClick={doWrap} color="#5BA88A">Wrap Up &rarr;</Btn>}{canNext&&<Btn onClick={doNext} color="#5B9BB5">Next Customer &rarr;</Btn>}{!canWrap&&!canNext&&<Btn onClick={doWrap} color="#5BA88A">Done &rarr;</Btn>}</div>}</div>
  </div>);
}

function ResolveNPC({npcs,relationships,modifier,traits,onTraitGain,onRelGain,onDiceResult,onRoll,onComplete,onBack,rollMode="normal",shiftEffects={},pendingEffects={},interactionHistory={},onMarkInteractionDone}){
  // Snapshot history at mount so mid-turn marks don't reset the current interaction
  const [snapshotHistory]=useState(()=>interactionHistory);
  const [selNPC,setSelNPC]=useState(npcs[0]);
  const [interaction,setInteraction]=useState(null);
  const [chainPart,setChainPart]=useState(1);
  const [chainTotal,setChainTotal]=useState(1);
  const [selTrait,setSelTrait]=useState(null);
  const [confirmed,setConfirmed]=useState(false);
  const [rolled,setRolled]=useState(false);
  const [rollResult,setRollResult]=useState(null);
  const [passiveMod,setPassiveMod]=useState(0);

  // Load interaction when NPC selection changes
  useEffect(()=>{
    const int=getNextInteraction(selNPC,snapshotHistory,relationships);
    setInteraction(int);
    const nextInt=int?.next?INTERACTIONS.find(i=>i.id===int.next):null;
    setChainTotal(nextInt?2:1);
    setChainPart(1);
    setSelTrait(null);setConfirmed(false);setRolled(false);setRollResult(null);setPassiveMod(0);
  },[selNPC]);

  const locked=confirmed||rolled;
  const effDC=interaction?.type==="skill_check"
    ?(interaction.dcIfRel&&(relationships[selNPC]||0)>=interaction.dcIfRel.threshold?interaction.dcIfRel.dc:interaction.dc||DC.INTERACTION)
    :DC.INTERACTION;
  const totalMod=modifier+passiveMod;
  const tAdv=selTrait&&shiftEffects.traitAdvantages?.[selTrait],padv=pendingEffects.advantageNextRoll;
  const lrm=(tAdv||padv)&&rollMode==="disadvantage"?"normal":(tAdv||padv)?"advantage":rollMode;
  const isLastInChain=!interaction?.next||chainPart>=chainTotal;

  const relBonus=interaction?.effect?.relIfTrait
    ?(Array.isArray(interaction.effect.relIfTrait)?interaction.effect.relIfTrait.includes(selTrait):interaction.effect.relIfTrait===selTrait)
    :false;

  const successOdds=()=>{
    const target=effDC-totalMod;let h=0;
    for(let c=1;c<=12;c++)for(let s=1;s<=12;s++)if(c+s>=target)h++;
    return Math.round(h/144*100);
  };

  const handleConfirm=()=>{
    if(!selTrait||confirmed)return;
    onTraitGain(selTrait,1);
    if(relBonus)onRelGain(selNPC);
    onMarkInteractionDone(interaction.id,selNPC);
    setConfirmed(true);
  };

  const handleContinue=()=>{
    const next=INTERACTIONS.find(i=>i.id===interaction?.next);
    if(!next)return;
    setInteraction(next);setChainPart(p=>p+1);
    setSelTrait(null);setConfirmed(false);setRolled(false);setRollResult(null);setPassiveMod(0);
  };

  const handleRoll=r=>{
    setRolled(true);setRollResult(r);
    onDiceResult&&onDiceResult(r,selNPC);
    onRoll&&onRoll();
    onMarkInteractionDone(interaction.id,selNPC);
  };

  const canComplete=!interaction||(interaction.type==="trait_gain"&&confirmed&&isLastInChain)||(interaction.type==="skill_check"&&rolled&&isLastInChain);

  return(<div style={{display:"flex",flexDirection:"column",gap:12}}>
    <Panel title="Interact with Friend" titleColor="#5B9BB5" accent="#5B9BB545">
      {/* NPC selector */}
      <div style={{marginBottom:13}}>
        <div style={{fontSize:9,color:"#5C6380",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:7}}>With</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {npcs.map(n=>(<div key={n} onClick={()=>!locked&&setSelNPC(n)} style={{display:"flex",alignItems:"center",gap:7,background:selNPC===n?"#5B9BB520":"#0A0C18",border:`1px solid ${selNPC===n?"#5B9BB570":"#1E2338"}`,borderRadius:20,padding:"5px 14px",cursor:locked?"default":"pointer",opacity:locked&&selNPC!==n?.4:1}}>
            <span style={{fontSize:11,fontWeight:selNPC===n?700:400,color:selNPC===n?"#5B9BB5":"#8A91B0"}}>{n}</span>
            <span style={{fontSize:10,color:"#5B9BB5"}}>♥{relationships[n]||0}</span>
          </div>))}
        </div>
      </div>

      {/* Chain progress indicator */}
      {chainTotal>1&&(
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          {Array.from({length:chainTotal}).map((_,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:i<chainPart-1?"#5BA88A":i===chainPart-1?"#E8A84C":"transparent",border:`1.5px solid ${i<chainPart-1?"#5BA88A":i===chainPart-1?"#E8A84C":"#1E2338"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:i<chainPart-1?"#0C0E1A":i===chainPart-1?"#E8A84C":"#5C6380"}}>
                {i<chainPart-1?"✓":i+1}
              </div>
              {i<chainTotal-1&&<div style={{width:24,height:1,background:i<chainPart-1?"#5BA88A":"#1E2338"}}/>}
            </div>
          ))}
          <span style={{fontSize:10,color:"#5C6380",marginLeft:4}}>Part {chainPart} of {chainTotal} — {interaction?.type==="trait_gain"?"Trait Gain":"Skill Check"}</span>
        </div>
      )}

      {/* No interaction available */}
      {!interaction&&<div style={{fontSize:11,color:"#5C6380",fontStyle:"italic",padding:"8px 0"}}>Nothing more to discuss with {selNPC} right now.</div>}

      {interaction&&(<>
        {/* Interaction description */}
        <div style={{background:"#0A0C18",border:"1px solid #1E2338",borderRadius:8,padding:"12px 14px",marginBottom:13,fontSize:11,color:"#F0EBE1",lineHeight:1.7,fontStyle:"italic"}}>{interaction.desc}</div>

        {/* Type badge */}
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
          <div style={{background:interaction.type==="trait_gain"?"#5B9BB520":"#E8A84C18",border:`1px solid ${interaction.type==="trait_gain"?"#5B9BB550":"#E8A84C50"}`,borderRadius:5,padding:"2px 9px",fontSize:9,fontWeight:700,color:interaction.type==="trait_gain"?"#5B9BB5":"#E8A84C"}}>
            {interaction.type==="trait_gain"?"Trait Gain":"Skill Check"}
          </div>
          {interaction.type==="skill_check"&&selTrait&&<div style={{fontSize:9,color:"#5C6380"}}>~{successOdds()}% success at current modifier</div>}
          {interaction.type==="skill_check"&&interaction.dcIfRel&&(relationships[selNPC]||0)>=interaction.dcIfRel.threshold&&<div style={{fontSize:9,color:"#5BA88A"}}>Relationship bonus active</div>}
        </div>

        {/* Response options */}
        <div style={{fontSize:9,color:"#5C6380",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>{interaction.type==="trait_gain"?"Your response:":"Your approach:"}</div>
        <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:12}}>
          {interaction.options.map(opt=>{
            const color=TRAIT_CFG.find(t=>t.key===opt.trait)?.color||"#5C6380";
            const isSel=selTrait===opt.trait;
            return(<div key={opt.trait} onClick={()=>!locked&&setSelTrait(opt.trait)} style={{background:isSel?color+"14":"#0A0C18",border:`1px solid ${isSel?color+"70":"#1E2338"}`,borderRadius:8,padding:"10px 13px",cursor:locked?"default":"pointer",opacity:locked&&!isSel?.4:1,transition:"all .15s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
                <span style={{fontSize:11,color:isSel?color:"#F0EBE1",fontStyle:"italic",flex:1}}>"{opt.text}"</span>
                <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
                  <span style={{background:color+"20",border:`1px solid ${color}40`,color,fontSize:9,fontWeight:700,padding:"1px 7px",borderRadius:3,textTransform:"capitalize"}}>{opt.trait}</span>
                  <span style={{fontSize:12,fontWeight:700,color:isSel?color:"#5C6380"}}>{traits[opt.trait]||0}</span>
                  {shiftEffects.traitAdvantages?.[opt.trait]&&<span style={{fontSize:8,color:"#5BA88A"}}>★</span>}
                </div>
              </div>
            </div>);
          })}
        </div>

        {/* Trait gain: confirm + outcome */}
        {interaction.type==="trait_gain"&&!confirmed&&(
          <Btn onClick={handleConfirm} disabled={!selTrait} color="#5B9BB5">Confirm &rarr;</Btn>
        )}
        {interaction.type==="trait_gain"&&confirmed&&(
          <div style={{background:"#5B9BB512",border:"1px solid #5B9BB540",borderRadius:8,padding:"11px 14px"}}>
            <div style={{fontSize:9,color:"#5B9BB5",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6}}>
              +1 {selTrait}{relBonus?" · ♥ +1 relationship with "+selNPC:""} · card earned if available
            </div>
            <div style={{fontSize:11,color:"#F0EBE1",lineHeight:1.65}}>{interaction.outcome}</div>
          </div>
        )}

        {/* Skill check: modifier display */}
        {interaction.type==="skill_check"&&!rolled&&(
          <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",marginTop:4}}>
            <Stepper value={passiveMod} onChange={setPassiveMod} label="Passive mod:"/>
            {modifier!==0&&<div style={{fontSize:10,color:"#5BA88A"}}>{modifier>0?"+":""}{modifier} from cards</div>}
            {(modifier!==0||passiveMod!==0)&&<div style={{fontSize:11,fontWeight:700,color:"#F0EBE1"}}>Total: {totalMod>0?"+":""}{totalMod}</div>}
          </div>
        )}

        {/* Skill check: outcome narrative */}
        {interaction.type==="skill_check"&&rollResult&&(
          <div style={{background:rollResult.success?"#5BA88A12":"#C0524A12",border:`1px solid ${rollResult.success?"#5BA88A50":"#C0524A50"}`,borderRadius:8,padding:"11px 14px"}}>
            <div style={{fontSize:9,color:rollResult.success?"#5BA88A":"#C0524A",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6}}>{rollResult.success?"✓ What happens":"✗ What happens"}</div>
            <div style={{fontSize:11,color:"#F0EBE1",lineHeight:1.65}}>{rollResult.success?interaction.onSuccess:interaction.onFailure}</div>
            {rollResult.success&&interaction.successEffect?.rel>0&&<div style={{fontSize:9,color:"#5B9BB5",marginTop:6,fontWeight:700}}>♥ +1 relationship with {selNPC}</div>}
          </div>
        )}
      </>)}
    </Panel>

    {/* Dice roller for skill checks */}
    {interaction?.type==="skill_check"&&(
      <DiceRoller modifier={totalMod} dc={effDC} onRoll={handleRoll} rollMode={lrm}
        rerollOnes={pendingEffects.rerollOnes||false}
        canRerollOne={pendingEffects.canRerollOneDie||false}
        guaranteedSuccess={pendingEffects.guaranteedSuccess||false}/>
    )}

    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <Btn outline onClick={onBack}>&larr; Decide</Btn>
      <div style={{display:"flex",gap:8}}>
        {interaction?.type==="trait_gain"&&confirmed&&!isLastInChain&&(
          <Btn onClick={handleContinue} color="#5B9BB5">The conversation continues &rarr;</Btn>
        )}
        {canComplete&&(
          <Btn onClick={()=>onComplete({npcInteracted:selNPC})} color="#5BA88A">Complete Turn &rarr;</Btn>
        )}
      </div>
    </div>
  </div>);
}


function ResolveComplication({complication,modifier,traits,onComplete,onBack,onDiceResult,onRoll,shiftEffects={},pendingEffects={}}){
  const [selTrait,setSelTrait]=useState(null),[passiveMod,setPassiveMod]=useState(0),[rolled,setRolled]=useState(false),[rollResult,setRollResult]=useState(null);
  const APPROACHES=[{trait:"charismatic",label:"Charisma and charm",desc:"Solves issues by persuading counterparty or rallying people to help."},{trait:"direct",label:"Straight shooter",desc:"Solves issues with pragmatism, negotiating or trying the obvious."},{trait:"empathetic",label:"Empathy and Intuition",desc:"Solves issues by reading the situation and finding an opening."}];
  const dcEscalation=(complication?.turnsActive||0)*2;
  const baseDC=(complication?.dc||DC.COMPLICATION)+dcEscalation;
  const effDC=selTrait&&complication?.vulnerability===selTrait?(complication.dcOnVuln+dcEscalation):baseDC;
  const tAdv=selTrait&&shiftEffects.traitAdvantages?.[selTrait],padv=pendingEffects.advantageNextRoll;
  const lrm=(tAdv||padv)?"advantage":"normal";
  const totalMod=modifier+passiveMod;
  const handleRoll=r=>{setRolled(true);setRollResult(r);onDiceResult&&onDiceResult(r,"comp");onRoll&&onRoll();};
  return(<div style={{display:"flex",flexDirection:"column",gap:12}}>
    <Panel title="Dealing with Complication" titleColor="#C0524A" accent="#C0524A45">
      <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:14}}>
        <span style={{fontSize:18}}>⚠</span>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
            <div style={{fontSize:13,fontWeight:700,color:"#F0EBE1"}}>{complication?.name}</div>
            {complication?.type?.map(t=><div key={t} style={{background:t==="Technical"?"#5B9BB520":"#E8A84C20",border:`1px solid ${t==="Technical"?"#5B9BB550":"#E8A84C50"}`,borderRadius:4,padding:"1px 6px",fontSize:8,fontWeight:700,color:t==="Technical"?"#5B9BB5":"#E8A84C"}}>{t}</div>)}
            {(complication?.turnsActive||0)>=1&&<div style={{background:"#C0524A25",border:"1px solid #C0524A60",borderRadius:4,padding:"1px 6px",fontSize:8,fontWeight:700,color:"#C0524A"}}>DC +{(complication.turnsActive||0)*2}</div>}
          </div>
          <div style={{fontSize:11,color:"#5C6380",lineHeight:1.55}}>{complication?.desc}</div>
        </div>
      </div>
      <div style={{fontSize:9,color:"#5C6380",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Choose your approach</div>
      <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
        {APPROACHES.map(a=>{
          const isSel=selTrait===a.trait,color=TRAIT_CFG.find(t=>t.key===a.trait)?.color||"#5C6380";
          const tileDC=(complication?.vulnerability===a.trait?complication.dcOnVuln:(complication?.dc||DC.COMPLICATION))+dcEscalation;
          const target=tileDC-totalMod;let hits=0;for(let c=1;c<=12;c++)for(let s=1;s<=12;s++)if(c+s>=target)hits++;
          const odds=Math.round(hits/144*100);
          return(<div key={a.trait} onClick={()=>!rolled&&setSelTrait(a.trait)} style={{background:isSel?color+"14":"#0A0C18",border:`1px solid ${isSel?color+"70":"#1E2338"}`,borderRadius:8,padding:"10px 13px",cursor:rolled?"default":"pointer",opacity:rolled&&!isSel?.5:1}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontSize:11,fontWeight:700,color:isSel?color:"#F0EBE1"}}>{a.label}</span>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:9,color:odds>=60?"#5BA88A":odds>=40?"#E8A84C":"#C0524A",fontWeight:700}}>~{odds}% success</span>
                <span style={{background:color+"20",border:`1px solid ${color}40`,color,fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:3}}>{traits?.[a.trait]||0}</span>
                <span style={{fontSize:9,color,fontWeight:700,textTransform:"capitalize"}}>{a.trait}</span>
                {shiftEffects.traitAdvantages?.[a.trait]&&<span style={{fontSize:8,color:"#5BA88A"}}>★</span>}
              </div>
            </div>
            <div style={{fontSize:10,color:"#5C6380",lineHeight:1.45}}>{a.desc}</div>
          </div>);
        })}
      </div>
      {dcEscalation>0&&<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}><div style={{background:"#C0524A20",border:"1px solid #C0524A50",borderRadius:5,padding:"2px 9px",fontSize:9,fontWeight:700,color:"#C0524A"}}>⚠ DC +{dcEscalation} ({complication.turnsActive} turn{complication.turnsActive>1?"s":""} unresolved)</div></div>}
      {!selTrait&&!rolled&&<div style={{fontSize:10,color:"#5C6380",marginBottom:8,fontStyle:"italic"}}>Pick an approach to use its odds — or roll without one at base DC {baseDC}.</div>}
      <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}><Stepper value={passiveMod} onChange={setPassiveMod} label="Passive mod:"/>{modifier!==0&&<div style={{fontSize:10,color:"#5BA88A"}}>{modifier>0?"+":""}{modifier} from cards</div>}{(modifier!==0||passiveMod!==0)&&<div style={{fontSize:11,fontWeight:700,color:"#F0EBE1"}}>Total: {totalMod>0?"+":""}{totalMod}</div>}</div>
    </Panel>
    <DiceRoller modifier={totalMod} dc={effDC} onRoll={handleRoll} rollMode={lrm} rerollOnes={pendingEffects.rerollOnes||false} canRerollOne={pendingEffects.canRerollOneDie||false} guaranteedSuccess={pendingEffects.guaranteedSuccess||false}/>
    {rollResult&&(rollResult.success?complication?.onSuccess:complication?.onFail)&&(
      <Panel accent={rollResult.success?"#5BA88A50":"#C0524A50"}>
        <div style={{fontSize:9,color:rollResult.success?"#5BA88A":"#C0524A",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>{rollResult.success?"✓ What happens":"✗ What happens"}</div>
        <div style={{fontSize:12,color:"#F0EBE1",lineHeight:1.7,fontStyle:"italic"}}>{rollResult.success?complication.onSuccess:complication.onFail}</div>
      </Panel>
    )}
    {!selTrait&&!rolled&&<div style={{fontSize:10,color:"#E8A84C",padding:"6px 0"}}>Pick an approach above for a DC bonus — or roll at base DC {baseDC}.</div>}
    <div style={{display:"flex",justifyContent:"space-between"}}><Btn outline onClick={onBack}>&larr; Decide</Btn><Btn onClick={()=>onComplete(rollResult?.success)} disabled={!rolled} color="#5BA88A">Resolve &amp; Complete Turn &rarr;</Btn></div>
  </div>);
}

function ShiftEnd({day,cashThisShift,satisfaction,isLastDay,cash,goal,onContinue}){
  const hit=cash>=goal;
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:380,gap:16,textAlign:"center",padding:"40px 20px"}}>
    <div style={{fontSize:32}}>{isLastDay?(hit?"🎉":"💔"):"🌙"}</div>
    <div style={{fontSize:22,fontWeight:700,color:isLastDay?(hit?"#5BA88A":"#C0524A"):"#E8A84C"}}>{isLastDay?(hit?"The Arcadian Survives":"The Landlord Wins"):`End of Day ${day}`}</div>
    {isLastDay&&<div style={{fontSize:13,color:"#5C6380",maxWidth:380,lineHeight:1.7}}>{hit?`You hit ₡${goal.toLocaleString()} by Day ${day}. The bar lives.`:`You fell short of ₡${goal.toLocaleString()}. The landlord closes the bar.`}</div>}
    {!isLastDay&&<div style={{fontSize:12,color:"#5C6380"}}>The last customer tabs out. Take a breath.</div>}
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
      <div style={{fontSize:10,color:"#5C6380",letterSpacing:"0.14em",textTransform:"uppercase"}}>Campaign Total</div>
      <div style={{fontSize:44,fontWeight:800,color:"#E8A84C",lineHeight:1}}>₡{cash.toLocaleString()}</div>
      <div style={{fontSize:13,color:"#5BA88A",fontWeight:600}}>+₡{cashThisShift.toLocaleString()} earned this shift</div>
      <div style={{width:200,height:5,background:"#151829",borderRadius:3,marginTop:6}}>
        <div style={{width:`${Math.min(cash/goal,1)*100}%`,height:"100%",background:cash>=goal?"#5BA88A":"#E8A84C",borderRadius:3,transition:"width .4s"}}/>
      </div>
      <div style={{fontSize:11,color:"#5C6380",marginTop:2}}>₡{cash.toLocaleString()} / ₡{goal.toLocaleString()} goal</div>
    </div>
    <div style={{fontSize:11,color:"#5BA88A",fontWeight:600}}>Satisfaction {satisfaction}%</div>
    {!isLastDay&&<div style={{background:"#5B9BB512",border:"1px solid #5B9BB540",borderRadius:8,padding:"11px 20px",maxWidth:360,fontSize:11,color:"#5C6380",fontStyle:"italic"}}>In game, after every shift there will be a key story beat.</div>}
    <Btn onClick={onContinue} color="#E8A84C">{isLastDay?"Play Again":`Begin Day ${day+1} →`}</Btn>
  </div>);
}

// ── Game Instructions overlay ──────────────────────────────────
function InstructionsView({onClose,dayGoal,cashGoal}){
  const [open,setOpen]=useState(new Set([0]));
  const toggle=i=>setOpen(prev=>{const n=new Set(prev);n.has(i)?n.delete(i):n.add(i);return n;});
  const C2={bg:"#0C0E1A",card:"#131629",border:"#1E2338",gold:"#E8A84C",green:"#5BA88A",red:"#C0524A",blue:"#5B9BB5",muted:"#5C6380",text:"#F0EBE1",sub:"#8A91B0"};
  const P=({children})=>(<p style={{fontSize:12,color:C2.sub,lineHeight:1.75,marginBottom:10}}>{children}</p>);
  const B=({children})=>(<strong style={{color:C2.text,fontWeight:700}}>{children}</strong>);
  const Tag=({c,children})=>(<span style={{background:c+"20",border:`1px solid ${c}50`,borderRadius:4,padding:"1px 7px",fontSize:10,fontWeight:700,color:c,marginRight:5,whiteSpace:"nowrap"}}>{children}</span>);
  const sections=[
    {title:"1. Start Here",content:(<>
      <P>The landlord is putting pressure to close down The Arcadian! To keep it open, you have <B>{dayGoal} days</B> to earn at least <B>₡{cashGoal.toLocaleString()}</B>.</P>
      <P>Each day is made of <B>turns</B> — at least 3 per day, though you can increase this by spending Care Points. On each turn you can take <B>one action</B> and <B>one bonus action</B>.</P>
      <P>To play a turn: <B>Assess</B> what's happening in the bar, then <B>Decide</B> how to spend your action and bonus action, and <B>Resolve</B> them with dice rolls.</P>
    </>)},
    {title:"2. Actions and Bonus Actions",content:(<>
      <P>Your main action each turn can be used to:</P>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
        {[["🗣","Interact with a Friend","Talk to a regular — earn Trait points, relationship bonuses, and Cards.","#5B9BB5"],["🍹","Serve the Bar","Roll dice to serve customers in the queue and earn tips.","#E8A84C"],["⚠","Deal with a Complication","Tackle something going wrong in the bar before it gets worse.","#C0524A"]].map(([i,l,d,c])=>(<div key={l} style={{background:C2.card,border:`1px solid ${C2.border}`,borderRadius:8,padding:"10px 13px",display:"flex",gap:11,alignItems:"flex-start"}}><span style={{fontSize:16,marginTop:1}}>{i}</span><div><div style={{fontSize:12,fontWeight:700,color:c,marginBottom:3}}>{l}</div><div style={{fontSize:11,color:C2.sub,lineHeight:1.6}}>{d}</div></div></div>))}
      </div>
      <P>Bonus actions let you do a little extra on that turn — earn some quick cash, restock the bar, prevent customers from leaving, or reduce the odds of a complication appearing.</P>
    </>)},
    {title:"3. Care Pool",content:(<>
      <P>Represents your emotional energy to run the bar. It has two parts: <B>Slots</B> (your energy today) and <B>Care Points</B> (energy you're building for tomorrow).</P>
      <P><B>Slots (1–5):</B> You spend slots by playing Cards — special abilities that grant boons for a turn. If you run out of slots, you can't play cards.</P>
      <P><B>Care Points (0–20):</B> Every 5 points earns you one extra slot the next day. Finish a day with 10 points → start the next day with 3 slots total. Points carry over between shifts.</P>
      <div style={{background:C2.card,border:`1px solid ${C2.border}`,borderRadius:8,padding:"11px 14px",marginBottom:12}}>
        <div style={{fontSize:10,color:C2.muted,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Care Point milestones</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{[[5,2],[10,3],[15,4],[20,5]].map(([pts,slots])=>(<div key={pts} style={{background:"#0C0E1A",border:`1px solid ${C2.gold}40`,borderRadius:6,padding:"5px 12px",textAlign:"center"}}><div style={{fontSize:15,fontWeight:800,color:C2.gold}}>{pts}</div><div style={{fontSize:9,color:C2.muted}}>pts → {slots} slots</div></div>))}</div>
      </div>
      <P><Tag c={C2.green}>+2 pts</Tag> Interacting with a friend — always.</P>
      <P><Tag c={C2.red}>−1 pt</Tag> Serving the bar or dealing with a complication — always.</P>
    </>)},
    {title:"4. Traits",content:(<>
      <P>Your three traits — <Tag c={C2.blue}>Charismatic</Tag><Tag c={C2.gold}>Direct</Tag><Tag c={C2.green}>Empathetic</Tag> — reflect how you deal with people and situations.</P>
      <P>You earn a trait point every time you choose that trait in a conversation, and also every time you succeed on a <B>Skill Check</B>.</P>
      <P><B>Skill Checks</B> happen when talking to friends or dealing with complications. You pick an approach (matching one of your traits), roll the dice, and aim to beat the difficulty. Higher trait scores give you better odds.</P>
    </>)},
    {title:"5. Dice Rolls, Chill and Stress",content:(<>
      <P>Most actions are resolved by rolling <B>two d12 dice</B> — a <B>Chill die</B> and a <B>Stress die</B>. Add them together and try to beat the difficulty number.</P>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
        {[[C2.green,"Chill > Stress","+1 Care Point — the activity felt good.","🌙"],[C2.red,"Stress > Chill","−1 Care Point — the activity was draining.","🔥"],[C2.gold,"Both dice match","Critical! +5 Care Points and immediately unlock an extra Care Slot.","⚡"]].map(([c,h,d,i])=>(<div key={h} style={{background:C2.card,border:`1px solid ${c}40`,borderRadius:8,padding:"10px 13px",display:"flex",gap:10,alignItems:"flex-start"}}><span style={{fontSize:16}}>{i}</span><div><div style={{fontSize:12,fontWeight:700,color:c,marginBottom:2}}>{h}</div><div style={{fontSize:11,color:C2.sub,lineHeight:1.6}}>{d}</div></div></div>))}
      </div>
      <P>The dice result only determines Care Points — the <B>success or failure</B> of the action depends on beating the difficulty number with the combined total.</P>
    </>)},
    {title:"6. Cards",content:(<>
      <P>Cards are special abilities earned by talking to friends or succeeding on Skill Checks. Click a card during your turn (before rolling) to activate it — it costs <B>1 Care Slot</B>.</P>
      <P>Cards stay in your deck permanently. After use they're marked as spent for that day, then become available again the next shift. When you have more cards than your hand size (6), each shift's hand is drawn randomly.</P>
      <P>Cards can do things like give you a roll modifier, grant advantage, instantly solve a complication, or even give you an extra action for the turn.</P>
    </>)},
    {title:"7. Spend Care",content:(<>
      <P>You can spend Care Points to gain immediate benefits — think of it as doing a little extra today at the cost of tiring yourself for tomorrow.</P>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
        {[["★ Free","First spend of the day — no cost."],["−5 pts","Redraw 2 discarded cards"],["−5 pts","+1 extra turn today (max 5 turns/day)"],["−5 pts","Activate an empty Care Slot"]].map(([cost,desc])=>(<div key={desc} style={{display:"flex",gap:12,alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C2.border}`}}><div style={{background:cost==="★ Free"?C2.green+"20":"#C0524A20",border:`1px solid ${cost==="★ Free"?C2.green+"50":"#C0524A50"}`,borderRadius:4,padding:"2px 8px",fontSize:9,fontWeight:700,color:cost==="★ Free"?C2.green:C2.red,whiteSpace:"nowrap",minWidth:60,textAlign:"center"}}>{cost}</div><div style={{fontSize:11,color:C2.sub}}>{desc}</div></div>))}
      </div>
      <P>The first Spend Care action each day is always free — use it wisely.</P>
    </>)},
    {title:"8. Customer Mood and Satisfaction",content:(<>
      <P>Each customer has a <B>mood</B> (1–3). After every turn, their mood drops by 1. When mood hits 0, they leave without being served — which hurts your satisfaction score. Active complications also drop customer mood by 1 per turn.</P>
      <P><B>Satisfaction</B> works like a reputation score. The higher it is, the more customers visit the bar each day. Serving customers well raises it; serving bad drinks or leaving customers unserved lowers it.</P>
      <P>Think of it as the long game — early shifts with poor service compound into quieter bars later in the week.</P>
    </>)},
    {title:"9. Serving the Bar",content:(<>
      <P>Each customer will ask for a specific drink. You choose up to <B>6 ingredients</B> from the full list to serve them.</P>
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
        {[[C2.green,"Correct recipe","+1 to your roll modifier — easier to satisfy them."],[C2.gold,"Different drink (e.g. a wine when they ordered a cocktail)","−1 modifier — a harder sell, but it might land."],[C2.red,"Random combination that matches no recipe","−1 modifier + roll with disadvantage."]].map(([c,h,d])=>(<div key={h} style={{background:C2.card,border:`1px solid ${c}40`,borderRadius:7,padding:"9px 13px"}}><div style={{fontSize:11,fontWeight:700,color:c,marginBottom:3}}>{h}</div><div style={{fontSize:10,color:C2.sub,lineHeight:1.6}}>{d}</div></div>))}
      </div>
      <P>If you're out of stock for a requested drink, you can always serve an alternative. Just know the customer might not be thrilled about it.</P>
    </>)},
  ];
  return(<div style={{position:"fixed",inset:0,background:"#0C0E1A",zIndex:200,overflowY:"auto",fontFamily:"'Space Grotesk',system-ui,sans-serif"}}>
    <div style={{maxWidth:720,margin:"0 auto",padding:"24px 20px 48px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
        <div>
          <div style={{fontSize:10,color:C2.gold,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:4}}>Bar Raiser · Tequila Moonrise</div>
          <div style={{fontSize:26,fontWeight:800,color:C2.text}}>How to Play</div>
          <div style={{fontSize:12,color:C2.muted,marginTop:4}}>Click any section to expand it.</div>
        </div>
        <button onClick={onClose} style={{background:"transparent",border:`1px solid ${C2.border}`,color:C2.sub,borderRadius:8,padding:"8px 18px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0,marginTop:4}}>✕ Close</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {sections.map((s,i)=>(
          <div key={i} style={{border:`1px solid ${open.has(i)?"#E8A84C40":C2.border}`,borderRadius:10,overflow:"hidden",transition:"border-color .2s"}}>
            <div onClick={()=>toggle(i)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",cursor:"pointer",background:open.has(i)?"#E8A84C08":"#131629",userSelect:"none"}}>
              <span style={{fontSize:14,fontWeight:700,color:open.has(i)?C2.gold:C2.text}}>{s.title}</span>
              <span style={{fontSize:16,color:open.has(i)?C2.gold:C2.muted,display:"inline-block",transform:open.has(i)?"rotate(180deg)":"rotate(0deg)",transition:"transform .2s"}}>▾</span>
            </div>
            {open.has(i)&&<div style={{padding:"4px 18px 18px",borderTop:`1px solid ${C2.border}`}}>{s.content}</div>}
          </div>
        ))}
      </div>
    </div>
  </div>);
}

export default function BarRaiserHUD(){
  const [phase,setPhase]=useState("assess"),[day,setDay]=useState(1),[turn,setTurn]=useState(1),[maxTurns,setMaxTurns]=useState(3);
  const [cashGoal,setCashGoal]=useState(10000),[compRate,setCompRate]=useState(0.66);
  const [showInstructions,setShowInstructions]=useState(false);
  const [satGain,setSatGain]=useState(3),[satLoss,setSatLoss]=useState(2);
  const [satServeMod,setSatServeMod]=useState(1),[satCompDrain,setSatCompDrain]=useState(5);
  const [satEndCompPenalty,setSatEndCompPenalty]=useState(5),[satFloor,setSatFloor]=useState(10);
  const [care,setCare]=useState({limit:2,current:2,points:5});
  const [hand,setHand]=useState([]),[deck,setDeck]=useState([]);
  const [rollLocked,setRollLocked]=useState(false),[selAction,setSelAction]=useState(null),[selBonus,setSelBonus]=useState(null);
  const [customers,setCustomers]=useState([]),[complication,setComplication]=useState(null);
  const [satisfaction,setSatisfaction]=useState(50),[cash,setCash]=useState(0),[cashThisShift,setCashThisShift]=useState(0);
  const [traits,setTraits]=useState({charismatic:0,direct:0,empathetic:0});
  const [relationships,setRelationships]=useState(Object.fromEntries(ALL_NPCS.map(n=>[n,0])));
  const [moodFrozen,setMoodFrozen]=useState(false);
  const [ingredientStock,setIngredientStock]=useState(Object.fromEntries(Object.keys(INGREDIENTS).map(k=>[k,INGREDIENTS[k].stock])));
  const [careSpentThisShift,setCareSpentThisShift]=useState(0);
  const [shiftInteractedNPCs,setShiftInteractedNPCs]=useState([]);
  const [interactionHistory,setInteractionHistory]=useState({}); // {npcName: [completedIds]} — persists across shifts
  const [activeNPCs,setActiveNPCs]=useState(["Hermes"]);
  const [triggeredMilestones,setTriggeredMilestones]=useState([]);
  const [newCardEarned,setNewCardEarned]=useState(null);
  const [pendingEffects,setPendingEffects]=useState({modifierBonus:0,advantageNextRoll:false,rerollOnes:false,canRerollOneDie:false,guaranteedSuccess:false,freeNextCard:false,freeRestock:false});
  const [shiftEffects,setShiftEffects]=useState({traitAdvantages:{charismatic:false,direct:false,empathetic:false},cancelDisadvantage:0,mindfulnessRounds:0});
  const [extraActions,setExtraActions]=useState(0),[noBonusAction,setNoBonusAction]=useState(false);
  const [selAction2,setSelAction2]=useState(null),[resolveStep,setResolveStep]=useState(0),[action1Result,setAction1Result]=useState(null);

  const triggeredRef=useRef([]),deckRef=useRef([]),handRef=useRef([]);
  useEffect(()=>{triggeredRef.current=triggeredMilestones;},[triggeredMilestones]);
  useEffect(()=>{deckRef.current=deck;},[deck]);
  useEffect(()=>{handRef.current=hand;},[hand]);

  useEffect(()=>{if(!newCardEarned)return;const t=setTimeout(()=>setNewCardEarned(null),4000);return()=>clearTimeout(t);},[newCardEarned]);

  useEffect(()=>{setHand(h=>h.map(c=>{if(care.current===0&&c.cardState==="available")return{...c,cardState:"locked"};if(care.current>0&&c.cardState==="locked")return{...c,cardState:"available"};return c;}));},[care.current]);

  const updateCarePoints=useCallback(delta=>{
    setCare(prev=>{
      const newPoints=Math.max(0,Math.min(20,prev.points+delta));
      let newLimit=prev.limit;
      if(delta>0){const ml=Math.min(5,Math.floor(newPoints/5)+1);if(ml>prev.limit)newLimit=ml;} // new slot unlocked as SPENT (current unchanged)
      return{...prev,points:newPoints,limit:newLimit};
    });
  },[]);
  const spendSlot=useCallback(()=>setCare(c=>({...c,current:Math.max(0,c.current-1)})),[]);
  const returnSlot=useCallback(()=>setCare(c=>({...c,current:Math.min(c.limit,c.current+1)})),[]);
  /* Old forfeitSlot (permanent limit reduction) — commented out while testing points-based Spend Care cost:
  const forfeitSlot=useCallback(()=>setCare(prev=>{const nl=Math.max(1,prev.limit-1),nn=Math.max(2,2*(nl-1));return{...prev,limit:nl,current:Math.min(Math.max(0,prev.current-1),nl),gainProgress:Math.min(prev.gainProgress,nn-1),gainNeeded:nn};}),[]);
  */
  const forfeitSlot=useCallback(()=>setCare(prev=>({...prev,points:Math.max(0,prev.points-5)})),[]);

  // Doubles positive care point gains when Mindfulness is active
  const gainCarePoints=useCallback(delta=>{
    updateCarePoints(shiftEffects.mindfulnessRounds>0?delta*2:delta);
  },[updateCarePoints,shiftEffects.mindfulnessRounds]);

  // Refs for Tidy Up and Hermes delayed restock
  const tidyUpOverrideRef=useRef(null);
  const [pendingHermesRestock,setPendingHermesRestock]=useState(null); // {free,requestedTurn} or null

  const awardCard=useCallback(card=>{
    if(!card)return;
    if(card.exclusive&&triggeredRef.current.includes(card.exclusive))return;
    if(card.exclusive)setTriggeredMilestones(p=>[...p,card.exclusive]);
    if(deckRef.current.find(d=>d.id===card.id))return;
    const cs={...card,cardState:"available"};
    setDeck(p=>[...p,cs]);
    if(handRef.current.filter(c=>c.cardState!=="discarded").length<HAND_SIZE)setHand(h=>[...h,cs]);
    setNewCardEarned(card);
  },[]);

  const awardTraitCard=useCallback(traitKey=>{
    const ek=`first_${traitKey}`;
    if(!triggeredRef.current.includes(ek)){const c=ALL_CARDS.find(x=>x.exclusive===ek);if(c){awardCard(c);return;}}
    const tl={charismatic:"Charismatic",direct:"Direct",empathetic:"Empathetic"}[traitKey];
    const pool=ALL_CARDS.filter(c=>c.type===tl&&!c.exclusive&&!deckRef.current.find(d=>d.id===c.id));
    if(pool.length)awardCard(randFrom(pool));
  },[awardCard]);

  const awardCheckCard=useCallback((context,npcName)=>{
    if(context==="npc"&&npcName){const nm={Darius:"first_darius",Mimi:"first_mimi",Cooper:"first_cooper"}[npcName];if(nm&&!triggeredRef.current.includes(nm)){const c=ALL_CARDS.find(x=>x.exclusive===nm);if(c){awardCard(c);return;}}}
    const pool=ALL_CARDS.filter(c=>!c.exclusive&&!deckRef.current.find(d=>d.id===c.id));
    if(pool.length)awardCard(randFrom(pool));
  },[awardCard]);

  const complicationRef=useRef(null);
  useEffect(()=>{complicationRef.current=complication;},[complication]);

  const applyCardEffect=useCallback(card=>{
    const comp=complicationRef.current;
    switch(card.effect){
      // modifier_next: card.modifier is already summed in activeModifier reduce — no pendingEffects needed
      case"advantage_next":setPendingEffects(p=>({...p,advantageNextRoll:true}));break;
      case"advantage_trait_shift":if(card.effectTrait)setShiftEffects(s=>({...s,traitAdvantages:{...s.traitAdvantages,[card.effectTrait]:true}}));break;
      case"cancel_disadvantage":setShiftEffects(s=>({...s,cancelDisadvantage:2}));break;
      case"reroll_ones":setPendingEffects(p=>({...p,rerollOnes:true}));break;
      case"reroll_one_die":setPendingEffects(p=>({...p,canRerollOneDie:true}));break;
      case"guaranteed_stress":setPendingEffects(p=>({...p,guaranteedSuccess:true}));break;
      case"solve_social_sat":if(comp?.type?.includes("Social")){setComplication(null);setSatisfaction(s=>Math.max(0,s-3));}break;
      case"solve_social_cash":if(comp?.type?.includes("Social")){setComplication(null);setCash(c=>Math.max(0,c-150));}break;
      case"fix_technical":if(comp?.type?.includes("Technical")){setComplication(null);setSelBonus(null);}break;
      case"shots_instant":setCustomers(cs=>cs.filter(c=>c.mood>2));break;
      case"free_restock":setPendingEffects(p=>({...p,freeRestock:true}));break;
      case"two_actions":setExtraActions(1);break;
      case"two_actions_no_bonus":setExtraActions(1);setNoBonusAction(true);break;
      case"mindfulness":setShiftEffects(prev=>({...prev,mindfulnessRounds:2}));break;
      case"personal_angle":setPendingEffects(p=>({...p,freeNextCard:true}));{const pool=ALL_CARDS.filter(c=>!c.exclusive&&!deckRef.current.find(d=>d.id===c.id));if(pool.length)awardCard(randFrom(pool));}break;
      default:break;
    }
  },[awardCard]);

  const onToggleCard=useCallback(id=>{
    const card=hand.find(c=>c.id===id);if(!card)return;
    if(card.cardState==="available"){
      if(care.current<=0)return;
      const isFree=pendingEffects.freeNextCard;
      setHand(h=>h.map(c=>c.id===id?{...c,cardState:"selected"}:c));
      if(!isFree)spendSlot();else setPendingEffects(p=>({...p,freeNextCard:false}));
      if(card.clearsComplication)setComplication(null);
      applyCardEffect(card);
    }else if(card.cardState==="selected"){setHand(h=>h.map(c=>c.id===id?{...c,cardState:"available"}:c));returnSlot();}
  },[hand,care.current,spendSlot,returnSlot,applyCardEffect,pendingEffects.freeNextCard]);

  const onSpendCare=useCallback(key=>{
    if(key==="gainCare"){gainCarePoints(1);return;}
    if(key==="extraSlot"&&care.current>=care.limit)return; // no empty slots to activate
    const isFree=careSpentThisShift===0;
    if(key==="redraw")setHand(h=>{const ids=h.filter(c=>c.cardState==="discarded").map(c=>c.id).slice(0,2);return h.map(c=>ids.includes(c.id)?{...c,cardState:"available"}:c);});
    if(key==="extraTurn")setMaxTurns(t=>t+1);
    if(key==="extraSlot")setCare(p=>({...p,current:Math.min(p.limit,p.current+1)}));
    if(!isFree)forfeitSlot();
    setCareSpentThisShift(n=>n+1);
  },[care.current,care.limit,careSpentThisShift,forfeitSlot,gainCarePoints]);

  const onTraitGain=useCallback((traitKey,amount=1)=>{setTraits(t=>({...t,[traitKey]:t[traitKey]+amount}));awardTraitCard(traitKey);},[awardTraitCard]);

  const onRelGain=useCallback(npcName=>{
    setRelationships(r=>({...r,[npcName]:(r[npcName]||0)+1}));
  },[]);

  const onMarkInteractionDone=useCallback((interactionId,npcName)=>{
    setInteractionHistory(h=>({...h,[npcName]:[...(h[npcName]||[]),interactionId].filter((v,i,a)=>a.indexOf(v)===i)}));
  },[]);

  const consumePending=useCallback(()=>setPendingEffects(p=>({...p,modifierBonus:0,advantageNextRoll:false,rerollOnes:false,canRerollOneDie:false,guaranteedSuccess:false})),[]);

  const handleDiceResult=useCallback((result,context)=>{
    if(result.isCrit){setCare(prev=>{const nl=Math.min(5,prev.limit+1);return{...prev,limit:nl,current:Math.min(nl,prev.current+1),points:Math.max(prev.points,(nl-1)*5)};});setRollLocked(true);consumePending();return;}
    if(pendingEffects.rerollOnes&&result.success&&result.dominant==="chill")returnSlot();
    if(result.dominant==="chill")gainCarePoints(1);else updateCarePoints(-1);
    if(result.success&&context==="comp")awardCheckCard("comp",null);
    setRollLocked(true);consumePending();
  },[pendingEffects.rerollOnes,gainCarePoints,updateCarePoints,returnSlot,awardCheckCard,consumePending]);

  const handleNPCDiceResult=useCallback((result,npcName)=>{
    if(result.isCrit){setCare(prev=>{const nl=Math.min(5,prev.limit+1);return{...prev,limit:nl,current:Math.min(nl,prev.current+1),points:Math.max(prev.points,(nl-1)*5)};});setRollLocked(true);consumePending();return;}
    if(pendingEffects.rerollOnes&&result.success&&result.dominant==="chill")returnSlot();
    if(result.dominant==="chill")gainCarePoints(1);else updateCarePoints(-1);
    if(result.success){setRelationships(r=>({...r,[npcName]:(r[npcName]||0)+1}));awardCheckCard("npc",npcName);}
    setRollLocked(true);consumePending();
  },[pendingEffects.rerollOnes,gainCarePoints,updateCarePoints,returnSlot,awardCheckCard,consumePending]);

  const handleBonusResult=useCallback(({bonusKey,band,succeeded,roll=0})=>{
    if(bonusKey==="tips"){
      if(roll!==1){const tip=roll===20?180:succeeded?144:120;setCash(c=>c+tip);setCashThisShift(c=>c+tip);}
    }
    if(bonusKey==="tidy"){
      if(roll===20){tidyUpOverrideRef.current=0;gainCarePoints(1);}      // crit: no comp + care point
      else if(roll>=15){tidyUpOverrideRef.current=0;}                     // strong: no comp
      else if(roll>=10){tidyUpOverrideRef.current=compRate*0.30;}         // partial: ~20% comp
      // else no effect
    }
    if(bonusKey==="freeze"&&succeeded)setMoodFrozen(true);
    if(bonusKey==="hermes"){
      if(succeeded)setComplication(null);
      const isFree=pendingEffects.freeRestock;
      if(isFree)setPendingEffects(p=>({...p,freeRestock:false}));
      if(roll===1){
        // Natural 1: fail — no restock, no charge
      } else if(roll<11){
        // 2–10: delayed restock — takes effect next turn via useEffect
        setPendingHermesRestock({free:isFree,requestedTurn:turn});
      } else if(roll===20){
        // Natural 20: immediate restock at half cost
        setIngredientStock(prev=>{
          if(!isFree){const cost=Math.floor(Object.keys(INGREDIENTS).reduce((t,n)=>t+Math.max(0,5-(prev[n]??5))*INGREDIENTS[n].cost,0)/2);setCash(c=>Math.max(0,c-cost));}
          return Object.fromEntries(Object.keys(INGREDIENTS).map(k=>[k,5]));
        });
      } else {
        // 11–19: immediate restock at full cost
        setIngredientStock(prev=>{
          if(!isFree){const cost=Object.keys(INGREDIENTS).reduce((t,n)=>t+Math.max(0,5-(prev[n]??5))*INGREDIENTS[n].cost,0);setCash(c=>Math.max(0,c-cost));}
          return Object.fromEntries(Object.keys(INGREDIENTS).map(k=>[k,5]));
        });
      }
    }
  },[pendingEffects.freeRestock,gainCarePoints,compRate,turn]);

  const activeModifier=hand.filter(c=>c.cardState==="selected").reduce((s,c)=>s+(c.modifier||0),0)+pendingEffects.modifierBonus;

  const customersRef=useRef([]);
  useEffect(()=>{customersRef.current=customers;},[customers]);
  useEffect(()=>{
    if(pendingHermesRestock&&pendingHermesRestock.requestedTurn<turn){
      const{free}=pendingHermesRestock;
      setPendingHermesRestock(null);
      setIngredientStock(prev=>{
        if(!free){const cost=Object.keys(INGREDIENTS).reduce((t,n)=>t+Math.max(0,5-(prev[n]??5))*INGREDIENTS[n].cost,0);setCash(c=>Math.max(0,c-cost));}
        return Object.fromEntries(Object.keys(INGREDIENTS).map(k=>[k,5]));
      });
    }
  },[turn,pendingHermesRestock]);

  const completeTurn=useCallback(({tips=0,servedCount=0,rollResults=[],npcInteracted=null,usedIngredients=[],wasNPC=false}={})=>{
    setCash(c=>c+tips);setCashThisShift(c=>c+tips);
    if(selAction==="npc"||wasNPC)gainCarePoints(2);
    if(selAction==="serve"||selAction2==="serve")updateCarePoints(-1); // serve action: −1 point per turn
    if(selAction==="comp"||selAction2==="comp")updateCarePoints(-1); // comp action: −1 point per turn
    if(usedIngredients.length>0)setIngredientStock(prev=>{const n={...prev};usedIngredients.forEach(i=>{n[i]=Math.max(0,(n[i]??5)-1);});return n;});
    const ta=complication?.turnsActive||0;
    const compMoodDrain=(complication&&selAction!=="comp")?(ta>=1?2:1):0;
    if(complication&&selAction!=="comp"){updateCarePoints(-1);if(ta>=1)updateCarePoints(-1);setComplication(prev=>prev?{...prev,turnsActive:ta+1,stacked:ta+1>=1}:null);
      if(satCompDrain>0)setSatisfaction(s=>Math.max(0,s-satCompDrain));}
    setHand(h=>h.map(c=>c.cardState==="selected"?{...c,cardState:"discarded"}:c));
    // Track interacted NPC so they can't re-enter this shift
    if(npcInteracted)setShiftInteractedNPCs(prev=>[...prev,npcInteracted]);
    if(turn>=maxTurns){
      if(complication&&satEndCompPenalty>0)setSatisfaction(s=>Math.max(0,s-satEndCompPenalty));
      setRollLocked(false);setPhase("shiftEnd");return;
    }
    const cur=customersRef.current;
    const rem=cur.slice(servedCount);
    const afterDecay=moodFrozen?rem:rem.map(c=>({...c,mood:Math.max(0,c.mood-1)}));
    const withComp=compMoodDrain>0?afterDecay.map(c=>({...c,mood:Math.max(0,c.mood-compMoodDrain)})):afterDecay;
    const leaving=withComp.filter(c=>c.mood<=0).length;
    let surv=withComp.filter(c=>c.mood>0);
    if(turn+1>=3){while(surv.length<2){const used=surv.map(c=>c.label),avail=CUSTOMER_POOL.filter(l=>!used.includes(l));surv.push({label:avail.length?randFrom(avail):CUSTOMER_POOL[0],mood:2});}}
    // Serve quality modifier: good rolls +satServeMod, bad rolls -satServeMod (single-action serve only)
    const serveQualDelta=selAction==="serve"?rollResults.reduce((a,r)=>a+((r.success||r.isCrit)?satServeMod:-satServeMod),0):0;
    // satGain only applies on serve turns — reputation comes from tending bar, not from NPC/comp actions
    const effectiveSatGain=selAction==="serve"?satGain:0;
    // Gate arrivals on current satisfaction (pre-turn value is fine for gating), then update sat
    const satScale=Math.sqrt(Math.max(satFloor/100,satisfaction/100));
    const occupied=new Set(surv.map(c=>c.label));
    const avail=CUSTOMER_POOL.filter(l=>!occupied.has(l));
    const nArrivals=Math.floor(Math.random()*Math.min(3,avail.length)*satScale);
    const arrivals=avail.sort(()=>Math.random()-0.5).slice(0,nArrivals);
    const nextQueue=[...surv,...arrivals.map(l=>({label:l,mood:Math.random()<0.5?3:2}))].slice(0,5);
    setCustomers(nextQueue);
    const satDelta=effectiveSatGain+serveQualDelta-leaving*satLoss;
    setSatisfaction(s=>Math.max(0,Math.min(100,s+satDelta)));
    const nextTurn=turn+1,nextIsOnb=day===1&&nextTurn<=2;
    if(nextIsOnb)setCustomers([]); // no customers during onboarding turns
    if(!nextIsOnb){
      setActiveNPCs(prev=>{
        let n=prev.filter(x=>x!==npcInteracted);
        n=n.filter(x=>{const rm=relationships[x]||0,r=Math.ceil(Math.random()*20);return r+rm>=11;});
        // Exclude NPCs already interacted with this shift, and those with no remaining interactions
        const interacted=[...shiftInteractedNPCs,...(npcInteracted?[npcInteracted]:[])];
        const avail=ALL_NPCS.filter(x=>!n.includes(x)&&!interacted.includes(x)&&npcHasAvailableInteractions(x,interactionHistory));
        const arr=[...avail].sort(()=>Math.random()-0.5).slice(0,Math.floor(Math.random()*3));
        const res=[...n,...arr];
        const fallback=ALL_NPCS.filter(x=>!interacted.includes(x)&&npcHasAvailableInteractions(x,interactionHistory));
        return res.length?res:(fallback.length?[randFrom(fallback)]:[]);
      });
    }else{setActiveNPCs(nextTurn===1?["Hermes"]:nextTurn===2?["Cooper"]:[]);}
    setMoodFrozen(false);setExtraActions(0);setNoBonusAction(false);
    setSelAction(null);setSelAction2(null);setSelBonus(null);setRollLocked(false);setResolveStep(0);setAction1Result(null);
    // careSpentThisShift resets only at shift end (startNewDay), NOT each turn
    setShiftEffects(s=>({...s,cancelDisadvantage:Math.max(0,s.cancelDisadvantage-1),mindfulnessRounds:Math.max(0,s.mindfulnessRounds-1)}));
    if(day===1&&nextTurn===3){const ic=[];while(ic.length<3){const av=CUSTOMER_POOL.filter(l=>!ic.some(c=>c.label===l));ic.push({label:av.length?randFrom(av):CUSTOMER_POOL[0],mood:2});}setCustomers(ic);}
    const effectiveCompRate=tidyUpOverrideRef.current!==null?tidyUpOverrideRef.current:compRate;
    tidyUpOverrideRef.current=null; // consume override
    if(!nextIsOnb&&selAction!=="comp"){if(Math.random()<effectiveCompRate&&!complication)setComplication(randComplication());}
    setTurn(t=>t+1);setPhase("assess");
  },[turn,maxTurns,complication,selAction,selAction2,gainCarePoints,updateCarePoints,moodFrozen,relationships,day,shiftInteractedNPCs,interactionHistory,compRate,satGain,satLoss,satServeMod,satCompDrain,satEndCompPenalty,satFloor,satisfaction]);

  const startNewDay=useCallback(()=>{
    const nd=day+1;setDay(nd);setTurn(1);setMaxTurns(3);
    setCare(prev=>{const nl=Math.min(5,Math.floor(prev.points/5)+1);const nc=complication?Math.max(1,nl-1):nl;return{...prev,limit:nl,current:nc};});
    if(complication&&satEndCompPenalty>0)setSatisfaction(s=>Math.max(0,s-satEndCompPenalty));
    setDeck(prev=>{setHand(drawHand(prev));return prev;});
    setSelAction(null);setSelBonus(null);setCashThisShift(0);setRollLocked(false);setCareSpentThisShift(0);
    setShiftInteractedNPCs([]);
    setMoodFrozen(false);setExtraActions(0);setNoBonusAction(false);
    setShiftEffects({traitAdvantages:{charismatic:false,direct:false,empathetic:false},cancelDisadvantage:0,mindfulnessRounds:0});
    setCustomers(generateCustomers(satisfaction));setComplication(null);setPendingHermesRestock(null);
    setActiveNPCs([...ALL_NPCS].sort(()=>Math.random()-0.5).slice(0,2+Math.floor(Math.random()*2)));
    setPhase("assess");
  },[day,satisfaction,complication,satEndCompPenalty]);

  const restart=useCallback(()=>{
    setDay(1);setTurn(1);setMaxTurns(3);setCare({limit:2,current:2,gainProgress:0,gainNeeded:2});
    setDeck([]);setHand([]);setSelAction(null);setSelBonus(null);setRollLocked(false);
    setCash(0);setCashThisShift(0);setSatisfaction(50);setTraits({charismatic:0,direct:0,empathetic:0});setPendingHermesRestock(null);
    setRelationships(Object.fromEntries(ALL_NPCS.map(n=>[n,0])));setActiveNPCs(["Hermes"]);
    setTriggeredMilestones([]);setNewCardEarned(null);setCareSpentThisShift(0);setShiftInteractedNPCs([]);setInteractionHistory({});
    setIngredientStock(Object.fromEntries(Object.keys(INGREDIENTS).map(k=>[k,INGREDIENTS[k].stock])));
    setCustomers([]);setComplication(null);setMoodFrozen(false);
    setPendingEffects({modifierBonus:0,advantageNextRoll:false,rerollOnes:false,canRerollOneDie:false,guaranteedSuccess:false,freeNextCard:false,freeRestock:false});
    setShiftEffects({traitAdvantages:{charismatic:false,direct:false,empathetic:false},cancelDisadvantage:0,mindfulnessRounds:0});
    setExtraActions(0);setNoBonusAction(false);setSelAction2(null);setResolveStep(0);setAction1Result(null);setPhase("assess");
  },[]);

  const goBack=useCallback(()=>{const sc=hand.filter(c=>c.cardState==="selected").length;setHand(h=>h.map(c=>c.cardState==="selected"?{...c,cardState:"available"}:c));if(sc>0)setCare(c=>({...c,current:Math.min(c.limit,c.current+sc)}));setRollLocked(false);setResolveStep(0);setAction1Result(null);tidyUpOverrideRef.current=null;setPhase("decide");},[hand]);

  const handleAction1Complete=useCallback((result={})=>{
    setAction1Result({...result,wasNPC:selAction==="npc"});
    setResolveStep(1);setRollLocked(false);
  },[selAction]);

  const handleAction2Complete=useCallback((result={})=>{
    const r1=action1Result||{};
    completeTurn({
      tips:(r1.tips||0)+(result.tips||0),
      servedCount:(r1.servedCount||0)+(result.servedCount||0),
      rollResults:[...(r1.rollResults||[]),...(result.rollResults||[])],
      npcInteracted:r1.npcInteracted||result.npcInteracted||null,
      usedIngredients:[...(r1.usedIngredients||[]),...(result.usedIngredients||[])],
      wasNPC:(r1.wasNPC||false)||(selAction2==="npc"),
    });
  },[action1Result,selAction2,completeTurn]);

  const isLastDay=day>=DAY_GOAL;
  const baseDisadv=!!(complication&&shiftEffects.cancelDisadvantage===0);
  const rollMode=selAction==="comp"?"normal":pendingEffects.advantageNextRoll&&baseDisadv?"normal":pendingEffects.advantageNextRoll?"advantage":baseDisadv?"disadvantage":"normal";
  const hermesCost=Object.keys(INGREDIENTS).reduce((t,n)=>t+Math.max(0,5-(ingredientStock[n]??5))*INGREDIENTS[n].cost,0);

  return(<div style={{fontFamily:"'Space Grotesk',system-ui,sans-serif",background:"#0C0E1A",minHeight:"100vh",padding:16,color:"#F0EBE1",boxSizing:"border-box"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;}button{font-family:inherit;}`}</style>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,paddingBottom:14,borderBottom:"1px solid #1E2338"}}>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <div style={{display:"flex",alignItems:"baseline",gap:10}}><div style={{fontSize:18,fontWeight:700,color:"#E8A84C"}}>THE ARCADIAN</div><div style={{fontSize:11,color:"#5C6380"}}>Bar Raiser · Playtest</div></div>
        <button onClick={()=>setShowInstructions(true)} style={{display:"flex",alignItems:"center",gap:5,background:"transparent",border:"1px solid #1E2338",borderRadius:6,padding:"4px 10px",fontSize:10,fontWeight:700,color:"#5C6380",cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.04em"}}>
          <span style={{fontSize:13,fontWeight:800}}>?</span> Game Instructions
        </button>
      </div>
      <div style={{display:"flex",gap:16,alignItems:"center"}}>
        <div style={{display:"flex",gap:12,alignItems:"center",paddingRight:16,borderRight:"1px solid #1E2338"}}>
          {TRAIT_CFG.map(({key,label,color})=>(<div key={key} style={{textAlign:"center"}}><div style={{fontSize:8,color:"#5C6380",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>{label}</div><div style={{fontSize:18,fontWeight:700,color}}>{traits[key]}</div></div>))}
        </div>
        {[{l:"Day",v:`${day}/${DAY_GOAL}`},{l:"Turn",v:`${Math.min(turn,maxTurns)}/${maxTurns}`}].map(({l,v})=>(<div key={l} style={{display:"flex",alignItems:"center",gap:16}}><div style={{textAlign:"center"}}><div style={{fontSize:9,color:"#5C6380",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:1}}>{l}</div><div style={{fontSize:18,fontWeight:700,lineHeight:1}}>{v}</div></div><div style={{width:1,height:26,background:"#1E2338"}}/></div>))}
        <div style={{paddingRight:16,borderRight:"1px solid #1E2338"}}><div style={{fontSize:9,color:"#5C6380",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Satisfaction</div><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:80,height:5,background:"#151829",borderRadius:3}}><div style={{width:`${satisfaction}%`,height:"100%",background:"#5BA88A",borderRadius:3,transition:"width .4s"}}/></div><span style={{fontSize:12,fontWeight:700,color:"#5BA88A"}}>{satisfaction}%</span></div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:9,color:"#5C6380",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:2}}>Cash / Goal</div><div style={{fontSize:16,fontWeight:700,color:"#E8A84C"}}>₡{cash} <span style={{color:"#5C6380",fontSize:12,fontWeight:400}}>/ ₡{cashGoal}</span></div><div style={{height:3,background:"#151829",borderRadius:2,marginTop:4}}><div style={{width:`${Math.min(cash/cashGoal,1)*100}%`,height:"100%",background:cash>=cashGoal?"#5BA88A":"#E8A84C",borderRadius:2,transition:"width .4s"}}/></div></div>
      </div>
    </div>
    {phase==="shiftEnd"&&<ShiftEnd day={day} cashThisShift={cashThisShift} satisfaction={satisfaction} isLastDay={isLastDay} cash={cash} goal={cashGoal} onContinue={isLastDay?restart:startNewDay}/>}
    {phase!=="shiftEnd"&&(<div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
      <Sidebar care={care} hand={hand} maxTurns={maxTurns} rollLocked={rollLocked} activeModifier={activeModifier} onToggleCard={onToggleCard} onSpendCare={onSpendCare} careSpentThisShift={careSpentThisShift}/>
      <div style={{flex:1,minWidth:0}}>
        {newCardEarned&&<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,padding:"10px 14px",background:"#E8A84C18",border:"1px solid #E8A84C60",borderRadius:8}}><span style={{fontSize:18}}>🃏</span><div><div style={{fontSize:10,color:"#E8A84C",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>New card earned</div><div style={{fontSize:12,color:"#F0EBE1",fontWeight:600}}>{newCardEarned.name} <span style={{fontSize:10,color:"#5C6380",fontWeight:400}}>— {newCardEarned.desc}</span></div></div><button onClick={()=>setNewCardEarned(null)} style={{marginLeft:"auto",background:"none",border:"none",color:"#5C6380",fontSize:16,cursor:"pointer",fontFamily:"inherit"}}>×</button></div>}
        <PhaseStrip current={phase} onNavigate={setPhase} canResolve={!!(selAction&&(noBonusAction||selBonus))}/>
        {phase==="assess"&&<AssessPhase customers={customers} npcs={activeNPCs} relationships={relationships} complication={complication} moodFrozen={moodFrozen} onNext={()=>{if(day===1&&turn<=2)setSelAction("npc");setPhase("decide");}} day={day} turn={turn} cashGoal={cashGoal} onSetCashGoal={setCashGoal} compRate={compRate} onSetCompRate={setCompRate} satGain={satGain} onSetSatGain={setSatGain} satLoss={satLoss} onSetSatLoss={setSatLoss} satServeMod={satServeMod} onSetSatServeMod={setSatServeMod} satCompDrain={satCompDrain} onSetSatCompDrain={setSatCompDrain} satEndCompPenalty={satEndCompPenalty} onSetSatEndCompPenalty={setSatEndCompPenalty} satFloor={satFloor} onSetSatFloor={setSatFloor}/>}
        {phase==="decide"&&<DecidePhase selAction={selAction} selAction2={selAction2} selBonus={selBonus} onSelAction={setSelAction} onSelAction2={setSelAction2} onSelBonus={setSelBonus} complication={complication} customers={customers} turn={turn} maxTurns={maxTurns} onNext={()=>setPhase("resolve")} onBack={()=>setPhase("assess")} extraActions={extraActions} noBonusAction={noBonusAction} isOnboarding={day===1&&turn<=2}/>}
        {phase==="resolve"&&(<div style={{display:"flex",flexDirection:"column",gap:12}}>
          {resolveStep===1&&<div style={{background:"#A87CC018",border:"1px solid #A87CC050",borderRadius:8,padding:"8px 13px",fontSize:10,color:"#A87CC0",fontWeight:700}}>★ Action 2 of 2</div>}
          {resolveStep===0&&!noBonusAction&&<BonusActionPanel bonusKey={selBonus} onBonusResult={handleBonusResult} hermesCost={hermesCost}/>}
          {resolveStep===0&&selAction==="serve"&&<ResolveServe key="a1-serve" customers={customers} modifier={activeModifier} onComplete={selAction2?handleAction1Complete:completeTurn} onBack={goBack} onDiceResult={handleDiceResult} onRoll={()=>setRollLocked(true)} stock={ingredientStock} rollMode={rollMode} pendingEffects={pendingEffects}/>}
          {resolveStep===0&&selAction==="npc"&&<ResolveNPC key="a1-npc" npcs={activeNPCs} relationships={relationships} modifier={activeModifier} traits={traits} onTraitGain={onTraitGain} onRelGain={onRelGain} onDiceResult={handleNPCDiceResult} onRoll={()=>setRollLocked(true)} onComplete={selAction2?handleAction1Complete:completeTurn} onBack={goBack} rollMode={rollMode} shiftEffects={shiftEffects} pendingEffects={pendingEffects} interactionHistory={interactionHistory} onMarkInteractionDone={onMarkInteractionDone}/>}
          {resolveStep===0&&selAction==="comp"&&<ResolveComplication key="a1-comp" complication={complication} modifier={activeModifier} traits={traits} onComplete={(success)=>{if(success)setComplication(null);else setComplication(prev=>prev?{...prev,turnsActive:(prev.turnsActive||0)+1}:null);selAction2?handleAction1Complete():completeTurn();}} onBack={goBack} onDiceResult={handleDiceResult} onRoll={()=>setRollLocked(true)} shiftEffects={shiftEffects} pendingEffects={pendingEffects}/>}
          {resolveStep===1&&selAction2==="serve"&&<ResolveServe key="a2-serve" customers={customers} modifier={activeModifier} onComplete={handleAction2Complete} onBack={goBack} onDiceResult={handleDiceResult} onRoll={()=>setRollLocked(true)} stock={ingredientStock} rollMode={rollMode} pendingEffects={pendingEffects}/>}
          {resolveStep===1&&selAction2==="npc"&&<ResolveNPC key="a2-npc" npcs={activeNPCs} relationships={relationships} modifier={activeModifier} traits={traits} onTraitGain={onTraitGain} onRelGain={onRelGain} onDiceResult={handleNPCDiceResult} onRoll={()=>setRollLocked(true)} onComplete={handleAction2Complete} onBack={goBack} rollMode={rollMode} shiftEffects={shiftEffects} pendingEffects={pendingEffects} interactionHistory={interactionHistory} onMarkInteractionDone={onMarkInteractionDone}/>}
          {resolveStep===1&&selAction2==="comp"&&<ResolveComplication key="a2-comp" complication={complication} modifier={activeModifier} traits={traits} onComplete={(success)=>{if(success)setComplication(null);else setComplication(prev=>prev?{...prev,turnsActive:(prev.turnsActive||0)+1}:null);handleAction2Complete();}} onBack={goBack} onDiceResult={handleDiceResult} onRoll={()=>setRollLocked(true)} shiftEffects={shiftEffects} pendingEffects={pendingEffects}/>}
        </div>)}
      </div>
    </div>)}
    {showInstructions&&<InstructionsView onClose={()=>setShowInstructions(false)} dayGoal={DAY_GOAL} cashGoal={cashGoal}/>}
  </div>);
}
