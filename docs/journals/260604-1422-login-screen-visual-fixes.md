# Login Screen Visual Fixes: MoMorph Asset Gaps & Typography Precision

**Date**: 2026-06-04 14:22
**Severity**: Medium (visual regressions pre-merge)
**Component**: Auth/Login UI, Design Asset Management
**Status**: Resolved

## What Happened

Two layout bugs surfaced during visual validation on the SAA login screen (feat/login-supabase-google-auth, commit f31132d). First: decorative background artwork failed MoMorph export—MCP returned 500 on get_figma_image; get_node_context showed no MM_MEDIA node; asset was unrecoverable from design tool. Second: login button rendered at wrong size (14px instead of 22px) and wrong layout (flex:1 pushed Google icon to far-right edge instead of 8px spacing). Both traced to precision gaps between design spec and implementation. Fixed and validated.

## The Brutal Truth

This is the frustration of working from design specs without the ability to pull exact assets—MoMorph sold us a "pixel-perfect export" capability that doesn't handle decorative rasters. Pulled the exact CSS values from design (22px Montserrat 700, 305×60 box) and realized the code had silently drifted to 14px and flex:1 layout. No one caught it until Playwright screenshots. The lesson burned: **design specs are snapshots; code drift is silent.**

## Technical Details

**Bug #1: Missing Background Artwork**
- Figma asset: raster keyvisual on Login frame (GzbNeVGJHz)
- MCP calls attempted:
  - `get_figma_image(assetId)` → HTTP 500
  - `get_node_context(frameId)` → no MM_MEDIA node for raster
  - `get_design_item_image(nodeId)` → "Not found"
- Resolution: Wired CSS `background-image: url('/login/bg-keyvisual.png')` in app/login/page.tsx; positioned beneath gradient overlays; degrades gracefully if asset absent. Requested user supply file at exact spec (1440×1022px, PNG).
- User delivered: public/login/bg-keyvisual.png
- Validation: Playwright full-page screenshot; background comps correctly with gradients at 1440×1024

**Bug #2: Login Button Size & Spacing**
- Design spec (pulled from MoMorph get_node_context): label = 22px/28px Montserrat 700, button box = 305×60
- Code reality: label rendered 14px; button used flex:1 (consumed all available space); Google icon pushed to right edge
- Root cause: Copy-paste drift—code had been tweaked without updating against spec
- Fix applied:
  - Changed font-size from 14px to 22px
  - Removed flex:1; set button width to 305px
  - Added gap: 8px between icon and text
- Before/after screenshots: element inspector, computed styles, rendered output

## What We Tried

1. Export background via MCP (3 attempts, all failed) → Accepted asset loss; pivoted to CSS slot + user request
2. Visual inspection of button → Looked "close enough" → Playwright comparison revealed pixel mismatch
3. Pulled MoMorph CSS context for label node → Found exact 22px value in design; traced code divergence

## Root Cause Analysis

**Background Export Failure**: Figma's raster-asset handling in MoMorph MCP is either not implemented or hits 500 on that specific asset. The node exists (visible in design), but tooling can't serialize it. No fallback; accepted degradation.

**Button Size Drift**: Code diverged from spec over iteration. No automated link between Figma design values and TypeScript/CSS constants—humans must manually sync. Design review caught UX intent; implementation review caught precision loss. Both are necessary.

## Lessons Learned

1. **Non-Exportable Assets Need Fallback**: When MCP can't pull a decorative raster, don't fake it with gradients or placeholder colors. Build the CSS slot (graceful degradation) + request the exact file with specs (path, format, dimensions). Waiting for user delivery is slower than guessing and fixing.

2. **Design Values Must Be Extracted, Not Eyeballed**: Pulled exact MoMorph CSS (22px/28px Montserrat 700) and used it as source of truth. Eyeballing button size against screenshots is insufficient; precision requires explicit values.

3. **Spec Drift is Silent**: Code can diverge from design without triggering compile/lint errors. Visual validation (Playwright) caught the 14px→22px regression; linters would not. Include visual diffs in review gates.

## Next Steps

1. **Post-Merge**: Confirm bg-keyvisual.png deployment path in build system (vercel.json / next.config.js); test asset load in staging before prod.
2. **Process**: For future MoMorph integrations, extract all typography/spacing constants from design upfront; hardcode into a design-tokens.ts module; reference in components. Reduces drift risk.
3. **Asset Management**: Document which Figma assets are exportable vs. require manual delivery. Add checklist to pre-merge reviews.

Status: Both bugs fixed, tsc/build clean, validation screenshots confirm visual match. Ready for merge.
