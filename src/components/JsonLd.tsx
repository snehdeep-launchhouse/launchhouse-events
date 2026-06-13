import { useEffect } from "react";

/**
 * Injects a single JSON-LD <script> into <head> by id.
 * Replaces the contents on every data change and cleans up on unmount.
 */
export default function JsonLd({ id, data }: { id: string; data: unknown }) {
  useEffect(() => {
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
    return () => {
      script?.remove();
    };
  }, [id, data]);

  return null;
}
