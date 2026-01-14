import React, { useState } from 'react';
import EditorialTheme from './themes/editorial/EditorialTheme';
import LandingPage from './components/LandingPage';

/**
 * Main App Component
 * Shows Landing Page first, then Editorial Theme after login
 */
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (provider) => {
    // Per ora simuliamo il login
    setUser({ provider, name: provider === 'guest' ? 'Ospite' : `User (${provider})` });
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <>
      <EditorialTheme />
    </>
  );
}

export default App;
