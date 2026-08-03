# Marvel Brutal (Neo-Brutalist Design System) Specification

> **Note:** This is the legacy spec. The source of truth for implemented tokens is `src/styles/global.css` (`@theme` block: `bg-background`/`bg-foreground`/`bg-primary`/`bg-secondary`/`shadow-hard-*`/`font-display`/`font-body`/`font-mono` + `.stripes-yellow`/`.stripes-red`/`.halftone` utilities).

## 1. COLORS

### Color Palette

| Token Name | Hex Code | Usage / Context |
| :--- | :--- | :--- |
| **Ink Black** | `#000000` | Universal 3px–4px borders, dark button fills, dark badges, primary text, solid hard drop shadows (`4px 4px 0px #000000`). |
| **Pure White** | `#FFFFFF` | Primary card backgrounds, light mode background, ghost button fill, dark button text. |
| **Brutal Red** | `#FF2D2D` | Logo badge background, "PRIMARY" button fill, "BROWSE ALL HEROES" CTA fill, "MUTANT" & "AVENGERS" badges, progress/stat fill bars, red hard drop shadow on "CLEAR SEARCH" button. |
| **Brutal Yellow** | `#FFE600` | "SECONDARY" button fill, character title banner background in details view, "TECH" & "COSMIC" badges, comic year overlay tags, yellow hard drop shadow on card CTAs ("VIEW DETAILS", "ADD TO COMPARE"). |
| **Brutal Teal** | `#14B8A6` | Navigation bar background, "READ MORE ->" comic button fills, "SHIELD" & "AVENGER" badges. |
| **Neutral Gray (Light)**| `#E5E7EB` | Input backgrounds, toggle container fills, choice item backgrounds, skeleton card image placeholders. |
| **Neutral Gray (Dark)** | `#1E293B` | Dark badge fill variant ("TECH" in component showcase). |

### Background Modes
* **Light Mode Background:** `#FFFFFF` (or light wireframe layout container).
* **Dark Mode Background:** Configurable `#000000` base with invert toggles (`#FFFFFF` text and components).

### Shadows
* **Default Hard Shadow:** `4px 4px 0px #000000` (applied to cards, buttons, containers).
* **CTA Accent Shadow (Yellow):** `4px 4px 0px #FFE600` (applied to black primary buttons like "VIEW DETAILS ->" and "ADD TO COMPARE").
* **Accent Shadow (Red):** `4px 4px 0px #FF2D2D` (applied to "CLEAR SEARCH" button).

---

## 2. TYPOGRAPHY

**Font Family:** `Space Grotesk`, `Syne`, or `Plus Jakarta Sans` (Google Fonts), fallback to `sans-serif`. High contrast, bold geometric structure.

| Text Role | Weight | Size | Letter Spacing | Case Transform | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **App Title** | 900 (Black) | `24px` | `-0.02em` | Uppercase | Header brand title ("MARVEL BRUTAL") |
| **App Subtitle** | 700 (Bold) | `11px` | `0.12em` | Uppercase | Sub-header system label ("NEO-BRUTALIST DESIGN SYSTEM") |
| **Section Title** | 800 (ExtraBold)| `20px`–`22px` | `-0.01em` | Uppercase | Container section headings ("SEARCH & INPUTS", "BIOGRAPHY") |
| **Hero Name (Detail)**| 900 (Black) | `28px`–`32px` | `0.00em` | Uppercase | Yellow detail header ("IRON MAN") |
| **Hero Name (Card)** | 800 (ExtraBold)| `18px`–`20px` | `0.00em` | Uppercase | Character listing card headers |
| **Card Subtitle** | 700 (Bold) | `13px`–`14px` | `0.02em` | Uppercase | Real name sub-bar ("TONY STARK") |
| **Nav Link** | 800 (ExtraBold)| `14px` | `0.05em` | Uppercase | Header tab items ("COMPONENTS", "TOKENS") |
| **Badge / Tag** | 800 (ExtraBold)| `11px`–`12px` | `0.08em` | Uppercase | Category tags ("TECH", "AVENGER", "MUTANT") |
| **Stat Label** | 800 (ExtraBold)| `11px` | `0.06em` | Uppercase | Character stats ("POWER LEVEL 88", "INTELLIGENCE") |
| **Body Text** | 400 (Regular) | `14px`–`15px` | `0.00em` | Sentence Case | Biography paragraph (Line height: `1.6`) |
| **Button Text** | 800 (ExtraBold)| `12px`–`14px` | `0.05em` | Uppercase | Action buttons ("VIEW DETAILS ->", "READ MORE ->") |

