# Clarifications — Hệ thống giải (Award System, screen zFYDgyj_pD)

## MoMorph refs
- Hệ thống giải: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD

## Session 2026-06-27
- Q: Branch strategy given uncommitted profile-page work? → A: Stay on feat/profile-page (implement alongside existing work)
- Q: How to render the 6 award visuals? → A: Download/crop each as a PNG (faithful, KISS)
- Q: English locale handling for VN-only design copy? → A: VN verbatim + faithful EN translation (bilingual app)
- Q: Route path for the page? → A: /he-thong-giai (per test cases ID-0/1/2)
- Q: Top Talent quantity unit — spec/test say "Đơn vị" but design text node + render show "Cá nhân"? → A: Use "Cá nhân" (MCP design node is authoritative; spec text is stale)
- Q: Award visual export — get_media_file 401, get_figma_image 500; how to obtain assets? → A: Full-frame render is 1:1 with design coords (1440px); cropped each 336×336 award + hero via sharp from the frame PNG
- Q: "scroll thì note highlight đi theo" requirement? → A: Left category nav is position:sticky with IntersectionObserver scroll-spy (active = gold + underline) and smooth-scroll on click
