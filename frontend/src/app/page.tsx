import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LandingPageContent } from '@/components/LandingPageContent';

export default async function RootPage() {
  const cookieStore = await cookies();
  if (cookieStore.has('goal_app_auth')) redirect('/dashboard');
  return <LandingPageContent />;
}
