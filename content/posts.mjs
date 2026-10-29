/** First-party editorial: artist facts come from the supplied portfolio, not invented press. */
export const PUBLICATION_DATE = "2026-10-28";
export function createPosts({ internal: link, external: ext, next }) {
  const acnd = (label = "ACND’s artist profile") => link("acnd/", label);
  const mix = (label = "complete Qbic Pulse tracklist") =>
    link("mixes/qbic-pulse/", label);
  const release = (label = "Down In Bossa release details") =>
    link("music/down-in-bossa/", label);
  const post = (slug, label) => link(`journal/${slug}/`, label);
  return [
    {
      slug: "down-in-bossa-out-now-profi-music",
      date: "2026-10-30",
      title: "Down In Bossa out now: Ash Army & ACND’s Afro House release on Profi Music",
      description:
        "Down In Bossa by Ash Army & ACND is out now on Profi Music. Stream the Afro House release, check the credits and add it to your summer, beach and Ibiza-inspired playlists.",
      category: "New release",
      image: "img/down-in-bossa.jpg",
      imageAlt: "Down In Bossa cover artwork by Ash Army and ACND, released on Profi Music",
      answer:
        "“Down In Bossa” by Ash Army & ACND is out now on Profi Music. Released on 30 October 2026, it is an Afro House collaboration between Ash Army and ACND, the Dhaka-based producer and DJ Ahmed Masum. Stream it through the label’s official smart link.",
      related: [
        "down-in-bossa-collaboration-credits",
        "afro-house-listening-guide",
        "where-to-listen-acnd",
      ],
      body: `
        <section><h2>Down In Bossa is out now</h2>
        <p><strong>“Down In Bossa”</strong>, the collaboration between <strong>Ash Army &amp; ACND</strong>, is out now on <strong>Profi Music</strong>. The release date is 30 October 2026, and the genre given in the release information is Afro House.</p>
        <p>The quickest way to listen is the ${ext(next.presave, "official Down In Bossa smart link")}, which lets you choose your streaming service. The ${ext(next.page, "Profi Music release page")} is the label’s own reference for the track, and the ${release("Down In Bossa release page")} on this site collects the credits and facts in one place.</p>
        <dl class="fact-list"><div><dt>Title</dt><dd>Down In Bossa</dd></div><div><dt>Artists</dt><dd>Ash Army &amp; ACND</dd></div><div><dt>Genre</dt><dd>Afro House</dd></div><div><dt>Label</dt><dd>Profi Music</dd></div><div><dt>Released</dt><dd><time datetime="2026-10-30">30 October 2026</time></dd></div><div><dt>Format</dt><dd>Digital single, two tracks</dd></div><div><dt>Catalogue ref.</dt><dd>1200220291328</dd></div></dl>
        <h3>Tracklist</h3><ol class="tracks"><li><strong>Down In Bossa</strong> · 2:26</li><li><strong>Down In Bossa (Extended Edit)</strong> · 3:24</li></ol>
        <p>The Extended Edit is the longer 3:24 version, handy in a DJ set; the original runs 2:26. You can also open the single directly on ${ext("https://music.apple.com/us/album/down-in-bossa-single/6822243986", "Apple Music")}.</p></section>
        <section><h2>Who made Down In Bossa?</h2>
        <p>The track is credited to Ash Army &amp; ACND. ACND, pronounced “Ascend”, is the artist name of <strong>Ahmed Masum</strong>, a producer, DJ and composer based in Dhaka, Bangladesh. Ahmed Masum and ACND are one artist, not two collaborators. Ash Army is the separately credited partner on the record.</p>
        <p>When you share the release, keep the full artist line: “Down In Bossa — Ash Army &amp; ACND, out now on Profi Music”. The ${post("down-in-bossa-collaboration-credits", "Down In Bossa credits guide")} explains each field in more detail, and ${acnd("Ahmed Masum’s ACND artist profile")} covers the rest of his work.</p></section>
        <section><h2>The sound: Afro House with a bossa title</h2>
        <p>The release information describes “Down In Bossa” as Afro House: a style built on rolling percussion, deep bass and space in the groove. “Bossa” is part of the title; the title alone does not tell you whether a bossa nova sample or instrument is used, so listen to the full track and judge for yourself.</p>
        <p>New to the genre? The ${post("afro-house-listening-guide", "Afro House listening guide")} gives a short exercise for hearing how percussion, bass and space work together, which is a useful way into this track.</p></section>
        <section><h2>Down In Bossa for summer, beach and Ibiza-inspired playlists</h2>
        <p>Afro House is a regular choice for sunset sets, beach bars and summer playlists, and many listeners build Ibiza-inspired selections around that warm, percussive sound. If that is the playlist you are making, “Down In Bossa” is a fresh Profi Music release to try. For a DJ set, reach for the Extended Edit; for a playlist, the 2:26 original keeps things moving.</p>
        <ol><li><strong>Save it from the official link.</strong> Use the ${ext(next.presave, "smart link")} so the track lands in your library with the correct credits.</li><li><strong>Hear it in full.</strong> Judge the energy and the build from the complete track, not a short preview.</li><li><strong>Place it in the flow.</strong> Compare it with the tracks either side so the transition feels natural.</li><li><strong>Keep the credit.</strong> List it as Ash Army &amp; ACND so both artists are found.</li></ol>
        <p>This is a listening suggestion. It does not claim Ibiza airplay, a club booking or a venue endorsement.</p></section>
        <section><h2>More from ACND</h2>
        <p>“Down In Bossa” is one side of ACND’s work; his own productions also move through techno, melodic techno, acid and progressive sounds. Find his profiles in the ${post("where-to-listen-acnd", "where to listen to ACND guide")}, and hear him with অপূর্ব on the ${mix("Qbic Pulse DJ mix and tracklist")} made for Hong Kong Community Radio.</p></section>`,
    },
    {
      slug: "ahmed-masum-acnd-name-guide",
      title: "Ahmed Masum and ACND: one artist, two names",
      description:
        "Ahmed Masum is ACND, pronounced Ascend: a producer, DJ and composer based in Dhaka. A guide to his name, credits and artist profiles.",
      category: "Artist identity",
      image: "img/acnd-portrait.webp",
      imageAlt: "ACND artist image from the I Rave You portfolio",
      answer:
        "Ahmed Masum is the artist known as ACND, pronounced “Ascend”. He is a producer, DJ and composer based in Dhaka, Bangladesh. The two names identify the same artist.",
      related: [
        "where-to-listen-acnd",
        "nitol-paye-electric-acnd-remix-credit",
        "dhaka-electronic-music-acnd",
      ],
      body: `
        <section><h2>What does ACND mean on this site?</h2>
        <p>ACND is Ahmed Masum’s recording and performance name. It is pronounced “Ascend”. A release credit using ACND and a portfolio reference using Ahmed Masum therefore refer to one person. They should not be read as a collaboration between two different artists.</p>
        <p>The distinction is useful when moving between a music platform, a video credit and an artist biography. Display names can change from one service to another. The clearest starting point is ${acnd()}, which brings the biography and linked music profiles together.</p></section>
        <section><h2>Ahmed Masum, ACND and alternate search spellings</h2>
        <p>This portfolio uses <strong>Ahmed Masum</strong> as the personal name and <strong>ACND</strong> as the artist name. If you arrived through a search for “Ahmed Al Masum”, the artist presented here is Ahmed Masum / ACND. That phrase is included as an alternate search spelling, rather than a claim about a different legal name or a separate collaborator.</p>
        <p>Because names and short artist aliases can overlap, a search result alone is not enough to identify a musician. Check the profile’s linked recordings, location and official artist destinations together.</p>
        <dl class="fact-list"><div><dt>Artist name</dt><dd>ACND</dd></div><div><dt>Personal name used here</dt><dd>Ahmed Masum</dd></div><div><dt>Pronunciation</dt><dd>Ascend</dd></div><div><dt>Based in</dt><dd>Dhaka, Bangladesh</dd></div><div><dt>Creative roles</dt><dd>Producer, DJ and composer</dd></div></dl></section>
        <section><h2>Searching for Masum, the musician?</h2><p>“Masum” on its own can refer to many different people. To identify the musician presented on this site, use the full name Ahmed Masum alongside the artist name ACND. Match the biography and linked music profiles rather than assuming that every result containing Masum refers to this artist.</p><p>For a concise reference you can cite, use the ${acnd()}. Publications and radio listings can also use the ${link("acnd/press/", "ACND press kit")} for biographies and credits.</p></section>
        <section><h2>Which credits connect these names?</h2>
        <p>The “Nitol Paye Electric” remix is credited here to ACND (Ahmed Masum). It is not an অপূর্ব remix credit. For the video destination and a clear explanation of the credit, read the ${post("nitol-paye-electric-acnd-remix-credit", "Nitol Paye Electric remix guide")}.</p>
        <p>“Down In Bossa” is a separate collaboration credited to Ash Army &amp; ACND, released 30 October 2026 via Profi Music. The label’s page is the reference for release availability. ACND also shares the Qbic Pulse DJ set with অপূর্ব, the electronic project of Khalid Bin Alam. These are distinct collaborations, rather than additional names for ACND.</p></section>
        <section><h2>How to find the right artist profile</h2>
        <p>Start from this site’s ${post("where-to-listen-acnd", "ACND listening directory")} and follow its Spotify, SoundCloud or Instagram links. When sharing an artist credit, “ACND (Ahmed Masum)” gives readers both names without suggesting two contributors. For a shorter music credit, “ACND” is the artist name used throughout this portfolio.</p>
        <p>For the full biography, return to ${acnd()}. For the broader musical context, explore the ${post("acnd-techno-melodic-acid-progressive", "guide to ACND’s musical directions")}.</p></section>`,
    },
    {
      slug: "acnd-techno-melodic-acid-progressive",
      title:
        "Techno, melodic techno, acid and progressive: ACND’s musical directions",
      description:
        "A listening guide to the techno, melodic techno, acid and progressive language around ACND, with practical ways to explore his music and DJ set.",
      category: "Listening guide",
      image: "img/logo-acnd.png",
      imageAlt: "ACND artist logo",
      answer:
        "ACND’s artist biography describes work across techno, melodic techno, acid and progressive sounds. These terms describe musical directions; they do not mean every release or every track in his DJ set has the same genre.",
      related: [
        "afro-house-listening-guide",
        "qbic-pulse-listening-route",
        "dhaka-electronic-music-acnd",
      ],
      body: `
        <section><h2>Use genre as a listening tool</h2>
        <p>A genre name is most helpful when it directs your attention to something you can hear. It is less useful when it becomes a rigid promise about every track an artist makes. ACND’s biography names techno, melodic techno, acid and progressive as recurring directions. His collaboration with Ash Army, “Down In Bossa”, is separately presented as Afro House.</p>
        <p>That range is a reason to explore individual recordings rather than assume a single fixed style. ${acnd()} provides the identity and biography; this guide explains some of the listening vocabulary.</p></section>
        <section><h2>Four ways to pay attention</h2>
        <table><thead><tr><th scope="col">Direction</th><th scope="col">What to listen for</th></tr></thead><tbody>
        <tr><th scope="row">Techno</th><td>Rhythmic repetition, the relationship between kick and bass, and small changes in texture over time.</td></tr>
        <tr><th scope="row">Melodic techno</th><td>The interaction between dance-floor rhythm, pitched motifs, atmosphere and tension.</td></tr>
        <tr><th scope="row">Acid</th><td>Resonant, squelching synthesizer lines and the way changes in tone reshape a repeated phrase.</td></tr>
        <tr><th scope="row">Progressive</th><td>Gradual development: layers entering or leaving, longer transitions and a sense of movement across a sequence.</td></tr>
        </tbody></table>
        <p>These are broad listening prompts, not formal rules or a claim about ACND’s studio equipment. An acid sound does not establish that a particular synthesizer was used, and a melodic passage does not settle a track’s genre by itself.</p></section>
        <section><h2>Try a continuous set before isolating a track</h2>
        <p>A DJ set lets you hear how selections relate across time. In Qbic Pulse, ACND and অপূর্ব share one continuous programme for Hong Kong Community Radio. Its ${mix()} gives takeover timestamps and original-recording links. Those markers help you identify a selection without treating the set as fifteen unrelated songs.</p>
        <p>Listen for what changes at a transition: a bass pattern, a new rhythmic emphasis, a different melodic shape or simply more space. There is no need to decide which host selected each track; the published tracklist does not attribute individual selections to one DJ.</p></section>
        <section><h2>Keep individual credits and genres separate</h2>
        <p>A recording included in a mix remains credited to its original artists. Playing another producer’s track is different from producing it. Likewise, an artist’s broad musical interests should not replace the genre and contributor information supplied for a specific release.</p>
        <p>For an example of that distinction, explore ${release()} and the ${post("afro-house-listening-guide", "Afro House listening guide")}. For a practical route through the shared set, continue with ${post("qbic-pulse-listening-route", "Qbic Pulse in three listening stages")}.</p></section>`,
    },
    {
      slug: "afro-house-listening-guide",
      title: "How to listen to Afro House: rhythm, space and the full track",
      description:
        "An introduction to listening for groove, percussion and space in Afro House, with Down In Bossa by Ash Army & ACND as a release to explore.",
      category: "Genre guide",
      image: "img/down-in-bossa.jpg",
      imageAlt: "Down In Bossa cover artwork, credited to Ash Army and ACND",
      answer:
        "When exploring Afro House, listen to how the steady house pulse interacts with layered percussion, bass and space. “Down In Bossa” by Ash Army & ACND is presented by this portfolio as an Afro House release on Profi Music.",
      related: [
        "down-in-bossa-collaboration-credits",
        "acnd-techno-melodic-acid-progressive",
        "where-to-listen-acnd",
      ],
      body: `
        <section><h2>Start with the relationship between rhythms</h2>
        <p>Afro House is a broad area of house music with roots in African, especially South African, dance-music scenes. Individual records vary considerably. A useful first listen focuses on the relationship between the central dance pulse and the other rhythmic parts, rather than treating one drum sound as a definition of the whole genre.</p>
        <p>Try following the kick for a few bars, then shift attention to the percussion around it. Notice whether accents repeat, answer one another or leave gaps. That change of attention can reveal a different groove inside a passage you have already heard.</p></section>
        <section><h2>Three passes through a recording</h2>
        <ol><li><strong>Rhythm first.</strong> Listen for the pulse and the placement of percussion around it. Resist the temptation to judge the whole track from the opening seconds.</li><li><strong>Bass and space next.</strong> Notice how bass phrases fit between the drums, and where parts stop to make room for something else.</li><li><strong>Structure last.</strong> Follow how the arrangement grows, releases tension and returns. A full recording often makes those decisions clearer than a short social clip.</li></ol>
        <p>This exercise is a listening method, not a technical checklist every Afro House producer must follow. It also avoids assuming that a title, artwork or genre label reveals which instruments, samples or production tools were used.</p></section>
        <section><h2>Where Down In Bossa fits</h2>
        <p>“Down In Bossa” is credited to Ash Army &amp; ACND and described as Afro House in the release information supplied for this site. It was released on 30 October 2026 via Profi Music. The ${ext(next.page, "Profi Music release page")} is the reference for current availability, and the ${ext(next.presave, "label’s smart link")} opens the listening destinations.</p>
        <p>This guide does not claim to be a review of an advance recording. It does not infer a bossa nova sample, a particular tempo or an instrument from the title. Once the recording is available, use the listening exercise above to form your own impression. Find the factual summary on the ${release("dedicated release page")}.</p></section>
        <section><h2>Explore the collaborators without losing the track credit</h2>
        <p>ACND is Ahmed Masum, a producer and DJ based in Dhaka. “Down In Bossa” is a collaboration with Ash Army; it should not be reduced to a solo credit. The ${post("down-in-bossa-collaboration-credits", "collaboration and credits guide")} explains the difference between artists, label and listening links.</p>
        <p>If you are arriving from ACND’s techno-oriented portfolio, a different genre label is an invitation to hear another side of the work. Read the ${post("acnd-techno-melodic-acid-progressive", "guide to his broader musical directions")} for that context.</p></section>`,
    },
    {
      slug: "down-in-bossa-collaboration-credits",
      title: "Ash Army & ACND: understanding the Down In Bossa credits",
      description:
        "Who is credited on Down In Bossa? Understand the artist pairing, Profi Music label reference and where to check the official release information.",
      category: "Release credits",
      image: "img/down-in-bossa.jpg",
      imageAlt: "Official cover used for Down In Bossa by Ash Army and ACND",
      answer:
        "“Down In Bossa” is credited to Ash Army & ACND, with Profi Music as the label, released on 30 October 2026. ACND is Ahmed Masum; Ash Army is the separately credited collaborator.",
      related: [
        "down-in-bossa-out-now-profi-music",
        "afro-house-listening-guide",
        "ahmed-masum-acnd-name-guide",
      ],
      body: `
        <section><h2>Read the artist line as a collaboration</h2>
        <p>The artist pairing is <strong>Ash Army &amp; ACND</strong>. ACND is Ahmed Masum’s artist identity, while Ash Army is the separately named collaborator. That makes “Ahmed Masum and ACND” an incorrect way to describe two contributors to this recording: those names identify the same person.</p>
        <p>The ${release()} collect the title, genre, release date and official destinations in one place. This article explains how to interpret those fields when sharing the release or finding it on another service.</p></section>
        <section><h2>What each field tells you</h2>
        <dl class="fact-list"><div><dt>Title</dt><dd>Down In Bossa</dd></div><div><dt>Credited artists</dt><dd>Ash Army &amp; ACND</dd></div><div><dt>Genre supplied for this site</dt><dd>Afro House</dd></div><div><dt>Label</dt><dd>Profi Music</dd></div><div><dt>Released</dt><dd>30 October 2026</dd></div></dl>
        <p>The artist line identifies the release’s credited performers or creators at the public-facing level. The label name identifies the release organisation. Neither field, by itself, supplies a full breakdown of songwriting shares, production tasks, publishing, distribution contracts or ownership of any underlying material.</p></section>
        <section><h2>Where to check availability and detailed metadata</h2>
        <p>Use the ${ext(next.page, "label’s release page")} and ${ext(next.presave, "official smart link")} to check the available destinations. Availability can still differ by platform and territory.</p>
        <p>If you need detailed credits for a publication or a rights enquiry, consult the label’s published metadata and the relevant service’s credits view. This portfolio does not invent a split between the collaborators or claim an unlisted contributor. Do not infer a sample source or musical quotation from the words “Bossa” or “Afro House”.</p></section>
        <section><h2>How to share the release accurately</h2>
        <p>A clear reference is “Down In Bossa — Ash Army &amp; ACND, via Profi Music”. Since 30 October 2026 the recording is out; link the official smart link so listeners land on the right platform.</p>
        <p>For the artist behind the alias, read ${post("ahmed-masum-acnd-name-guide", "Ahmed Masum and ACND: one artist, two names")}. For a way into the genre, try the ${post("afro-house-listening-guide", "Afro House listening guide")}. Keep those artist and listening explanations connected to the factual release page rather than treating them as replacement credits.</p></section>`,
    },
    {
      slug: "qbic-pulse-listening-route",
      title: "Qbic Pulse with ACND & অপূর্ব: a route through the DJ set",
      description:
        "Explore the Qbic Pulse set in three timestamped stages, from Initiate to Mystic, with ACND and অপূর্ব and links to the complete tracklist.",
      category: "Mix guide",
      image: "img/og-frequency-unity.jpg",
      imageAlt: "অপূর্ব and ACND logos from the Frequency & Unity artwork",
      answer:
        "Qbic Pulse is the shared DJ set presented here by ACND and অপূর্ব for Hong Kong Community Radio. It opens with “Initiate” at 00:00; the published tracklist identifies fifteen selections with takeover timestamps.",
      related: [
        "how-to-read-dj-mix-tracklist",
        "initiate-unreleased-id-guide",
        "acnd-techno-melodic-acid-progressive",
      ],
      body: `
        <section><h2>Listen continuously, then return to a marker</h2>
        <p>A continuous set makes different demands from a playlist. Transitions and overlaps are part of the listening experience, so the moment a new selection takes over matters as much as its title. Qbic Pulse is presented here as a shared set by ACND and অপূর্ব for Hong Kong Community Radio.</p>
        <p>The route below divides the published sequence into three convenient listening stages. These are editorial navigation points, not chapters announced by the DJs or evidence of which host selected a track. Use the ${mix()} for every exact takeover time and original-recording destination.</p></section>
        <section><h2>Stage one: the opening, 00:00–15:43</h2>
        <p>The set begins with “Initiate”, credited to ACND × অপূর্ব and marked as an unreleased ID. Remusic’s “Ancestral Calling” takes over at 03:37, followed by the Vakabular remix of “Acid” at 06:35. “Life” arrives at 09:41, and “Lose My Body” at 12:28.</p>
        <p>Rather than skipping immediately, hear how one selection hands the floor to the next. If the opening is the track you came to identify, the ${post("initiate-unreleased-id-guide", "Initiate guide")} explains what the unreleased label means and which details are published here.</p></section>
        <section><h2>Stage two: the middle sequence, 15:43–30:48</h2>
        <p>HERMEN’s “Subra” is marked at 15:43. The next takeover points are “Mars” at 18:59 and “WTF” at 21:37. Andy Syn, Heinrich &amp; Heine’s “I Need Every Little Piece of You” follows at 25:30, with the Original Mix specified in the tracklist.</p>
        <p>That version detail is worth preserving when you move to a streaming service. An original mix, remix and extended version may share a title while being different recordings. The tracklist links aim to identify the version actually listed, rather than send you to a broad search result.</p></section>
        <section><h2>Stage three: from Pria to the closing selection</h2>
        <p>Rem Siman’s “Pria” takes over at 30:48. The sequence continues with “QUENTE” at 33:47, “LOSE CONTROL” at 35:41, “Duck Duck” at 38:11 and “Nakupenda” at 40:57. Axl Stace’s “Mystic” is the last published takeover marker, at 43:19.</p>
        <p>A takeover time does not state the full runtime of the source recording. Nor does the final marker establish the set’s ending time. Read ${post("how-to-read-dj-mix-tracklist", "how to read a DJ mix tracklist")} for those distinctions.</p></section>
        <section><h2>After the set</h2>
        <p>Follow the original-recording links to explore the featured artists on their own platforms. Listening to this site’s mix is not counted as a Spotify, Apple Music or SoundCloud stream of each source track. For the hosts themselves, explore ${acnd()} and ${link("apurba/", "অপূর্ব’s biography and releases")}.</p></section>`,
    },
    {
      slug: "how-to-read-dj-mix-tracklist",
      title:
        "How to read a DJ mix tracklist: timestamps, takeovers and versions",
      description:
        "Learn what DJ mix timestamps mean, why remix versions matter and how to find the correct original recording using the Qbic Pulse tracklist.",
      category: "Track identification",
      image: "img/og-frequency-unity.jpg",
      imageAlt: "Artwork connecting the ACND and অপূর্ব artist identities",
      answer:
        "In the Qbic Pulse tracklist, each timestamp marks where a track takes over in the mix. It is a position inside the continuous set, not the original track’s duration or a promise that its first sound begins at that instant.",
      related: [
        "qbic-pulse-listening-route",
        "initiate-unreleased-id-guide",
        "where-to-listen-acnd",
      ],
      body: `
        <section><h2>A timestamp belongs to the set</h2>
        <p>If a track is marked 06:35, go to six minutes and thirty-five seconds into the DJ mix. Do not look for a source recording with that runtime. In a blended transition, elements from a new selection can be audible before the published takeover marker, while elements from the previous selection may remain afterwards.</p>
        <p>The ${mix()} uses takeover times supplied for this set. That convention helps listeners identify what is leading the mix without pretending there is a clean silence between selections.</p></section>
        <section><h2>Preserve the complete recording name</h2>
        <p>One title can lead to several different recordings. For example, Qbic Pulse lists “Acid” as the <strong>Vakabular Remix</strong>, with Acrobat, Thomas Gandey and Vakabular in the artist credit. Searching only “Acid” discards the detail that distinguishes this selection.</p>
        <p>Likewise, “I Need Every Little Piece of You” is listed with <strong>Original Mix</strong>. Keep the version wording when sharing it. A matching title or cover is useful, but the remix and version fields often decide whether you have found the right recording.</p>
        <ol><li>Read the artist credit and full title.</li><li>Keep remix, edit and version names intact.</li><li>Follow the tracklist’s recording link.</li><li>Check the destination’s displayed title and artists.</li></ol></section>
        <section><h2>Why the links go to different platforms</h2>
        <p>The Qbic Pulse list includes Apple Music and SoundCloud links because the goal is to point to the identified recording, not force every result onto one service. A publisher or artist page can be the clearest source for a particular mix version.</p>
        <p>Links may require a platform account or have regional availability limits. If a destination changes or becomes unavailable, report the track and its timestamp through the ${link("legal/copyright/", "site contact page")} rather than substituting a similarly named song.</p></section>
        <section><h2>What an ID does and does not tell you</h2>
        <p>“ID” is commonly used when a track’s identifying or release information is not fully public. The first Qbic Pulse selection is named “Initiate” and marked as an unreleased ID. That label is not a release date, an invitation to redistribute audio or proof that a platform search result belongs to the same recording.</p>
        <p>The ${post("initiate-unreleased-id-guide", "Initiate article")} collects the specific information supplied for that selection. The ${post("qbic-pulse-listening-route", "three-stage set guide")} provides a broader route through the fifteen takeover points.</p></section>
        <section><h2>A tracklist is identification, not a streaming counter</h2>
        <p>A website playing a continuous DJ mix does not automatically credit the underlying recordings as plays on external music services. If you want to listen through a featured artist’s platform page, open the original-recording link and use that service. Credits and listening links also do not establish the permissions needed to publish a mix.</p></section>`,
    },
    {
      slug: "nitol-paye-electric-acnd-remix-credit",
      title: "Nitol Paye Electric remix: the ACND (Ahmed Masum) credit",
      description:
        "The Nitol Paye Electric remix is credited to ACND, the artist name of Ahmed Masum. Find the linked video and understand what the remix credit means.",
      category: "Remix credits",
      image: "img/logo-acnd.png",
      imageAlt: "ACND artist logo accompanying the remix credit",
      answer:
        "The “Nitol Paye Electric” remix is credited on this portfolio to ACND (Ahmed Masum). ACND and Ahmed Masum are the same artist; this remix is not credited here to অপূর্ব.",
      related: [
        "ahmed-masum-acnd-name-guide",
        "where-to-listen-acnd",
        "down-in-bossa-collaboration-credits",
      ],
      body: `
        <section><h2>The credit to use</h2>
        <p>The portfolio’s supplied credit is <strong>“Nitol Paye Electric — ACND (Ahmed Masum) Remix”</strong>. If you are identifying the remix from this site, preserve that artist attribution. ACND is the recording name, and Ahmed Masum identifies the same musician.</p>
        <p>The video destination listed for this remix is ${ext("https://youtu.be/om5QGreRaYg", "Nitol Paye Electric on YouTube")}. Opening that destination is the most direct way to compare the recording you are looking for with the link supplied here.</p></section>
        <section><h2>Why the name distinction matters</h2>
        <p>This site presents two artists: ACND and অপূর্ব. They collaborate on other work, but a shared portfolio does not make every track a joint production. The “Nitol Paye Electric” remix credit belongs to ACND, rather than an অপূর্ব × Ahmed Masum pairing.</p>
        <p>For the name relationship and alternate search spelling, see ${post("ahmed-masum-acnd-name-guide", "Ahmed Masum and ACND: one artist, two names")}. For the other artist’s separate work, use ${link("apurba/", "অপূর্ব’s artist profile")}. Keeping those identities clear helps listeners find the right catalogue.</p></section>
        <section><h2>A remix credit is different from the original-song credit</h2>
        <p>Attributing a remix identifies the person credited with that version. It does not automatically state who wrote the underlying song, owns the original master, controls publishing or authorised a sample. Those rights can belong to different people or organisations.</p>
        <p>This article does not add unverified original-song credits, claim the remix is officially licensed or announce a release date. If you need rights information for reuse, obtain it from the relevant rights holders rather than treating a portfolio credit as clearance.</p></section>
        <section><h2>How to share or cite the remix</h2>
        <p>Use the full track wording and remix artist name, then link to the listed video. A useful plain-language reference is: “Nitol Paye Electric — remix by ACND (Ahmed Masum).” A link preserves the destination without copying or redistributing the audio itself.</p>
        <p>Before embedding, downloading or reusing any part of a recording, check the permissions and platform terms that apply to that use. If the credit or linked content is disputed, the ${link("legal/copyright/", "copyright contact process")} explains how to identify the material for review.</p></section>
        <section><h2>Explore ACND’s other work</h2>
        <p>For current artist information and the next release presented here, visit ${acnd()}. “Down In Bossa” is a separate Ash Army &amp; ACND collaboration via Profi Music; the ${post("down-in-bossa-collaboration-credits", "release-credit guide")} keeps that collaboration distinct from this remix. The ${post("where-to-listen-acnd", "ACND listening directory")} brings the artist-platform destinations together.</p></section>`,
    },
    {
      slug: "initiate-unreleased-id-guide",
      title: "Initiate by ACND × অপূর্ব: what the unreleased ID label means",
      description:
        "Initiate opens the Qbic Pulse set at 00:00. Understand its ACND × অপূর্ব credit, position in the set and unreleased ID status.",
      category: "Track guide",
      image: "img/og-frequency-unity.jpg",
      imageAlt: "ACND and অপূর্ব logos for their shared music project",
      answer:
        "“Initiate” is listed as an unreleased collaboration by ACND × অপূর্ব and opens their Qbic Pulse set at 00:00. No separate external listening link or release date is published here.",
      related: [
        "qbic-pulse-listening-route",
        "how-to-read-dj-mix-tracklist",
        "ahmed-masum-acnd-name-guide",
      ],
      body: `
        <section><h2>What is known about this selection?</h2>
        <p>The first entry in the ${mix()} is “Initiate (unreleased ID)”, credited to ACND × অপূর্ব. Its marker is 00:00, making it the published opening selection of the shared set. No external listening link is provided for this unreleased track.</p>
        <p>Those details identify the work presented by this portfolio. They do not establish a commercial release date, an album announcement or availability on every music service. Searching the title alone can return unrelated recordings, so keep both artist names with the title.</p></section>
        <section><h2>Who are the collaborators?</h2>
        <p>ACND is Ahmed Masum, a producer and DJ based in Dhaka. অপূর্ব, also written Opurbo or Apurba in Latin script, is the electronic project of Khalid Bin Alam from Cumilla. The collaboration connects two separate artists; Ahmed Masum is not a third collaborator in addition to ACND.</p>
        <p>Their biographies are available on ${acnd()} and ${link("apurba/", "অপূর্ব’s artist page")}. The ${link("frequency-unity/", "Frequency & Unity feature")} provides additional context for the shared project and set.</p></section>
        <section><h2>Why a named track can still be an ID</h2>
        <p>In DJ-set language, “ID” can mark music whose complete identifying or release information is not public. A working title and artist credit may be known while a label, release date or final distribution plan is not. “Unreleased” describes that release status; it does not mean the audio cannot have been heard in a set.</p>
        <p>For “Initiate”, use the specific title and credit supplied here rather than inventing missing metadata. If information changes, an artist or label announcement should establish the update. A listener upload or a matching title on another service is not enough to confirm it.</p></section>
        <section><h2>Hear it in context</h2>
        <p>To hear the published sequence, ${link("", "open the site’s mix player")} and begin at the start. There is no separate external recording link on this site. The ${post("qbic-pulse-listening-route", "Qbic Pulse listening route")} places the opening alongside the selections that follow it.</p>
        <p>The ${post("how-to-read-dj-mix-tracklist", "timestamp and version guide")} explains why a marker belongs to the continuous set rather than the source track’s runtime. This matters when matching a section of the mix to a separately linked recording.</p></section>
        <section><h2>Listening access does not grant reuse rights</h2>
        <p>An unreleased label does not make a recording public domain. A listening link does not grant permission to download, re-upload, sample or sell the work. For any intended reuse, seek the required permission from the relevant rights holders.</p></section>`,
    },
    {
      slug: "dhaka-electronic-music-acnd",
      title: "Exploring an electronic music artist from Dhaka: ACND",
      description:
        "A focused route into the work of ACND (Ahmed Masum), a producer and DJ based in Dhaka, through artist profiles, collaborations and the Qbic Pulse mix.",
      category: "Artist discovery",
      image: "img/acnd-portrait.webp",
      imageAlt: "ACND portfolio artist image",
      answer:
        "ACND is an electronic music producer, DJ and composer based in Dhaka, Bangladesh. This guide explores his portfolio through his artist identity, collaborations and shared radio set, rather than claiming to rank Bangladesh’s artists.",
      related: [
        "acnd-techno-melodic-acid-progressive",
        "where-to-listen-acnd",
        "qbic-pulse-listening-route",
      ],
      body: `
        <section><h2>Begin with one artist’s actual work</h2>
        <p>A search for electronic music from Bangladesh can lead to artist profiles, event listings, videos and playlists that answer very different questions. If your goal is to explore ACND, a focused route through his own work is more useful than an unsupported “best DJs” list.</p>
        <p>ACND is the artist name of Ahmed Masum, a producer, DJ and composer based in Dhaka. His ${acnd("artist profile")} is the foundation for the biographical details used here. This page offers a listening route; it is not a survey of the whole city’s music scene or a claim about his relative status within it.</p></section>
        <section><h2>First stop: identity and musical directions</h2>
        <p>The name is pronounced “Ascend”. ACND and Ahmed Masum refer to the same artist, a distinction that helps when following credits across a video, biography and streaming service. The ${post("ahmed-masum-acnd-name-guide", "artist-name guide")} explains that relationship in more detail.</p>
        <p>His supplied biography describes work across techno, melodic techno, acid and progressive sounds. Those categories are a starting vocabulary, rather than a complete description of every recording. The ${post("acnd-techno-melodic-acid-progressive", "musical-directions guide")} offers concrete things to listen for without inventing studio techniques or equipment.</p></section>
        <section><h2>Second stop: hear a shared set</h2>
        <p>Qbic Pulse brings ACND together with অপূর্ব, the project of Khalid Bin Alam from Cumilla. The set is presented for Hong Kong Community Radio and begins with their unreleased collaboration “Initiate”. A shared programme is a way to explore how artists connect their own work with music by other producers.</p>
        <p>The ${mix()} identifies fifteen selections. Use the ${post("qbic-pulse-listening-route", "listening route")} to move through the sequence, or open the full player and follow the timestamps. The list credits featured tracks to their original artists; inclusion does not make them ACND productions.</p></section>
        <section><h2>Third stop: follow a release collaboration</h2>
        <p>“Down In Bossa” is credited to Ash Army &amp; ACND and presented as Afro House via Profi Music, released 30 October 2026. The ${release()} point to the label’s current information and smart link.</p>
        <p>Comparing a continuous DJ set with a specifically credited release gives you two different views of a musician’s work. One foregrounds selection and sequencing; the other provides a recording to explore on its own terms. Neither requires a sweeping claim that one artist represents all Bangladeshi electronic music.</p></section>
        <section><h2>Keep exploring through identifiable sources</h2>
        <p>The ${post("where-to-listen-acnd", "ACND listening directory")} lists the linked artist destinations in one place. Check those profiles and the label’s page when sharing music or looking for updates. A booking date, award or festival appearance should be supported by a current announcement, not inferred from a location or a music genre.</p></section>`,
    },
    {
      slug: "where-to-listen-acnd",
      title: "Where to listen to ACND: artist profiles, releases and the mix",
      description:
        "Find ACND’s Spotify, SoundCloud and Instagram destinations, the Down In Bossa label link, Nitol Paye Electric remix video and Qbic Pulse tracklist.",
      category: "Listening directory",
      image: "img/logo-acnd.png",
      imageAlt: "ACND artist logo used for the listening directory",
      answer:
        "Start with the ACND artist links listed by this portfolio: Spotify and SoundCloud for artist discovery, the Profi Music smart link for Down In Bossa, YouTube for the listed Nitol Paye Electric remix, and this site for the Qbic Pulse mix.",
      related: [
        "ahmed-masum-acnd-name-guide",
        "down-in-bossa-collaboration-credits",
        "nitol-paye-electric-acnd-remix-credit",
      ],
      body: `
        <section><h2>Choose a destination for what you want to hear</h2>
        <p>An artist profile, a release page and a continuous mix answer different listening needs. A profile helps you explore a catalogue; a label page identifies a specific release; a mix places multiple selections in sequence. The links below preserve those distinctions instead of sending every listener to a generic search result.</p>
        <p>ACND is Ahmed Masum, pronounced “Ascend”, based in Dhaka, Bangladesh. If you need the biography before listening, start with ${acnd()} or the ${post("ahmed-masum-acnd-name-guide", "artist-name guide")}.</p></section>
        <section><h2>Artist-platform destinations</h2>
        <ul><li>${ext("https://open.spotify.com/artist/5Ts3wXXRcpcnMXZmMwqgwY", "ACND on Spotify")} — the artist profile linked by this portfolio.</li><li>${ext("https://soundcloud.com/acndlovestoes", "ACND on SoundCloud")} — another artist destination supplied for ACND.</li><li>${ext("https://www.instagram.com/acnd_music/", "ACND on Instagram")} — the social profile linked here for the artist.</li></ul>
        <p>Services control their own account requirements, regional availability and profile presentation. If a page changes, compare its identity and linked music with this portfolio rather than assuming every result named ACND belongs to the same musician.</p></section>
        <section><h2>For Down In Bossa, use the label’s links</h2>
        <p>“Down In Bossa” is the Ash Army &amp; ACND collaboration presented here via Profi Music. Use ${ext(next.page, "the label release page")} for the factual release reference and ${ext(next.presave, "the official smart link")} for the streaming and store destinations. It was released on 30 October 2026.</p>
        <p>The ${release()} bring those details together, while the ${post("down-in-bossa-collaboration-credits", "collaboration guide")} explains the artist line. Availability can differ by platform and territory, so the smart link is the safest route.</p></section>
        <section><h2>For the remix and shared set</h2>
        <p>The listed “Nitol Paye Electric” remix video is ${ext("https://youtu.be/om5QGreRaYg", "on YouTube")}. The remix credit used on this site is ACND (Ahmed Masum). Read the ${post("nitol-paye-electric-acnd-remix-credit", "remix-credit guide")} if you are citing or identifying that version.</p>
        <p>For ACND and অপূর্ব together, open ${mix("Qbic Pulse’s timestamped tracklist")} and follow its link to the continuous player. The list includes the opening unreleased ID “Initiate” and fourteen further selections, with original-recording destinations.</p></section>
        <section><h2>What counts as a platform stream?</h2>
        <p>Playing this site’s self-hosted mix does not automatically create plays for its underlying tracks on Spotify, Apple Music or SoundCloud. Following a link also does not guarantee a counted play: each platform applies its own playback and eligibility rules. To listen on a service, open its destination and use its player normally.</p>
        <p>No page here asks you to simulate plays or loop tracks to manipulate counts. Explore the music because you want to hear it, and use the ${link("legal/privacy/", "privacy notice")} for information about this site’s storage and external links.</p></section>`,
    },
  ];
}
