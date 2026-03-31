import { useEffect } from "react";

interface PageMetaOptions {
  title: string;
  description?: string;
  noindex?: boolean;
}

export const usePageMeta = ({ title, description, noindex }: PageMetaOptions) => {
  useEffect(() => {
    document.title = title;

    if (description) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = description;
    }

    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (noindex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement("meta");
        robotsMeta.name = "robots";
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.content = "noindex,nofollow";
    } else if (robotsMeta) {
      robotsMeta.remove();
    }

    return () => {
      if (noindex && robotsMeta && robotsMeta.parentNode) {
        robotsMeta.remove();
      }
    };
  }, [title, description, noindex]);
};
