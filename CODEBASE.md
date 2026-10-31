# HandSon — Codebase Documentation

HandSon is a Filipino Sign Language (FSL) recognition and avatar application built with TypeScript, React, Vite, Three.js, and Tailwind CSS. It uses MediaPipe Holistic for landmark detection and a TensorFlow.js classifier model for sign recognition, with a 3D Xbot avatar for sign playback.

**Live URL:** `https://handson-woad.vercel.app`
**Repository:** `https://github.com/Sl0ws/Handson`

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Directory Structure](#directory-structure)
4. [Configuration Files](#configuration-files)
5. [CSS Design System](#css-design-system)
6. [Source Files (Frontend)](#source-files-frontend)
7. [Source Files (Training Pipeline)](#source-files-training-pipeline)
8. [Key Design Decisions](#key-design-decisions)
9. [Deployment](#deployment)

---

## Project Overview

HandSon translates Filipino Sign Language in real-time using a webcam and MediaPipe Holistic landmarks. The pipeline:

```
MediaPipe Holistic → Landmarks (345 floats/frame) → selectFeatures() (63 floats)
  → useSignInference (TF.js model, 4 classes: GRANDMA, I, LOVE, YOU)
  → SentenceOverlay / PredictionOverlay (display)
  → SignAvatar (Three.js 3D avatar playback)
```

The app has four main views:
- **Home** — Landing page with translator and avatar feature cards
- **Translate** — Real-time camera-based sign recognition
- **Avatar** — Text-to-sign avatar playback (type English, avatar signs it)
- **Practice** — Practice mode with camera
- **Capture** — Video capture studio for recording training data
- **Account** — User profile management

Authentication is handled by Firebase (email/password). All screens behind the auth gate require a signed-in user.

---

## Architecture

### Current Pipeline (Hybrid Migration — Phases 0-5 Complete)

```
MediaPipe Holistic → Landmarks (345 floats/frame)
  → selectFeatures() → right-hand-only 63-float frame
    → useSignInference → TF.js classifier (fsl_model_tfjs, 4 classes)
      → PredictionOverlay / SentenceOverlay
      → SignAvatar (Three.js bone application)
```

### Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Application shell, auth gate, pipeline wiring, view routing |
| `src/components/TopNavBar.tsx` | Floating sticky top nav: brand, Camera/Model/Tier/FPS, Profile dropdown |
| `src/components/ProfileDropdown.tsx` | Avatar button + Account/Settings/Logout dropdown |
| `src/components/SettingsModal.tsx` | Floating settings: text size, contrast, low power, dark mode |
| `src/screens/HomeScreen.tsx` | Landing page with feature cards and mascot |
| `src/screens/VideoCaptureScreen.tsx` | Capture studio: record webcam, import video, extract landmarks |
| `src/screens/AuthLoadingScreen.tsx` | Firebase auth loading screen |
| `src/screens/LoginScreen.tsx` | Login / signup |
| `src/screens/AccountScreen.tsx` | User profile |
| `src/screens/PracticeScreen.tsx` | Practice mode |
| `src/inference/useSignInference.ts` | TF.js inference hook |
| `src/inference/labels.ts` | INFERENCE_LABELS — model output order contract |
| `src/inference/frameQuality.ts` | Frame quality gate (hand presence filter) |
| `src/features/sentenceBuilder.ts` | Sentence-mode grammar (fast=mode correction, slow=stability) |
| `src/features/grammarParser.ts` | FSL grammar → English translation |
| `src/features/featureSelect.ts` | Select right-hand 63-float features from landmarks |
| `src/features/englishToGloss.ts` | English → FSL gloss mapping |
| `src/avatar/dataLoader.ts` | SMPL-X service integration |
| `src/avatar/smplxConverter.ts` | SMPL-X pose → AvatarFrame converter |
| `src/avatar/retarget.ts` | Quaternion-based bone alignment |
| `src/components/SignAvatar.tsx` | Three.js renderer, bone animation |
| `src/lib/videoCapture.ts` | Video → avatar-data extraction engine |
| `src/lib/usePointerIntent.ts` | Pointer tracking for mascots |
| `src/lib/firebase.ts` | Firebase auth configuration |
| `src/auth/AuthProvider.tsx` | Firebase auth context provider |
| `src/hooks/useHolisticPipeline.ts` | MediaPipe Holistic detection loop (30 FPS target) |
| `src/hooks/useCamera.ts` | Camera source management |
| `src/mediapipe/types.ts` | Landmark layout constants |
| `src/mediapipe/pack.ts` | Pack HolisticLandmarkerResult into flat buffer |
| `src/utils/normalizeLandmarks.ts` | Shoulder-midpoint normalization |
| `src/utils/landmarkSmoother.ts` | Landmark smoothing for avatar |
| `src/components/ui/BrutalNav.tsx` | Bottom navigation slab (Home, Translate, Avatar, Practice, Capture, Account) |
| `src/components/ui/BrutalButton.tsx` | Neobrutalist button component |
| `src/components/ui/BrutalCard.tsx` | Neobrutalist card component |
| `src/components/ui/BrutalLabel.tsx` | Neobrutalist label/kicker component |
| `src/components/ui/BrutalBadge.tsx` | Neobrutalist badge component |
| `src/components/ui/BrutalSticker.tsx` | Neobrutalist sticker component |
| `src/components/ui/BrutalInput.tsx` | Neobrutalist input component |
| `src/components/ui/BrutalArrow.tsx` | Neobrutalist arrow component |

---

## Directory Structure

```
Handson/
├── CODEBASE.md                          # This file
├── AGENTS.md                            # Project architecture notes
├── ARCHITECTURE.md                      # Architecture documentation
├── README.md                            # Project README
├── package.json                         # Node.js dependencies
├── package-lock.json
├── vite.config.ts                       # Vite configuration
├── tsconfig.json                        # TypeScript configuration
├── tsconfig.node.json
├── tailwind.config.js                   # Tailwind CSS configuration
├── postcss.config.js
├── vercel.json                          # Vercel deployment config
├── .vercelignore                        # Vercel ignore patterns
├── index.html                           # HTML entry point
├── label_classes.json                   # Label classes mapping
├── normalize_test.json                  # Normalization test data
├── test_dataset_20labels.json           # Test dataset (20 labels)
├── inspect-windows.ts                   # Window inspection script
├── diff.txt                             # Comparison diff
├── check_output.txt                     # Check output
├── _model_scan.txt                      # Model scan results
├── _scan_refs.py                        # Reference scanning script
├── compare_models.py                    # Model comparison script
├── compare_layers.py                    # Layer comparison script
├── check_manifest.py                    # Manifest checker
├── check_dataset.py                     # Dataset checker
├── check_dataset2.py                    # Dataset checker v2
├── check_bones.mjs                      # Bone checking script
├── check_avatar_data.py                 # Avatar data checker
├── debug_skeleton.mjs                   # Skeleton debug script
├── download_model.py                    # Model download script
├── training/
│   ├── train.py                         # Training script
│   ├── prepare_windows.py               # Window preparation for training
│   ├── rebuild_keras2.py                # Keras 2 rebuild script
│   ├── extract_landmarks.py             # Landmark extraction
│   ├── step_3_convert.sh                # TF.js conversion script
│   ├── sample_dataset.json              # Sample training dataset
│   └── test_tfjs_model.cjs              # TF.js model test script
├── public/
│   ├── sw.js                            # Service worker
│   ├── manifest.json                    # PWA manifest
│   ├── models/
│   │   ├── fsl_model_tfjs/              # Deployed TF.js model (4 classes)
│   │   │   ├── model.json
│   │   │   └── group1-shard1of1.bin
│   │   ├── fsl_model_v2/                # Alternative model version
│   │   ├── fsl_model/                   # Legacy model versions
│   │   │   ├── tfjs/
│   │   │   ├── tfjs_combined/
│   │   │   ├── fsl_bigru_v2/
│   │   │   └── ... (variants)
│   │   └── Xbot.glb                     # 3D avatar model
│   └── avatar-data/                     # Pre-recorded sign sequences (JSON)
├── src/
│   ├── App.tsx                          # Application shell
│   ├── main.tsx                         # React entry point
│   ├── index.css                        # CSS design tokens & styles
│   ├── vite-env.d.ts
│   ├── components/
│   │   ├── TopNavBar.tsx                # Floating sticky top navigation
│       ├── ProfileDropdown.tsx          # Profile avatar + dropdown menu
│       ├── SettingsModal.tsx            # Floating settings panel
│       ├── StatusBar.tsx                # Status rail (legacy)
│       ├── MouseFollower.tsx            # Mouse-following decorative dots
│       ├── SignAvatar.tsx               # 3D avatar renderer
│       ├── CameraPreview.tsx            # Camera preview component
│       ├── PredictionOverlay.tsx        # Prediction display overlay
│       ├── AccuracyDashboard.tsx        # Accuracy metrics display
│       ├── SentenceOverlay.tsx          # Sentence display overlay
│       ├── GlossDisplay.tsx             # Gloss result display
│       ├── Autocomplete.tsx             # Autocomplete input
│       ├── SentenceOverlay.tsx
│       ├── OnboardingTour.tsx           # First-run tour
│       ├── MarqueeStrip.tsx             # Scrolling marquee
│       ├── PrintedLayout.tsx            # Printed layout wrapper
│       ├── Skeleton.tsx                 # Loading skeleton
│       ├── TextInput.tsx                # Text input component
│       ├── Tooltip.tsx                  # Tooltip component
│       ├── icons.tsx                    # Hand-drawn icon set
│       ├── mascots/
│       │   ├── EyeMascot.tsx            # Eye mascot (translator card)
│         ├── HandsMascot.tsx            # Hands mascot (avatar card)
│         └── GuideMascot.tsx            # Guide mascot
│       └── ui/
│         ├── BrutalNav.tsx              # Bottom nav slab
│         ├── BrutalButton.tsx
│         ├── BrutalCard.tsx
│         ├── BrutalBadge.tsx
│         ├── BrutalSticker.tsx
│         ├── BrutalLabel.tsx
│         ├── BrutalInput.tsx
│         └── BrutalArrow.tsx
│   ├── screens/
│     │   ├── HomeScreen.tsx             # Landing page
│     │   ├── LoginScreen.tsx            # Login/signup
│     │   ├── AuthLoadingScreen.tsx      # Auth loading
│     │   ├── AccountScreen.tsx          # User profile
│     │   ├── PracticeScreen.tsx         # Practice mode
│     │   └── VideoCaptureScreen.tsx     # Capture studio
│     ├── hooks/
│     │   ├── useHolisticPipeline.ts     # MediaPipe detection loop
│     │   └── useCamera.ts               # Camera source management
│     ├── features/
│     │   ├── sentenceBuilder.ts         # Sentence grammar builder
│     │   ├── grammarParser.ts           # FSL grammar → English
│     │   ├── englishToGloss.ts          # English → FSL gloss
│     │   ├── featureSelect.ts           # Feature selection (63 floats)
│     │   ├── signSimilarity.ts          # Sign similarity
│     │   └── windowBuffer.ts            # Window buffer
│     ├── inference/
│     │   ├── useSignInference.ts        # TF.js inference hook
│     │   ├── labels.ts                  # Model label contract
│     │   ├── frameQuality.ts            # Frame quality gate
│     │   ├── temporalEnsemble.ts        # Temporal ensemble smoothing
│     │   ├── secondOpinion.ts           # Second opinion classifier
│     │   └── accuracyLog.ts             # Accuracy logging
│     ├── avatar/
│     │   ├── dataLoader.ts              # SMPL-X service integration
│     │   ├── smplxConverter.ts          # SMPL-X → AvatarFrame
│     │   ├── smplxAdapter.ts            # SMPL-X adapter
│     │   ├── retarget.ts                # Quaternion bone alignment
│     │   ├── retargeter.ts              # Retargeter
│     │   ├── bodyRetargeter.ts          # Body retargeter
│     │   ├── handRetargeter.ts          # Hand retargeter
│     │   ├── mediapipeAdapter.ts        # MediaPipe adapter
│     │   ├── footingSolver.ts           # Footing solver
│     │   ├── rootTranslation.ts         # Root translation
│     │   ├── stabilityGuard.ts          # Stability guard
│     │   ├── signSequence.ts            # Sign sequence
│     │   ├── coordinateSystem.ts        # Coordinate system
│     │   ├── constraints.ts             # Constraints
│     │   ├── canonicalPose.ts           # Canonical pose
│     │   └── boneResolver.ts            # Bone resolver
│     ├── lib/
│     │   ├── videoCapture.ts            # Video capture engine
│     │   ├── usePointerIntent.ts        # Pointer tracking
│     │   ├── firebase.ts                # Firebase config
│     │   ├── cn.ts                      # Class name utility
│     │   └── clipTester.ts              # Clip tester
│     ├── auth/
│     │   └── AuthProvider.tsx           # Firebase auth provider
│     ├── mediapipe/
│     │   ├── types.ts                   # Landmark types
│     │   ├── pack.ts                    # Pack landmarks to buffer
│     │   ├── smoothing.ts               # Landmark smoothing
│     │   └── drawResult.ts              # Draw results
│     └── utils/
│     │   ├── normalizeLandmarks.ts      # Landmark normalization
│     │   └── landmarkSmoother.ts        # Landmark smoother
└── signavatars-service/                 # Python SMPL-X service (not in repo root)
    ├── app.py                           # Flask REST API
    ├── fit_smplx.py                     # SMPL-X fitting logic
    ├── convert_avatar_data.py           # Batch conversion
    └── requirements.txt                 # Python dependencies
```

---

## Configuration Files

### `package.json`
Node.js project with React 18, TypeScript, Vite, Tailwind CSS, Three.js, TensorFlow.js, Firebase, Framer Motion, and MediaPipe.

### `vite.config.ts`
Vite development server on port 5174.

### `tailwind.config.js`
Tailwind CSS configuration with the HandSon design system.

### `tsconfig.json`
TypeScript strict configuration.

### `vercel.json`
Vercel deployment configuration — builds with `npm install && npm run build`.

### `index.html`
HTML entry point with viewport meta tag (`width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover`).

---

## CSS Design System (`src/index.css`)

The design system is **neo-brutalist** — printed-object language with:
- **Warm paper background** (`--paper: #f4efe5`) — not clinical white
- **Thick ink borders** (`--border-w: 3px`) — `--ink: #111111`
- **Hard offset shadows, zero blur** — cast down-right like physical objects
- **Small sharp corners** (`--radius: 4px`) — not pill-shaped
- **Saturated brand colours** — teal, coral, lime, sun, purple, pink
- **Three typefaces** — Anton (mega display), Archivo Black (display/UI), Inter (body)

### Design Tokens (`:root`)

| Token | Value | Purpose |
|-------|-------|---------|
| `--paper` | `#f4efe5` | Page canvas |
| `--paper-raised` | `#fffdf7` | Cards sitting on paper |
| `--paper-sunken` | `#e6dfce` | Wells/inset areas |
| `--ink` | `#111111` | Primary text + border colour |
| `--teal` | `#18d5c5` | Primary action |
| `--coral` | `#ff5c5c` | Translator/energy |
| `--lime` | `#c8ff3d` | Highlight/ready |
| `--sun` | `#ffd900` | Caution/marquee |
| `--purple` | `#7c5cff` | Avatar decorative |
| `--border-w` | `3px` | Default border weight |
| `--radius` | `4px` | Cards/buttons |
| `--shadow` | `5px 5px 0 var(--ink)` | Hard offset shadow |
| `--shadow-xl` | `12px 12px 0 var(--ink)` | Large hard shadow |
| `--press-ms` | `90ms` | Button press transition |
| `--ease-snap` | `cubic-bezier(0.2, 0, 0, 1)` | Snap easing |

### Dark Mode (`[data-theme="dark"]`)

Dark mode swaps surfaces to deep charcoal slate (`--paper: #14181c`), ink to light slate (`#e2e8f0`), and shadows to near-black cast (`#030712`). Brand colours are balanced (not neon). Theme transitions cross-fade over 0.35s.

### High Contrast (`[data-hc="true"]`)

Pure black on white, maximum border weight (4px), all decorative layers disabled.

---

## Source Files (Frontend)

### `src/App.tsx` (576 lines)

The application shell. Key responsibilities:

- **Auth gate** — Loading → AuthLoadingScreen; authenticated → HandSonApp; unauthenticated → LoginScreen
- **Pipeline wiring** — Connects MediaPipe Holistic → feature selection → TF.js inference → sentence builder
- **View routing** — Home, Translate, Avatar, Practice, Capture, Account views
- **State management** — view, textSize, highContrast, lowPowerMode, darkMode, confidence, FPS tier, offline status
- **FPS tier downgrade** — When FPS < 25 for 5 consecutive samples, downgrades resolution tier (640×480 → 424×240 → 320×240), never reducing FPS below 30
- **TopNavBar** — Floating sticky top navigation with brand, Camera/Model/Tier/FPS controls, Profile dropdown
- **SettingsModal** — Floating settings panel (text size, contrast, low power, dark mode)

### `src/components/TopNavBar.tsx` (213 lines)

Floating sticky Neobrutalist top navigation bar with three sections:

- **LEFT** — HandSon Wordmark (clickable → home)
- **CENTER** — Camera (navigates to translate), Model (status), Tier (X/3) controls + FPS counter (translate view only) + Offline indicator
- **RIGHT** — ProfileDropdown (Account, Settings, Logout)

Features:
- Detached floating container with visible margins (`mx-auto`, `top-[0.75rem] sm:top-[1rem]`, `max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-2rem)] lg:max-w-[1200px]`)
- Cream background, thick ink border, hard offset shadow (`shadow-[4px_4px_0_var(--ink)] sm:shadow-[6px_6px_0_var(--ink)]`)
- Controls adapt when translate view opens (tighter gaps, slightly reduced padding, FPS appears)
- 200ms smooth transitions on gap/padding/opacity changes
- Readable font sizes: `text-sm sm:text-base` (desktop), `text-xs sm:text-sm` (translate mode)

### `src/components/ProfileDropdown.tsx` (197 lines)

Neobrutalist profile avatar button with dropdown menu:

- **Avatar button** — User's first initial (or profile picture fallback), teal background, thick ink border, downward chevron
- **Dropdown panel** — Account / Settings / Logout items
- **Account** — Navigates to account page
- **Settings** — Opens SettingsModal via `onOpenSettings` callback
- **Logout** — Firebase signOut via `signOut()`
- Behaviors: toggle on click, close on outside click, Escape key, or item selection
- Mobile-safe: `max-w-[calc(100vw-1rem)]` prevents overflow

### `src/components/SettingsModal.tsx` (231 lines)

Floating neobrutalist settings panel:

- **Display / Text Size** — Small / Normal / Large, shows selected state with sun indicator
- **Contrast** — Normal / High toggle
- **Low Power Mode** — On / Off toggle
- **Dark Mode** — On / Off toggle
- Close button (top-right ✕), Escape key, outside-click to close
- Centered floating panel, responsive width (`max-w-[calc(100vw-2rem)]`)
- Scrollable on mobile (`max-h-[calc(100vh-4rem)] overflow-y-auto`)

### `src/screens/HomeScreen.tsx` (479 lines)

Landing page with:

- **Wordmark** — Hand-drawn SVG logo + "HandSon" text (exported, used by TopNavBar, LoginScreen, AuthLoadingScreen)
- **TranslatorCard** (Card 01) — Coral slab, EyeMascot, "Real-Time Translator" CTA
- **AvatarCard** (Card 02) — Purple slab, HandsMascot, "3D Sign Avatar" CTA
- **Hero section** — Giant "Make Signs Visible." headline, asymmetry design, registration marks
- No standalone logo in header (logo moved to TopNavBar)

### `src/screens/VideoCaptureScreen.tsx`

Capture studio for recording training data:
- Record webcam with live avatar mimic
- Import video, mark in/out points, extract landmarks
- 30 FPS resample on save
- Per-clip classifier test
- Avatar preview, mirror toggle, WebM export

### `src/inference/useSignInference.ts`

TF.js inference hook. Loads `/models/fsl_model_tfjs/model.json`, pushes 63-float feature vectors at 30 Hz gated by `INFERENCE_SAMPLE_INTERVAL_MS = 33ms`.

### `src/inference/labels.ts`

The model's output label contract — must match `label_map.json` from training:
```typescript
export const INFERENCE_LABELS: string[] = ["GRANDMA", "I", "LOVE", "YOU"];
```

### `src/inference/frameQuality.ts`

Frame quality gate — filters out frames without hand presence. Uses right-hand-only 63-float frame offsets (right hand at offset 0, no left hand in selectFeatures output).

### `src/features/sentenceBuilder.ts`

Sentence-mode layer with speed-aware grammar:
- **Slow signing** (deliberate pauses > 350ms) — stability-based commit (highest confidence)
- **Fast signing** (< 350ms between predictions) — mode-correction pass replaces each word with the most frequent word in its local window (±2), cleaning up rapid-fire misclassifications
- Hands leaving frame = sentence boundary

### `src/features/grammarParser.ts`

FSL grammar layer — canonicalizes spelling, applies contextual disambiguation, re-orders Topic-Comment glosses into grammatical English.

### `src/features/featureSelect.ts`

Selects right-hand-only landmarks (63 floats: 21 landmarks × 3 coordinates) from the normalized 345-float holistic vector.

### `src/lib/usePointerIntent.ts`

Pointer tracking hook — writes `--mx`/`--my` (unitless, clamped to [-1, 1]) to a host element for mascot following. Zero React re-renders after mount; compositor moves dots directly.

### `src/lib/videoCapture.ts`

Video → avatar-data extraction engine. Handles webcam recording, video import, in/out marking, 30 FPS resampling, mirror frame handedness flip.

### `src/hooks/useHolisticPipeline.ts`

MediaPipe Holistic detection loop. Target FPS = 30, frame interval = 33.33ms. Handles landmark detection, smoothing, and inference gating.

### `src/hooks/useCamera.ts`

Camera source management. Frame rate cap at 30 FPS (`{ ideal: 30, max: 30 }`). Low-power mode caps at 15 FPS.

### `src/components/ui/BrutalNav.tsx`

Bottom navigation slab — fixed to bottom of viewport, 6 items (Home, Translate, Avatar, Practice, Capture, Account). Each item is a printed block with active fill colour, thick border, hard shadow.

---

## Source Files (Training Pipeline)

### `training/train.py`
Training script for the FSL classifier model. Produces `label_map.json` with alphabetically sorted labels.

### `training/prepare_windows.py`
Prepares training windows from recorded landmark data.

### `training/extract_landmarks.py`
Extracts MediaPipe landmarks from video files.

### `training/rebuild_keras2.py`
Keras 2 model rebuild script.

### `training/step_3_convert.sh`
Converts trained Keras model to TF.js format.

### `training/test_tfjs_model.cjs`
Tests the converted TF.js model.

### `training/sample_dataset.json`
Sample training dataset.

---

## Key Design Decisions

### 1. Label Order Contract
The model was trained with labels sorted alphabetically: `["GRANDMA", "I", "LOVE", "YOU"]`. `src/inference/labels.ts` must match `label_map.json` exactly — index 0 = GRANDMA, index 1 = I, etc.

### 2. Right-Hand-Only Features
`selectFeatures()` outputs a 63-float right-hand-only frame. All downstream components (frame quality gate, inference) use this 63-float format, not the full 345-float holistic vector.

### 3. 30 FPS Target
Camera detection, TF.js inference, and the top nav FPS counter all target 30 FPS. On low-end devices, resolution tiers downgrade (not FPS) to maintain 30 FPS.

### 4. Neo-brutalist Design
No glassmorphism, no blur, no translucent panels. Everything uses flat colours, thick ink borders, hard offset shadows, and sharp corners.

### 5. Sentence Grammar
Fast signing triggers mode-correction (most frequent word in local window replaces misclassified blips). Slow signing uses stability-based commit for highest accuracy.

---

## Deployment

### Vercel
The app is deployed on Vercel at `https://handson-woad.vercel.app`. Build command: `npm install && npm run build`. The `vercel.json` configures the build and output directory.

### Local Development
```bash
# Install dependencies
npm install

# Run dev server (port 5174)
npm run dev

# TypeScript type check
npx tsc --noEmit

# Python service (SMPL-X fitting)
cd signavatars-service && python app.py
```

### Environment Variables
- `VITE_SMPLX_SERVICE_URL` — SMPL-X service URL (default: `http://localhost:8000`)

---

## Recent Changes (Session Summary)

1. **Label order fix** — `labels.ts` changed from `["I", "LOVE", "YOU", "GRANDMA"]` to `["GRANDMA", "I", "LOVE", "YOU"]` to match `label_map.json`
2. **Frame quality gate fix** — Fixed hand offsets (99/162 → 0/-1) so right-hand-only frames are usable
3. **Bias correction removal** — Removed 1.25x probability boost that inflated confidence to 125%
4. **30 FPS target** — Camera detection, inference gate, and top nav all target 30 FPS
5. **Dark mode theme** — Pleasing dark slate theme with balanced brand colours
6. **Theme transitions** — 0.35s cross-fade on dark/light mode toggle
7. **Mouse follower** — Decorative dots trail cursor (disabled in low power mode)
8. **ProfileDropdown** — Account / Settings / Logout with neobrutalist styling
9. **SettingsModal** — Floating settings panel (text size, contrast, low power, dark mode)
10. **TopNavBar** — Centered floating sticky top nav replacing left StatusBar rail
11. **Mobile fixes** — Viewport meta tag, touch targets (44px+), responsive layout
12. **Removed Home logo** — Logo now only appears in TopNavBar brand button
13. **Pushed to GitHub** — Commit `0080d5c24` on `master`
