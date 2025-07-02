# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview production build locally

## Application Overview

This is a comprehensive focus timer application built with React, TypeScript, and Vite. It provides time tracking, task management, project organization, and detailed analytics through a single-page application with four main sections.

## Architecture Overview

### State Management Architecture
The app uses React Context API with a centralized `AppContext` that manages all application state:
- **Sessions**: Focus/timer sessions with timing, task names, projects, and session notes
- **Todos**: Task management with project categorization, notes, and focus prioritization
- **Projects**: User-defined project categories with notes and archiving capabilities
- **Navigation**: Single-page app with 4 main pages (Home, Timer, Todo, History)
- **Active States**: Currently tracked todo and selected todo for seamless workflow

### Data Persistence
All data is persisted to localStorage through the `useLocalStorage` hook, which:
- Automatically serializes/deserializes data including Date objects
- Handles corrupted data gracefully by clearing and resetting to defaults
- Uses a custom date reviver to properly restore Date objects from JSON
- Implements automatic cleanup of soft-deleted todos after 30 days
- Supports data migration for legacy project formats

## Data Types & Relationships

### Session Interface
```typescript
interface Session {
    id: string;              // Unique identifier for reliable updates
    startTime: Date;         // When the session started
    durationMs: number;      // Duration in milliseconds
    description: string;     // Task name/description
    project: string;         // Associated project name
    todoId?: string | null;  // Optional link to Todo item
    notes?: string;          // Session-specific notes (separate from task name)
}
```

### Todo Interface
```typescript
interface Todo {
    id: string;              // Unique identifier
    text: string;            // Task description
    completed: boolean;      // Completion status
    projectId: string;       // Project association (empty string = no project)
    notes: string;           // Task notes
    completedAt?: Date;      // Completion timestamp
    deleted: boolean;        // Soft delete flag
    deletedAt?: Date;        // Deletion timestamp
    focusOrder?: number;     // Priority order (1, 2, or 3 for "Top 3 Focus")
}
```

### Project Interface
```typescript
interface Project {
    id: string;              // Unique identifier
    name: string;            // Project name
    notes: string;           // Project notes
    archived: boolean;       // Archive status
    archivedAt?: Date;       // Archive timestamp
    createdAt: Date;         // Creation timestamp
}
```

### Key Data Relationships
- **Sessions ↔ Todos**: Sessions can be linked to todos via `todoId` field
- **Todos ↔ Projects**: Todos are categorized by project via `projectId` (uses project name)
- **Sessions ↔ Projects**: Sessions are categorized by project via `project` field (uses project name)
- **Active todo state**: Shared between Timer and Todo pages for seamless workflow

## Core Application Features

### HomePage (`src/pages/HomePage.tsx`)
**View Modes:**
- **Day View**: Full timeline visualization with detailed daily summary
- **Week/Month/Year Views**: Simplified views showing total time only

**Timeline Features:**
- 24-hour visual timeline with 30-minute intervals
- Color-coded session blocks by project
- Current time indicator line
- Auto-scrolls to current time when viewing today (day view only)
- Hover tooltips showing session details

**Summary Components:**
- Work hours vs. target hours with progress tracking
- Project breakdown with donut chart and legend
- Task breakdown with percentage distribution
- All summaries update based on selected date and view

**Date Navigation:**
- Previous/next navigation buttons
- Calendar date picker widget
- Automatic "Today" detection for summary titles

### TimerPage (`src/pages/TimerPage.tsx`)
**Timer Modes:**
- **Timer Mode**: Countdown timer with preset durations (15, 25, 45, 60, 90 minutes)
- **Stopwatch Mode**: Open-ended time tracking

**Session Management:**
- Visual progress ring for timer mode
- Audio notification on timer start (boxing-bell.mp3)
- Real-time timeline visualization during active sessions
- Automatic session saving on completion

**Task Integration:**
- Can link to existing todos or create new ones automatically
- When `activeTodoId` is set from TodoPage, automatically starts stopwatch mode
- Auto-creates todos if task name provided but no existing todo found
- Shows task details and total accumulated time when tracking linked todo

**Notes Functionality:**
- Session-level notes can be added during active session
- Notes persist when session is saved to Previous Sessions
- Task-level notes are saved when new todos are created

### TodoPage (`src/pages/TodoPage.tsx`)
**Task Management Views:**
- **Inbox**: Tasks without project assignment
- **Today**: All pending tasks with Top 3 Focus prioritization system
- **Project Views**: Tasks filtered by specific project
- **Completed**: Tasks grouped by completion date with collapsible sections
- **Trash**: Soft-deleted tasks with restore/permanent delete options

**Top 3 Focus System:**
- Special priority system in Today view with 3 numbered slots
- Drag-and-drop to assign tasks to focus positions 1, 2, or 3
- Visual drop zones for adding/removing focus priorities
- Integrates with timer page for quick session starts

**Task Operations:**
- Create, edit, complete, delete (soft), restore, permanent delete
- Inline text editing with Enter/Escape keyboard support
- Project assignment with dropdown selector
- Task notes with auto-save functionality
- Time tracking integration showing total session time per task

**Project Management:**
- Create, rename, archive, unarchive, delete projects
- Project notes with auto-save
- Task counts displayed per project
- When project deleted, associated tasks moved to Inbox

### HistoryPage (`src/pages/HistoryPage.tsx`)
**Session Management:**
- Tabular view of all sessions sorted by date (newest first)
- Displays: Task name, project, start time, end time, duration
- **Edit Sessions**: Modify all session fields including notes
- **Add Manual Entries**: Create sessions retroactively
- **Delete Sessions**: Permanent deletion with confirmation

