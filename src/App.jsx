import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import AppLayout from "./layouts/AppLayout";
import Splash from "./components/Splash";

import Home from "./pages/Home";
import StreakPage from "./pages/StreakPage";
import Statistics from "./pages/Statistics";
import Calendar from "./pages/Calender";
import Onboarding from "./pages/Onboarding";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <BrowserRouter>
      {showSplash && <Splash onFinish={() => setShowSplash(false)} />}

      {!showSplash && (
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/streak/:habit" element={<StreakPage />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/calendar" element={<Calendar />} />
          </Routes>
        </AppLayout>
      )}
    </BrowserRouter>
  );
}
