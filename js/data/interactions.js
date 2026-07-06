export const INTERACTABLES = [
  {
    id: 'chai-wallah',
    name: 'Raju — Chai Wallah',
    position: [10, 0, -6],
    type: 'npc',
    dialogue: [
      'Namaste, wanderer. Cutting chai is five salvage chips. Best on Colaba Causeway.',
      'Marine Drive floods every monsoon now. We serve from this stall since the Sundering.',
      'Mirage Caravans passed at dawn — headed toward the old Bandra reclamation.',
    ],
  },
  {
    id: 'engineer',
    name: 'Dr. Meera — Vardhaki',
    position: [-18, 0, 14],
    type: 'npc',
    dialogue: [
      'CST station ran on tidal power once. Victoria Terminus — they called it UNESCO heritage.',
      'I salvage circuit maps from flooded first-class compartments below platform three.',
      'The flyover still stands. I dream of linking solar grids across the seven islands again.',
    ],
  },
  {
    id: 'shrine',
    name: 'Siddhivinayak Ruins',
    position: [0, 0, 24],
    type: 'object',
    dialogue: [
      'A Ganesh murti half-buried in rubble — trunk raised in blessing amid the dust.',
      'Marigold garlands dry on rusted railings. Someone still leaves modaks every Tuesday.',
      'Faith outlasted the sea walls. Mumbai prays even when the city drowns.',
    ],
  },
  {
    id: 'metro',
    name: 'Flooded Metro — Line 3',
    position: [-8, 0, -20],
    type: 'object',
    dialogue: [
      'Escalators vanish into Arabian Sea backwash. This was meant to link Colaba to SEEPZ.',
      'Scavengers dive for sealed server racks in the tunnels — pre-Sundering data.',
      "A child's chalk drawing on the wall: home is up.",
    ],
  },
  {
    id: 'rickshaw',
    name: 'Abandoned Auto-Rickshaw',
    position: [18, 0, 2],
    type: 'vehicle',
    dialogue: [
      'Green and yellow — the last colours of old Mumbai. Engine stripped for solar parts.',
      'Inside: a cassette labelled Bollywood Hits 2039. The city had a soundtrack.',
      'From here you can see the Gateway ruins. Tourists came from everywhere once.',
    ],
  },
  {
    id: 'vendor',
    name: 'Lakshmi — Spice Vendor',
    position: [-14, 0, -14],
    type: 'npc',
    dialogue: [
      'Malvani masala, Kashmiri chilli, Konkan kokum — flavours of a united Bharat.',
      'Dharavi lane still grows herbs on terrace plots. Best turmeric in the wasteland.',
      'Take this pouch. On hard days, taste is memory.',
    ],
    action: { type: 'item', name: 'Spice Pouch', log: 'Received Spice Pouch from Lakshmi.' },
  },
  {
    id: 'watchtower',
    name: 'Marine Drive Watchtower',
    position: [28, 0, -26],
    type: 'object',
    dialogue: [
      'Heliograph signals bounce off Art Deco facades — someone is calling from Worli.',
      'The Queen\'s Necklace used to glitter with car headlights. Now only salvage lanterns.',
      'You note the Morse pattern. Mumbai is fractured, but not silent.',
    ],
  },
  {
    id: 'tiger-mural',
    name: 'Tiger Corridor Mural — Dharavi',
    position: [-24, 0, 6],
    type: 'object',
    dialogue: [
      'A Bengal tiger painted across chawl brick — Sanjay Gandhi National Park remembers.',
      'Vanara mark: share the lane with the forest. The slum and jungle made a treaty.',
      'Real tigers were spotted near Aarey colony last year. The wild reclaims what we left.',
    ],
  },
];

export const ZONES = [
  { name: 'Marine Drive', x: 0, z: -18, radius: 18 },
  { name: 'Colaba Causeway', x: 10, z: -8, radius: 12 },
  { name: 'Gateway Quarter', x: -6, z: -30, radius: 10 },
  { name: 'Dharavi Lane', x: -24, z: 10, radius: 14 },
  { name: 'CST Station Ruins', x: 20, z: 24, radius: 12 },
  { name: 'Temple Quarter', x: 0, z: 24, radius: 10 },
  { name: 'Art Deco Row', x: 24, z: -6, radius: 12 },
];

export function getZoneAt(x, z) {
  for (const zone of ZONES) {
    const dx = x - zone.x;
    const dz = z - zone.z;
    if (dx * dx + dz * dz < zone.radius * zone.radius) return zone.name;
  }
  if (z < -32) return 'Arabian Sea Promenade';
  return 'Seven Islands Wasteland';
}
