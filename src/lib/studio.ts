export const STUDIO = {
  name: "Halden Rowe",
  descriptor: "Interior Architecture & Design",
  email: "studio@haldenrowe.com.au",
  phone: "+61 2 9360 4410",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "61412345678",
  address: ["14 Glenmore Lane", "Paddington NSW 2021"],
  coords: "33.8847° S, 151.2264° E",
};

export function waLink(text: string) {
  return `https://wa.me/${STUDIO.whatsapp}?text=${encodeURIComponent(text)}`;
}

export const IMG = {
  living: "/images/hero-living.jpg",
  kitchen: "/images/kitchen.jpg",
  bathroom: "/images/bathroom.jpg",
  bedroom: "/images/bedroom.jpg",
  restaurant: "/images/restaurant.jpg",
  materials: "/images/materials.jpg",
  studio: "/images/studio.jpg",
  bush: "/images/bush-house.jpg",
  apartment: "/images/apartment.jpg",
  detail: "/images/detail.jpg",
} as const;

export type Project = {
  slug: string;
  title: string;
  place: string;
  state: string;
  year: number;
  type: "Residential" | "Hospitality" | "Apartment" | "Retreat";
  area: number;
  cover: string;
  position?: string;
  blurb: string;
  story: string[];
  materials: string[];
  palette: string[];
  gallery: { src: string; caption: string; position?: string }[];
  direction: string;
  brief: string;
};

