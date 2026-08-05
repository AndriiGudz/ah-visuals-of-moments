import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact information for AH Visuals of Moments.",
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto py-6 space-y-10">
      <header className="border-b border-[#27272a] pb-6 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-light tracking-wide text-[#f5f4f0]">
          Contact
        </h1>
        <p className="text-sm text-[#a1a1aa]">
          Get in touch regarding the project, collections, or photography stories.
        </p>
      </header>

      <section className="bg-[#17171a] border border-[#27272a] p-8 rounded-sm space-y-6">
        <div className="space-y-2">
          <h2 className="text-xs uppercase tracking-widest text-[#d4a373] font-mono">
            General Inquiries
          </h2>
          <p className="text-sm text-[#a1a1aa] leading-relaxed">
            For general questions and inquiries about the AH Visuals of Moments project, please reach out via our project channels.
          </p>
        </div>

        <div className="pt-4 border-t border-[#27272a] text-xs text-[#71717a] font-mono">
          [ Contact forms and channel details will be configured in a future update ]
        </div>
      </section>
    </div>
  );
}
