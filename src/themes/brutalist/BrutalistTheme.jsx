import React, { useState } from 'react';
import useAnalysisStore from '../../store/analysisStore';
import { getScoreBand } from '../../utils/formatAnalysis';
import './brutalist.css';

/**
 * BRUTALIST MINIMALISM THEME
 * Plain HTML semantics, minimal CSS, no animations
 * Fast load time priority
 */

const BrutalistTheme = () => {
  const {
    scrapingStatus,
    targetUrl,
    analysisData,
    setTargetUrl,
    updateStatus,
    setAnalysisData,
    resetAnalysis
  } = useAnalysisStore();

  const [showRaw, setShowRaw] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;

    updateStatus('scanning');

    try {
      const response = await fetch('http://localhost:8001/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const result = await response.json();
      setAnalysisData(result);
    } catch (error) {
      console.error('Analysis error:', error);
      updateStatus('idle');
      alert('ERROR: Analysis failed');
    }
  };

  return (
    <div className="brutalist-theme">
      {/* Header */}
      <header>
        <h1>SHADOW ANALYZER</h1>
        <p>Media Bias Detection System</p>
        <hr />
      </header>

      {/* Main Content */}
      <main>
        {/* Input Form */}
        {scrapingStatus === 'idle' && (
          <article>
            <h2>Submit Article for Analysis</h2>
            <form onSubmit={handleAnalyze}>
              <p>
                <label htmlFor="url">Article URL:</label><br />
                <input
                  type="url"
                  id="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  required
                />
              </p>
              <p>
                <input type="submit" value="ANALYZE" />
              </p>
            </form>
          </article>
        )}

        {/* Loading State */}
        {scrapingStatus === 'scanning' && (
          <div className="brutalist-loading">
            <p><strong>PROCESSING...</strong></p>
            <p>Analyzing article content.</p>
          </div>
        )}

        {/* Results */}
        {scrapingStatus === 'results' && analysisData && (
          <article>
            <h2>Analysis Results</h2>

            {/* Article Title */}
            <section>
              <h3>Article Title</h3>
              <p>{analysisData.title}</p>
            </section>

            <hr />

            {/* Score Summary */}
            <section>
              <h3>Score Summary</h3>
              <table>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Bias Score</td>
                    <td>
                      <span className="brutalist-score">
                        [{analysisData.meta?.score || 0}]
                      </span> {getScoreBand(analysisData.meta?.score || 0)}
                    </td>
                  </tr>
                  <tr>
                    <td>Tone</td>
                    <td>{analysisData.meta?.tone || 'Unknown'}</td>
                  </tr>
                  <tr>
                    <td>Verdict</td>
                    <td>{analysisData.meta?.verdict_short || 'Unknown'}</td>
                  </tr>
                  <tr>
                    <td>Facts</td>
                    <td>{analysisData.facts?.length || 0}</td>
                  </tr>
                  <tr>
                    <td>Axioms</td>
                    <td>{analysisData.axioms?.length || 0}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <hr />

            {/* Intent */}
            <section>
              <h3>Strategic Intent</h3>
              <p>{analysisData.intent}</p>
            </section>

            <hr />

            {/* Facts */}
            <section>
              <h3>Verified Facts ({analysisData.facts?.length || 0})</h3>
              <ul>
                {analysisData.facts?.map((fact, i) => (
                  <li key={i}>{fact}</li>
                ))}
              </ul>
            </section>

            <hr />

            {/* Axioms */}
            <section>
              <h3>Hidden Axioms ({analysisData.axioms?.length || 0})</h3>
              <ul>
                {analysisData.axioms?.map((axiom, i) => (
                  <li key={i}>{axiom}</li>
                ))}
              </ul>
            </section>

            <hr />

            {/* Narrative Analysis */}
            {analysisData.narrative_analysis && (
              <section>
                <h3>Narrative Analysis</h3>
                <p style={{ whiteSpace: 'pre-line' }}>{analysisData.narrative_analysis}</p>
              </section>
            )}

            <hr />

            {/* Raw JSON Toggle */}
            <section>
              <h3>Raw Data</h3>
              <p>
                <button onClick={() => setShowRaw(!showRaw)}>
                  {showRaw ? 'HIDE JSON' : 'SHOW JSON'}
                </button>
              </p>
              {showRaw && (
                <pre>{JSON.stringify(analysisData, null, 2)}</pre>
              )}
            </section>

            <hr />

            {/* Actions */}
            <p>
              <button onClick={resetAnalysis}>NEW ANALYSIS</button>
            </p>
          </article>
        )}
      </main>

      {/* Footer */}
      <footer>
        <hr />
        <p>
          <small>
            Shadow Analyzer v3.0 | <a href="#about">About</a> | <a href="#help">Help</a> | <a href="#api">API</a>
          </small>
        </p>
      </footer>
    </div>
  );
};

export default BrutalistTheme;