**Auto-linking Behavior:**
- When editing sessions, automatically links to existing todos by task name
- Creates new todos if task name doesn't match existing ones
- Case-insensitive matching for todo linking

## Component Architecture

### Major Components

**Timeline Component (`src/components/Timeline.tsx`):**
- Renders 48 time slots (30-minute intervals) for 24-hour view
- Color-coded session blocks using consistent project colors
- Current time indicator line with real-time updates
- Configurable pixels-per-minute scaling (2px default)

**Modal Components:**
- **StartSessionModal**: Duration selection and task configuration
- **EditSessionModal**: Full session editing (task, project, date, time, duration, notes)
- **DatePicker**: Calendar widget for date selection
- All modals support keyboard navigation (Escape to close)

**Task Components:**
- **TodoItem**: Checkbox, inline editing, project tags, drag-and-drop support
- **TaskDetails/TaskFocusDetail**: Task information, project assignment, notes, previous sessions
- **ProjectSelector**: Dropdown with project creation capability

**Session Components:**
- **EditableSessionItem**: Previous sessions with inline note editing
- **StatCard**: Metric displays with progress bars and trends
- **DonutChart**: Project time distribution visualization

### Custom Hooks

**useTimelineScroll (`src/hooks/useTimelineScroll.ts`):**
- Automatically scrolls timeline to center current time
- Only activates when viewing today in day view
- 100ms delay for proper layout calculation

**useLocalStorage (`src/hooks/useLocalStorage.ts`):**
- Handles all data persistence with automatic type safety
- Custom date reviver for JSON parsing
- Graceful error handling with fallback to defaults

**useDashboardData (`src/hooks/useDashboardData.ts`):**
- Processes session data for dashboard views
- Calculates project/task breakdowns and percentages
- Filters data by date range and view mode

### Utility Functions

**Formatters (`src/utils/formatters.ts`):**
- `formatToHoursAndMinutes()`: Converts milliseconds to "X hr Y min" format
- Date/time formatting with timezone support

**Colors (`src/utils/colors.ts`):**
- `getProjectColor()`: Consistent color assignment for projects
- Predefined colors for special categories
- Hash-based fallback for unknown projects

## Data Flow & Business Logic

### Session Creation Flow
1. **Timer Completion**: User starts timer → session automatically created on completion
2. **Manual Entry**: User adds session via History page with full editing capability
3. **Stopwatch Tracking**: Linked todos from TodoPage start stopwatch automatically

### Auto-linking System
- **Todo Creation**: Starting timer with new task name creates todo automatically
- **Existing Matching**: Case-insensitive matching of task names to existing todos
- **Bidirectional Updates**: Sessions link to todos, todos show related sessions

### Notes System
- **Session Notes**: Separate from task names, editable in Previous Sessions
- **Task Notes**: Stored on todo items, editable in TodoPage
- **Current Session Notes**: Flow from active session to saved session notes

### Project Color System
- Consistent color mapping based on project order in global list
- Special handling for categories like "Focus", "Meetings", "Breaks"
- Color persistence across timeline, charts, and UI elements

## Local Storage Strategy

### Storage Keys
- `focusTimerSessions` - Array of Session objects
- `focusTimerProjects` - Array of Project objects (migrated from legacy string array)
- `focusTimerTodos` - Array of Todo objects

### Data Migration & Cleanup
- Automatic migration from legacy project format (string array to Project objects)
- Soft delete cleanup: Permanently removes todos deleted 30+ days ago
- Graceful handling of corrupted data with reset to defaults

## Working with the Codebase

### Adding New Features
1. Update types in `src/types.ts` if new data structures needed
2. Add state/actions to `AppContext.tsx` for global state management
3. Create/modify components following existing patterns
4. Use `useAppContext()` hook to access global state
5. Follow localStorage persistence patterns for data durability
6. Add appropriate TypeScript types for type safety

### Code Patterns
- **Context Pattern**: All global state managed through AppContext
- **Component Composition**: Reusable components with clear prop interfaces
- **Custom Hooks**: Extract complex logic into reusable hooks
- **Type Safety**: Comprehensive TypeScript types for all data structures

### Current Limitations & Technical Debt
- **Project Linking**: Mixed ID/name linking strategies create potential inconsistencies
- **Timeline View**: Only available in day view mode
- **Data Export**: No built-in export functionality
- **Mobile Responsiveness**: Optimized primarily for desktop use
- **Complex Context**: Large context provider managing many responsibilities

### Testing & Quality
- TypeScript compilation ensures type safety
- ESLint configuration for code quality
- Build process validates all code before production
- No automated tests currently implemented

## Key File Locations

### Core Application
- `src/main.tsx` - Application entry point
- `src/pages/App.tsx` - Main router and layout
- `src/context/AppContext.tsx` - Global state management
- `src/types.ts` - All TypeScript type definitions

### Pages
- `src/pages/HomePage.tsx` - Dashboard with timeline and summaries
- `src/pages/TimerPage.tsx` - Timer/stopwatch functionality
- `src/pages/TodoPage.tsx` - Task management and projects
- `src/pages/HistoryPage.tsx` - Session history and editing

### Key Components
- `src/components/Timeline.tsx` - Visual timeline component
- `src/components/TaskFocusDetail.tsx` - Task details and previous sessions
- `src/components/EditSessionModal.tsx` - Session editing modal
- `src/components/DailySummaryCard.tsx` - Dashboard summary card

### Utilities
- `src/hooks/` - Custom React hooks
- `src/utils/` - Utility functions for formatting and colors
- `src/styles.css` - Application-wide styles