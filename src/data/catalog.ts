import type {
  Artisan,
  Craft,
  ImageAsset,
  JournalEntry,
  NavLink,
  Product,
  Region,
} from "../types/catalog";
import { localImage, pexelsImage } from "../lib/media";

/**
 * DEMO CATALOGUE
 *
 * Every record in this file is `source: "demo"`.
 * Names, quotes, prices, lead times and biographies are art direction for the
 * landing page. They must not ship as marketplace facts.
 *
 * Photography: local plates are studio studies. Remote Pexels plates are
 * compositional placeholders — replace with commissioned masters before launch.
 */

const DEMO = "demo" as const;

/* ==========================================================================
   Photography
   ========================================================================== */

const silkFallback = pexelsImage(4938321, "Folds of pleated silk in low light.", 4480, 6720, {
  credit: "Karola G / Kaboompics",
});

export const heroImage: ImageAsset = localImage(
  "hero.jpg",
  "Folds of madder-red Banarasi silk brocade, woven with fine zari motifs, catching low afternoon light.",
  1568,
  882,
  { fallback: silkFallback }
);

const kutchStock = pexelsImage(36794177, "Close view of traditional Kutch embroidery.", 6000, 4000, {
  credit: "Ds Babariya",
});

export const kutchPanel = localImage(
  "kutch-panel.jpg",
  "A Rabari embroidered panel from Kutch: geometric chain stitch in madder, indigo and ochre around small mirrors, on black cotton.",
  1200,
  1500,
  { fallback: kutchStock }
);

export const kutchDetail = localImage(
  "kutch-detail.jpg",
  "Macro detail of chain stitch and interlacing holding a small round mirror in place.",
  1200,
  1500,
  { fallback: kutchStock }
);

export const materialImage = localImage(
  "material-silk.jpg",
  "A loose skein of raw, undyed mulberry silk resting on pale limestone.",
  1200,
  1500,
  { fallback: pexelsImage(8465948, "Cream silk with a soft drape.", 6016, 4000) }
);

/** Intro figure — a local plate, not a remote placeholder. */
export const introFigure = materialImage;

export const madhubaniPainting = localImage(
  "product-madhubani.jpg",
  "An original Mithila kohbar painting in the kachni line style: lotus pond, peacocks, sun and moon, on handmade paper.",
  1200,
  1500
);

export const pashminaDetail = localImage(
  "pashmina-detail.jpg",
  "Macro of undyed oatmeal pashmina in a fine twill, with a hand-knotted fringe.",
  1200,
  1500
);

export const makerDetail = pexelsImage(
  6634606,
  "Hands cutting a finished thread from the warp of a handloom.",
  6720,
  4480,
  { credit: "Karola G / Kaboompics", kind: "field" }
);

/* ==========================================================================
   Regions
   ========================================================================== */

export const regions: Region[] = [
  { id: "banaras", place: "Banaras", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739 },
  { id: "kutch", place: "Kutch", state: "Gujarat", lat: 23.242, lng: 69.6669 },
  { id: "channapatna", place: "Channapatna", state: "Karnataka", lat: 12.6518, lng: 77.2086 },
  { id: "srinagar", place: "Srinagar", state: "Kashmir", lat: 34.0837, lng: 74.7973 },
  { id: "madhubani", place: "Madhubani", state: "Bihar", lat: 26.3538, lng: 86.071 },
  { id: "pedana", place: "Pedana", state: "Andhra Pradesh", lat: 16.2553, lng: 81.1444 },
];

/* ==========================================================================
   Crafts — the atlas
   ========================================================================== */

