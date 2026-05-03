"use client";

import { useEffect } from "react";

export default function PwaInstaller() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof navigator === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    let cancelled = false;
    let firstActivation = true;

    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "SW_ACTIVATED") {
        if (firstActivation) {
          firstActivation = false;
          return;
        }
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener("message", onMessage);

    const t = window.setTimeout(() => {
      if (cancelled) return;
      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .then((reg) => {
          const tellWaiting = () => {
            if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
          };
          tellWaiting();
          reg.addEventListener("updatefound", () => {
            const next = reg.installing;
            if (!next) return;
            next.addEventListener("statechange", () => {
              if (next.state === "installed" && navigator.serviceWorker.controller) {
                next.postMessage({ type: "SKIP_WAITING" });
              }
            });
          });
          reg.update().catch(() => {});
        })
        .catch(() => {});
    }, 1500);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
      navigator.serviceWorker.removeEventListener("message", onMessage);
    };
  }, []);

  return null;
}
