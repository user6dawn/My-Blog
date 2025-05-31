// pages/admin/index.tsx
'use client'

import dynamic from 'next/dynamic';
import { use } from 'react';

const Login = dynamic(() => import('@/components/pages/admin/Login'), { ssr: false });

export default function AdminLoginPage() {
  return <Login />;
}
