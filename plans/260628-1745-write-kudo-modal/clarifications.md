# Clarifications — Write Kudo Modal (Viết Kudo)

Screen: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2

## Session 2026-06-28
- Q: How to handle the required "Danh hiệu" (title/badge) field not in DB schema? → A: Add `title` column to kudos table + persist; show as kudos title
- Q: How should image upload work (no pipeline exists)? → A: Real upload to Supabase Storage bucket, persist public URLs into kudos.images
- Q: How should anonymous send work (no DB columns)? → A: Add `is_anonymous` (bool) + `anonymous_name` (text) columns; hide real sender, show custom name on cards
- Q: How far should the content editor go? → A: Functional toolbar (Bold/Italic/Strike/list/link/quote) storing HTML + @mention with live suggestion popup
- Q: Light/cream design theme or dark to match app? → A: Light/cream per MoMorph design (design authoritative for visuals)
- Q: Hashtag dropdown source and custom entry? → A: Predefined list + free entry (curated dropdown AND allow typing custom), min 1 / max 5
