import { useTheme } from "../Context/ThemeContext";
import { getTokens } from "../theme/tokens";
import { useLanguage } from "../Context/LanguageContext";

export default function Other() {
  const { isDark } = useTheme();
  const { accent, subText } = getTokens(isDark);
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center mt-40 animate-fade-in gap-4">
      <h1 className="text-3xl font-bold" style={{ color: accent }}>
        {t("other")}
      </h1>
      <p className="text-lg" style={{ color: subText }}>
        {t("underConstruction")}
      </p>
      <div className="mt-4 text-5xl opacity-20 select-none">🚧</div>
    </div>
  );
}
