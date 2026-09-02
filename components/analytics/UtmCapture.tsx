"use client";

import { useEffect } from "react";
import { captureUtm } from "@/lib/utm";

/**
 * Reads UTM params once on landing and stores them for the session, so every
 * WhatsApp button downstream can stamp its attribution ref. Renders nothing.
 */
export function UtmCapture() {
  useEffect(() => {
    captureUtm();
  }, []);

  return null;
}
