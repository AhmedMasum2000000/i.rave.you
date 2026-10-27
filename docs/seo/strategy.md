# I Rave You: search visibility audit and growth plan

Audit date: 28 October 2026 (Asia/Dhaka). Primary domain: https://iraveyou.com/.

## Scope and evidence limits

This is a source-level technical audit, implemented foundation and research plan. Live requests to Google search, Google Search Central, Profi Music and the production domain returned network-policy 403 denials in this environment. No Search Console, Bing Webmaster Tools, analytics or paid keyword database is connected. Therefore no current ranking, indexed-page count, competitor position, keyword volume, difficulty, backlink total or field Core Web Vitals score is claimed here. Keyword opportunities below are hypotheses based on the supplied artist facts and current site content. They need live SERP and first-party validation before investment.

“Every search intent” is not a suitable target for this portfolio. Start with the artists' identities, actual music and listener questions, then expand into topics they can substantiate. Nobody can promise first place, universal coverage or a deadline for indexing. Titles, canonicals and structured data are signals, not ranking or rich-result guarantees.

## Verified source findings and shipped fixes

| Finding before this change | Impact | Implemented response |
| --- | --- | --- |
| Artist views existed only as `#/acnd` and `#/apurba` routes | Hash variants are not reliable separately indexable documents | Static `/acnd/` and `/apurba/` profiles, linked from home and menu; interactive routes remain available |
| Root HTML contained an empty application mount | Core artist text depended entirely on JavaScript rendering | Visible, static homepage introduction and discovery links below the interactive hero |
| Sitemap and feature canonical selected the GitHub copy | Conflicting preferred-domain signals across two public hosts | HTTPS custom-domain canonicals, sitemap and robots sitemap reference |
| No clean release or tracklist documents | Specific release and tracklist searches lacked matching destinations | Static `/music/down-in-bossa/` and `/mixes/qbic-pulse/`, with official links and timestamps |
| Root social image used a relative URL | Inconsistent social preview resolution | Absolute image URLs, descriptive Open Graph and Twitter metadata |
| Feature implied both artists were from Cumilla despite ACND's Dhaka biography | Inconsistent identity information | Consistent location descriptions and ACND = Ahmed Masum identity |
| Article FAQ schema was unnecessary for this portfolio | FAQ markup does not make an artist site eligible for Google's restricted FAQ rich results | Kept visible questions; removed FAQPage JSON-LD |
| Private pitch pages deliberately used noindex | Accidental discoverability would conflict with their purpose | Preserved noindex and excluded them from sitemap |

Validation: `npm run build` followed by `node scripts/check-seo.mjs`. The SEO check also runs in the GitHub Pages workflow and validates the actual built documents, sitemap URLs, canonical uniqueness, metadata, JSON-LD syntax, local-link targets, artist credits, track count and private-page exclusions. Browser checks at 320, 390, 768 and 1280 pixels verify script-free discovery pages, mobile overflow, project-subpath assets, menu links and hash-route canonical updates. These checks do not establish Google indexing or a live deployment.

New discovery pages are ordinary HTML, work without JavaScript, contain no autoplay, and reuse the existing data for biography, releases and original music links. They are not bot-only text or keyword doorway pages. The interactive mix remains as requested. Third-party music permissions remain a separate unresolved matter.

## Search intent and destination map

These are candidate queries, not measured keywords. Priority reflects relevance and ability to answer accurately, not estimated traffic.

| Priority | Intent | Candidate searches | Preferred destination | What makes the page useful |
| --- | --- | --- | --- | --- |
| 1 | Artist identity / navigation | ACND, ACND Ahmed Masum, Ahmed Masum DJ, ACND Bangladesh | `/acnd/` | Clear identity, location, biography and matching artist-platform profiles |
| 1 | Artist identity / ambiguity | অপূর্ব electronic music, Opurbo producer Bangladesh, Apurba Khalid Bin Alam | `/apurba/` | Bengali name, supplied Latin spelling plus existing Apurba spelling, real name and Cumilla context |
| 1 | Project navigation | I Rave You ACND, iraveyou, I Rave You Bangladesh | `/` | Identifies this project and both artists; avoids confusion with similarly named rave publications |
| 1 | Release discovery / action | Down In Bossa Ash Army ACND, Down In Bossa Profi Music | `/music/down-in-bossa/` | Release facts, official label page and listening/pre-save destination |
| 1 | Mix listening / identification | Qbic Pulse ACND Apurba, Qbic Pulse HKCR tracklist | `/mixes/qbic-pulse/` | Complete 15-track list, timestamps and verified exact-recording links |
| 2 | Remix attribution | Nitol Paye Electric ACND remix, Ahmed Masum Nitol remix | `/acnd/` | Correct credit and YouTube destination; does not imply clearance of the original composition |
| 2 | Artist release navigation | 1by1 অপূর্ব, Monolithic Flow Apurba, Opurbo releases | `/apurba/` | Actual release catalogue and official listening links |
| 2 | Collaboration / context | Initiate ACND Apurba, Opurbo ACND collaboration | `/frequency-unity/` | Clearly identifies unreleased status, partners and listening context |
| Later | Broad discovery | Bangladesh electronic music artists, melodic techno Bangladesh, Cumilla electronic producer | Profiles + an evidence-based future scene guide | Broader coverage requires original reporting, credited sources and distinct useful content |
| Only after confirmation | Booking / commercial evaluation | book ACND DJ, Opurbo DJ booking Bangladesh | Future dedicated booking/contact page | Needs explicit booking availability, authorised booking contact, current EPK, approved performance evidence and actual setup/rider |

Avoid generic “best DJ”, unrelated trending keywords, city doorway pages and near-identical articles for every spelling. Do not publish fake reviews, events, addresses, awards, press coverage or label affiliations. Do not create a Google Business Profile unless the business meets Google's eligibility requirements.

