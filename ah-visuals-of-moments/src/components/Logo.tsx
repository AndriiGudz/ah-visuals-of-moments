"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Locale } from "@/i18n/config";

interface LogoProps {
  locale: Locale;
}

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function Logo({ locale }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useIsMounted();

  const isLight = mounted && resolvedTheme === "light";
  const logoSrc = isLight
    ? "/brand/logo-on-light.webp"
    : "/brand/logo-on-dark.webp";

  return (
    <Link
      href={`/${locale}`}
      className="inline-flex items-center shrink-0 group transition-opacity hover:opacity-90 focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-warm)] rounded-sm py-1"
      aria-label="AH Visuals of Moments - Home"
    >
      <div className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden">
        <Image
          src={logoSrc}
          alt="AH Visuals of Moments"
          fill
          sizes="(max-width: 640px) 80px, 96px"
          className="object-contain object-left"
          priority
          unoptimized
        />
      </div>
    </Link>
  );
}
