
import { PageHeader } from "@/components/common/page-header";
import { UrlShortenerClient } from "@/components/url-shortener/url-shortener-client";
import { Link as LinkIcon } from "lucide-react"; // Renamed to avoid conflict with Next/Link

export const metadata = {
  title: "URL Shortener | PopGPT :AI",
};

export default function UrlShortenerPage() {
  return (
    <>
      <PageHeader
        title="URL Shortener 🔗"
        description="Generate a shorter version of your long URLs (for demonstration purposes)."
        icon={LinkIcon}
      />
      <UrlShortenerClient />
    </>
  );
}
