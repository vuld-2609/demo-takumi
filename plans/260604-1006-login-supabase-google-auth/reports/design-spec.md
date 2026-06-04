# Design Spec — Login + Language Dropdown (extracted from MoMorph, authoritative)

> All values below are EXACT, extracted from MoMorph MCP (CSS node-context + node tree).
> Base design canvas: 1440×1024. Do NOT guess — use these values.

## Visual reference images (open with Read to validate)
- Login (full composite 1440×1024): `plans/260604-1006-login-supabase-google-auth/reports/login-reference.png`
- Dropdown (215×304): `plans/260604-1006-login-supabase-google-auth/reports/dropdown-reference.png`

## Downloaded assets (in `public/login/`)
| File | Size | Use |
|------|------|-----|
| `saa-logo.png` | 52×48 | Header logo (Sun* Annual Awards 2025) |
| `flag-vn.svg` | 24×24 | Vietnam flag (VN) |
| `flag-en.svg` | 24×24 | UK flag (EN) — Union Jack |
| `chevron-down.svg` | 24×24 | Language switcher down arrow |
| `google-icon.svg` | 24×24 | Google "G" icon on login button |
| `root-further.png` | 451×200 | "ROOT FURTHER" key-visual logo |

Reference paths in code: `/login/saa-logo.png`, etc.

## Shared design tokens
```
--page-bg:            #00101A   (app/login background base)
--brand-gold:         #FFEA9E   (login button fill, highlight)
--dropdown-bg:        #00070C   (Details-Container-2)
--dropdown-border:    #998C5F   (Details-Border)
--divider:            #2E3940   (Details-Divider, footer top border)
--selected-highlight: rgba(255,234,158,0.20)  (selected dropdown item)
--header-bg:          rgba(11,15,18,0.80)
--text-white:         #FFFFFF
```
Font: **Montserrat** for welcome text + button label (load via next/font/google). Welcome text = Montserrat 700.

## LOGIN SCREEN (screenId GzbNeVGJHz)

Layer order (bottom → top):
1. **Base bg**: `#00101A`.
2. **Decorative artwork** (right side: organic flowing roots, orange/green/teal). NOTE: this raster is NOT individually exportable from MoMorph (get_figma_image 500s). Reproduce the dark base + gradients below faithfully; approximate the artwork only if achievable — it is an accepted limitation, prioritize structure + the gradients.
3. **Gradient overlay 1** (full-frame): `linear-gradient(90deg, #00101A 0%, #00101A 25.41%, rgba(0,16,26,0) 100%)` — darkens LEFT for text readability.
4. **Gradient overlay 2** (full-frame): `linear-gradient(0deg, #00101A 22.48%, rgba(0,19,32,0) 51.74%)` — darkens BOTTOM.

### Header (mms_A) — fixed top
- 1440×80, `display:flex; flex-direction:row; justify-content:space-between; align-items:center; padding:12px 144px;` bg `rgba(11,15,18,0.80)`.
- **Logo (left)**: frame 52×56, image `saa-logo.png`. Click → navigate to `/` (home).
- **Language switcher (right)**: frame 108×56, `display:flex; flex-direction:row; gap:16px; align-items:center;` Contents (in order): `flag-vn.svg` (24×24) + text **"VN"** (white) + `chevron-down.svg` (24×24). Click → open language dropdown. Cursor pointer + hover highlight.
  - Expose props: `currentLang: "vi"|"en"`, `onLanguageClick?: () => void`. Render the BUTTON (closed) only — the open menu is a separate component.

### Main content (mms_B) — LEFT aligned
- `padding:96px 144px; display:flex; flex-direction:column; gap:120px; align-items:flex-start;` starts at y=88 (below header).
- **Key Visual**: `root-further.png` (451×200).
- **Text+CTA group** (gap 24px, padding-left 16px):
  - **Welcome text**: Montserrat 700, `font-size:20px; line-height:40px; letter-spacing:0.5px;` color `#FFFFFF`, text-align left, width 480px. Two lines:
    `Bắt đầu hành trình của bạn cùng SAA 2025.`
    `Đăng nhập để khám phá!`
  - **Login button** (mms_B.3): 305×60, bg `#FFEA9E`, `border-radius:8px; padding:16px 24px; display:flex; flex-direction:row; align-items:center; gap:8px;`
    - Content order: text **"LOGIN With Google"** (LEFT, dark text ~`#00101A`, Montserrat ~600/700) then `google-icon.svg` (24×24, RIGHT). ⚠️ The real label is "LOGIN With Google" (English) per the rendered design — NOT the Vietnamese guess in the raw spec.
    - States: hover (lighten + shadow/elevation), active (press), `disabled` + spinner when `loading`.
    - **Presentational props**: `onLogin?: () => void`, `loading?: boolean`, `disabled?: boolean`. NO Supabase logic here.

### Footer (mms_D)
- Full width, `padding:40px 90px; border-top:1px solid #2E3940; display:flex; justify-content:space-between; align-items:center;`
- Text (appears centered in reference): **"Bản quyền thuộc về Sun* © 2025"** — small, light text on dark.

## LANGUAGE DROPDOWN (screenId hUyaaugye2)
The OPEN state of the header language switcher. Standalone presentational component.

- **Container**: bg `#00070C`, `border:1px solid #998C5F; border-radius:8px; padding:6px; display:flex; flex-direction:column;` width ≈122px (auto).
- **Item VN (selected)**: 108×56, `display:flex; flex-direction:row; align-items:center; justify-content:flex-start; border-radius:2px;` bg `rgba(255,234,158,0.20)`. Content: `flag-vn.svg` (24×24) + "VN" (white). gap ~8–16px.
- **Item EN (option)**: 110×56, `display:flex; flex-direction:row; align-items:center; justify-content:center;` transparent bg (shows container). Content: `flag-en.svg` (24×24) + "EN" (white).
- **States**: the `current` language shows selected bg `rgba(255,234,158,0.20)`; non-current options are transparent and show a hover highlight (e.g. `rgba(255,234,158,0.10)`). Cursor pointer.
- **Props**:
  ```ts
  type Lang = "vi" | "en";
  interface LanguageDropdownProps { current: Lang; onSelect: (lang: Lang) => void; open?: boolean; }
  ```
- Likely a client component (`"use client"`).

## i18n note (orchestrator handles, agents ignore)
Visible VN strings (welcome text, footer) will be moved to next-intl message catalogs during integration. UI agents: render the Vietnamese strings as plain text for now; the orchestrator will replace them with translation keys. Button label "LOGIN With Google" stays English in both locales.
