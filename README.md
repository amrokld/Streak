<div align="center">
  <h1>⚡ STREAK</h1>
  <p><strong>A minimal, elegant habit tracking app focused on sheer consistency.</strong></p>
  <p>One habit. One streak. Every day.</p>
</div>

<br />

## 📖 About The Project

**STREAK** is a highly-polished, completely offline habit tracker built for users who demand premium design without app bloat. By leveraging modern fluid animations, dynamic theming, and an uncompromising stance on data privacy, STREAK delivers a native-feeling tracking experience directly inside the browser.

## ✨ Key Features

- 🎯 **Frictionless Tracking:** Increment streaks with massive, satisfying counter interactions & confetti celebrations
- 🎨 **Premium Animations:** Physics-based layout transitions and frosted-glass modals using Framer Motion
- 🌓 **Dynamic Theming:** Deeply integrated Dark Mode and Light Mode that responds beautifully to user preference
- 📂 **Smart Categorization:** Organize, filter, and prioritize habits by *Important*, *Urgent*, or *Optional* 
- 🔒 **Absolute Privacy:** 100% offline. Your data never leaves your device and lives entirely in your browser's Local Storage
- 💾 **Data Portability:** Safely backup your entire history via JSON Export/Import capabilities
- 📩 **Built-in Support:** In-app Bug & Feedback reporting natively hooked into EmailJS

## 🛠️ Built With

* **React 18 (Vite):** Core architecture and fast bundling
* **TailwindCSS:** Utility-first, geometric aesthetic styling
* **Framer Motion:** Physics and layout-based animations
* **React Router v6:** Seamless page transitions
* **React Context API:** Global `Habit` and `Theme` state management

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
