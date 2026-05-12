import { useEffect, useRef } from "react";

/**
 * Google Identity Services button. Requires VITE_GOOGLE_CLIENT_ID (same Web client ID as backend GOOGLE_CLIENT_ID).
 * @param {(credential: string) => void} onCredential - JWT from Google to send to POST /api/auth/google
 */
export function GoogleSignInButton({ onCredential, disabled, uxMode = "signin" }) {
  const ref = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !ref.current || disabled) return;

    const el = ref.current;
    const handle = (response) => {
      if (response?.credential) onCredential(response.credential);
    };

    const render = () => {
      if (!window.google?.accounts?.id) return;
      el.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handle,
        auto_select: false,
      });
      window.google.accounts.id.renderButton(el, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: uxMode === "signup" ? "signup_with" : "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: 300,
      });
    };

    if (window.google?.accounts?.id) {
      render();
      return () => {
        el.innerHTML = "";
      };
    }

    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      const run = () => {
        if (window.google?.accounts?.id) render();
      };
      if (window.google?.accounts?.id) run();
      else existing.addEventListener("load", run);
      return () => {
        el.innerHTML = "";
      };
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.body.appendChild(script);

    return () => {
      el.innerHTML = "";
    };
  }, [clientId, disabled, onCredential, uxMode]);

  if (!clientId) {
    return (
      <p className="text-xs text-slate-500 text-center">
        Google sign-in: set <code className="text-slate-700">VITE_GOOGLE_CLIENT_ID</code> in{" "}
        <code className="text-slate-700">frontend/.env</code> (Web client ID from Google Cloud Console).
      </p>
    );
  }

  return (
    <div
      ref={ref}
      className="flex justify-center min-h-[44px]"
      style={disabled ? { opacity: 0.55, pointerEvents: "none" } : undefined}
    />
  );
}
