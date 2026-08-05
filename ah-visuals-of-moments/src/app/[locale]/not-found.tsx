import Link from "next/link";
import { defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { getLocalizedUrl } from "@/utils/url";

export default function NotFound() {
  const dictionary = getDictionary(defaultLocale);
  const collectionUrl = getLocalizedUrl("/collection", defaultLocale);

  return (
    <div className="py-24 text-center space-y-6 max-w-md mx-auto">
      <div className="text-xs uppercase tracking-widest text-[var(--accent-warm)] font-mono">
        {dictionary.notFound.badge}
      </div>
      <h1 className="text-3xl font-light text-[var(--text-primary)]">
        {dictionary.notFound.title}
      </h1>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        {dictionary.notFound.description}
      </p>
      <div className="pt-4">
        <Link
          href={collectionUrl}
          className="inline-block bg-[var(--bg-elevated)] border border-[var(--border-highlight)] text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-sm shadow-xs"
        >
          {dictionary.notFound.button}
        </Link>
      </div>
    </div>
  );
}
