# Viết Kudo Modal Feature Complete

**Date**: 2026-06-28 18:27  
**Severity**: Medium  
**Component**: Kudos Compose Modal + Backend Integration  
**Status**: Resolved  
**Branch**: feat/vieest-kudos | **Commit**: 92ebc99 | **PR**: #5

## What Happened

Delivered the complete "Viết Kudo" light-themed modal via Takumi two-track parallel execution. Track A (UI) rebuilt compose-dialog.tsx and 6 sub-components with mock data. Track B (backend) implemented DB migration, Storage integration, XSX-safe sanitizer, and anon sender masking. All reviewer feedback addressed; merged into main.

## The Brutal Truth

This feature was *tight*. Two tracks running parallel meant catching integration gaps late — specifically, the profile page wasn't rendering the new title column, and we nearly shipped with an open RLS vulnerability in Storage (path-prefix wasn't scoped). The sanitizer choice (dependency-free DOM-based) was correct but added complexity around HTML persistence. Real relief when it passed final tests.

## Technical Details

**Database Migration (0003):**
- Added `title` (VARCHAR), `is_anonymous` (BOOLEAN), `anonymous_name` (VARCHAR) to kudos table
- Storage bucket with owner-scoped RLS: `(auth.uid()::text = (storage.foldername())[1])`

**Rich-text Security:**
- Custom HTML sanitizer (90 lines, zero deps) removes script tags, event handlers, data URIs
- Rendered via `dangerouslySetInnerHTML` with re-sanitization on display (defense-in-depth)
- Mention `<span>` class preserved through round-trip

**Reviewer Catches (APPROVE_WITH_FIXES):**
- Missing 5MB file-size limit on image upload
- Storage RLS path validation gap (fixed: `/user_id/kudo_id/filename`)
- Profile card title not displayed (added)
- Mention href control-char injection (stripped in sanitizer)

## What We Tried

1. **RLS scope:** Initially single-role bucket access → migrated to per-user folders
2. **Sanitizer:** Considered DOMPurify → built lightweight in-house (project uses zero runtime deps)
3. **Theme:** Followed design pixel-perfect → avoided adding custom CSS, used Tailwind only

## Root Cause Analysis

The integration gap (missing profile title) happened because Track A and Track B didn't sync on component contracts until merge review. We had the contract docs but didn't cross-check the actual card implementations until final integration. Lesson: even with parallel tracks, enforce a "contract sync" checkpoint before code merge.

Storage RLS oversight was pure pattern-matching — we copied bucket config from other projects without auditing the path structure. This almost became a real security issue.

## Lessons Learned

- **Contract sync on parallel tracks:** Document component prop interfaces *and* verify implementations match before integration phase
- **Sanitizer as infrastructure:** Security-sensitive functions belong in a dedicated module, not scattered in components
- **Re-verify RLS in context:** Don't copy-paste auth patterns; audit them for the specific data model
- **next/image host whitelist:** Always add Storage hosts to next.config.ts *before* runtime testing

## Next Steps

- Monitor Storage usage for test image cleanup (migration leaves old orphaned files)
- Profile page performance baseline (new title column adds query width — check query plan)
- Document rich-text HTML spec in CONTRIBUTING.md for future kudo types

**Status**: DONE
