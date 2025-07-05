# Focus Timer App

A powerful productivity application built with React and TypeScript that helps you track time, manage tasks, and maintain focus throughout your day.

![Focus Timer Screenshot](screenshots/focus-timer-main.png)

## ✨ Features

- **🎯 Top 3 Focus System**: Prioritize your most important tasks for the day with drag-and-drop functionality
- **🌅 Daily Reset System**: Intelligent daily reset prompts to help you start each day fresh
- **⏱️ Dual Timer Modes**: Choose between countdown timer or stopwatch based on your workflow
- **📝 Task Management**: Create, organize, and track tasks with project categorization
- **📊 Analytics Dashboard**: Visual timeline and statistics to track your productivity
- **⚙️ Comprehensive Settings**: Customize work goals, reset behavior, and focus preferences
- **📈 Focus History**: Track your daily focus patterns and productivity trends
- **🎨 Modern Dark UI**: Clean, distraction-free interface optimized for focus
- **💾 Local Storage**: All data is saved locally on your device - no account required
- **🔄 Drag & Drop**: Intuitive task reordering and focus management

## 🚀 Quick Start

### Prerequisites

Before you begin, you'll need to install the following tools:

#### 1. Install Node.js
Node.js is required to run the development server and build the application.

**Windows:**
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS version (recommended)
3. Run the installer and follow the setup wizard
4. Restart your computer after installation

**macOS:**
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS version
3. Run the `.pkg` installer
4. Or install via Homebrew: `brew install node`

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verify Installation:**
Open a terminal/command prompt and run:
```bash
node --version
npm --version
```
You should see version numbers for both commands.

#### 2. Install Git (Optional but Recommended)
Git is needed if you want to clone the repository or contribute to the project.

