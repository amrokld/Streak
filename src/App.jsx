import { HashRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import AppLayout from "./layouts/AppLayout";
import Splash from "./components/Splash";
import Home from "./pages/Home";
import StreakPage from "./pages/StreakPage";
import Statistics from "./pages/Statistics";
import Other from "./pages/Other";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import Tasks from "./pages/Tasks";
import UpdatePatches from "./pages/UpdatePatches";
import Today from "./pages/Today";

import { HabitProvider } from "./Context/HabitContext";
import { TaskProvider } from "./Context/TaskContext";
import { LanguageProvider } from "./Context/LanguageContext";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <LanguageProvider>
      <HabitProvider>
        <TaskProvider>
          <HashRouter>
            {showSplash && <Splash onFinish={() => setShowSplash(false)} />}

            {!showSplash && (
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/streak/:habit" element={<StreakPage />} />
                  <Route path="/statistics" element={<Statistics />} />
                  <Route path="/other" element={<Other />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/updates" element={<UpdatePatches />} />
                  <Route path="/today" element={<Today />} />
                </Route>
              </Routes>
            )}
          </HashRouter>
        </TaskProvider>
      </HabitProvider>
    </LanguageProvider>
  );
}
