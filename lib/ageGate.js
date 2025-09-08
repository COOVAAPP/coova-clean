// lib/ageGate.js
export function isAgeVerified() {
  if (typeof window === "undefined") return false;
  // supports either flag you’ve used so far
  return (
    localStorage.getItem("age_verified") === "true" ||
    localStorage.getItem("age_gate_ok") === "1"
  );
}

/**
 * Ensures the user has passed the age gate.
 * - If already verified -> returns true immediately.
 * - If not, opens VerifyAgeModal via window.__COOVA_OPEN_AGE__ and resolves true once confirmed.
 * - If the modal function isn’t present, returns false.
 */
export function requireAgeVerified(onVerified) {
  if (isAgeVerified()) return Promise.resolve(true);
  if (typeof window === "undefined") return Promise.resolve(false);

  return new Promise((resolve) => {
    if (typeof window.__COOVA_OPEN_AGE__ !== "function") {
      resolve(false);
      return;
    }
    // open age modal; when user confirms, the modal will call us back
    window.__COOVA_OPEN_AGE__(() => {
      try {
        // set a local flag (your modal also sets it, but double-safing is fine)
        localStorage.setItem("age_gate_ok", "1");
      } catch {}
      if (typeof onVerified === "function") onVerified();
      resolve(true);
    });
  });
}