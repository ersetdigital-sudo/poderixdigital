import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { ServiceAppBar } from "@/components/ServiceAppBar";
import { ServiceHero } from "@/components/ServiceHero";
import { ServiceForm } from "@/components/ServiceForm";
import { services, serviceBySlug } from "@/lib/services";
import { getHydratedService } from "@/lib/catalog-hydrate";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = serviceBySlug(slug);
  if (!service) return {};
  return {
    title: `${service.name} · Poderix Digital`,
    description: service.description,
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { services: hydratedServices, games, service } = await getHydratedService(slug);
  if (!service) notFound();

  const others = hydratedServices.filter((s) => s.slug !== service.slug);

  return (
    <>
      <ServiceAppBar service={service} />
      <div className="hidden lg:block">
        <Header />
      </div>

      <main className="px-5 pt-5 pb-6 lg:max-w-6xl lg:mx-auto lg:px-5 lg:py-10">
        <nav className="hidden lg:block text-sm text-[#6B6A80] mb-6">
          <Link href="/" className="hover:text-black">
            Beranda
          </Link>{" "}
          /{" "}
          <Link href="/#layanan" className="hover:text-black">
            Layanan
          </Link>{" "}
          / <span className="text-black font-semibold">{service.title}</span>
        </nav>

        <ServiceHero service={service} />

        <div className="mt-6 lg:mt-10">
          <ServiceForm service={service} others={others} games={games} />
        </div>
      </main>
    </>
  );
}
