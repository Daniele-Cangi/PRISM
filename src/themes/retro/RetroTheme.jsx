import React, { useState, useEffect } from 'react';
import useAnalysisStore from '../../store/analysisStore';
import TypewriterText from './components/TypewriterText';
import { getScoreBand } from '../../utils/formatAnalysis';
import './retro.css';

const RetroTheme = () => {
  const {
    scrapingStatus,
    targetUrl,
    analysisData,
    setTargetUrl,
    updateStatus,
    setAnalysisData,
    resetAnalysis
  } = useAnalysisStore();

  const [bootSequence, setBootSequence] = useState(true);
  const [progress, setProgress] = useState(0);

  // Boot sequence on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setBootSequence(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Progress bar animation during scanning
  useEffect(() => {
    if (scrapingStatus === 'scanning') {
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 0 : prev + 2));
      }, 50);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [scrapingStatus]);

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
    }
  };

  const getStatusClass = (score) => {
    if (score < 30) return 'ok';
    if (score < 70) return 'warn';
    return 'error';
  };

  if (bootSequence) {
    return (
      <div className="retro-theme">
        <div className="retro-screen loading">
          <div className="retro-text">
            <TypewriterText text="SHADOW ANALYZER v3.0" speed={50} />
            <br />
            <TypewriterText text="INITIALIZING SYSTEM..." speed={40} />
            <br />
            <br />
            <TypewriterText text="LOADING MODULES..." speed={30} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="retro-theme">
      <div className="retro-screen">
        {/* Header */}
        <header className="retro-header">
          <h1 className="retro-title retro-text">SHADOW ANALYZER</h1>
          <div className="retro-subtitle retro-text">
            ════════ MEDIA BIAS DETECTION SYSTEM v3.0 ════════
          </div>
        </header>

        {/* Main Terminal */}
        <main>
          {/* Idle State - Input Form */}
          {scrapingStatus === 'idle' && (
            <div>
              <div className="retro-box">
                <div className="retro-box-title">[ URL INPUT ]</div>
                <form onSubmit={handleAnalyze}>
                  <p className="retro-text">
                    &gt; ENTER ARTICLE URL FOR ANALYSIS:
                  </p>
                  <input
                    type="url"
                    className="retro-input"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://example.com/article"
                    required
                  />
                  <br /><br />
                  <button type="submit" className="retro-button">
                    [ ANALYZE ]
                  </button>
                </form>
              </div>

              <div className="retro-text" style={{ marginTop: '2rem' }}>
                <p>&gt; SYSTEM READY</p>
                <p>&gt; AWAITING INPUT<span className="retro-cursor"></span></p>
              </div>
            </div>
          )}

          {/* Scanning State */}
          {scrapingStatus === 'scanning' && (
            <div>
              <div className="retro-text">
                <p>&gt; ANALYZING TARGET URL...</p>
                <p>&gt; EXTRACTING CONTENT...</p>
                <p>&gt; RUNNING BIAS DETECTION...</p>
                <br />
              </div>

              <div className="retro-progress">
                <div className="retro-progress-fill" style={{ width: `${progress}%` }}></div>
                <div className="retro-progress-text">{progress}%</div>
              </div>

              <br />
              <div className="retro-text">
                <p>&gt; PLEASE WAIT<span className="retro-cursor"></span></p>
              </div>
            </div>
          )}

          {/* Results State */}
          {scrapingStatus === 'results' && analysisData && (
            <div>
              {/* Status */}
              <div className="retro-text">
                <p>
                  <span className={`retro-status ${getStatusClass(analysisData.meta?.score || 0)}`}></span>
                  ANALYSIS COMPLETE
                </p>
              </div>

              <br />

              {/* Summary Table */}
              <div className="retro-box">
                <div className="retro-box-title">[ ANALYSIS RESULTS ]</div>
                <table className="retro-table">
                  <tbody>
                    <tr>
                      <td>BIAS_SCORE</td>
                      <td>{analysisData.meta?.score || 0}% [{getScoreBand(analysisData.meta?.score || 0)}]</td>
                    </tr>
                    <tr>
                      <td>TONE</td>
                      <td>{analysisData.meta?.tone || 'UNKNOWN'}</td>
                    </tr>
                    <tr>
                      <td>VERDICT</td>
                      <td>{analysisData.meta?.verdict_short || 'UNKNOWN'}</td>
                    </tr>
                    <tr>
                      <td>FACTS_COUNT</td>
                      <td>{analysisData.facts?.length || 0}</td>
                    </tr>
                    <tr>
                      <td>AXIOMS_COUNT</td>
                      <td>{analysisData.axioms?.length || 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Title */}
              <div className="retro-box" style={{ marginTop: '2rem' }}>
                <div className="retro-box-title">[ ARTICLE TITLE ]</div>
                <p className="retro-text">{analysisData.title}</p>
              </div>

              {/* Intent */}
              <div className="retro-box">
                <div className="retro-box-title">[ STRATEGIC INTENT ]</div>
                <p className="retro-text">{analysisData.intent}</p>
              </div>

              {/* Facts */}
              <div className="retro-box">
                <div className="retro-box-title">[ VERIFIED FACTS ]</div>
                <ul className="retro-list retro-text">
                  {analysisData.facts?.map((fact, i) => (
                    <li key={i}>{fact}</li>
                  ))}
                </ul>
              </div>

              {/* Axioms */}
              <div className="retro-box">
                <div className="retro-box-title">[ HIDDEN AXIOMS ]</div>
                <ul className="retro-list retro-text">
                  {analysisData.axioms?.map((axiom, i) => (
                    <li key={i}>{axiom}</li>
                  ))}
                </ul>
              </div>

              {/* Narrative */}
              {analysisData.narrative_analysis && (
                <div className="retro-box">
                  <div className="retro-box-title">[ NARRATIVE ANALYSIS ]</div>
                  <p className="retro-text" style={{ whiteSpace: 'pre-line' }}>
                    {analysisData.narrative_analysis}
                  </p>
                </div>
              )}

              {/* Actions */}
              <br />
              <button onClick={resetAnalysis} className="retro-button">
                [ NEW ANALYSIS ]
              </button>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '2px solid var(--amber)' }}>
          <div className="retro-text" style={{ textAlign: 'center' }}>
            <p>════════════════════════════════════════════════════════</p>
            <p>(C) 2024 SHADOW ANALYZER • ALL RIGHTS RESERVED</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default RetroTheme;
