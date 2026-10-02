import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StayProfile } from "@/components/stays/stay-profile";
import { getPublishedStay, getPublishedStaySlugs } from "@/lib/data/content";
import { buildStayMetadata } from "@/lib/stays/seo";

// Static + ISR: served from cache; admin saves call revalidatePath(`/stays/${slug}`).
export const revalidate = 300;

export async function generateStaticParams() {
  const stays = await getPublishedStaySlugs();
  return stays.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/stays/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const stay = await getPublishedStay(slug);
  if (!stay) return { title: "Stay not found" };
  const meta = buildStayMetadata(stay);
  return {
    title: stay.seo_title ? { absolute: meta.title } : meta.title,
    description: meta.description,
    alternates: { canonical: meta.canonical },
    openGraph: {
      type: "website",
      title: meta.title,
      description: meta.description,
      url: meta.canonical,
      images: meta.ogImage ? [{ url: meta.ogImage, alt: stay.name }] : undefined,
    },
    twitter: {
      card: meta.ogImage ? "summary_large_image" : "summary",
      title: meta.title,
      description: meta.description,
      images: meta.ogImage ? [meta.ogImage] : undefined,
    },
  };
}

export default async function StayPage({ params }: PageProps<"/stays/[slug]">) {
  const { slug } = await params;
  const stay = await getPublishedStay(slug);
  if (!stay) notFound();
  return <StayProfile stay={stay} />;
}
