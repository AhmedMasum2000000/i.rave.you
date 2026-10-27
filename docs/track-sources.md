# Track link verification

Checked 27 October 2026 against Apple’s public iTunes Search catalog and SoundCloud track metadata. These are direct recording links, never platform search pages. Catalog availability and playback can vary by country and account.

| Takeover | Recording | Source |
|---|---|---|

Version checks:

- Initiate: the supplied SoundCloud short link resolves to ACND_Music’s “Initiate -Unreleased ID”, not the complete Qbic Pulse set. Retain the short link because the destination includes the creator’s private-share token.
- Acid: SoundFocus’s release has the exact “Vakabular Remix” title and Acrobat / Thomas Gandey publisher credits (ISRC GBKQU2607588). Apple’s search returned an extended remix, so that different version was not selected.
- WTF: direct recording on Mark Hoffen’s verified SoundCloud profile, credited to Mark Hoffen and Bittermind.
- I Need Every Little Piece of You: Andy Syn’s SoundCloud recording explicitly identifies Original Mix and publisher credits “Andy Syn, Heinrich & Heine” (ISRC UKHKF1250267); the instrumental version was excluded.
- Nakupenda: exact title on Adapter’s verified SoundCloud profile (ISRC QM6N22650457); Apple’s result was an extended mix, which was not substituted.
- Mystic: the catalog’s plain “Mystic” recording was selected; extended and slowed/reverb versions were excluded.

## Playback and rights

The site continues to play the existing self-hosted DJ mix at the owner’s request. Clicking a source opens that original recording in a separate tab; it does not switch the mix to a platform stream. Self-hosted playback does not generate Spotify, Apple Music or SoundCloud streams. Artist credits and external links do not license the mix. The owner is confirming permissions.

Official playback options include [Spotify embeds](https://developer.spotify.com/documentation/embeds), [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk) (Spotify Premium and OAuth required), [Apple MusicKit](https://developer.apple.com/musickit/) and the [SoundCloud Widget API](https://developers.soundcloud.com/docs/api/html5-widget). Platforms determine eligible playback and counting under their own policies; none can retroactively report local mix playback as original-track streams. A catalog metadata API is not a music playback license.
