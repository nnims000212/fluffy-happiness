# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview production build locally

## Architecture Overview

### Technology Stack
- **Frontend**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 6.3.5 with React plugin
- **Styling**: Custom CSS with Google Fonts (Poppins, Roboto Mono)
- **State Management**: React Context API
- **Data Persistence**: localStorage with custom hooks
- **Notifications**: react-hot-toast
- **Date Utilities**: date-fns
- **Linting**: ESLint with TypeScript integration

### State Management Architecture
The app uses React Context API with a centralized `AppContext` that manages all application state:
- **Sessions**: Focus/timer sessions with start time, duration, project, and optional todo linking
- **Todos**: Task management with project categorization, notes, and completion tracking
- **Projects**: Rich project objects with names, notes, archiving capability, and metadata for organizing sessions and todos
- **Navigation**: Single-page app with 4 main pages (Home, Timer, Todo, History)
- **UI State**: Active todo selection, page navigation, and inter-page communication

### Data Persistence
All data is persisted to localStorage through the `useLocalStorage` hook (`src/hooks/useLocalStorage.ts`):
- Automatically serializes/deserializes data including Date objects
- Handles corrupted data gracefully by clearing and resetting to defaults
- Uses a custom date reviver function with regex pattern matching for ISO date strings
- Provides type-safe localStorage access with React state synchronization

### Key Data Relationships
- Sessions can be linked to todos via optional `todoId` field
- Both sessions and todos are categorized by project using `project` and `projectId` fields
- Active todo state (`activeTodoId`, `selectedTodoId`) is shared between Timer and Todo pages
- Sessions store actual time data while todos track task completion status with optional `completedAt` timestamp
- Project management includes creation, deletion, renaming, archiving/unarchiving, and notes with automatic data migration
- **Top 3 Focus**: Todos can have an optional `focusOrder` (1, 2, or 3) for daily prioritization
- **Collapsible UI**: Completed sections maintain individual collapse state for projects and Inbox

### Component Structure
- **Pages**: 
  - `App.tsx` - Main router with expandable navigation sidebar
  - `HomePage.tsx` - Dashboard with stats and charts
  - `TimerPage.tsx` - Timer interface with session management
  - `TodoPage.tsx` - Task management interface
  - `HistoryPage.tsx` - Session history and analytics
- **Components**: Modular components in `src/components/` including modals, charts, forms, and UI elements
- **Context Provider**: `AppProvider` wraps the entire app providing state and actions
- **Custom Hooks**: 
  - `useLocalStorage` for persistence
  - `useTimelineScroll` for UI behavior
  - `useDashboardData` for dashboard calculations

### Timer Implementation
- Supports both countdown timer and stopwatch modes
- Uses setInterval for time tracking with proper cleanup
- Audio feedback via HTML5 Audio API (`public/audio/boxing-bell.mp3`)
- Automatic session saving with unique IDs, duration, project, and description
- Real-time timeline visualization during active sessions
- Integration with todo system for task-focused sessions

### Local Storage Keys
- `focusTimerSessions` - Array of Session objects with unique IDs
- `focusTimerProjects` - Array of Project objects with id, name, notes, archived status, and timestamps
- `focusTimerTodos` - Array of Todo objects with notes and completion tracking

## Working with the Codebase

### Data Types (`src/types.ts`)
- `Session` - Timer session data with required id, startTime, durationMs, description, project, optional todoId
- `Todo` - Task data with id, text, completed boolean, projectId, notes, optional completedAt Date
- `Project` - Project data with id, name, notes, archived boolean, optional archivedAt, and createdAt Date

### Project Structure
```
src/
├── components/          # Reusable UI components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── pages/              # Main page components
├── utils/              # Utility functions (colors, formatters)
├── types.ts            # TypeScript type definitions
├── main.tsx            # React app entry point
├── index.css           # Global styles
└── styles.css          # Component-specific styles
```

### Adding New Features
1. Update types in `src/types.ts` if needed
2. Add state/actions to `AppContext.tsx` context provider
3. Create/modify components in appropriate folders following existing patterns
4. Use `useAppContext()` hook to access global state and actions
5. Follow existing patterns for localStorage persistence and error handling
6. Add toast notifications for user feedback using react-hot-toast

### Project Color System
Colors are assigned to projects via `getProjectColor()` in `utils/colors.ts`:
- Uses a predefined color palette for consistent visual representation
- Includes hardcoded colors for special categories (Focus, Meetings, Breaks, Other)
- Provides stable color mapping based on project array index
- Fallback system ensures colors are always assigned even for unknown projects

### Project Management Features
The Todo page includes enhanced project management capabilities:
- **Collapsible Project Sections**: Projects and Archived Projects sections can be collapsed/expanded in the sidebar
- **Project Archiving**: Projects can be archived/unarchived to reduce clutter while preserving data
- **Project Notes**: Each project supports rich text notes displayed in the main content area when a project is selected
- **Archive Actions**: Archive button appears on hover next to delete button for active projects
- **Archived Projects Section**: Only visible when archived projects exist, with unarchive and delete actions
- **Project Migration**: Automatic migration from string-based to object-based project storage
- **Visual Indicators**: Archived projects shown with reduced opacity and italics

### Todo Page Layout
- **Left Sidebar**: Collapsible sections for Inbox, Projects, Archived Projects (if any), Completed, and Trash
- **Main Content**: Project title, project notes textarea (for projects), task input, and todo lists
- **Right Panel**: Task details with notes and session history
- **Interactive Elements**: Hover actions for archive/delete, click-to-collapse sections, inline editing

### Development Patterns
- All components use TypeScript with strict typing
- State updates use functional updates for arrays/objects
- Error boundaries and graceful error handling throughout
- Responsive design with CSS Grid and Flexbox
- Accessibility considerations with semantic HTML and proper ARIA labels