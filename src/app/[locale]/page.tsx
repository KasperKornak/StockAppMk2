import { useTranslations } from "next-intl";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";

export default function Home() {
  const t = useTranslations("Landing");
  const steps = [
    { number: "01", title: t("step1Title"), description: t("step1Description") },
    { number: "02", title: t("step2Title"), description: t("step2Description") },
    { number: "03", title: t("step3Title"), description: t("step3Description") },
  ];

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[640px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl"
      />

      <SiteHeader />

      <main className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-24">
        <p className="text-sm font-medium tracking-wide text-neutral-500 uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-50 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="max-w-xl text-lg leading-8 text-neutral-400">{t("subtitle")}</p>
        <div className="flex gap-3">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-500 px-6 text-base font-medium text-neutral-950 transition-colors hover:bg-emerald-400"
          >
            {t("getStarted")}
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-full border border-neutral-700 px-6 text-base font-medium text-neutral-100 transition-colors hover:border-emerald-500/50 hover:text-emerald-400"
          >
            {t("login")}
          </Link>
        </div>
      </main>

      <section id="how-it-works" className="relative border-t border-neutral-900 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-sm font-medium tracking-wider text-neutral-500 uppercase">
            {t("howItWorksTitle")}
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number}>
                <div className="mb-3 font-mono text-sm text-emerald-400">{step.number}</div>
                <h3 className="mb-2 font-medium text-neutral-100">{step.title}</h3>
                <p className="text-sm leading-6 text-neutral-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
