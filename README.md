<div align="center">
  <h1>⚡ STREAK</h1>
  <p><strong>A minimal, elegant habit tracking app focused on sheer consistency.</strong></p>
  <p>One habit. One streak. Every day.</p>
  <p><code>v3.1</code> &nbsp;•&nbsp; React + Electron &nbsp;•&nbsp; Fully Offline &nbsp;•&nbsp; EN / AR</p>
</div>

<br />

## 📖 About The Project

**STREAK** is a highly-polished, completely offline habit tracker built for users who demand premium design without app bloat. By leveraging modern fluid animations, dynamic theming, and an uncompromising stance on data privacy, STREAK delivers a native-feeling tracking experience — with full bilingual support, smart scheduling, and a dedicated daily execution layer.

---

## ✨ Key Features

### 🏠 Home — Habit Dashboard
- Track all habits in a swipeable card grid
- Habit cards display category, schedule label, and streak count
- Right-click any card to access options (edit category & schedule, delete)
- Filter habits by category (Important, Urgent, Optional)

### 📅 Today — Daily Execution Layer
- Focused view showing **only habits scheduled for today**
- Tap the streak number directly to check in — instant confetti + toast feedback
- Intelligent progress messaging based on how many habits remain
- Completed habits and tasks collapse into a "Show Completed" section
- "Clear All" removes completed tasks and hides done habits — page goes clean
- "Show Completed" auto-hides when nothing is left

### ✅ Task Management
- Add tasks with priority levels (Urgent, Important, Optional) and a built-in calendar date picker
- Dual-label system: **Priority badge** + **Time badge** (Today / Tomorrow / Yesterday / Date)
- Overdue tasks highlighted in blue across all views
- Full task editing modal — redesigned to match all other app modals
- Clear completed tasks in one click

### 📅 Habit Scheduling System *(new in v3.1)*
- Choose **Daily** or **Custom** schedule when creating a habit
- Custom: pick specific weekdays (Mon, Wed, Fri, etc.)
- Today page automatically filters — only relevant habits appear
- Schedule label displayed on each habit card (e.g. "Mon, Wed")
- Edit schedule at any time via the "Category & Schedule" modal

### 🎯 Streak Tracking
- Satisfying counter interactions with confetti celebrations
- Streak resets are timezone-safe with automatic missed-day detection
- "Come back tomorrow" guard prevents duplicate check-ins

### 🎨 Design & Theming
- Premium animations with Framer Motion (physics-based transitions, frosted-glass modals)
- Deeply integrated Dark Mode and Light Mode via a centralized token system
- Consistent "alive" button style across all modals and forms
- Fully responsive layout with RTL support for Arabic

### 🌍 Bilingual Support
- Full English & Arabic localization
- Automatic RTL layout flip when Arabic is selected
- Native Arabic typography

### 📊 Statistics & History
- Overview cards, weekly consistency tracking, and behavior insights
- Integrated activity heatmap calendar
- Filter by habit and tap any day for details

### 🔒 Privacy & Data
- 100% offline — your data never leaves your device
- All data stored in Local Storage
- JSON Export/Import for full backup and restore
- Factory reset option in Settings

### 📩 Feedback
- In-app bug reporting and feedback relay via EmailJS (Settings → Info)

---

## 🏗️ Architecture

| Layer | Details |
|---|---|
| **State** | `HabitContext`, `TaskContext`, `ThemeContext`, `LanguageContext` |
| **Theming** | `getTokens(isDark)` — single source for all colors |
| **i18n** | `/locales/en.js` + `/locales/ar.js` with `t(key)` function |
| **Dates** | `YYYY-MM-DD` format via `dateHelpers.js` — timezone-safe |
| **Scheduling** | `habitSchedule.js` — `isHabitScheduledForToday(habit)` utility |
| **Storage** | All keys centralized in `constants/storageKeys.js` |

---

## 🛠️ Built With

* **React 18 (Vite)** — Core architecture and fast bundling
* **Electron** — Desktop application packaging
* **TailwindCSS** — Utility-first styling
* **Framer Motion** — Layout and physics-based animations
* **React Router v6** — Page transitions and navigation
* **canvas-confetti** — Check-in celebration feedback
* **EmailJS** — In-app feedback relay

---

## 🚀 Getting Started

### Prerequisites
* Node.js installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/streak.git
   ```
2. Navigate to the project directory:
   ```bash
   cd streak
   ```
3. Install the required NPM packages:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Build the Electron desktop app:
   ```bash
   npm run electron:build
   ```

---

## ⚙️ Configuration

**Feedback Form (EmailJS)**
The Settings page is pre-wired for live feedback relay. To enable it:
1. Create a free account at [EmailJS](https://www.emailjs.com/).
2. Create an Email Service and Template with a `{{message}}` parameter.
3. In `src/pages/Settings.jsx`, insert your `service_id`, `template_id`, and `user_id` inside `handleFeedbackSubmit`.

---

## 🤝 Contributing
Contributions, issues, and feature requests are always welcome!

## 📝 License
Distributed under the MIT License.

---
*Crafted with ❤️ by amro.*