export const crafts: Craft[] = [
  {
    id: "banarasi",
    source: DEMO,
    place: "Banaras",
    name: "Banarasi brocade",
    medium: "Silk",
    category: "Textile",
    regionId: "banaras",
    material: "Katan silk, zari",
    swatch: { name: "Madder", hex: "#8e2f25" },
    note: "Woven on pit looms in the lanes of Sarai Mohana and Madanpura. A single kadhua sari can hold a month of work.",
    image: pexelsImage(28382914, "A weaver working the warp of a wooden handloom by hand.", 6720, 4480, {
      position: "50% 50%",
      credit: "Susheel Parihar",
      kind: "field",
    }),
  },
  {
    id: "kutch",
    source: DEMO,
    place: "Kutch",
    name: "Kutch embroidery",
    medium: "Embroidery",
    category: "Textile",
    regionId: "kutch",
    material: "Cotton, silk thread, mirror",
    swatch: { name: "Terracotta", hex: "#a65a3a" },
    note: "Rabari, Ahir and Jat women each keep a distinct stitch — a signature precise enough to identify a village.",
    image: kutchPanel,
  },
  {
    id: "channapatna",
    source: DEMO,
    place: "Channapatna",
    name: "Channapatna lacquerware",
    medium: "Wood",
    category: "Wood",
    regionId: "channapatna",
    material: "Ivory wood, vegetable lac",
    swatch: { name: "Turmeric", hex: "#c29a3e" },
    note: "Turned on a lathe from soft aale mara wood, then coloured with lac pressed from turmeric, indigo and kumkum.",
    image: pexelsImage(34913184, "Hand-turned, lacquered wooden figurines from Karnataka arranged in rows.", 6067, 4045, {
      position: "50% 50%",
      credit: "atelierbyvineeth",
      kind: "field",
    }),
  },
  {
    id: "pashmina",
    source: DEMO,
    place: "Srinagar",
    name: "Kashmiri pashmina",
    medium: "Pashmina",
    category: "Textile",
    regionId: "srinagar",
    material: "Changthangi goat fibre",
    swatch: { name: "Raw silk", hex: "#d8c8a6" },
    note: "Spun on the yinder, woven on the loom and finished by hand in the old city, along the Jhelum.",
    image: pashminaDetail,
  },
  {
    id: "madhubani",
    source: DEMO,
    place: "Madhubani",
    name: "Mithila painting",
    medium: "Painting",
    category: "Painting",
    regionId: "madhubani",
    material: "Handmade paper, natural pigment",
    swatch: { name: "Vermilion", hex: "#b4432b" },
    note: "Once painted on the mud walls of homes for weddings. Now on paper — the line still drawn with a bamboo nib.",
    image: madhubaniPainting,
  },
  {
    id: "kalamkari",
    source: DEMO,
    place: "Kalamkari",
    name: "Kalamkari",
    medium: "Textile",
    category: "Textile",
    regionId: "pedana",
    material: "Cotton, vegetable dye",
    swatch: { name: "Indigo", hex: "#2b3a67" },
    note: "Carved teak blocks, iron-rust black, myrobalan and alum. Printed, washed in running water, printed again.",
    image: pexelsImage(39180709, "Hand-carved wooden printing blocks laid out on a red cloth.", 4000, 6000, {
      position: "50% 50%",
      credit: "H",
      kind: "field",
    }),
  },
];

/* ==========================================================================
   Artisans
   ========================================================================== */

export const artisans: Artisan[] = [
  {
    id: "abdul-rahim-ansari",
    source: DEMO,
    number: "07",
    name: "Abdul Rahim Ansari",
    pronoun: "his",
    regionId: "banaras",
    craftId: "banarasi",
    village: "Sarai Mohana, Varanasi",
    practice: "Kadhua brocade on katan silk",
    years: 52,
    since: 2023,
    quote: "My father taught me the first knot when I was eight. The loom has been teaching me ever since.",
    bio: [
      "Abdul Rahim weaves in a single room off a lane in Sarai Mohana, at a pit loom his grandfather built. He works in kadhua — each motif woven separately, with its own small shuttle — which is why the back of his cloth is as clean as the front.",
      "He trains two apprentices, both nephews. Every piece he makes for Kārigar is numbered, and carries his name on a slip woven into the selvedge.",
    ],
    plate: "A pit loom in Sarai Mohana, Varanasi.",
    portrait: pexelsImage(
      17777833,
      "A weaver at work on silk at a wooden loom in a Varanasi workshop.",
      6000,
      4000,
      { position: "50% 45%", credit: "Satyabrata Maiti", kind: "field" }
    ),
  },
  {
    id: "hansaben-ahir",
    source: DEMO,
    number: "12",
    name: "Hansaben Ahir",
    pronoun: "her",
    regionId: "kutch",
    craftId: "kutch",
    village: "Dhaneti, Kutch",
    practice: "Ahir embroidery, abhla mirror work",
    years: 34,
    since: 2022,
    quote: "My mother taught me the first stitch when I was eight. I still use her needle for the mirrors.",
  },
  {
    id: "syed-riyaz-pasha",
    source: DEMO,
    number: "19",
    name: "Syed Riyaz Pasha",
    pronoun: "his",
    regionId: "channapatna",
    craftId: "channapatna",
    village: "Channapatna, Ramanagara",
    practice: "Lathe-turned lacquerware",
    years: 27,
    since: 2024,
  },
  {
    id: "ghulam-nabi-dar",
    source: DEMO,
    number: "03",
    name: "Ghulam Nabi Dar",
    pronoun: "his",
    regionId: "srinagar",
    craftId: "pashmina",
    village: "Zaina Kadal, Srinagar",
    practice: "Hand-spun, handwoven pashmina",
    years: 41,
    since: 2022,
  },
  {
    id: "sunita-jha",
    source: DEMO,
    number: "24",
    name: "Sunita Jha",
    pronoun: "her",
    regionId: "madhubani",
    craftId: "madhubani",
    village: "Jitwarpur, Madhubani",
    practice: "Mithila painting, kachni line style",
    years: 22,
    since: 2023,
  },
  {
    id: "p-srinivasulu",
    source: DEMO,
    number: "31",
    name: "P. Srinivasulu",
    pronoun: "his",
    regionId: "pedana",
    craftId: "kalamkari",
    village: "Pedana, Krishna district",
    practice: "Block-printed Kalamkari",
    years: 30,
    since: 2024,
  },
];