export const projects: Project[] = [
  {
    slug: "salt-house",
    title: "Salt House",
    place: "Bronte",
    state: "NSW",
    year: 2024,
    type: "Residential",
    area: 320,
    cover: IMG.living,
    position: "30% 50%",
    blurb: "A family home that bends toward the Pacific, softened by hand-trowelled plaster and constant, shifting light.",
    brief:
      "A young family left a dark 1970s brick home for the headland. They asked for calm — somewhere to put their phones down.",
    story: [
      "Salt House began with a single instruction: remove everything that shouts. We stripped the original brick box back to its structure, then re-drew its edges as curves — walls that turn corners the way a wave does.",
      "Every surface was chosen to hold light rather than reflect it. Limewashed plaster by a Marrickville artisan, fumed oak floors, a travertine table cut from a single block. Linen curtains the length of the room let the afternoon move through like breath.",
      "The result is a house that changes with the hour. At seven it is pearl; at five it is honey. The family says they now eat dinner by the window, just to watch it happen.",
    ],
    materials: ["Limewashed plaster", "Honed travertine", "Fumed oak", "Belgian linen"],
    palette: ["#E8DCC6", "#C9B79C", "#8A7355", "#2A211A"],
    gallery: [
      { src: IMG.bedroom, caption: "Principal suite — washed linen, rammed earth, a single ceramic lamp", position: "50% 60%" },
      { src: IMG.bathroom, caption: "Bath hall — carved stone in a tadelakt cave", position: "50% 70%" },
      { src: IMG.detail, caption: "Entry plinth — banksia against ochre limewash", position: "50% 40%" },
    ],
    direction: "plaster",
  },
  {
    slug: "gum-ridge",
    title: "Gum Ridge",
    place: "Kangaroo Valley",
    state: "NSW",
    year: 2023,
    type: "Retreat",
    area: 410,
    cover: IMG.bush,
    position: "50% 50%",
    blurb: "A concrete and blackbutt pavilion that disappears into the canopy — a house for listening to weather.",
    brief:
      "Two architects, tired of the city, wanted a weekender that felt less like a house and more like a clearing.",
    story: [
      "Gum Ridge sits on a fold of escarpment, with the eucalypts close enough to touch. Our job was to make the interior as quiet as the forest: nothing decorative, nothing that competes with the view.",
      "Board-formed concrete carries the memory of the timber that shaped it. Blackbutt, harvested within 200 km of the site, warms the ceilings. A stone hearth anchors the living room; low linen seating keeps eyelines open to the trees.",
      "On misty mornings the glass dissolves and the room becomes an extension of the valley.",
    ],
    materials: ["Board-formed concrete", "Blackbutt", "Bluestone", "Boiled wool"],
    palette: ["#9AA38F", "#6C6F5C", "#3A3A30", "#1D1F1A"],
    gallery: [
      { src: IMG.kitchen, caption: "Kitchen — spotted gum and honed limestone", position: "50% 50%" },
      { src: IMG.bedroom, caption: "Guest room — earth walls, morning paddock light", position: "50% 40%" },
      { src: IMG.detail, caption: "Hall detail — a plinth of rough-cut stone", position: "50% 55%" },
    ],
    direction: "bush",
  },
  {
    slug: "banksia-lane",
    title: "Banksia Lane",
    place: "Mornington Peninsula",
    state: "VIC",
    year: 2024,
    type: "Residential",
    area: 260,
    cover: IMG.kitchen,
    position: "50% 50%",
    blurb: "A kitchen in dark spotted gum and pale limestone, built for long lunches and slow Sundays.",
    brief:
      "A couple who cook for twenty on weekends needed a kitchen that could host without ever feeling like a showroom.",
    story: [
      "We started with the table, not the cabinetry. Everything in Banksia Lane bends toward the long communal bench: a slab of honed limestone with room for twelve elbows.",
      "Spotted gum — stained deep, almost black — wraps the joinery and gives the room its gravity. Aged brass tapware will patina with every meal. An arched window frames a single gum tree, which is the only artwork the room needs.",
      "It is a kitchen that gets better with grease and wine and age.",
    ],
    materials: ["Spotted gum", "Honed limestone", "Aged brass", "Washed linen"],
    palette: ["#D8CBB3", "#9A7A54", "#4A3322", "#1E1510"],
    gallery: [
      { src: IMG.living, caption: "Open living room — a quiet counterpoint to the kitchen", position: "70% 50%" },
      { src: IMG.detail, caption: "Dining detail — dried banksia, always", position: "50% 40%" },
      { src: IMG.apartment, caption: "Hallway — the long walk to lunch", position: "50% 50%" },
    ],
    direction: "bush",
  },
  {
    slug: "ember",
    title: "Ember",
    place: "Fitzroy",
    state: "VIC",
    year: 2023,
    type: "Hospitality",
    area: 180,
    cover: IMG.restaurant,
    position: "50% 55%",
    blurb: "A sixty-four seat restaurant where the banquette curves like a hand around every table.",
    brief:
      "A chef with a wood-fire menu wanted a room that felt like the end of a long day — amber, close, unhurried.",
    story: [
      "Ember is designed to be seen at 8 pm. Warm sconces, plaster that drinks light, and an ochre velvet banquette that wraps the room in a single sweeping curve.",
      "Terrazzo underfoot uses crushed terracotta from the building's original floor. Travertine tabletops are cut so each one shows a different vein. Nothing is perfectly matched: every table is slightly different, the way every night is.",
      "The restaurant has been full since opening week; the banquette has since become the most photographed seat in Fitzroy.",
    ],
    materials: ["Terrazzo", "Ochre velvet", "Travertine", "Limewashed plaster"],
    palette: ["#B8893C", "#8C4A2A", "#4B2A1C", "#1B120D"],
    gallery: [
      { src: IMG.apartment, caption: "Entry passage — arches that slow the pace", position: "50% 55%" },
      { src: IMG.detail, caption: "Bar-end detail — stone and dried natives", position: "50% 50%" },
      { src: IMG.bathroom, caption: "Powder room — a carved stone basin", position: "50% 65%" },
    ],
    direction: "dusk",
  },
  {
    slug: "arcade-apartment",
    title: "Arcade Apartment",
    place: "Potts Point",
    state: "NSW",
    year: 2022,
    type: "Apartment",
    area: 135,
    cover: IMG.apartment,
    position: "50% 55%",
    blurb: "A 1930s Art Deco apartment re-sequenced through arches — a procession of rooms, each a little surprise.",
    brief:
      "A gallerist inherited a tired deco flat and wanted a home that could hold art without feeling like a gallery.",
    story: [
      "The original floorplan was a corridor with rooms hanging off it. We kept the corridor and made it the hero: a series of arched thresholds that frame each space like a painting.",
      "Limewash gives the walls a chalky depth; terrazzo gives the floor its rhythm. Plinths — each lit from above — are left empty or filled depending on the season.",
      "It is an apartment that rewards walking.",
    ],
    materials: ["Limewash", "Terrazzo", "Hand-thrown ceramic", "American walnut"],
    palette: ["#EADFCB", "#CDBB9B", "#8E6F4A", "#2C2118"],
    gallery: [
      { src: IMG.detail, caption: "Plinth — an ever-changing still life", position: "50% 50%" },
      { src: IMG.bathroom, caption: "Bathroom — carved stone and a single brass tap", position: "50% 70%" },
      { src: IMG.bedroom, caption: "Bedroom — linen and earth", position: "50% 50%" },
    ],
    direction: "dusk",
  },
  {
    slug: "clay-house",
    title: "Clay House",
    place: "Byron Bay",
    state: "NSW",
    year: 2025,
    type: "Retreat",
    area: 290,
    cover: IMG.bathroom,
    position: "50% 60%",
    blurb: "A hinterland retreat built around a single carved-stone bath and one beam of morning light.",
    brief:
      "A wellness founder wanted a home that felt like being inside a warm, hollowed stone — somewhere to exhale.",
    story: [
      "Clay House has no sharp corners. Every wall is tadelakt — a Moroccan lime plaster, burnished by hand with river stones until it glows like skin. The colour is local clay, mixed on site.",
      "In the bath hall, a single skylight lets a blade of sun slide down the wall across the day. The bath itself was carved from a river boulder by a stonemason in Bangalow.",
      "The house is deliberately dark and warm. It asks you to slow down — and then rewards you for it.",
    ],
    materials: ["Tadelakt", "Terracotta", "River stone", "Aged brass"],
    palette: ["#C77C54", "#A4532F", "#5B2F1D", "#1C120D"],
    gallery: [
      { src: IMG.bedroom, caption: "Bedroom — warm earth and washed linen", position: "50% 55%" },
      { src: IMG.detail, caption: "Landing — ochre limewash, banksia", position: "50% 45%" },
      { src: IMG.living, caption: "Lounge — the one bright room, facing the sea", position: "60% 50%" },
    ],
    direction: "terra",
  },
];

