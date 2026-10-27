import './style.css';
import './artist.css';
import './feature.css';
import { mountChrome } from './chrome';
import { installGuard } from './guard';
import { mountPlayer } from './player';
import { revealOnScroll } from './ui';

/**
 * The "Beyond the Capital" feature. The article itself is static HTML in
 * frequency-unity/index.html so crawlers read every word; this only adds the
 * site chrome. The set starts from the player's play button, so no gate.
 */

installGuard();
mountChrome();
mountPlayer();
revealOnScroll(document);