export const featuredArtisanId = "abdul-rahim-ansari";

/* ==========================================================================
   Products — objects worth keeping
   ========================================================================== */

export const products: Product[] = [
  {
    id: "banarasi-silk-stole",
    source: DEMO,
    name: "Banarasi Silk Stole",
    price: 8400,
    craftId: "banarasi",
    regionId: "banaras",
    artisanId: "abdul-rahim-ansari",
    material: "Katan silk, antique zari",
    technique: "Kadhua brocade",
    time: "31 days on the loom",
    dimensions: "70 × 200 cm",
    description:
      "Kadhua buti on a madder katan ground, finished with a narrow woven border. Each motif is woven individually, so the reverse is as considered as the face.",
    story: "Woven on the pit loom Abdul Rahim’s grandfather built.",
    images: [
      localImage("product-silk-stole.jpg", "A folded madder-red Banarasi silk stole resting on a travertine block.", 1200, 1600, {
        fallback: silkFallback,
      }),
      localImage("hero.jpg", "Madder Banarasi silk, catching low light.", 1568, 882, { position: "74% 38%" }),
    ],
    availability: { status: "made-to-order", label: "Made to order · 5 weeks" },
  },
  {
    id: "kutch-mirrorwork-panel",
    source: DEMO,
    name: "Kutch Mirrorwork Panel",
    price: 11800,
    craftId: "kutch",
    regionId: "kutch",
    artisanId: "hansaben-ahir",
    material: "Cotton, silk thread, abhla mirror",
    technique: "Chain stitch, interlacing, abhla",
    time: "70 days of evenings",
    dimensions: "48 × 62 cm",
    description:
      "A single panel of chain stitch and interlacing, built outward from one square without a drawing. Signed with a thread of indigo on the reverse.",
    images: [kutchPanel, kutchDetail],
    availability: { status: "one-of-one", label: "One of one" },
  },
  {
    id: "channapatna-horse",
    source: DEMO,
    name: "Channapatna Horse",
    price: 2200,
    craftId: "channapatna",
    regionId: "channapatna",
    artisanId: "syed-riyaz-pasha",
    material: "Aale mara wood, vegetable lac",
    technique: "Lathe-turned lacquer",
    time: "Two days, including drying",
    dimensions: "18 × 7 × 16 cm",
    description:
      "Turned in three parts and finished with turmeric lac while still spinning on the lathe. Safe for small hands; made for adult shelves.",
    images: [
      localImage("product-channapatna.jpg", "A lacquered Channapatna wooden horse in turmeric yellow on a travertine block.", 1200, 1600, {
        fallback: crafts[2].image,
      }),
    ],
    detail: { scale: 1.9, origin: "50% 46%" },
    availability: { status: "ready", label: "Ready to ship" },
  },
  {
    id: "handwoven-pashmina-shawl",
    source: DEMO,
    name: "Handwoven Pashmina Shawl",
    price: 18500,
    craftId: "pashmina",
    regionId: "srinagar",
    artisanId: "ghulam-nabi-dar",
    material: "Hand-spun Changthangi pashmina",
    technique: "Hand-spun, handwoven twill",
    time: "18 days",
    dimensions: "100 × 200 cm",
    description:
      "Undyed, in the natural oatmeal of the fibre. A fine twill that softens over years, finished with a hand-knotted fringe.",
    images: [
      localImage("product-pashmina.jpg", "A folded oatmeal pashmina shawl with a knotted fringe on a travertine block.", 1200, 1600, {
        fallback: pashminaDetail,
      }),
      pashminaDetail,
    ],
    availability: { status: "ready", label: "Ready to ship" },
  },
  {
    id: "madhubani-original-kohbar",
    source: DEMO,
    name: "Madhubani Original, ‘Kohbar’",
    price: 26000,
    craftId: "madhubani",
    regionId: "madhubani",
    artisanId: "sunita-jha",
    material: "Natural pigment on handmade paper",
    technique: "Kachni line, bamboo nib",
    time: "12 days",
    dimensions: "56 × 76 cm",
    description:
      "The kohbar is painted for a wedding chamber: lotus, bamboo, fish, the sun and moon. Drawn in the kachni line style with a bamboo nib.",
    images: [madhubaniPainting],
    detail: { scale: 2.1, origin: "50% 42%" },
    framed: true,
    availability: { status: "one-of-one", label: "One of one · Signed" },
  },
  {
    id: "kalamkari-cotton-throw",
    source: DEMO,
    name: "Kalamkari Cotton Throw",
    price: 6900,
    craftId: "kalamkari",
    regionId: "pedana",
    artisanId: "p-srinivasulu",
    material: "Cotton, vegetable dye",
    technique: "Hand block print",
    time: "11 days, including washing",
    dimensions: "140 × 220 cm",
    description:
      "A flowering vine in indigo and madder on unbleached cotton. Printed with carved teak blocks over eleven days, washed in running water between colours.",
    images: [
      localImage("product-kalamkari.jpg", "A folded Kalamkari cotton throw in indigo and madder on a travertine block.", 1200, 1600, {
        fallback: crafts[5].image,
      }),
    ],
    detail: { scale: 1.9, origin: "54% 56%" },
    availability: { status: "made-to-order", label: "Made to order · 6 weeks" },
  },
];

