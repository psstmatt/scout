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
