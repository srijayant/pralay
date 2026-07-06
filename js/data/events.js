export const EVENTS = [
  {
    id: 'monsoon-late',
    title: 'The Late Monsoon',
    text: 'Dark clouds gather but release nothing. Fields crack. The elders say the sky has forgotten how to weep.',
    choices: [
      { text: 'Organize community rain rituals', effects: { faith: 8, water: -5 }, log: 'Faith sustained hope through the dry weeks.' },
      { text: 'Ration water strictly', effects: { water: 5, unity: -8 }, log: 'Harsh rationing saved stores but bred resentment.' },
      { text: 'Send scouts upriver', effects: { tech: 3, water: -3 }, log: 'Scouts mapped a buried aqueduct.' },
    ],
    weight: 10,
  },
  {
    id: 'salvage-train',
    title: 'The Rust Cathedral',
    text: 'Scouts find a half-submerged metro tunnel. Inside: sealed cars of unknown cargo and flickering emergency lights.',
    choices: [
      { text: 'Excavate carefully for technology', effects: { tech: 15, unity: -3 }, log: 'Salvaged working solar inverters from the trains.' },
      { text: 'Leave it sealed — some doors should stay closed', effects: { faith: 5, unity: 5 }, log: 'The community chose restraint over greed.' },
      { text: 'Strip it fast before rivals arrive', effects: { tech: 10, water: -5, food: -5 }, log: 'A frantic salvage left scars on the land.' },
    ],
    weight: 8,
  },
  {
    id: 'refugee-wave',
    title: 'The Walking City',
    text: 'Thousands arrive from the drowned coast — families, artisans, a whole theatre troupe. Your stores cannot feed them all.',
    choices: [
      { text: 'Welcome all and share equally', effects: { unity: 15, food: -15, water: -8 }, log: 'The bastion swelled with new voices and hunger.' },
      { text: 'Accept only those with useful skills', effects: { tech: 8, unity: -10 }, log: 'Engineers and healers were chosen; others turned away.' },
      { text: 'Direct them to allied territories', effects: { unity: -5, faith: 5 }, log: 'You guided the exodus toward the Sangam Council.' },
    ],
    weight: 9,
  },
  {
    id: 'tiger-corridor',
    title: 'The Striped Border',
    text: 'A Bengal tiger claims the forest path to your eastern trade route. The Vanara tribes say she is a guardian, not a pest.',
    choices: [
      { text: 'Declare the path a sacred corridor', effects: { faith: 10, food: -5 }, log: 'Trade slowed, but the forest breathed easier.' },
      { text: 'Build a fortified bypass', effects: { tech: 5, unity: 5, water: -5 }, log: 'Engineers carved a new road through rock.' },
      { text: 'Hunt the tiger to secure the route', effects: { food: 5, faith: -15, unity: -10 }, log: 'The kill fed many but angered the forest tribes.' },
    ],
    weight: 7,
  },
  {
    id: 'solar-eclipse',
    title: 'Rahu\'s Shadow',
    text: 'A total eclipse darkens the sky. Old fears resurface. Some say it is an omen; others check their instruments.',
    choices: [
      { text: 'Hold a unity gathering at the shrine', effects: { faith: 12, unity: 8 }, log: 'Stories were shared until the light returned.' },
      { text: 'Use the darkness for a covert expedition', effects: { tech: 8 }, log: 'Scouts reached a rival cache unseen.' },
      { text: 'Lock down the bastion until it passes', effects: { unity: -5, water: 2 }, log: 'Fear kept people indoors; little was accomplished.' },
    ],
    weight: 6,
  },
  {
    id: 'spice-war',
    title: 'The Pepper Road Dispute',
    text: 'Mirage Caravans and Vanara tribes clash over a spice grove. Your bastion sits between them.',
    choices: [
      { text: 'Mediate a shared harvest treaty', effects: { unity: 12, food: 8 }, log: 'A new trade pact was inked in turmeric and salt.' },
      { text: 'Side with the Mirage Caravans', effects: { tech: 5, faith: -8 }, log: 'Desert traders now owe you favors.' },
      { text: 'Seize the grove for your people', effects: { food: 15, unity: -15 }, log: 'You took the grove by force. Neighbors remember.' },
    ],
    weight: 8,
    requiresFactions: ['mirage', 'vanara'],
  },
  {
    id: 'archive-discovery',
    title: 'The Floodproof Library',
    text: 'Divers surface with waterproof cases — pre-Sundering agricultural records in a dozen languages.',
    choices: [
      { text: 'Share copies with all factions', effects: { unity: 20, tech: 5 }, log: 'Knowledge flowed like monsoon water.' },
      { text: 'Study them in secret', effects: { tech: 18, unity: -12 }, log: 'Your fields improved; neighbors grew suspicious.' },
      { text: 'Burn heretical sections, keep the rest', effects: { faith: 10, tech: 8, unity: -5 }, log: 'The Akhand League praised your discernment.' },
    ],
    weight: 7,
  },
  {
    id: 'cholera',
    title: 'The Blue Death',
    text: 'Contaminated water spreads sickness. The healers work without sleep. Burial grounds fill.',
    choices: [
      { text: 'Quarantine and purify all water sources', effects: { water: -10, unity: 5, faith: 5 }, log: 'Strict measures halted the outbreak.' },
      { text: 'Pray and treat with traditional medicine', effects: { faith: 10, food: -8 }, log: 'Faith and herbs saved some; others were lost.' },
      { text: 'Appeal to Vardhaki for filtration tech', effects: { tech: 5, unity: -5 }, log: 'Engineers delivered ceramic filters at a price.' },
    ],
    weight: 9,
  },
  {
    id: 'festival',
    title: 'Diwali in the Dark',
    text: 'Despite everything, people want light. Someone has hoarded oil for lamps. The children wait.',
    choices: [
      { text: 'Hold a grand festival — morale above all', effects: { unity: 18, faith: 10, food: -8, water: -3 }, log: 'Lamps burned bright against the long night.' },
      { text: 'A modest ceremony only', effects: { unity: 8, faith: 5 }, log: 'A quiet Diwali reminded people they endure.' },
      { text: 'Forbid festivals — resources are scarce', effects: { unity: -15, food: 5 }, log: 'The bastion grew colder than the season.' },
    ],
    weight: 8,
  },
  {
    id: 'earthquake',
    title: 'The Earth Remembers',
    text: 'The ground shudders. A cliffside section of your walls crumbles. Dust hangs like a second sky.',
    choices: [
      { text: 'Mobilize everyone to rebuild', effects: { unity: 10, food: -10, water: -5 }, log: 'Hands together raised the walls again.' },
      { text: 'Prioritize the water system', effects: { water: -8, tech: 3 }, log: 'Pipes were saved; walls wait.' },
      { text: 'Evacuate to open ground', effects: { unity: 5, faith: 5, food: -5 }, log: 'No one died; much was lost.' },
    ],
    weight: 7,
  },
  {
    id: 'radio-signal',
    title: 'A Voice from Kolkata',
    text: 'Your heliograph picks up a repeating signal — coordinates and a plea in Bengali, Hindi, and English.',
    choices: [
      { text: 'Send an expedition immediately', effects: { unity: 5, food: -8, water: -5 }, log: 'The expedition found survivors and stories.' },
      { text: 'Relay the signal to other factions', effects: { unity: 15, tech: 3 }, log: 'A network of hope flickered to life.' },
      { text: 'Ignore it — we have our own crises', effects: { unity: -8 }, log: 'The signal faded. Some never forgave the silence.' },
    ],
    weight: 6,
    requiresBuilding: 'watchtower',
  },
  {
    id: 'seed-vault',
    title: 'Seeds of the Old World',
    text: 'Vanara scouts offer access to a hidden seed vault — thousands of heirloom varieties, one-time entry.',
    choices: [
      { text: 'Accept and plant diverse crops', effects: { food: 20, faith: 5 }, log: 'Fields bloomed with colors lost for decades.' },
      { text: 'Decline — your strains are adapted now', effects: { unity: 5, tech: 3 }, log: 'You trusted the land you had shaped.' },
      { text: 'Demand permanent access by force', effects: { food: 10, unity: -20, faith: -10 }, log: 'You took seeds and made enemies of the forest.' },
    ],
    weight: 7,
  },
  {
    id: 'border-skirmish',
    title: 'Lines in the Dust',
    text: 'Sangam patrols cross into your claimed territory. They say the river has shifted; borders must shift too.',
    choices: [
      { text: 'Negotiate new boundaries', effects: { unity: 10, water: 5 }, log: 'Maps were redrawn in goodwill.' },
      { text: 'Stand firm — this land is ours', effects: { unity: -10, food: 5 }, log: 'Blood was spilled over a dry creek bed.' },
      { text: 'Offer a joint irrigation project', effects: { water: 12, tech: 5, food: -5 }, log: 'Shared water united former rivals.' },
    ],
    weight: 8,
  },
  {
    id: 'comet',
    title: 'The Wandering Star',
    text: 'A comet blazes across the monsoon sky. Astrologers and scientists argue late into the night.',
    choices: [
      { text: 'Fund scientific observation', effects: { tech: 12, faith: -3 }, log: 'Orbital data was recorded for the first time in years.' },
      { text: 'Treat it as a spiritual sign', effects: { faith: 15, unity: 5 }, log: 'Pilgrims came from distant bastions.' },
      { text: 'Both — science and faith in dialogue', effects: { tech: 6, faith: 6, unity: 8 }, log: 'A new kind of council was born under the comet.' },
    ],
    weight: 5,
  },
  {
    id: 'blackout',
    title: 'The Grid Dies Again',
    text: 'Your salvaged power network fails. Medicines warm in broken fridges. The workshop falls silent.',
    choices: [
      { text: 'Emergency repairs — all hands', effects: { tech: 8, food: -8 }, log: 'Power returned after three dark days.' },
      { text: 'Transition to manual methods', effects: { faith: 5, unity: 8, tech: -5 }, log: 'The community learned to live without current.' },
      { text: 'Trade food for Vardhaki capacitors', effects: { tech: 15, food: -12 }, log: 'Engineers sold salvation at a steep price.' },
    ],
    weight: 7,
  },
];

