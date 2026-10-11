# Software factory return

The public navigation bridge lets visits launched from the software factory return with Escape. It never changes authentication or app data. Direct visitors are unaffected.

Allowed launch origins are `https://psstmatt.com` and the existing computer review site `https://matt-konami-computers.psstmatt.chatgpt.site`. Visits expire after 30 minutes and require matching tab-session records. The launch marker is removed before application scripts run. Ordinary browser Back remains available.

Escape first belongs to open dialogs, inspectors, focused input controls, fullscreen and pointer lock. Anduril hash navigation explicitly inherits the accepted visit; history traversal only restores an existing marker.

Source is in `src/`; generated ESM is in `dist/`. Run the strict compilation and regression suite with `npm run test:factory-return`. Rebuild ESM with TypeScript using the supplied tsconfig, and the public bundle with `bun build shared/factory-return/src/boot.ts --target browser --format iife --minify --outfile PUBLIC_PATH/factory-return.js`, replacing PUBLIC_PATH with this app's public asset directory.

No browser security restrictions are bypassed. Suppressed referrers, unavailable storage or a sign-in redirect may disable return for that visit. Physical Safari testing is separate from automated tests.