export type Direction = {
  id: string;
  name: string;
  line: string;
  description: string;
  materials: string[];
  palette: string[];
  image: string;
  position?: string;
  project: string;
  services: string[];
};

export const directions: Record<string, Direction> = {
  plaster: {
    id: "plaster",
    name: "Plaster & Light",
    line: "Calm, curved, sun-washed",
    description:
      "Soft architecture, hand-finished walls and linen that moves. Rooms that quietly change colour through the day — pale at dawn, honey at dusk.",
    materials: ["Limewashed plaster", "Honed travertine", "Fumed oak", "Belgian linen"],
    palette: ["#E8DCC6", "#C9B79C", "#8A7355", "#2A211A"],
    image: IMG.living,
    project: "salt-house",
    services: ["Residential Interiors", "Procurement & Styling"],
  },
  bush: {
    id: "bush",
    name: "Bush Modern",
    line: "Timber, stone, and the long view",
    description:
      "Honest materials and low, generous furniture that lets the landscape lead. Darker woods, concrete, wool — nothing that competes with the canopy.",
    materials: ["Spotted gum", "Board-formed concrete", "Honed limestone", "Boiled wool"],
    palette: ["#9AA38F", "#6C6F5C", "#4A3322", "#1D1F1A"],
    image: IMG.bush,
    project: "gum-ridge",
    services: ["Residential Interiors", "Joinery & Furniture"],
  },
  terra: {
    id: "terra",
    name: "Terra",
    line: "Clay, brass, and warm shadow",
    description:
      "Earth-pigmented plasters, burnished surfaces and carved stone. Warm, sensory, a little dark — spaces designed to slow the pulse.",
    materials: ["Tadelakt", "Terracotta", "River stone", "Aged brass"],
    palette: ["#C77C54", "#A4532F", "#5B2F1D", "#1C120D"],
    image: IMG.bathroom,
    position: "50% 60%",
    project: "clay-house",
    services: ["Residential Interiors", "Joinery & Furniture"],
  },
  dusk: {
    id: "dusk",
    name: "Dusk",
    line: "Layered, convivial, after-dark",
    description:
      "Velvet, terrazzo and arches; rooms that glow in amber and reward a slow walk. Perfect for homes that host and venues that linger.",
    materials: ["Terrazzo", "Ochre velvet", "Travertine", "American walnut"],
    palette: ["#B8893C", "#8C4A2A", "#4B2A1C", "#1B120D"],
    image: IMG.restaurant,
    project: "ember",
    services: ["Hospitality & Retail", "Renovation & Planning"],
  },
};

