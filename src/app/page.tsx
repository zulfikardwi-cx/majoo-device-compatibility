import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AllDevicesBrowser } from "@/components/AllDevicesBrowser";
import { getPublicDevicesWithCategory } from "@/lib/data";

export default async function Home() {
  const devices = await getPublicDevicesWithCategory();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="gradient-brand">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
            <h1 className="text-xl font-semibold text-white sm:text-2xl">
              Device Compatibility majoo
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-white/85">
              Cek printer, scanner, cash drawer, dan perangkat lain yang sudah teruji
              compatible dengan sistem kasir majoo.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <AllDevicesBrowser devices={devices} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
