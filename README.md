# Focus Timer App

A powerful productivity application built with React and TypeScript that helps you track time, manage tasks, and maintain focus throughout your day.

![Focus Timer Screenshot](screenshots/focus-timer-main.png)

## ✨ Features

- **🎯 Top 3 Focus System**: Prioritize your most important tasks for the day with drag-and-drop functionality
- **⏱️ Dual Timer Modes**: Choose between countdown timer or stopwatch based on your workflow
- **📝 Task Management**: Create, organize, and track tasks with project categorization
- **📊 Analytics Dashboard**: Visual timeline and statistics to track your productivity
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
2. **Timer Page**: Start focus sessions with either countdown timer or stopwatch
3. **Todo Page**: Manage your tasks and projects
4. **History Page**: Review past sessions and add manual entries

### Setting Up Your First Focus Session

#### Method 1: Quick Timer Start
1. Go to the **Timer** page
2. Choose between **Timer** or **Stopwatch** mode
3. For Timer mode: Click the play button to open session setup
4. Enter your task name, select a project, and set duration
5. Click "Start Session" to begin

#### Method 2: Todo-Driven Focus
1. Go to the **Todo** page
2. Click "Add Task" to create a new task
3. Switch to **Today** view
4. Drag your most important tasks into the **Top 3 Focus** slots
5. Click on a focus task, then click "Track Time" to start a session

### Managing Projects
1. In the Todo page sidebar, click the **+** button next to "Projects"
2. Enter a project name and press Enter
3. Organize your tasks by selecting projects when creating tasks
4. Archive completed projects to keep your workspace clean

### Drag & Drop Features
- **Reorder Focus Tasks**: Drag tasks between the Top 3 Focus slots
- **Add to Focus**: Drag tasks from the pending list to focus slots
- **Remove from Focus**: Drag focus tasks to the removal zone
- **Swap Positions**: Drag one focus task over another to swap their positions

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
│   ├── TimerPage.tsx   # Focus timer interface
│   ├── TodoPage.tsx    # Task management
│   └── HistoryPage.tsx # Session history
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

### Getting Help
If you encounter issues:
1. Check the browser console for error messages (F12)
2. Make sure all dependencies are installed (`npm install`)
3. Try deleting `node_modules` and running `npm install` again
4. Create an issue on the GitHub repository with error details

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