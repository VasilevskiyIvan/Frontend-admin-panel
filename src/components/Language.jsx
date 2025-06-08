import "./Language.css";
import Indicators from "./Indicators";

const Language = ({ selectedLanguage, onSelect, languages, onChange, isMailing = false }) => {
  const handleLanguageSelect = (lang) => {
    onSelect(lang);
  };

  const handleLanguageChange = (e, field) => {
    onChange(selectedLanguage, field, e.target.value);
  };

  const getIndicatorStatus = (lang) => {
    const l = languages[lang] || {};
    if (isMailing) {
      return l.content ? "success" : "danger";
    } else {
      if (!l.title && !l.content) return "danger";
      if (l.title && l.content) return "success";
      return "warning";
    }
  };

  return (
    <div className="language-section">
      <Indicators
        languages={["ru", "en", "zh", "ar"]}
        getStatus={getIndicatorStatus}
      />

      <div className="language-selector">
        <select value={selectedLanguage} onChange={(e) => handleLanguageSelect(e.target.value)}>
          <option value="ru">Русский</option>
          <option value="en">English</option>
          <option value="zh">中文</option>
          <option value="ar">العربية</option>
        </select>
      </div>

      <div className="language-inputs">
        {!isMailing && (
          <input
            type="text"
            placeholder="Заголовок"
            value={languages[selectedLanguage]?.title || ""}
            onChange={(e) => handleLanguageChange(e, "title")}
          />
        )}
        <textarea
          placeholder={isMailing ? "Текст рассылки" : "Описание"}
          value={languages[selectedLanguage]?.content || ""}
          onChange={(e) => handleLanguageChange(e, "content")}
        />
      </div>
    </div>
  );
};

export default Language;
