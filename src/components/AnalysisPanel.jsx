import { analyzeText } from "../utils/analysis";

const AnalysisPanel = ({ text }) => {
  if (!text) return null;

  const data = analyzeText(text);

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {/* Stats */}
      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-sky-900 mb-2">
          Content Stats
        </h2>
        <dl className="grid grid-cols-2 gap-2 text-xs text-sky-800">
          <div>
            <dt className="font-medium">Words</dt>
            <dd>{data.wordCount}</dd>
          </div>
          <div>
            <dt className="font-medium">Characters</dt>
            <dd>{data.charCount}</dd>
          </div>
          <div>
            <dt className="font-medium">Lines</dt>
            <dd>{data.lineCount}</dd>
          </div>
          <div>
            <dt className="font-medium">Hashtags</dt>
            <dd>{data.hashtagsCount}</dd>
          </div>
          <div>
            <dt className="font-medium">Mentions</dt>
            <dd>{data.mentionsCount}</dd>
          </div>
          <div>
            <dt className="font-medium">Emojis</dt>
            <dd>{data.emojiCount}</dd>
          </div>
        </dl>
      </div>

      {/* Suggestions */}
      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-sky-900 mb-2">
          Engagement Suggestions
        </h2>
        {data.suggestions.length === 0 ? (
          <p className="text-xs text-sky-800">
            Looks good! No major issues detected.
          </p>
        ) : (
          <ul className="text-xs text-sky-800 space-y-1 list-disc list-inside">
            {data.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AnalysisPanel;