## Competitive research to complete when access is available

1. Search the exact candidates above, separately for Bangladesh and international audiences; record engine, country, language, device and date. Check Bengali and Latin names. Search results vary by context.
2. For each query capture the first ten organic URLs, page type, title, visible answer, image/video features, artist-platform panels and whether the intent is navigational, listening, learning or booking. Paid placements are separate.
3. Treat Spotify, SoundCloud, YouTube, Apple Music, Profi Music and HKCR as likely discovery partners as well as potential SERP alternatives. Actual positions have not been observed.
4. Review genuinely competing artist portfolios and Bangladesh scene/editorial pages found in those results. Record missing listener tasks, original evidence, linking sources and mobile performance; do not copy their text or assume generic domain authority predicts a result.
5. Validate demand with Search Console impressions and, if available, Keyword Planner or a licensed keyword dataset. A low-volume artist search can still be valuable. Avoid invented volume/difficulty estimates.
6. Consolidate overlapping ideas into existing destinations before creating new URLs. Only create a page when it answers a distinct question with original, rights-cleared material.

Record observations in `serp-research.csv`. Leave metrics blank until measured; unknown is not zero.

## Next 7 days: ownership and indexing

- Verify a **Domain property** for `iraveyou.com` in [Google Search Console](https://search.google.com/search-console/). Google will supply a unique TXT record; add that exact record at the active DNS provider. Preserve existing A/www, email and verification records. Do not invent a verification token.
- Submit `https://iraveyou.com/sitemap.xml`. Inspect `/`, `/acnd/`, `/apurba/`, `/music/down-in-bossa/` and `/mixes/qbic-pulse/`; request indexing where appropriate. Check rendered content, Google-selected canonical and discovery errors. Submission does not guarantee indexing.
- Verify [Bing Webmaster Tools](https://www.bing.com/webmasters/) and submit the same sitemap; import Search Console ownership if supported by the account.
- Align artist bios and official website links on Spotify for Artists, SoundCloud, YouTube, Instagram and the label's release metadata. ACND = Ahmed Masum; অপূর্ব = Khalid Bin Alam. No new claims or unapproved alias changes.
- Ask existing collaborators, the label and radio programme for an accurate contextual website credit where they normally publish artist information. This report does not authorise sending messages. Do not buy links, automate comments or use reciprocal link schemes.
- Canonical tags consolidate the GitHub mirror as a preference; they are not redirects. Where Hostinger supports it, confirm HTTP and www redirect with 301/308 to `https://iraveyou.com/`, preserving path and query. Check existing redirects before adding any rules. A GitHub project cannot set root `github.io/robots.txt`; its HTML canonicals are the relevant mirror signal.
- Around 30 October, confirm the release is actually available through the label before changing scheduled/pre-save wording. A calendar date alone does not establish availability.

## Days 8–30: evidence and listener experience

- Publish a substantive artist-authored note about the production of an existing track, using approved audio excerpts/images only. Include real equipment or process details supplied by the artist; no inferred gear, credits or release dates.
- Expand the Qbic Pulse page with a host-authored set note or verified programme link if available. The existing tracklist already answers identification intent; do not produce thin pages for every third-party track.
- Run [PageSpeed Insights](https://pagespeed.web.dev/) on the canonical root, both profiles and the mix page, on mobile and desktop. Distinguish Lighthouse lab data from CrUX field data. Field targets: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 at the 75th percentile; low-traffic sites may have no field dataset.
- The interactive root loads a long DJ mix and visual effects. Keep lightweight profile pages as direct search-entry destinations. Measure cold-load transfer, LCP and responsiveness before further media changes. Do not claim a score from a successful build.
- Review whether screenshot/copy restrictions and focus-based curtains harm ordinary visitors or search rendering. They do not enforce copyright. A broader change to this existing feature should be evaluated separately.
- Submit representative URLs to Google's Rich Results Test and Schema.org Validator. Person/ProfilePage/MusicRecording are descriptive schema, not a promise of a supported Google rich result. Don't add SearchAction without real site search or ratings/events without actual evidence.

## Days 31–90: measure and iterate

Establish a baseline first; numeric growth targets need actual data.

| Metric | Source | Cadence | Decision |
| --- | --- | --- | --- |
| Indexed canonical pages and crawl errors | Search Console Page indexing / URL inspection | Weekly | Fix discovery, canonical or server errors first |
| Impressions, clicks, CTR, position by page and query | Search Console Performance | Weekly, compare 28-day windows | Improve weak query/page matching and confusing titles; distinguish brand from discovery queries |
| Countries, devices and Bengali vs Latin queries | Search Console Performance exports | Monthly | Improve real audience coverage, not speculative location pages |
| Core Web Vitals | Search Console / PSI / CrUX | Monthly | Address field issues when a dataset exists |
| Official-platform outbound clicks | Future privacy-reviewed measurement, if needed | After approval | Evaluate listener actions; these clicks are not credited music streams |
| Legitimate referring pages | Search Console Links + manual checks | Monthly | Strengthen accurate credits from relevant collaborators |

No analytics or tracking was silently added. Search Console can provide search performance without adding a visitor analytics script. If event analytics is introduced later, update the privacy notice and consent behavior for the actual implementation and applicable requirements.

## Reference documentation

These are authoritative follow-up references; their live text could not be retrieved in this session due to network policy:

- [Google Search Essentials](https://developers.google.com/search/docs/essentials)
- [JavaScript SEO basics, including crawlable URLs](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Consolidating duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Building and submitting a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Structured data general guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [FAQ structured data eligibility](https://developers.google.com/search/docs/appearance/structured-data/faqpage)
- [Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)
