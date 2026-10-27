import './style.css';
import './artist.css';
import './feature.css';
import './mobile.css';
import './bar.css';
import { mountChrome } from './chrome';
import { inShell, installGuard } from './guard';
import { mountPlayer } from './player';
import { resumeRemembered, revealOnScroll } from './ui';

/**
 * The "Beyond the Capital" feature. The article itself is static HTML in
 * frequency-unity/index.html so crawlers read every word. Opened from the
 * site, it sits inside the shell, which already has the menu and the playing
 * mix; visited directly, it gets its own. It never asks about sound: the
 * player bar's play button is the choice.
 */

if (!inShell()) {
  installGuard();
  mountChrome();
  mountPlayer();
  resumeRemembered();
}
revealOnScroll(document);
