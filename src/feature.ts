import './style.css';
import './artist.css';
import './feature.css';
import './mobile.css';
import { mountChrome } from './chrome';
import { installGuard } from './guard';
import { mountPlayer } from './player';
import { mountVibeBanner, revealOnScroll } from './ui';

/**
 * The "Beyond the Capital" feature. The article itself is static HTML in
 * frequency-unity/index.html so crawlers read every word; this only adds the
 * site chrome, plus a non-blocking audio-choice banner that starts the set.
 */

installGuard();
mountChrome();
mountPlayer();
revealOnScroll(document);
mountVibeBanner();
