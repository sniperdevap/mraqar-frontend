import { PlanViewPage } from '@/components/plans/plan-view-page';

export default async function PlanView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlanViewPage planId={id} />;
}