---

## 3. COMPONENTS

### Header / Navbar
* **Layout:** Full-width outer frame with a `4px` solid black border and `4px 4px 0px #000000` drop shadow. Internal padding: `16px 20px`. Flex alignment (space-between).
* **Logo:** Square icon block (`40px x 40px`), solid red background (`#FF2D2D`), `3px` solid black border, containing a centered white lightning icon. Stacked text to the right ("MARVEL BRUTAL" top, "NEO-BRUTALIST DESIGN SYSTEM" bottom).
* **Light/Dark Toggle:** Right-aligned switch. Track width `50px`, height `24px`, white background with `3px` black border. Black/Red knob block (`18px x 18px`).
* **Navigation Bar Tabs:** Attached directly under main header container. Teal background (`#14B8A6`), 3 equal-width columns ("COMPONENTS", "TOKENS", "CHARACTER CARDS") separated by `3px` solid black vertical borders. Height `48px`. Active tab fills with `#000000` and white text.

### Search Bar & Input Group
* **Container:** Enclosed box with `3px` solid black border, `4px 4px 0px #000000` shadow. Padding `16px`.
* **Search Input Field:** 
  * Left yellow box button (`#FFE600`), width `48px`, height `48px`, `3px` solid black border with magnifying glass icon centered.
  * Input text box: White fill, `3px` solid black border, `48px` height, uppercase placeholder text (`SEARCH CHARACTERS...`) in `#6B7280`.
* **Sort Dropdown:** White box, height `44px`, `3px` black border, `3px 3px 0px #000000` shadow. Displays "SORT: NAME" with a down chevron icon.
* **View Mode Toggle:** Two square icon buttons (`44px x 44px`) side-by-side with grid (4 squares) and list (3 bullet lines) icons.

### Filter Tag Buttons
* **Shape:** Rectangular pill buttons with flat square corners (`0px` radius).
* **Border & Shadow:** `3px` solid black border, `3px 3px 0px #000000` shadow.
* **States:** 
  * Default: White fill, black uppercase text.
  * Active: Black fill (`#000000`), white uppercase text.

### Character Cards
* **Grid:** 4 columns on Desktop (`>1024px`), 1 column on Mobile (`<640px`). Gap: `20px`.
* **Card Frame:** White container, `3px` solid black border, `4px 4px 0px #000000` hard shadow. Padding: `0px` top (image edge-to-edge), `16px` inner padding for text content.
* **Image Container:** `4:3` aspect ratio top section. Gray skeleton placeholder (`#D1D5DB`) or real character photograph. `3px` solid black bottom border separating image from content.
* **Content Stack:**
  * **Title:** Character Name in `18px` ExtraBold uppercase.
  * **Category Badge:** Height `24px`, solid color fill (Red/Yellow/Teal), `2px` solid black border, black uppercase text.
  * **Power Bar:** Outer container height `12px`, white fill, `2px` black border. Inner bar fill: Solid Red (`#FF2D2D`). Text underneath: "POWER LEVEL [XX]" in `11px` bold text.
  * **CTA Button:** Full-width black button (`#000000`), height `40px`, white text ("VIEW DETAILS ->"), yellow hard drop shadow (`4px 4px 0px #FFE600`).

### Detail Page Layout
* **Layout Grid:** 2 columns on Desktop (1/3 left column, 2/3 right column). Gap: `24px`.
* **Left Column (Hero Block):**
  * **Hero Image Frame:** Outer Red frame block (`#FF2D2D`), `4px` black border. Center square display block with armor/character icon.
  * **Name Banner:** Solid Yellow box (`#FFE600`), `3px` black border, `28px` bold black name text ("IRON MAN").
  * **Real Name Sub-banner:** White box, `3px` black border, `14px` text ("TONY STARK").
  * **Stats Card:** White card with 4 progress indicators (POWER, INTELLIGENCE, SPEED, DURABILITY). Values right-aligned (`88`, `100`, `58`, `85`). Red progress bars (`#FF2D2D`).
  * **Teams Badges:** Horizontal array of colored team chips (AVENGERS [Red], SHIELD [Teal], ILLUMINATI [Yellow]).
  * **Action Button:** "ADD TO COMPARE" black button with yellow shadow (`4px 4px 0px #FFE600`).
