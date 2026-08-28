import { notFound } from 'next/navigation';
import JewelryBoxLandingPage from '../jewelry-box/page';
import { getProductBySlug } from '@/lib/data-store';

export default async function DynamicProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // If jewelry box, render the optimized landing page
  return <JewelryBoxLandingPage />;
}
