# Scout

Public interview workspace at https://scout.psstmatt.com, styled to match psstmatt.com.

## Refresh

The existing daily 2 a.m. America/Los_Angeles Interview Map task owns source reconciliation. Its canonical dataset is Sites project `appgprj_6a8e2f03de508191a5104c5e651b2866`. After successfully reviewing sources and updating that checkout, run:

```sh
npm ci
npm run sync:interviews -- /path/to/interview-conversation-map
npm test
npm run build
```

The sync copies only the public UI, summarized interview data, freshness checkpoint, fonts, and validation tests. It preserves Scout's Vite deployment setup. Never copy raw source messages or credentials.

Commit changes to `psstmatt/scout` on `main`. Publish to the existing Vercel project `prj_rQVR808qn92juO78X937uyYoxiKo`, team `team_3S4csTeQ0OEYH52mmJyZRNAc`, production target. Verify the production deployment is READY and scout.psstmatt.com serves the new asset hashes and completedAt checkpoint before reporting success. Preserve the last successful production version if validation or deployment fails.

The UI includes selection-centered globe rendering with a Canvas fallback, mobile inspection, and opt-in interaction sounds.

## Milestone integrity

Milestone journeys contain only documented events. `contact`, `nda`, `offer-discussion`, `written-offer`, `signed`, and `starting` are distinct; each event is explicitly `complete`, `scheduled`, or `pending`. A meeting RSVP is not employment acceptance, an NDA is not an offer, and pending onboarding is not a confirmed start. Keep the current verified commitment visible while playing historical or upcoming steps.

This is a public site and a public source repository. Refreshes must exclude compensation, private contract terms, raw messages, email/calendar/meeting links, and authentication information. Keep source evidence outside the repository. Preserve uncertain outcomes and conflicting evidence as unconfirmed rather than inferring closure or advancement.

## Pipeline Sankey

Click the toolbar’s **N shown** count to explore the current results. The default scope matches search and status filters; a dialog-only **All opportunities** view does not reset the workspace filters. The diagram partitions each unique opportunity once: total → recorded current stage → current status. It is a current snapshot, not a reconstructed history or conversion funnel. Closed records do not imply a known earlier interview stage, and missing or unrecognized categories remain explicit.

Select a node or flow to inspect its matching records, or use the keyboard-accessible grouped list. Selecting a record opens the existing conversation inspector. Escape closes the Sankey first and returns focus to its trigger; a later Escape can close the inspector. Counts and drilldowns are validated for both full and filtered scopes, including zero-result and unknown-category cases.

## Component foundation and role geography

Scout adapts the actual shadcn/ui Radix registry components for Buttons, Input, Tabs, Tooltip and Dialog, with provenance and MIT license in `src/ui/`. Scout-specific CSS preserves the existing visual language in the Vite mirror; Radix provides modal focus management, keyboard tabs and tooltip behavior. The Sankey still uses its own count-conserving SVG layout.

Geography is a partition of the same filtered opportunity records: a documented role city, explicitly remote, or unknown. Company headquarters, recruiter addresses, interview venues and time zones are not location evidence. City markers are approximate and grouped; remote/unknown records are counted but never assigned invented coordinates. Selecting a city or geography group reveals matching opportunities and links back to the existing inspector. Selecting a record outside the filters cannot alter the filtered globe total.

## Development and release

Run `npm ci` and `npm run dev` for local development. Run `npm test` and `npm run build` before release. The tests cover dataset integrity, milestone distinctions, filtered Sankey conservation, role geography, modal/focus behavior, and cross-build component styling.

The October 10, 2026 audit contains 184 role records: 89 closed, 69 application-only, 19 outcome-unknown, two paused, two scheduled, one waiting, one needs action, and one signed. Three networking or non-candidate conversations are retained outside role totals. Application-only does not establish an active recruiting process. Separate roles and reapplications keep distinct outcomes; Stripe Data & AI does not inherit the Global Payments recruiter-screen milestone.

Prototype review deployments use isolated Vercel staging builds from an exact commit. Release only after approval: save/deploy the matching canonical Sites version, update this repository, then publish the exact reviewed commit to the existing Vercel production project. Check the custom-domain assets against that build. Keep the preceding commit and deployment available for rollback; do not change access or sharing as part of release.

This release was approved for production on October 10, 2026. Previous production rollback: commit `f885374cc2593303fbb639d20b9211146684c78f`, Vercel deployment `dpl_4fsWhyp4jfSe13o6LVE8aMw56Yea`.

