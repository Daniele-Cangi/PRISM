import React, { useState } from 'react';
import EditorialTheme from './themes/editorial/EditorialTheme';
import LandingPageCustom from './components/LandingPageCustom';
// LandingPage originale mantenuta per uso futuro
// import LandingPage from './components/LandingPage';

const MAX_ANALYSES = 3;

/**
 * Main App Component
 * Shows Landing Page first, then Editorial Theme after login
 */
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [analysisCount, setAnalysisCount] = useState(0);

  const handleLogin = (provider) => {
    // Per ora simuliamo il login
    setUser({ provider, name: provider === 'guest' ? 'Ospite' : `User (${provider})` });
    setIsAuthenticated(true);
    setAnalysisCount(0); // Reset contatore al login
  };

  const handleBackToHome = () => {
    setIsAuthenticated(false);
    setUser(null);
    setAnalysisCount(0);
  };

  const handleAnalysisUsed = () => {
    setAnalysisCount(prev => prev + 1);
  };

  if (!isAuthenticated) {
    return <LandingPageCustom onLogin={handleLogin} />;
  }

  return (
    <EditorialTheme
      onBackToHome={handleBackToHome}
      analysisCount={analysisCount}
      maxAnalyses={MAX_ANALYSES}
      onAnalysisUsed={handleAnalysisUsed}
    />
  );
}

export default App;
