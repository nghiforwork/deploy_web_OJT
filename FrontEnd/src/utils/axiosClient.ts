'use client';
import { useEffect } from 'react';
import axios from 'axios';
import { signOut, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

// const DOMAIN = `${process.env.NEXT_PUBLIC_API}`;

export const axiosAuth = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000
});

export const axiosNoAuth = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

const UseAxiosAuth = () => {
  const { data: session } = useSession();
  const path = usePathname();
  const router = useRouter();
  useEffect(() => {
    const requestIntercept = axiosAuth.interceptors.request.use(
      config => {
        if (!config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${session?.user?.access as string}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    const responseIntercept = axiosAuth.interceptors.response.use(
      response => response,
      async error => {
        if ([400, 404].includes(error.response?.status)) {
          //Chuyển hướng trang về trang chủ

        //  console.log('Status 400 during HTTP request.');
          return Promise.resolve(error.response);
        }

        if ([401, 403].includes(error.response?.status)) {
          //Chuyển hướng trang về trang login
          console.log('Status 401 || 403 during HTTP request.');
           signOut();
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosAuth.interceptors.request.eject(requestIntercept);
      axiosAuth.interceptors.response.eject(responseIntercept);
    };
  }, [session, path, router]);
  return axiosAuth;
};

export default UseAxiosAuth;
