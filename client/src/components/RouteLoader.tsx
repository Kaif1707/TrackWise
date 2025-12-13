import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import DotSpinner from "./DotSpinner";

export default function RouteLoader({ durationMs = 450 }: { durationMs?: number }) {
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      prevPath.current = location.pathname;
      setLoading(true);

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(() => {
        setLoading(false);
        timerRef.current = null;
      }, durationMs);
    }
  }, [location.pathname, durationMs]);

  if (!loading) return null;

  return (
    <div className="route-loader-overlay" aria-hidden>
      <DotSpinner size="3rem" />
    </div>
  );
}
