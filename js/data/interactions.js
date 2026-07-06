export const INTERACTABLES = [
  {
    id: 'chai-wallah',
    name: 'Raju — Chai Wallah',
    position: [12, 0, -8],
    type: 'npc',
    color: 0xff6b35,
    dialogue: [
      'Namaste, wanderer. Rupee chai is five salvage chips. Best in the bazaar.',
      'The monsoon broke three years running. We adapt — masala never fails.',
      'Saw Mirage Caravans head east at dawn. They trade water for copper wire.',
    ],
  },
  {
    id: 'engineer',
    name: 'Dr. Meera — Vardhaki',
    position: [-18, 0, 14],
    type: 'npc',
    color: 0x4ecdc4,
    dialogue: [
      'This grid ran on tidal power once. Mumbai slept with lights on. Imagine.',
      'I can teach you to read old circuit maps — if you bring me capacitor cells.',
      'The Sangam Council wants my filters. I want independence. Typical politics.',
    ],
  },
  {
    id: 'shrine',
    name: 'Memory Shrine',
    position: [0, 0, 22],
    type: 'object',
    color: 0xf4c430,
    dialogue: [
      'Names carved into salvaged marble — thousands who did not survive the Sundering.',
      'You light a diya. The flame reflects in cracked glass. Someone whispers a prayer.',
      'Faith is not escape here. It is how we remember who we were.',
    ],
  },
  {
    id: 'metro',
    name: 'Flooded Metro Entrance',
    position: [-8, 0, -22],
    type: 'object',
    color: 0x6b8cae,
    dialogue: [
      'Stairs descend into black water. Emergency lights still blink below.',
      'Scavengers say sealed train cars hold pre-Sundering data drives.',
      'A child's chalk drawing on the wall: "home is up".',
    ],
  },
  {
    id: 'rickshaw',
    name: 'Abandoned Auto-Rickshaw',
    position: [22, 0, 6],
    type: 'vehicle',
    color: 0x2ecc71,
    dialogue: [
      'Green and yellow paint peeled by salt wind. Engine gutted for parts.',
      'Inside: a cassette labelled "Bollywood Hits 2039". The past has a soundtrack.',
      'You could restore it someday. For now, it is shelter from the dust.',
    ],
  },
  {
    id: 'vendor',
    name: 'Lakshmi — Spice Vendor',
    position: [-14, 0, -16],
    type: 'npc',
    color: 0xe056fd,
    dialogue: [
      'Turmeric, dried chilli, black cardamom — the old world in small bags.',
      'Vanara tribes guard the Ghats seeds. I trade stories for samples.',
      'Take this pouch. On hard days, flavour is medicine.',
    ],
    action: { type: 'item', name: 'Spice Pouch', log: 'Received Spice Pouch from Lakshmi.' },
  },
  {
    id: 'watchtower',
    name: 'Signal Watchtower',
    position: [28, 0, -20],
    type: 'object',
    color: 0xff9f43,
    dialogue: [
      'Heliograph mirrors catch the sunset. Someone is signalling from the Deccan ridge.',
      'Coordinates blink in Morse — survivors requesting medicine.',
      'You note the pattern. The wasteland is not as empty as it seems.',
    ],
  },
  {
    id: 'tiger-mural',
    name: 'Tiger Corridor Mural',
    position: [-24, 0, 4],
    type: 'object',
    color: 0xe67e22,
    dialogue: [
      'A painted Bengal tiger spans the wall — stripes glowing under UV salvage paint.',
      'Vanara mark: this street is shared with the forest. Do not hunt here.',
      'The city and jungle negotiate borders in colour and myth.',
    ],
  },
];

export const ZONES = [
  { name: 'Navi Ruins', x: 0, z: 0, radius: 25 },
  { name: 'Bazaar Row', x: 12, z: -8, radius: 12 },
  { name: 'Metro Sink', x: -8, z: -22, radius: 10 },
  { name: 'Temple Quarter', x: 0, z: 22, radius: 12 },
  { name: 'Engineer\'s End', x: -18, z: 14, radius: 10 },
];

export function getZoneAt(x, z) {
  for (const zone of ZONES) {
    const dx = x - zone.x;
    const dz = z - zone.z;
    if (dx * dx + dz * dz < zone.radius * zone.radius) return zone.name;
  }
  return 'Wasteland Edge';
}
