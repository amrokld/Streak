import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../Context/LanguageContext";
import { useTheme } from "../Context/ThemeContext";
import { getTokens } from "../theme/tokens";
import { useHabits } from "../Context/HabitContext";
import { useTour } from "../tour/TourProvider";
import { useNavigate } from "react-router-dom";

export default function IntroFlow({ onFinish, onOpenNewHabit, isModalOpen }) {
  const [step, setStep] = useState(0);

  const toggleEditDay = (day) => {
    setEditDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };


  const { isDark } = useTheme();
  const { cardBg, text } = getTokens(isDark);
  const { t } = useLanguage();
  const { isActive } = useTour();

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-md" style={{ display: (isActive || isModalOpen) ? 'none' : 'flex' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[420px] p-8 rounded-[32px] relative overflow-hidden ring-1 ring-white/10"
        style={{
          backgroundColor: cardBg,
          color: text,
          boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.8)' : '0 20px 40px rgba(0,0,0,0.15)'
        }}
      >
        <AnimatePresence mode="wait">
          {step === 0 && <Welcome key="0" next={next} />}
          {step === 1 && <ThemeAndLanguage key="1" next={next} back={back} />}
          {step === 2 && <Username key="2" next={next} back={back} />}
          {step === 3 && <AppIntroOptions key="3" next={next} back={back} onFinish={onFinish} />}
          {step === 4 && <FinishedTour key="4" next={next} />}
          {step === 5 && <ReadyToCreate key="5" next={next} onFinish={onFinish} onOpenNewHabit={onOpenNewHabit} />}
          {step === 6 && <Finish key="6" onFinish={onFinish} />}
        </AnimatePresence>

        {/* Progress Display */}
        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? "w-6 opacity-100" : "w-1.5 opacity-30"}`}
              style={{ backgroundColor: getTokens(isDark).accent }}
            />
          ))}
        </div>

      </motion.div>
    </div>
  );
}

{/* 1. Welcome - Styled Logo */ }
function Welcome({ next }) {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { accent, subText } = getTokens(isDark);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
      <motion.div
        whileTap={{ scale: 0.95 }}
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="mb-6 cursor-default mt-6"
      >
        <span
          className="text-6xl font-bold transition-all duration-300"
          style={{
            fontFamily: "Space Grotesk",
            letterSpacing: "0.06em",
            color: accent,
          }}
          onMouseEnter={(e) => e.currentTarget.style.textShadow = `0 0 15px ${accent}aa`}
          onMouseLeave={(e) => e.currentTarget.style.textShadow = "none"}
        >
          {t("appName") || "STREAK"}
        </span>
      </motion.div>

      <p className="mb-10 text-center text-sm font-medium" style={{ color: subText }}>
        {t("introWelcomeMsg")}
      </p>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={next}
        className="w-full py-3.5 rounded-xl font-bold transition-colors shadow-lg"
        style={{ backgroundColor: accent, color: isDark ? '#000' : '#fff' }}
      >
        {t("continue")}
      </motion.button>
    </motion.div>
  );
}

{/* 2. Theme & Lang Selection */ }
function ThemeAndLanguage({ next, back }) {
  const { lang, setLang, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { accent, text, subText, cardBg } = getTokens(isDark);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: accent }}>
        {t("setupEnvMsg")}
      </h2>

      <div className="space-y-6 mb-8">
        <div>
          <h3 className="text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: subText }}>
            {t("languageLabel")}
          </h3>
          <div className="flex gap-3">
            <button
              onClick={() => setLang('en')}
              className="flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition-all"
              style={{
                borderColor: lang === 'en' ? accent : (isDark ? '#444' : '#e5e7eb'),
                backgroundColor: lang === 'en' ? `${accent}15` : 'transparent',
                color: lang === 'en' ? accent : subText
              }}
              onMouseEnter={(e) => { if (lang !== 'en') e.currentTarget.style.borderColor = accent }}
              onMouseLeave={(e) => { if (lang !== 'en') e.currentTarget.style.borderColor = isDark ? '#444' : '#e5e7eb' }}
            >
              English
            </button>
            <button
              onClick={() => setLang('ar')}
              className="flex-1 py-2 px-3 rounded-lg border text-sm font-bold transition-all"
              style={{
                fontFamily: "'Cairo', sans-serif",
                borderColor: lang === 'ar' ? accent : (isDark ? '#444' : '#e5e7eb'),
                backgroundColor: lang === 'ar' ? `${accent}15` : 'transparent',
                color: lang === 'ar' ? accent : subText
              }}
              onMouseEnter={(e) => { if (lang !== 'ar') e.currentTarget.style.borderColor = accent }}
              onMouseLeave={(e) => { if (lang !== 'ar') e.currentTarget.style.borderColor = isDark ? '#444' : '#e5e7eb' }}
            >
              العربية
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: subText }}>
            {t("themeLabel")}
          </h3>
          <div className="flex gap-3">
            <button
              onClick={() => isDark && toggleTheme()}
              className="flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition-all"
              style={{
                borderColor: !isDark ? accent : (isDark ? '#444' : '#e5e7eb'),
                backgroundColor: !isDark ? `${accent}15` : 'transparent',
                color: !isDark ? accent : subText
              }}
              onMouseEnter={(e) => { if (isDark) e.currentTarget.style.borderColor = accent }}
              onMouseLeave={(e) => { if (isDark) e.currentTarget.style.borderColor = isDark ? '#444' : '#e5e7eb' }}
            >
              {t("lightTheme")}
            </button>
            <button
              onClick={() => !isDark && toggleTheme()}
              className="flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition-all"
              style={{
                borderColor: isDark ? accent : (isDark ? '#444' : '#e5e7eb'),
                backgroundColor: isDark ? `${accent}15` : 'transparent',
                color: isDark ? accent : subText
              }}
              onMouseEnter={(e) => { if (!isDark) e.currentTarget.style.borderColor = accent }}
              onMouseLeave={(e) => { if (!isDark) e.currentTarget.style.borderColor = isDark ? '#444' : '#e5e7eb' }}
            >
              {t("darkTheme")}
            </button>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={next}
        className="w-full py-3.5 rounded-xl font-bold transition-colors shadow-lg"
        style={{ backgroundColor: accent, color: isDark ? '#000' : '#fff' }}
      >
        {t("continue")}
      </motion.button>
    </motion.div>
  );
}

{/* 2.5 Username Selection */ }
function Username({ next, back }) {
  const { lang, t } = useLanguage();
  const { isDark } = useTheme();
  const { accent, text, subText, inputBg, cardBg } = getTokens(isDark);

  // Connect directly to local storage!
  const [name, setName] = useState(localStorage.getItem('username') || "");

  const handleContinue = () => {
    if (name.trim()) {
      localStorage.setItem("username", name.trim());
      next();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: accent }}>
        {t("whatToCall")}
      </h2>
      <p className="text-sm mb-8 text-center" style={{ color: subText }}>
        {t("changeFromSettings")}
      </p>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
        autoFocus
        className="w-full mb-8 py-4 rounded-xl text-center text-lg font-medium outline-none transition-colors border"
        placeholder={t("yourName")}
        style={{
          backgroundColor: inputBg,
          color: text,
          borderColor: name.trim() ? accent : 'transparent'
        }}
      />

      <div className="flex gap-4">

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          disabled={!name.trim()}
          className="flex-1 py-3.5 rounded-xl font-bold transition-opacity disabled:opacity-50 shadow-lg"
          style={{ backgroundColor: accent, color: isDark ? '#000' : '#fff' }}
        >
          {t("continue")}
        </motion.button>
      </div>
    </motion.div>
  );
}


{/* 3. App Intro (Triggers the global tour) */ }
function AppIntroOptions({ next, back, onFinish }) {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { accent, text, subText, cardBg } = getTokens(isDark);

  const { startTour } = useTour();
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
      <h2 className="text-2xl font-bold mb-4" style={{ color: accent }}>
        {t("quickTourTitle")}
      </h2>
      <p className="text-sm mb-10" style={{ color: subText }}>
        {t("quickTourDesc")}
      </p>

      <div className="flex flex-col gap-4">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => {
            startTour();
            next();
          }}
          className="w-full py-3.5 rounded-xl font-bold transition-colors shadow-md"
          style={{ backgroundColor: accent, color: isDark ? '#000' : '#fff' }}
        >
          {t("startTourBtn")}
        </motion.button>

      </div>

      <button
        onClick={next}
        className="mt-6 mx-auto block text-xs font-medium opacity-50 hover:opacity-100 transition-opacity"
      >
        {t("skipBtn")}
      </button>
    </motion.div>
  );
}

{/* 4. Finished Tour Guide */ }
function FinishedTour({ next }) {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { accent, subText } = getTokens(isDark);
  const { startTour } = useTour();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center">
      <h2 className="text-2xl font-bold mb-4" style={{ color: accent }}>{t("tourFinishedTitle")}</h2>
      <p className="text-sm mb-10" style={{ color: subText }}>
        {t("tourFinishedDesc")}
      </p>

      <div className="flex flex-col gap-4 w-full">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={startTour}
          className="w-full py-3.5 rounded-xl font-bold transition-colors shadow-md"
          style={{ backgroundColor: accent, color: isDark ? '#000' : '#fff' }}
        >
          {t("watchAgainBtn")}
        </motion.button>
      </div>

      <button onClick={next} className="mt-6 mx-auto block text-xs font-medium opacity-50 hover:opacity-100 transition-opacity">
        {t("skipBtn")}
      </button>
    </motion.div>
  );
}

{/* 5. Ready To Create First Habit */ }
function ReadyToCreate({ next, onFinish, onOpenNewHabit }) {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { accent, subText } = getTokens(isDark);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center">
      <h2 className="text-2xl font-bold mb-4" style={{ color: accent }}>{t("readyToCreateTitle")}</h2>
      <p className="text-sm mb-10" style={{ color: subText }}>
        {t("readyToCreateDesc")}
      </p>

      <div className="flex flex-col gap-4 w-full">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => {
            next();
            if (onOpenNewHabit) onOpenNewHabit();
          }}
          className="w-full py-3.5 rounded-xl font-bold transition-colors shadow-md"
          style={{ backgroundColor: accent, color: isDark ? '#000' : '#fff' }}
        >
          {t("create")}
        </motion.button>
      </div>

      <button onClick={next} className="mt-6 mx-auto block text-xs font-medium opacity-50 hover:opacity-100 transition-opacity">
        {t("skipBtn")}
      </button>
    </motion.div>
  );
}



{/* 5. Finish Slide */ }
function Finish({ onFinish }) {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { accent, subText } = getTokens(isDark);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10, stiffness: 100 }}
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: `${accent}20`, color: accent }}
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>

      <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: accent }}>
        {t("readyTitle")}
      </h2>
      <p className="text-sm mb-10 text-center" style={{ color: subText }}>
        {t("readyDesc")}
      </p>

      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={onFinish}
        className="w-full py-3.5 rounded-xl font-bold transition-all shadow-md mt-4"
        style={{ backgroundColor: accent, color: isDark ? '#000' : '#fff' }}
      >
        {t("startAppBtn")}
      </motion.button>
    </motion.div>
  );
}
