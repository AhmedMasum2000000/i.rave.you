/** File names in public/img, injected at build time (see vite.config.ts). */
declare const __IMAGES__: string[];
/** The radio library, newest first (see scripts/sets.mjs and scripts/mix-audio.mjs). */
declare const __SETS__: import("./data").RadioSet[];
/** The releases in public/releases.json when the site was built (see src/release.ts). */
declare const __RELEASES__: import("./release").Release[];
