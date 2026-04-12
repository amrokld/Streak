<div align="center">
  <h1>⚡ STREAK</h1>
  <p><strong>A minimal, elegant habit tracking app focused on sheer consistency.</strong></p>
  <p>One habit. One streak. Every day.</p>
</div>

<br />

## 📖 About The Project

**STREAK** is a highly-polished, completely offline habit tracker built for users who demand premium design without app bloat. By leveraging modern fluid animations, dynamic theming, and an uncompromising stance on data privacy, STREAK delivers a native-feeling tracking experience — now with full bilingual support.

## ✨ Key Features

- 🎯 **Frictionless Tracking:** Increment streaks with massive, satisfying counter interactions & confetti celebrations
- 🎨 **Premium Animations:** Physics-based layout transitions and frosted-glass modals using Framer Motion
- 🌓 **Dynamic Theming:** Deeply integrated Dark Mode and Light Mode with a centralized token system
- 📂 **Smart Categorization:** Organize, filter, and prioritize habits by *Important*, *Urgent*, or *Optional*
- 🌍 **Bilingual Support:** Full English & Arabic localization with automatic RTL layout and native Arabic typography
- ✅ **Task Management:** A complete to-do system with priorities, due dates, and a built-in calendar picker
- 📊 **Rich Statistics:** Overview cards, weekly consistency tracking, insights, and an integrated activity heatmap calendar
- 🔒 **Absolute Privacy:** 100% offline. Your data never leaves your device and lives entirely in Local Storage
- 💾 **Data Portability:** Safely backup your entire history via JSON Export/Import capabilities
- 📩 **Built-in Support:** In-app Bug & Feedback reporting natively hooked into EmailJS

## 🏗️ Architecture

- **Centralized State:** All habits, tasks, and settings managed through dedicated React Contexts (`HabitContext`, `TaskContext`, `ThemeContext`, `LanguageContext`)
- **Theme Tokens:** A single `getTokens(isDark)` function replaces all hardcoded colors across the app
- **i18n System:** Translation files in `/locales` with a `t(key)` function — scalable to any number of languages
- **Normalized Dates:** All date logic uses `YYYY-MM-DD` format via `dateHelpers.js` for timezone-safe comparisons
- **Centralized Storage:** All `localStorage` keys live in `constants/storageKeys.js`

## 🛠️ Built With

* **React 18 (Vite):** Core architecture and fast bundling
* **Electron:** Desktop application packaging with auto-update support
* **TailwindCSS:** Utility-first, geometric aesthetic styling
* **Framer Motion:** Physics and layout-based animations
* **React Router v6:** Seamless page transitions
* **React Context API:** Global state management for Habits, Tasks, Theme, and Language

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

## ⚙️ Additional Configuration

**Feedback Form Integration (EmailJS)**  
The application's `Settings` page comes pre-wired for live user feedback relay. To enable it:
1. Create a free account at [EmailJS](https://www.emailjs.com/).
2. Setup an Email Service and an Email Template containing the parameter `{{message}}`.
3. Open `src/pages/Settings.jsx` and insert your API credentials (`service_id`, `template_id`, and `user_id`) in the `handleFeedbackSubmit` function.

## 🤝 Contributing
Contributions, issues, and feature requests are always welcome! 

## 📝 License
Distributed under the MIT License.

---
*Crafted with ❤️ by amro.*
