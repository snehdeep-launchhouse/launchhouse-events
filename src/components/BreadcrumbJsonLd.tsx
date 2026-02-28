import { useEffect } from "react";

interface BreadcrumbItem {
  name: string;
  path: string;
}

const SITE_URL = "https://www.launchhouse.events";

export default function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  useEffect(() => {
    const id = "breadcrumb-jsonld";
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    const breadcrumbList = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL + "/" },
        ...items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 2,
          name: item.name,
          item: SITE_URL + item.path,
        })),
      ],
    };

    script.textContent = JSON.stringify(breadcrumbList);

    return () => {
      script?.remove();
    };
  }, [items]);

  return null;
}