export const EXPLORE_OUTCOMES = [
  { text: 'Scouts found an abandoned ashram with intact water filters.', effects: { water: 8, faith: 3 } },
  { text: 'A caravan of Mirage traders offered fair exchange.', effects: { food: 6, tech: 4 } },
  { text: 'Ruins yielded copper wire and solar cells.', effects: { tech: 10 } },
  { text: 'Wild millet fields discovered in a hidden valley.', effects: { food: 12 } },
  { text: 'Scouts were turned back by territorial wildlife.', effects: { unity: -3, food: -3 } },
  { text: 'A pre-Sundering mural depicting the old cities — morale soared.', effects: { unity: 8, faith: 5 } },
  { text: 'Contaminated ground — two scouts fell ill.', effects: { water: -5, unity: -5 } },
  { text: 'Contact made with a distant Himalayan relay station.', effects: { unity: 10, tech: 5 } },
];

export const LORE_TEXT = `
<p><strong>The Great Sundering (2044)</strong> — A convergence of climate collapse, water wars, and the fracturing of the old union. The monsoons failed for three years. The Himalayas shed glaciers like skin. Mumbai, Chennai, and Kolkata drowned or were abandoned. What remained was called <em>Bharat-That-Was</em>.</p>

<p><strong>The Pralay Years (2044–2060)</strong> — Sanskrit for dissolution. Populations halved. Languages persisted; borders did not. The Thar swallowed Rajasthan. The Ganga shifted course a dozen times. Faith and science, once opposed, became survival tools.</p>

<p><strong>The Reclamation (2060–present)</strong> — Small bastions rose: fortified towns, river confederacies, forest sanctuaries. You are a <em>Samskarak</em> — a rebuilder. Your choices shape whether Bharat becomes a federation of free communes, a technocratic restoration, a spiritual renewal, or fades into scattered camps.</p>

<p><strong>Factions</strong> — The Sangam Council controls waterways. Vardhaki Engineers hoard knowledge. The Akhand Dharmic League unites temples and mosques and gurudwaras in common cause. Vanara tribes guard the Ghats. Mirage Caravans rule the desert trade.</p>

<p><strong>Your Role</strong> — Survive monsoon cycles. Balance water, food, faith, technology, and unity. Expand territory. Navigate events drawn from the subcontinent's geography and culture. Reach one of several endings before the cycles run out or your bastion collapses.</p>
`;
