import {
  lazy,
  Suspense,
  useCallback,
  useState,
} from "react";

import API_ENDPOINTS from "./utils/api";


const EditorialTheme = lazy(
  () => import("./themes/editorial/EditorialTheme"),
);
const LandingPage = lazy(
  () => import("./components/LandingPageCustom"),
);
const FALLBACK_LIMIT = 3;

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="font-mono text-sm tracking-widest">
        LOADING PRISM…
      </p>
    </div>
  );
}

function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [rateLimit, setRateLimit] = useState(null);

  const refreshRateLimit = useCallback(async () => {
    try {
      const response = await fetch(
        API_ENDPOINTS.rateLimit,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      if (!response.ok) return;
      setRateLimit(await response.json());
    } catch {
      // The API remains authoritative if status lookup is unavailable.
    }
  }, []);

  const handleEnter = () => {
    setHasEntered(true);
    refreshRateLimit();
  };

  const total =
    rateLimit?.analyses_total ?? FALLBACK_LIMIT;
  const remaining =
    rateLimit?.analyses_remaining ?? total;

  return (
    <Suspense fallback={<LoadingScreen />}>
      {hasEntered ? (
        <EditorialTheme
          onBackToHome={() => setHasEntered(false)}
          analysisCount={total - remaining}
          maxAnalyses={total}
          onAnalysisUsed={refreshRateLimit}
        />
      ) : (
        <LandingPage onLogin={handleEnter} />
      )}
    </Suspense>
  );
}

export default App;
