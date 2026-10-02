// pages/admin/index.tsx
'use client'

import dynamic from 'next/dynamic';

const Login = dynamic(() => import('@/components/pages/admin/Login'), { ssr: false });

export default function AdminLoginPage() {
  return <Login />;
}