* **Right Column (Bio & Comics):**
  * **Biography Block:** Container header "BIOGRAPHY". Inner white card containing multi-line narrative paragraph.
  * **Comic Appearances Block:** Section title "COMIC APPEARANCES". 3-column sub-grid of comic preview cards.
  * **Comic Preview Card:** Image block top with floating Yellow Year tag (e.g. "1978"), issue title ("IRON MAN #128"), year badge below title, and Teal button ("READ MORE ->").

### Empty State / No Search Results
* **Container:** 2-column split (Desktop) or stacked (Mobile). Left panel features empty search notice; right panel features recommendations.
* **Alert Badge:** Red box (`#FF2D2D`), `3px` black border, centered white circular exclamation mark icon `!`.
* **Text Message:** Bold title "NO HEROES FOUND", subtitle "YOUR SEARCH FOR 'THANOS' RETURNED 0 RESULTS".
* **Action Buttons:** Dual button row:
  * "CLEAR SEARCH": Black background, white text, red hard drop shadow (`4px 4px 0px #FF2D2D`).
  * "BROWSE ALL HEROES": Red background (`#FF2D2D`), white text, black drop shadow (`4px 4px 0px #000000`).
* **Recommendations Panel:** Title "YOU MIGHT ALSO LIKE". 2x2 grid of mini character cards using solid block header fills (Red, Teal, Yellow, Black) instead of character photos.

### Pagination Controls
* **Buttons:** Array of square buttons (`40px x 40px`). `3px` solid black border, `3px 3px 0px #000000` drop shadow.
* **Active State:** Button '1' has white fill, black text, bold centered font.
* **Inactive State:** White background, black text.

### Interactive UI Elements (Component Showcase)
* **Toggle Switch:** Outer track height `28px`, width `56px`, white fill, `3px` black border. Circular knob `20px x 20px` solid black.
* **Checkbox:** Square box `24px x 24px`, white fill, `3px` black border. Checked state displays dark checkmark inside.
* **Radio Button:** Circle diameter `24px`, `3px` solid black outline. Selected state shows nested inner solid black circle.
* **Stepper:** Three-part row: Decrement button (`-`), input display box (`1`), Increment button (`+`). All `40px` height with `3px` black borders. Inner value box highlighted yellow (`#FFE600`).
* **Compare List Bar:** White text bar with black border, displaying "IRON MAN · PWR 88", attached red close button (`X`) on right edge (`#FF2D2D`).

---

## 4. LAYOUT & SPACING

* **Page Max Width:** `1200px` (Desktop centered frame).
* **Viewport Margins:**
  * Desktop: `32px` outer padding.
  * Mobile: `16px` outer padding.
* **Border Radii:**
  * Universal: `0px` (Strict Neo-Brutalist square edges).
  * Exceptions: Toggle tracks (`9999px`), Radio buttons (`50%`), Alert circle icon (`50%`).
* **Border Widths:**
  * Outer structural frames: `4px` solid `#000000`.
  * Cards, inputs, buttons, badges: `3px` solid `#000000`.
  * Sub-elements / progress borders: `2px` solid `#000000`.
* **Gaps:**
  * Main Section Stack Gap: `24px`.
  * Character Card Grid Gap: `20px` (Desktop), `16px` (Mobile).
  * Comic Cards Grid Gap: `16px`.
  * Badge Array Gap: `8px`.

---

## 5. BEHAVIOR & INTERACTION

* **Button Hover State:** 
  * Translates `-2px, -2px` on the X/Y axes while expanding the drop shadow offset from `4px` to `6px`.
* **Button Active / Press State:**
  * Translates `+2px, +2px` towards the shadow direction while shadow offset reduces to `0px 0px` (simulating physical depth press).
* **View Switching:** 
  * Grid/List icons toggle character layout between 4-column card grid and full-width list items.
* **Theme Switching:** 
  * "LIGHT / DARK" toggle flips background contrast from pure white (`#FFFFFF`) to deep black (`#000000`). Component surfaces adapt inverted borders and text colors.