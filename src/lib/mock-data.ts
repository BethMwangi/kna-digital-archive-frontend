export type LicenseType =
  | "Editorial"
  | "Commercial"
  | "Educational"
  | "Government"
  | "Internal Use";

export type AssetType =
  | "Photograph"
  | "Video"
  | "Audio"
  | "PDF"
  | "Newspaper"
  | "Document";

export type OrderStatus =
  | "Pending"
  | "Paid"
  | "Cancelled"
  | "Refunded"
  | "Completed";

export interface PriceTier {
  label: string;
  resolution: string;
  price: number; // KES
}

export interface Asset {
  id: string;
  slug: string;
  title: string;
  caption: string;
  description: string;
  photographer: string;
  credit: string;
  year: number;
  date: string;
  location: string;
  county: string;
  period: string;
  category: string;
  collection: string;
  type: AssetType;
  tags: string[];
  image: string;
  priceFrom: number;
  tiers: PriceTier[];
  licenses: LicenseType[];
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  cover: string;
  count: number;
  blurb: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  count: number;
}

const bw = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&auto=format&fit=crop&sat=-100`;

// TODO(api): replace with GET /api/v1/assets
export const assets: Asset[] = [
  {
    id: "kna-0001",
    slug: "jomo-kenyatta-uhuru-address-1963",
    title: "President Kenyatta addresses the nation on Uhuru eve",
    caption:
      "Founding President Jomo Kenyatta delivers his address to the nation from Uhuru Gardens on the eve of independence.",
    description:
      "Original silver gelatin print. Kenyatta stands at the podium moments before the raising of the Kenyan flag. Crowd estimated at 250,000.",
    photographer: "Mohamed Amin",
    credit: "Kenya News Agency Archives",
    year: 1963,
    date: "1963-12-11",
    location: "Uhuru Gardens, Nairobi",
    county: "Nairobi",
    period: "Independence Era",
    category: "Politics",
    collection: "Independence Collection",
    type: "Photograph",
    tags: ["independence", "kenyatta", "uhuru", "1963", "podium"],
    image: bw("1541872703-74c5e44368f9"),
    priceFrom: 1500,
    tiers: [
      { label: "Web", resolution: "1200 × 800", price: 1500 },
      { label: "Print", resolution: "3000 × 2000", price: 4500 },
      { label: "Archive", resolution: "6000 × 4000", price: 12000 },
    ],
    licenses: ["Editorial", "Commercial", "Educational", "Government"],
  },
  {
    id: "kna-0002",
    slug: "madaraka-day-parade-1964",
    title: "Inaugural Madaraka Day parade at Nyayo Stadium",
    caption: "Military honour guard marches past the presidential dais.",
    description:
      "Wide-angle press photograph of the first Madaraka Day parade marking self-rule.",
    photographer: "Priya Ramrakha",
    credit: "KNA / Ramrakha Estate",
    year: 1964,
    date: "1964-06-01",
    location: "Nyayo National Stadium",
    county: "Nairobi",
    period: "Independence Era",
    category: "National Events",
    collection: "National Celebrations",
    type: "Photograph",
    tags: ["madaraka", "parade", "military", "1964"],
    image: bw("1521737604893-d14cc237f11d"),
    priceFrom: 1200,
    tiers: [
      { label: "Web", resolution: "1200 × 800", price: 1200 },
      { label: "Print", resolution: "3000 × 2000", price: 3800 },
      { label: "Archive", resolution: "6000 × 4000", price: 9500 },
    ],
    licenses: ["Editorial", "Educational", "Government"],
  },
  {
    id: "kna-0003",
    slug: "maasai-mara-elephant-migration-1978",
    title: "Elephant herd crossing the Mara River",
    caption:
      "A matriarchal herd fords the Mara River during the great migration.",
    description:
      "Assignment photograph for the Ministry of Tourism and Wildlife.",
    photographer: "Duncan Willetts",
    credit: "Kenya News Agency Archives",
    year: 1978,
    date: "1978-08-14",
    location: "Maasai Mara",
    county: "Narok",
    period: "Nyayo Era",
    category: "Tourism",
    collection: "Kenya Wildlife",
    type: "Photograph",
    tags: ["wildlife", "elephant", "mara", "migration"],
    image: bw("1516426122078-c23e76319801"),
    priceFrom: 1800,
    tiers: [
      { label: "Web", resolution: "1200 × 800", price: 1800 },
      { label: "Print", resolution: "3000 × 2000", price: 5200 },
      { label: "Archive", resolution: "6000 × 4000", price: 13500 },
    ],
    licenses: ["Editorial", "Commercial", "Educational"],
  },
  {
    id: "kna-0004",
    slug: "harambee-school-opening-1971",
    title: "Villagers raise funds for a Harambee secondary school",
    caption: "Community leaders count contributions at a Harambee fundraiser.",
    description:
      "Documentary photograph produced for the Ministry of Education's rural literacy campaign.",
    photographer: "Boniface Mwangi Sr.",
    credit: "Kenya News Agency Archives",
    year: 1971,
    date: "1971-03-22",
    location: "Muranga",
    county: "Muranga",
    period: "Kenyatta Era",
    category: "Education",
    collection: "Presidential Archives",
    type: "Photograph",
    tags: ["harambee", "education", "community", "1970s"],
    image: bw("1509062522246-3755977927d7"),
    priceFrom: 1100,
    tiers: [
      { label: "Web", resolution: "1200 × 800", price: 1100 },
      { label: "Print", resolution: "3000 × 2000", price: 3400 },
      { label: "Archive", resolution: "6000 × 4000", price: 8900 },
    ],
    licenses: ["Editorial", "Educational", "Government"],
  },
  {
    id: "kna-0005",
    slug: "coffee-harvest-kiambu-1969",
    title: "Coffee harvest, Kiambu highlands",
    caption:
      "Women workers sort ripe cherries at a co-operative washing station.",
    description: "Agricultural documentation for the Coffee Board of Kenya.",
    photographer: "Anthony Njuguna",
    credit: "Kenya News Agency Archives",
    year: 1969,
    date: "1969-10-05",
    location: "Kiambu",
    county: "Kiambu",
    period: "Kenyatta Era",
    category: "Agriculture",
    collection: "Presidential Archives",
    type: "Photograph",
    tags: ["coffee", "agriculture", "co-operative", "highlands"],
    image: bw("1447933601403-0c6688de566e"),
    priceFrom: 1300,
    tiers: [
      { label: "Web", resolution: "1200 × 800", price: 1300 },
      { label: "Print", resolution: "3000 × 2000", price: 4100 },
      { label: "Archive", resolution: "6000 × 4000", price: 10500 },
    ],
    licenses: ["Editorial", "Commercial", "Educational"],
  },
  {
    id: "kna-0006",
    slug: "nation-newspaper-front-page-1978",
    title: "Daily Nation front page — Mzee Kenyatta obituary edition",
    caption: "Front page announcing the passing of the founding president.",
    description:
      "Newsprint scan, 22 August 1978. Part of the Historical Newspapers collection.",
    photographer: "Daily Nation",
    credit: "Nation Media Group / KNA",
    year: 1978,
    date: "1978-08-22",
    location: "Nairobi",
    county: "Nairobi",
    period: "Kenyatta Era",
    category: "Politics",
    collection: "Historical Newspapers",
    type: "Newspaper",
    tags: ["newspaper", "kenyatta", "obituary"],
    image: bw("1495020689067-958852a7765e"),
    priceFrom: 900,
    tiers: [
      { label: "Web", resolution: "A3 scan", price: 900 },
      { label: "Print", resolution: "A2 scan", price: 2400 },
      { label: "Archive", resolution: "Full TIFF", price: 6800 },
    ],
    licenses: ["Editorial", "Educational"],
  },
  {
    id: "kna-0007",
    slug: "kip-keino-mexico-1968",
    title: "Kip Keino celebrates 1500m gold, Mexico City",
    caption:
      "Kipchoge Keino raises his arms after winning the 1500m at the Games of the XIX Olympiad.",
    description: "Wire photograph, syndicated to East African press.",
    photographer: "Neil Leifer",
    credit: "KNA syndication",
    year: 1968,
    date: "1968-10-20",
    location: "Mexico City",
    county: "—",
    period: "Kenyatta Era",
    category: "Sports",
    collection: "National Celebrations",
    type: "Photograph",
    tags: ["olympics", "athletics", "keino", "1968"],
    image: bw("1461896836934-ffe607ba8211"),
    priceFrom: 1700,
    tiers: [
      { label: "Web", resolution: "1200 × 800", price: 1700 },
      { label: "Print", resolution: "3000 × 2000", price: 4900 },
      { label: "Archive", resolution: "6000 × 4000", price: 12800 },
    ],
    licenses: ["Editorial", "Commercial", "Educational"],
  },
  {
    id: "kna-0008",
    slug: "kicc-construction-1972",
    title: "Kenyatta International Convention Centre under construction",
    caption:
      "The rotunda and 28-storey tower rise above Nairobi's central business district.",
    description: "Architectural documentation for the Ministry of Works.",
    photographer: "David Mutua",
    credit: "Kenya News Agency Archives",
    year: 1972,
    date: "1972-05-30",
    location: "Nairobi CBD",
    county: "Nairobi",
    period: "Kenyatta Era",
    category: "Infrastructure",
    collection: "Presidential Archives",
    type: "Photograph",
    tags: ["architecture", "kicc", "construction", "nairobi"],
    image: bw("1449034446853-66c86144b0ad"),
    priceFrom: 1400,
    tiers: [
      { label: "Web", resolution: "1200 × 800", price: 1400 },
      { label: "Print", resolution: "3000 × 2000", price: 4200 },
      { label: "Archive", resolution: "6000 × 4000", price: 11000 },
    ],
    licenses: ["Editorial", "Commercial", "Educational", "Government"],
  },
  {
    id: "kna-0009",
    slug: "polio-vaccination-campaign-1985",
    title: "National polio vaccination campaign",
    caption: "A public health nurse administers oral polio vaccine in Kisumu.",
    description: "Ministry of Health documentation series.",
    photographer: "Rose Odengo",
    credit: "Kenya News Agency Archives",
    year: 1985,
    date: "1985-07-11",
    location: "Kisumu",
    county: "Kisumu",
    period: "Nyayo Era",
    category: "Health",
    collection: "Presidential Archives",
    type: "Photograph",
    tags: ["health", "vaccination", "polio", "public-health"],
    image: bw("1584515933487-779824d29309"),
    priceFrom: 1000,
    tiers: [
      { label: "Web", resolution: "1200 × 800", price: 1000 },
      { label: "Print", resolution: "3000 × 2000", price: 3200 },
      { label: "Archive", resolution: "6000 × 4000", price: 8400 },
    ],
    licenses: ["Editorial", "Educational", "Government"],
  },
  {
    id: "kna-0010",
    slug: "moi-national-address-1988",
    title: "President Moi delivers Jamhuri Day address",
    caption: "President Daniel arap Moi at the Nyayo Stadium podium.",
    description: "Assignment for the Presidential Press Service.",
    photographer: "Peter Wanyonyi",
    credit: "Kenya News Agency Archives",
    year: 1988,
    date: "1988-12-12",
    location: "Nyayo Stadium",
    county: "Nairobi",
    period: "Nyayo Era",
    category: "Politics",
    collection: "Presidential Archives",
    type: "Photograph",
    tags: ["moi", "jamhuri", "podium", "1988"],
    image: bw("1520975916090-3105956dac38"),
    priceFrom: 1500,
    tiers: [
      { label: "Web", resolution: "1200 × 800", price: 1500 },
      { label: "Print", resolution: "3000 × 2000", price: 4500 },
      { label: "Archive", resolution: "6000 × 4000", price: 12000 },
    ],
    licenses: ["Editorial", "Educational", "Government"],
  },
  {
    id: "kna-0011",
    slug: "mombasa-port-dhow-1966",
    title: "Dhow at Kilindini harbour, Mombasa",
    caption:
      "A traditional dhow rests alongside a container gantry at Kilindini port.",
    description: "Coastal trade documentation series.",
    photographer: "Mohamed Amin",
    credit: "Kenya News Agency Archives",
    year: 1966,
    date: "1966-04-18",
    location: "Mombasa",
    county: "Mombasa",
    period: "Kenyatta Era",
    category: "Infrastructure",
    collection: "Kenya Wildlife",
    type: "Photograph",
    tags: ["mombasa", "dhow", "port", "trade"],
    image: bw("1519046904884-53103b34b206"),
    priceFrom: 1200,
    tiers: [
      { label: "Web", resolution: "1200 × 800", price: 1200 },
      { label: "Print", resolution: "3000 × 2000", price: 3800 },
      { label: "Archive", resolution: "6000 × 4000", price: 9800 },
    ],
    licenses: ["Editorial", "Commercial", "Educational"],
  },
  {
    id: "kna-0012",
    slug: "rift-valley-landscape-1974",
    title: "Great Rift Valley escarpment at dawn",
    caption: "The escarpment near Mai Mahiu at first light.",
    description: "Landscape study for the Ministry of Tourism.",
    photographer: "Duncan Willetts",
    credit: "Kenya News Agency Archives",
    year: 1974,
    date: "1974-11-02",
    location: "Mai Mahiu",
    county: "Nakuru",
    period: "Kenyatta Era",
    category: "Tourism",
    collection: "Kenya Wildlife",
    type: "Photograph",
    tags: ["landscape", "rift-valley", "tourism"],
    image: bw("1516426122078-c23e76319801"),
    priceFrom: 1300,
    tiers: [
      { label: "Web", resolution: "1200 × 800", price: 1300 },
      { label: "Print", resolution: "3000 × 2000", price: 4000 },
      { label: "Archive", resolution: "6000 × 4000", price: 10500 },
    ],
    licenses: ["Editorial", "Commercial", "Educational"],
  },
];

export const collections: Collection[] = [
  {
    id: "c1",
    slug: "presidential-archives",
    title: "Presidential Archives",
    cover: bw("1541872703-74c5e44368f9", 1000),
    count: 1284,
    blurb: "Six decades of state photography from four administrations.",
  },
  {
    id: "c2",
    slug: "independence-collection",
    title: "Independence Collection",
    cover: bw("1521737604893-d14cc237f11d", 1000),
    count: 412,
    blurb: "The road to Uhuru, 1952–1965.",
  },
  {
    id: "c3",
    slug: "national-celebrations",
    title: "National Celebrations",
    cover: bw("1461896836934-ffe607ba8211", 1000),
    count: 903,
    blurb: "Madaraka, Jamhuri and Mashujaa observances.",
  },
  {
    id: "c4",
    slug: "kenya-wildlife",
    title: "Kenya Wildlife",
    cover: bw("1516426122078-c23e76319801", 1000),
    count: 2145,
    blurb: "Fauna, flora and the parks that protect them.",
  },
  {
    id: "c5",
    slug: "historical-newspapers",
    title: "Historical Newspapers",
    cover: bw("1495020689067-958852a7765e", 1000),
    count: 5680,
    blurb: "Front pages and features from the national press.",
  },
];

export const categories: Category[] = [
  { id: "cat1", slug: "politics", name: "Politics", count: 3120 },
  { id: "cat2", slug: "education", name: "Education", count: 842 },
  { id: "cat3", slug: "sports", name: "Sports", count: 1908 },
  { id: "cat4", slug: "health", name: "Health", count: 512 },
  { id: "cat5", slug: "agriculture", name: "Agriculture", count: 977 },
  { id: "cat6", slug: "tourism", name: "Tourism", count: 1443 },
  { id: "cat7", slug: "infrastructure", name: "Infrastructure", count: 1206 },
  { id: "cat8", slug: "national-events", name: "National Events", count: 2251 },
];

export const licenseInfo: Record<
  LicenseType,
  { blurb: string; usage: string[] }
> = {
  Editorial: {
    blurb: "News, journalism and editorial commentary.",
    usage: ["Newspapers", "Magazines", "News websites", "Blogs (non-promotional)"],
  },
  Commercial: {
    blurb: "Advertising, marketing and merchandise.",
    usage: ["Advertising campaigns", "Packaging", "Retail merchandise", "Brand websites"],
  },
  Educational: {
    blurb: "Teaching materials, dissertations and public lectures.",
    usage: ["Textbooks", "Course materials", "Museum exhibits", "Academic papers"],
  },
  Government: {
    blurb: "Official Government of Kenya publications.",
    usage: ["Ministry reports", "Public campaigns", "State exhibitions"],
  },
  "Internal Use": {
    blurb: "Non-distributed internal reference use only.",
    usage: ["Company decks", "Internal training", "Archival reference"],
  },
};

export interface Order {
  id: string;
  number: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: { assetId: string; title: string; license: LicenseType; price: number }[];
}

// TODO(api): replace with GET /api/v1/orders
export const orders: Order[] = [
  {
    id: "o1",
    number: "KNA-2024-00812",
    date: "2024-11-04",
    total: 6800,
    status: "Completed",
    items: [
      { assetId: "kna-0001", title: "President Kenyatta addresses the nation on Uhuru eve", license: "Editorial", price: 1500 },
      { assetId: "kna-0007", title: "Kip Keino celebrates 1500m gold, Mexico City", license: "Editorial", price: 1700 },
      { assetId: "kna-0011", title: "Dhow at Kilindini harbour, Mombasa", license: "Commercial", price: 3600 },
    ],
  },
  {
    id: "o2",
    number: "KNA-2024-00791",
    date: "2024-10-22",
    total: 4500,
    status: "Paid",
    items: [
      { assetId: "kna-0003", title: "Elephant herd crossing the Mara River", license: "Editorial", price: 1800 },
      { assetId: "kna-0005", title: "Coffee harvest, Kiambu highlands", license: "Commercial", price: 2700 },
    ],
  },
  {
    id: "o3",
    number: "KNA-2024-00744",
    date: "2024-09-30",
    total: 1200,
    status: "Refunded",
    items: [
      { assetId: "kna-0002", title: "Inaugural Madaraka Day parade at Nyayo Stadium", license: "Editorial", price: 1200 },
    ],
  },
  {
    id: "o4",
    number: "KNA-2024-00701",
    date: "2024-09-11",
    total: 900,
    status: "Pending",
    items: [
      { assetId: "kna-0006", title: "Daily Nation front page — Mzee Kenyatta obituary", license: "Editorial", price: 900 },
    ],
  },
];

export function findAsset(slugOrId: string): Asset | undefined {
  return assets.find((a) => a.slug === slugOrId || a.id === slugOrId);
}

export function formatKES(n: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(n);
}
