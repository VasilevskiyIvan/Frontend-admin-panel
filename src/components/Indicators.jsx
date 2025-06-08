import './Indicators.css'
const Indicators = ({ languages, getStatus }) => (
    <div className="language-indicators">
        {languages.map(lang => (
            <div
                key={lang}
                className={`language-indicator ${getStatus(lang)}-indicator`}
            >
                {lang.toUpperCase()}
            </div>
        ))}
    </div>
)

export default Indicators