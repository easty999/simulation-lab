# Ball-simulation format research

Research date: **14 November 2026**. Public search-index metadata was inspected, not complete video playback, transcripts, retention graphs or channel analytics. View counts below are the values returned by the search index and can lag the live page. These examples have very different upload ages, so their counts are evidence of historical audience interest, not a ranking of current trends or a prediction for CodeTrooper.

| Format | Reference | Observed evidence | Site adaptation |
| --- | --- | --- | --- |
| Ball grows on every bounce | [TheFlynCow — Everytime the ball bounces, it gets bigger](https://www.youtube.com/watch?v=WLFGDO4reHQ) | Published 9 November 2023. Search index reported **22,541,195 views** and **793,000 likes**. Title and indexed metadata inspected. | Original growing-ball simulation with adjustable percentage increase. A visible count makes the simple rule easy to follow. |
| Marble race | [Algorox — Marble Race (Part 1)](https://www.youtube.com/watch?v=mJqUFJlqfYU) | Published 29 October 2012. Search index reported **13,559,317 views** and **32,000 likes**. Title, description and indexed metadata inspected. The description identifies Algodoo. | Original six-color pegboard race with a viewer pick and finishing order. This adapts the general racing format, not the reference track. |
| Escape rotating rings | [MiJaGamess — The ball has 30 seconds to escape the rings](https://www.youtube.com/watch?v=9jx8ShHzdVE) | An [indexed video mirror](https://salda.ws/video.php?id=9jx8ShHzdVE) reports 24 September 2026 and a 31-second runtime. The direct YouTube page could not be fetched. No reliable view count was available. | Original rotating-ring arena with adjustable gaps, rotation and ring count. The visible goal creates a clear question for the viewer. |

The first two examples establish large historical reach. Ring escape has recent format evidence but its popularity was **not independently quantified** here. It is included as a recognizable current simulation format, supported by several contemporary implementations: [Ball-escape](https://github.com/Darknife339/Ball-escape), [HypnoSim](https://hypnosim.com/) and [Bounce Lab's Keep It In](https://bouncelabgames.itch.io/keep-it-in). Those projects' marketing claims are not independent audience statistics. Their source code was not copied.

## Why these three

Each has a rule visible in the first seconds: escape, grow, or win. My creative hypothesis is that the clear outcome gives viewers something to anticipate. Seeded variation enables original runs without adding heavy graphics. This is a design hypothesis, not proof of retention or guaranteed virality.

Possible original titles:

- Ring escape: “Seven rings. One way out.”
- Growing ball: “This ball gets 8% bigger on every bounce.”
- Marble race: “Pick a color before they drop.”

Use your own commentary or explanation when useful. All simulation visuals in the site are drawn from scratch; no reference footage, music, logos or thumbnails are included.

## Implementation references

- [Motion official quick start](https://motion.dev/docs/quick-start): script-tag use, animation APIs and version pinning. The package vendors version 12.23.24 and its MIT license; it does not need a CDN at runtime.
- [GitHub Pages official guide](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site): static entry file and publishing source.
