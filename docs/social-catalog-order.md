# Social catalog order

Confirmed by Tushar on October 23, 2026: every social section runs oldest to newest by the initial main recipe post date. A recipe refresh, new carousel, replacement video, Git commit or category change must not reset that date. Teasers, comment cuts, adult/kid companions, reposts and rankings do not establish a new recipe date.

New recipes belong in the appropriate food category and append to its end as the newest entry. Moving an existing recipe between categories retains its original date. Keep existing detail URLs working.

`src/data/socialPublication.json` records the dates independently of array positions and numeric IDs. `src/utils/socialOrder.js` applies one stable comparator to every social section, before search filtering. Add a confirmed `initialMainPostDate` (ISO YYYY-MM-DD) when the main post is verified. Until then, a new slug without historical metadata appends automatically. Freeze its first addition date when importing the package. Never assign today's date to an older recipe update.

The October 23 reconciliation used VIDEO_INVENTORY, POSTING INVENTORY, RECIPE VIDEO COVERAGE and TIKTOK LATEST in the connected VIDEO_INVENTORY workbook. Explicitly reviewed historical main captions supplement inventory dates. Raw captions and private inventory records stay outside Git.

102 of the 198 catalog slugs have a confirmed main post date in this snapshot. Remaining records have a null post date: the original available main creation date, then first catalog addition date, provides provisional ordering. Those fallback fields are not claims that a video was posted. Resolve historical gaps from a verified original main post and replace only the null date; do not infer dates from carousel posts, a current replacement export, or fuzzy caption matches. The standalone Caesar salad deliberately excludes the taco companion's date.
