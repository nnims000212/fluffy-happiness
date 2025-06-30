# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview production build locally

## Architecture Overview

### State Management Architecture
The app uses React Context API with a centralized `AppContext` that manages all application state:
- **Sessions**: Focus/timer sessions with start time, duration, project, and optional todo linking
- **Todos**: Task management with project categorization and notes
- **Projects**: User-defined project categories for organizing sessions and todos
- **Navigation**: Single-page app with 4 main pages (Home, Timer, Todo, History)

### Data Persistence
All data is persisted to localStorage through the `useLocalStorage` hook, which:
- Automatically serializes/deserializes data including Date objects
- Handles corrupted data gracefully by clearing and resetting to defaults
- Uses a custom date reviver to properly restore Date objects from JSON

### Key Data Relationships
- Sessions can be linked to todos via `todoId` field
- Both sessions and todos are categorized by project
- Active todo state is shared between Timer and Todo pages for seamless workflow
- Sessions store actual time data while todos track task completion status

### Component Structure
- **Pages**: App.tsx acts as router with conditional rendering based on `activePage`
- **Context Provider**: AppProvider wraps the entire app and provides state/actions
- **Custom Hooks**: useLocalStorage for persistence, useTimelineScroll for UI behavior
- **Utility Functions**: Date/time formatters, color assignment for projects

### Timer Implementation
- Supports both countdown timer and stopwatch modes
- Uses setInterval for time tracking with cleanup on component unmount
- Audio feedback via HTML5 Audio API (boxing-bell.mp3)
- Automatic session saving with duration, project, and description
- Real-time timeline visualization during active sessions

### Local Storage Keys
- `focusTimerSessions` - Array of Session objects
- `focusTimerProjects` - Array of project name strings (default: Work, Personal, Learning)
- `focusTimerTodos` - Array of Todo objects

## Working with the Codebase

### Data Types
All core types are defined in `src/types.ts`:
- `Session` - Timer session data with id, timing, description, project, optional todoId
- `Todo` - Task data with id, text, completion status, project, notes

### Adding New Features
1. Update types in `src/types.ts` if needed
2. Add state/actions to `AppContext.tsx`
3. Create/modify components in appropriate folders
4. Use `useAppContext()` hook to access global state
5. Follow existing patterns for localStorage persistence

### Project Color System
Colors are assigned to projects via `getProjectColor()` in `utils/colors.ts` using a predefined palette that ensures visual consistency across charts and UI elements.11