**Windows:**
1. Download from [git-scm.com](https://git-scm.com/)
2. Run the installer with default settings

**macOS:**
1. Install via Homebrew: `brew install git`
2. Or download from [git-scm.com](https://git-scm.com/)

**Linux:**
```bash
sudo apt-get install git
```

### Installation

#### Option 1: Clone with Git (Recommended)
```bash
# Clone the repository
git clone https://github.com/yourusername/focus-timer-vite.git

# Navigate to the project directory
cd focus-timer-vite

# Install dependencies
npm install

# Start the development server
npm run dev
```

#### Option 2: Download ZIP
1. Download the project as a ZIP file from GitHub
2. Extract the ZIP file to your desired location
3. Open a terminal/command prompt in the extracted folder
4. Run the following commands:
```bash
npm install
npm run dev
```

### 🎉 You're Ready!

The application will automatically open in your browser at `http://localhost:5173`

If it doesn't open automatically, copy and paste this URL into your web browser.

## 📖 How to Use

### Getting Started
1. **Home Dashboard**: View your daily timeline and productivity statistics
2. **Top 3 Page**: Plan your daily focus with the Top 3 priority system
3. **Timer Page**: Start focus sessions with either countdown timer or stopwatch
4. **To-do Page**: Manage your tasks and projects
5. **History Page**: Review past sessions and add manual entries
6. **Settings Page**: Customize your productivity preferences

### Setting Up Your First Focus Session

#### Method 1: Quick Timer Start
1. Go to the **Timer** page
2. Choose between **Timer** or **Stopwatch** mode
3. For Timer mode: Click the play button to open session setup
4. Enter your task name, select a project, and set duration
5. Click "Start Session" to begin

#### Method 2: Top 3 Focus Workflow (Recommended)
1. Go to the **Top 3** page for dedicated daily planning
2. Use the **Task Input** to create new tasks quickly
3. Drag your most important tasks into the **Top 3 Focus** slots (1, 2, 3)
4. Click on a focus task to see details, then click "Track Time" to start a session
5. Complete tasks by checking them off - they'll remain visible in focus slots

#### Method 3: Todo-Driven Focus
1. Go to the **To-do** page for comprehensive task management
2. Click "Add Task" to create new tasks with project categorization
3. Use the project sidebar to organize tasks by category
4. Navigate to **Top 3** page and drag tasks from the pending list to focus slots

### Managing Projects
1. In the To-do page sidebar, click the **+** button next to "Projects"
2. Enter a project name and press Enter
3. Organize your tasks by selecting projects when creating tasks
4. Archive completed projects to keep your workspace clean

### Daily Reset System
The app automatically detects when you start a new day and offers reset options:

1. **Keep Incomplete Tasks**: Archive completed focus tasks, preserve incomplete ones
2. **Fresh Start**: Clear all focus tasks and start with an empty Top 3
3. **Continue Previous Day**: Keep all tasks exactly as they were

Configure reset behavior in **Settings**:
- Set your preferred reset time (default: 6:00 AM)
- Enable/disable automatic reset prompts
- Choose default behaviors for incomplete tasks

### Drag & Drop Features
- **Reorder Focus Tasks**: Drag tasks between the Top 3 Focus slots (1, 2, 3)
- **Add to Focus**: Drag tasks from the pending list to focus slots
- **Remove from Focus**: Drag focus tasks back to the pending list
- **Swap Positions**: Drag one focus task over another to swap their positions

### Settings & Customization
Access the **Settings** page to customize:

**Daily Work Goal**
- Set your target hours per day (0.5-24 hours)
- Real-time progress tracking on the dashboard

**Focus Reset Options**
- Enable/disable daily reset prompts
- Set reset time (when to trigger daily reset)
- Configure incomplete task preservation
- Toggle completion celebrations

**Focus Management**
- View focus history count
- Clear focus history or current focus tasks
- Manage your productivity data

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

## 🏗️ Technology Stack

- **Frontend**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 6.3.5
- **Styling**: Custom CSS with CSS Variables
- **State Management**: React Context API
- **Data Persistence**: localStorage with custom hooks
- **Notifications**: react-hot-toast
- **Date Utilities**: date-fns
- **Code Quality**: ESLint with TypeScript integration

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Timeline.tsx     # Daily activity timeline
│   ├── TodoItem.tsx     # Individual task component
│   ├── TaskDetails.tsx  # Task information panel
│   └── ...
├── context/            # React Context providers
│   └── AppContext.tsx  # Global application state
├── hooks/              # Custom React hooks
│   ├── useLocalStorage.ts    # Data persistence
│   └── useTimelineScroll.ts  # UI behavior
├── pages/              # Main application pages
│   ├── HomePage.tsx    # Dashboard and analytics
│   ├── TodayPage.tsx   # Top 3 daily planning (displayed as "Top 3")
│   ├── TimerPage.tsx   # Focus timer interface
│   ├── TodoPage.tsx    # Comprehensive task management
│   ├── HistoryPage.tsx # Session history
│   └── SettingsPage.tsx # Application settings
├── utils/              # Utility functions
│   ├── colors.ts       # Project color management
│   └── formatters.ts   # Time and date formatting
├── types.ts           # TypeScript type definitions
├── main.tsx          # Application entry point
└── styles.css        # Global styles and themes
```

## 💾 Data Storage

Your data is stored locally in your browser using localStorage. This means:
- ✅ **Privacy**: No data is sent to external servers
- ✅ **Offline**: Works without an internet connection
- ✅ **Fast**: Instant loading and saving
- ⚠️ **Device-specific**: Data stays on the device where you use the app
- ⚠️ **Browser-specific**: Data is tied to the specific browser you use

### Storage Structure
The application uses these localStorage keys:
- `focusTimerSessions` - Array of focus session records
- `focusTimerProjects` - Array of project definitions with notes and archiving
- `focusTimerTodos` - Array of tasks with focus priority tracking
- `focusTimerDailyGoal` - Daily work goal in hours (default: 8)
- `focusTimerFocusHistory` - Daily focus reset history and patterns
- `focusTimerFocusSettings` - Reset preferences and celebration settings
- `focusTimerLastLaunch` - Last app launch date for daily reset detection

### Backing Up Your Data
To backup your data:
1. Open browser developer tools (F12)
2. Go to Application/Storage tab
3. Find localStorage entries starting with "focusTimer"
4. Copy the values to a text file for backup

## 🎨 Customization

### Adding New Project Colors
Edit `src/utils/colors.ts` to add more color options for projects.

### Modifying the Theme
Update CSS variables in `src/styles.css` to customize the dark theme colors and spacing.

### Changing Timer Defaults
Modify the timer defaults in `src/pages/TimerPage.tsx`.

## 🐛 Troubleshooting

### Common Issues

**"npm command not found"**
- Make sure Node.js is properly installed
- Restart your terminal/command prompt
- On Windows, make sure Node.js is in your PATH

**"Permission denied" errors on macOS/Linux**
- Try using `sudo npm install` (not recommended)
- Better: Fix npm permissions following [npm docs](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)

**Development server won't start**
- Make sure port 5173 isn't already in use
- Try `npm run dev -- --port 3000` to use a different port

**Data not saving**
- Check if localStorage is enabled in your browser
- Make sure you're not in private/incognito mode

**Daily reset not appearing**
- Check that auto-reset is enabled in Settings
- Verify the reset time matches your daily routine
- Make sure you have focus tasks set when the reset time passes

### Getting Help
If you encounter issues:
1. Check the browser console for error messages (F12)
2. Make sure all dependencies are installed (`npm install`)
3. Try deleting `node_modules` and running `npm install` again
4. Create an issue on the GitHub repository with error details

## 🆕 What's New

### v2.0 - Daily Reset System & Settings
- **🌅 Daily Reset System**: Intelligent daily reset prompts with three reset options
- **⚙️ Comprehensive Settings Page**: Full control over work goals and focus behavior
- **📈 Focus History Tracking**: Monitor daily focus patterns and productivity trends
- **🎯 Enhanced Top 3 Page**: Dedicated daily planning interface with improved UX
- **🔄 Smart Detection**: Automatic new day detection based on configurable reset time
- **💾 Enhanced Data Storage**: Additional localStorage keys for settings and history
- **🎨 UI Improvements**: Better navigation flow and visual consistency

### Key Improvements
- Moved Top 3 Focus to dedicated page for better daily planning workflow
- Added configurable daily work goals with real-time progress tracking
- Implemented focus completion celebrations and customizable reset behavior
- Enhanced task management with better project organization
- Improved drag-and-drop interactions for focus task management

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/) for fast development
- Icons and design inspiration from modern productivity apps
- Color palette designed for reduced eye strain during long work sessions

---

**Happy focusing! 🎯**

For questions or support, please create an issue on the GitHub repository.