# Scout's shadcn/ui foundation

These components are copied from the official MIT-licensed shadcn/ui
`new-york-v4` Radix registry on 2026-10-11:

- https://ui.shadcn.com/r/styles/new-york-v4/button.json
- https://ui.shadcn.com/r/styles/new-york-v4/input.json
- https://ui.shadcn.com/r/styles/new-york-v4/tabs.json
- https://ui.shadcn.com/r/styles/new-york-v4/tooltip.json
- https://ui.shadcn.com/r/styles/new-york-v4/dialog.json

The Radix behavior and upstream component API are preserved. Imports are relative
so the island can also be mirrored into Scout's Vite `src/` tree. `cn` is the
standard clsx + tailwind-merge helper. Button adds `variant="scout" size="scout"`
for existing scoped styles, and DialogContent adds `overlayClassName` for the
Scout backdrop. Original registry Tailwind classes are retained for future use.
Scout's scoped styles also support the current Vite mirror without Tailwind.

Pipeline uses controlled Dialog state. The caller owns dismissal and focus
restoration through onClose / onSelectOpportunity. Outside clicks do not dismiss
the overview; Escape does, including while a tooltip is visible. Radix owns
modal focus trapping, background isolation, body scroll lock, and tab navigation.