export type Mood = { id: string; label: string; image: string; position?: string; weights: Record<string, number> };

export const moods: Mood[] = [
  { id: "plaster", label: "Plaster & light", image: IMG.living, position: "30% 50%", weights: { plaster: 3, terra: 1 } },
  { id: "timber", label: "Timber & shadow", image: IMG.kitchen, weights: { bush: 3, dusk: 1 } },
  { id: "clay", label: "Clay & warmth", image: IMG.bathroom, position: "50% 60%", weights: { terra: 3, dusk: 1 } },
  { id: "linen", label: "Linen & quiet", image: IMG.bedroom, position: "50% 50%", weights: { plaster: 2, terra: 1, bush: 1 } },
  { id: "velvet", label: "Velvet & dusk", image: IMG.restaurant, position: "50% 55%", weights: { dusk: 3, terra: 1 } },
  { id: "arch", label: "Arches & art", image: IMG.apartment, position: "50% 55%", weights: { dusk: 2, plaster: 2 } },
  { id: "gum", label: "Gum & concrete", image: IMG.bush, weights: { bush: 3 } },
  { id: "still", label: "Dried & still", image: IMG.detail, position: "50% 45%", weights: { terra: 2, plaster: 1, dusk: 1 } },
];

export function pickDirection(selected: string[]): Direction {
  const score: Record<string, number> = { plaster: 0, bush: 0, terra: 0, dusk: 0 };
  for (const id of selected) {
    const m = moods.find((x) => x.id === id);
    if (!m) continue;
    for (const [k, v] of Object.entries(m.weights)) score[k] += v;
  }
  const top = Object.entries(score).sort((a, b) => b[1] - a[1])[0];
  return directions[top[1] === 0 ? "plaster" : top[0]];
}

export const services = [
  {
    n: "01",
    title: "Residential Interiors",
    kind: "home",
    text: "Whole-home design for new builds and considered renovations — from spatial planning to the last lamp.",
    from: "Design from $9,500",
    image: IMG.living,
    position: "30% 50%",
  },
  {
    n: "02",
    title: "Renovation & Planning",
    kind: "renovation",
    text: "Re-working the bones of an existing home: layout, light, services and joinery — in step with your architect and builder.",
    from: "Design from $9,500",
    image: IMG.apartment,
    position: "50% 55%",
  },
  {
    n: "03",
    title: "Hospitality & Retail",
    kind: "hospitality",
    text: "Restaurants, bars, hotels and boutiques designed to be remembered — and to trade beautifully.",
    from: "Design from $16,000",
    image: IMG.restaurant,
    position: "50% 55%",
  },
  {
    n: "04",
    title: "Joinery & Furniture",
    kind: "home",
    text: "Bespoke kitchens, wardrobes and pieces made by Australian craftspeople we have worked with for a decade.",
    from: "Per commission",
    image: IMG.kitchen,
    position: "50% 50%",
  },
  {
    n: "05",
    title: "Procurement & Styling",
    kind: "home",
    text: "A curated edit: furniture, art, lighting and textiles sourced and styled to finish a room. Day-rate from $1,800.",
    from: "From $1,800 / day",
    image: IMG.detail,
    position: "50% 45%",
  },
];

export const processSteps = [
  {
    n: "I",
    title: "Listen",
    text: "A long, unhurried conversation — about how you live, what you love, and what quietly irritates you about your home. We walk the site, take measurements, and gather references.",
    meta: "Week 0–2",
  },
  {
    n: "II",
    title: "Imagine",
    text: "A concept presented as a story: mood, materials, layouts, and a first set of sketches. Expect real samples on the table, not a screen of renders.",
    meta: "Week 2–8",
  },
  {
    n: "III",
    title: "Resolve",
    text: "Every joint, switch and shadow gap drawn and documented. We coordinate with your architect, engineer and builder, and tender with trusted makers.",
    meta: "Month 2–5",
  },
  {
    n: "IV",
    title: "Deliver",
    text: "We stay with the project on site until the last cushion is plumped. Then we photograph it, and hand you the keys.",
    meta: "Month 5–14",
  },
];

export const locationsList = [
  "Bondi", "Byron Bay", "Mornington Peninsula", "Southern Highlands", "Noosa", "Hobart", "Fitzroy", "Potts Point", "Kangaroo Valley", "Bronte",
];
