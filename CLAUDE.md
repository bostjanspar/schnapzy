# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Schnapzy is a web-based implementation of Schnapsen, a traditional Austrian two-player point-trick card game. The game is built as a single-page web application using Vite, TypeScript, and PixiJS for rendering.

## Development Commands

- `npm run dev` - Start the development server at http://localhost:5173/ with hot-reload
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run preview` - Preview the production build locally

### Testing
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once (CI-friendly)
- `npm run test:ui` - Run tests with visual UI interface
- `npm run coverage` - Generate test coverage report

### Browser Debugging
When `npm run dev` is running, use MCP tools to debug and visualize the application:

**To view and analyze the current page:**
1. Navigate: `mcp__chrome-devtools__navigate_page` to http://localhost:5173/
2. Take screenshot: `mcp__chrome-devtools__take_screenshot`
3. Process image: `mcp__zai-mcp-server__analyze_image` to analyze layout, design, and UI

**Additional Chrome DevTools MCP capabilities:**
- `take_snapshot` - Get text-based page structure snapshot
- `list_console_messages` - Check for JavaScript errors
- `list_network_requests` - Inspect API calls and resource loading
- `evaluate_script` - Run JavaScript in the browser context
- `click`/`fill`/`hover` - Interact with UI elements

**Performance audits:**
- `performance_start_trace` / `performance_stop_trace` - Record performance metrics
- Check Core Web Vitals (LCP, FID, CLS)

## Architecture

### Tech Stack
- **Vite** - Build tool and dev server
- **TypeScript** - Type-safe JavaScript (strict mode enabled)
- **Pixi.js** - 2D WebGL rendering engine for the game board and cards
- **@pixi/ui** - UI components library for interactive elements
- **Vitest** - Test runner with jsdom environment

### Project Structure
- `src/main.ts` - Application entry point, initializes the PixiJS app
- `src/vite-env.d.ts` - Vite-specific type declarations (CSS, SVG imports)
- `test/` - Test files (separate from src, uses tsconfig.spec.json)
- `index.html` - HTML entry point with `#app` container
- `public/` - Static assets
- `vitest.config.ts` - Vitest configuration
- `tsconfig.json` - Main TypeScript config (src only)
- `tsconfig.spec.json` - TypeScript config for tests (includes test and src)

### TypeScript Configuration
- Target: ES2022 with bundler module resolution
- Strict mode enabled with all strict flags (`strictNullChecks`, `noImplicitAny`, etc.)
- Additional strict options: `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noImplicitOverride`
- Supports `package.json` exports and imports fields via `resolvePackageJsonExports`
- Tests use separate `tsconfig.spec.json` that extends base config

## Game Rules Reference

The README.md contains the complete rules for Schnapsen. Key concepts for implementation:

- **Deck:** 20 cards (Ace, Ten, King, Queen, Jack in four suits)
- **Objective:** First to 66 card points wins a hand; first to 0 game points wins the match
- **Two gameplay phases:** Open talon (flexible play) and closed/exhausted talon (strict suit-following rules)
- **Special actions:** Trump Jack exchange, marriage melds (20/40 points), closing the talon
- **Scoring:** Mental scorekeeping, 1-3 game points per hand based on opponent's tricks/points

## Implementation Notes

This is a new project. The codebase currently contains Vite boilerplate that will be replaced with the Schnapsen game logic and UI. When implementing:
- Use Pixi.js for card rendering and game board visualization
- Use @pixi/ui for interactive buttons and game controls
- Model the complete Schnapsen rules including all edge cases (closing restrictions, marriage timing, last trick rule)