/* ==========================================================================
   Journal
   ========================================================================== */

export const journal: JournalEntry[] = [
  {
    id: "why-banarasi-silk-still-matters",
    source: DEMO,
    index: "01",
    kind: "Essay",
    minutes: 9,
    title: "Why Banarasi silk still matters",
    excerpt: "On power looms, cheap imitations, and the families in Varanasi who refuse to hurry.",
    image: pexelsImage(23494589, "Black and white photograph of hands passing thread through the warp of a loom.", 7360, 4912, {
      position: "50% 50%",
      credit: "Duc Nguyen",
      kind: "field",
    }),
  },
  {
    id: "the-colours-of-kutch",
    source: DEMO,
    index: "02",
    kind: "Field notes",
    minutes: 6,
    title: "The colours of Kutch",
    excerpt: "Madder, indigo, pomegranate rind — a season with the dyers and embroiderers north of Bhuj.",
    image: pexelsImage(37415386, "Embroidered textiles hung outdoors in bright afternoon light.", 7008, 4672, {
      position: "50% 50%",
      credit: "Harsh Kukadiya",
      kind: "field",
    }),
  },
  {
    id: "inside-a-channapatna-workshop",
    source: DEMO,
    index: "03",
    kind: "Visit",
    minutes: 7,
    title: "Inside a Channapatna workshop",
    excerpt: "Lathes, lac sticks and the quiet economics of a toy town two hours from Bengaluru.",
    image: pexelsImage(18947375, "A woodworker finishing a carved piece in a small workshop.", 4000, 6000, {
      position: "50% 40%",
      credit: "Gowtham AGM",
      kind: "field",
    }),
  },
];

/* ==========================================================================
   Navigation
   ========================================================================== */

export const primaryNav: NavLink[] = [
  { label: "Discover", href: "#objects" },
  { label: "Crafts", href: "#atlas" },
  { label: "Makers", href: "#maker" },
  { label: "Journal", href: "#journal" },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Crafts", href: "#atlas" },
      { label: "Makers", href: "#maker" },
      { label: "Collections", href: "#objects" },
      { label: "Journal", href: "#journal" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our Story", href: "#intro" },
      { label: "Craft Philosophy", href: "#intro" },
      { label: "Shipping", href: "#closing" },
      { label: "Contact", href: "#closing" },
    ],
  },
  {
    title: "Social",
    links: [
      { label: "Instagram", href: "https://www.instagram.com/" },
      { label: "Pinterest", href: "https://www.pinterest.com/" },
    ],
  },
];

/* ==========================================================================
   Lookups
   ========================================================================== */

const byId = <T extends { id: string }>(list: T[]) => {
  const map = new Map(list.map((item) => [item.id, item]));
  return (id: string) => {
    const found = map.get(id);
    if (!found) throw new Error(`Unknown id: ${id}`);
    return found;
  };
};

export const regionById = byId(regions);
export const craftById = byId(crafts);
export const artisanById = byId(artisans);
export const productById = byId(products);

export const findProduct = (id: string) => products.find((item) => item.id === id);
