"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { X } from "lucide-react";
import LoginForm from "@/components/LoginForm/loginForm";
import RegisterForm from "@/components/RegisterForm/registerForm";
import styles from "./authOverlay.module.scss";

function AuthOverlayInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const auth = searchParams.get("auth");

  useEffect(() => {
    if (auth === "login" || auth === "signup") {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [auth]);

  const close = () => router.push(pathname);

  if (auth === "login") {
    return (
      <div className={styles.overlay} onClick={close} role="dialog" aria-modal="true" aria-label="Sign in">
        <div className={styles.inner} onClick={(e) => e.stopPropagation()}>
          <button type="button" className={styles.closeBtn} onClick={close} aria-label="Close">
            <X size={24} />
          </button>
          <LoginForm embedded />
        </div>
      </div>
    );
  }

  if (auth === "signup") {
    return (
      <div className={styles.overlay} onClick={close} role="dialog" aria-modal="true" aria-label="Create account">
        <div className={styles.inner} onClick={(e) => e.stopPropagation()}>
          <button type="button" className={styles.closeBtn} onClick={close} aria-label="Close">
            <X size={24} />
          </button>
          <RegisterForm embedded />
        </div>
      </div>
    );
  }

  return null;
}

export default function AuthOverlay() {
  return (
    <Suspense fallback={null}>
      <AuthOverlayInner />
    </Suspense>
  );
}
