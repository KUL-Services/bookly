# Project Structure & Guidelines

## Directory Structure
This project follows a strict directory structure for the Next.js application, split between the main app logic and the Bookly specific features.

### Core Directories
- **`src/app`**: Next.js App Router pages and layouts.
  - **`[lang]`**: Localization root.
    - **`(bookly)`**: Routes specific to the Bookly customer interface.
    - **`(dashboard)`**: Admin/Business dashboard routes.
  - **`front-pages`**: Landing pages and marketing content.
- **`src/bookly`**: Core components and features for the Bookly application logic.
- **`src/configs`**: Global configuration files (fonts, i18n, theme).
- **`src/@core`**: Core utility libraries, theme definitions, and shared hooks.

## Design Systems & Fonts
The application strictly enforces a two-font system. No other fonts should be introduced.

### Primary Font: Helvetica World
- **Variable**: `--font-helvetica-world`
- **Usage**: Used for 99% of the UI. Headings, body text, buttons, inputs, and navigation.
- **Implementation**: Injected via `src/configs/fonts.ts` and applied globally in `globals.css`.

### Secondary Font: Fira Code
- **Variable**: `--font-fira-code`
- **Usage**: Strictly for code blocks, `pre` tags, `kbd`, technical data displays, and text inputs requiring monospaced alignment.
- **Implementation**: 
  - Configured in `tailwind.config.ts` as `font-mono` and `font-fira`.
  - Enforced globally on `<code>`, `<pre>`, `<kbd>`, `<samp>` tags.

## Component & Styling Guidelines
1. **Tailwind CSS**: Use utility classes for most styling.
2. **Typography**:
   - Use `font-sans` (default) for standard text.
   - Use `font-mono` for code/technical text.
   - **DO NOT** use inline `fontFamily` styles.
   - **DO NOT** import Google Fonts or other external font resources.
3. **Icons**: Use `Lucide React` icons or the custom `KulIcon` component.

## Key Configuration Files
- `src/configs/fonts.ts`: Central definition for `helveticaWorld` and `firaCode`.
- `tailwind.config.ts`: Tailwind theme extension mapping variables to utility classes.
- `src/app/globals.css`: Global base styles and font resets.
