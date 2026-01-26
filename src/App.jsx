import { BrowserRouter, Routes, Route } from "react-router-dom";
import Onboarding from "./pages/Onboarding";
import StreakPage from "./pages/StreakPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/streak" element={<StreakPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
