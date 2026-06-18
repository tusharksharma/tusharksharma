// Brand -> per-platform handle map for the /studio caption composer.
//
// Standalone copy (the social page keeps its own KNOWN_HANDLES — we deliberately
// don't touch it). Write {slug} tokens in a caption; expandCaption resolves each
// to the right handle per platform, with safe fallbacks (never a fake @):
//   brand known + handle for platform -> "@handle"
//   brand known + handle missing      -> brand's plain name
//   token unknown                     -> the slug text, unbraced
export const BRANDS = {
  danos:          { name: "Dan-O's",            ig: "@danosseasoning",          tt: "@danosseasoning" },
  kirkland:       { name: "Kirkland Signature", ig: "@kirklandsignature_costco" },
  laughingcow:    { name: "Laughing Cow",       ig: "@thelaughingcow",          tt: "@thelaughingcowus" },
  leaperrins:     { name: "Lea & Perrins",      ig: "@leaandperrins",           tt: "@lea_and_perrins" },
  smashkitchen:   { name: "Smash Kitchen",      ig: "@smashkitchenco",          tt: "@getsmashkitchen" },
  kikkoman:       { name: "Kikkoman",           ig: "@kikkoman_usa",            tt: "@kikkomankitchen" },
  generalmills:   { name: "General Mills",      ig: "@generalmills",            tt: "@generalmills" },
  leekumkee:      { name: "Lee Kum Kee",        ig: "@leekumkeeusa",            tt: "@leekumkeeusa" },
  verka:          { name: "Verka",              ig: "@verkadairy" },
  redboat:        { name: "Red Boat",           ig: "@redboatfishsauce",        tt: "@redboatfishsauce" },
  tanimuraantle:  { name: "Tanimura & Antle",   ig: "@tanimuraantle" },
  chosenfoods:    { name: "Chosen Foods",       ig: "@chosenfoods",             tt: "@chosenfoods" },
  herdez:         { name: "Herdez",             ig: "@herdez",                  tt: "@herdezbrand" },
  daisy:          { name: "Daisy",              ig: "@daisybrand",              tt: "@daisysourcreamofficial" },
  fage:           { name: "Fage",               ig: "@fage",                    tt: "@fage" },
  philadelphia:   { name: "Philadelphia",       ig: "@philadelphia",            tt: "@philadelphia" },
  wholeearth:     { name: "Whole Earth",        ig: "@wholeearthsweetener",     tt: "@wholeearthsweetener" },
  ghirardelli:    { name: "Ghirardelli",        ig: "@ghirardelli",             tt: "@officalghirardelli" },
  nescafe:        { name: "Nescafé",            ig: "@nescafe_usa",             tt: "@nescafe.usa" },
  highkey:        { name: "HighKey",            ig: "@highkeysnacks",           tt: "@highkeysnacks" },
  pescience:      { name: "PEScience",          ig: "@pescience",               tt: "@pescience" },
  littlepotato:   { name: "Little Potato Co.",  ig: "@littlepotatoco",          tt: "@littlepotatoco" },
  nystylesausage: { name: "NY Style Sausage Co.", ig: "@nystylesausage" },
  dynasty:        { name: "Dynasty",            ig: "@dynasty.foods" },
  barebones:      { name: "Bare Bones",         ig: "@barebonesbroth" },
  anthonys:       { name: "Anthony's",          ig: "@anthonys.organic" },
  lilys:          { name: "Lily's",             ig: "@lilyssweets" },
  thrivemarket:   { name: "Thrive Market",      ig: "@thrivemarket",            tt: "@thrivemarket" },
  fairlife:       { name: "Fairlife",           ig: "@fairlife",                tt: "@fairlifeofficial" },
  nakano:         { name: "Nakano",             ig: "@nakanorice" },
  tasteflavor:    { name: "Taste Flavor Co.",   ig: "@tasteflavorco" },
  opportuniteas:  { name: "Opportuniteas",      ig: "@opportuniteas" },
  bobsredmill:    { name: "Bob's Red Mill",     ig: "@bobsredmill",             tt: "@bobsredmill" },
  marketside:     { name: "Marketside",         ig: "@marketside" },
  petespasta:     { name: "Pete's Pasta",       ig: "@petespasta" },
  raos:           { name: "Rao's",              ig: "@raoshomemade",            tt: "@raoshomemade" },
  barilla:        { name: "Barilla",            ig: "@barillaus",               tt: "@barilla" },
  fallsbrand:     { name: "Falls Brand",        ig: "@fallsbrand" },
  wholefoods:     { name: "365 Whole Foods",    ig: "@wholefoods" },
  godshalls:      { name: "Godshall's",         ig: "@godshalls",               tt: "@godshalls" },
};

const PLATFORM_FIELD = { youtube: "yt", instagram: "ig", tiktok: "tt" };

export function expandCaption(caption, platform) {
  if (!caption) return caption;
  const field = PLATFORM_FIELD[platform];
  return caption
    .replace(/\{([a-z0-9]+)\}/gi, (match, slug) => {
      const brand = BRANDS[slug.toLowerCase()];
      if (!brand) return slug;
      const handle = field && brand[field];
      return handle || brand.name;
    })
    .replace(/ {2,}/g, " ")
    .trim();
}

// Sorted token list for the chip palette.
export const BRAND_TOKENS = Object.entries(BRANDS)
  .map(([slug, b]) => ({ slug, name: b.name, platforms: ["yt", "ig", "tt"].filter((f) => b[f]) }))
  .sort((a, b) => a.name.localeCompare(b.name));
