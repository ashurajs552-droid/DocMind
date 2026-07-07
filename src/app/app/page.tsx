'use client';

import dynamic from 'next/dynamic';

const MainWorkspace = dynamic(() => import('@/components/MainWorkspace'), {
  ssr: false,
});

export default function AppHome() {
  return <MainWorkspace />;
}
