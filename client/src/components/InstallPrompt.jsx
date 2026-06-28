import { useEffect, useRef, useState } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InstallPrompt() {
  const deferredPrompt = useRef(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Don't show if already in standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    function handleBeforeInstall(e) {
      e.preventDefault();
      deferredPrompt.current = e;
      setShowBanner(true);
    }

    function handleAppInstalled() {
      setShowBanner(false);
      deferredPrompt.current = null;
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt.current) return;
    deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === "accepted" || outcome === "dismissed") {
      setShowBanner(false);
      deferredPrompt.current = null;
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t shadow-lg safe-area-bottom">
      <div className="flex items-center justify-between max-w-lg mx-auto gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
            <Download className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">Install Freiwilliger</p>
            <p className="text-xs text-slate-500">Add to home screen for quick access</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" onClick={handleInstall}>
            Install
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
