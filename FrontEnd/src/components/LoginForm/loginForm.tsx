"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Eye, EyeOff } from "lucide-react";
import { SIGNUP } from "@/constants/routes";
import styles from "./loginForm.module.scss";

interface LoginFormProps {
  embedded?: boolean;
}

export default function LoginForm({ embedded }: LoginFormProps) {
  const pathname = usePathname();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const signupHref = embedded ? `${pathname}?auth=signup` : SIGNUP;

  const cardContent = (
    <div className={styles.card}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to your SHOP.CO account</p>
      </header>

      <form className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <div className={styles.inputWrapper}>
            <input id="email" type="email" placeholder="Enter your email" className={styles.input} autoComplete="email" />
            <User className={styles.inputIcon} size={20} aria-hidden />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <div className={styles.inputWrapper}>
            <input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" className={styles.input} autoComplete="current-password" />
            <button type="button" className={styles.iconButton} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff className={styles.inputIcon} size={20} /> : <Eye className={styles.inputIcon} size={20} />}
            </button>
          </div>
        </div>

        <div className={styles.optionsRow}>
          <label className={styles.rememberLabel}>
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className={styles.checkbox} />
            <span className={styles.rememberText}>Remember me</span>
          </label>
          <Link href="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
        </div>

        <button type="submit" className={styles.submitBtn}>Sign In</button>

        <div className={styles.divider}>
          <span className={styles.dividerText}>Or continue with</span>
        </div>

        <div className={styles.socialGrid}>
          <button type="button" className={styles.socialBtn} aria-label="Continue with Google">
            <GoogleIcon className={styles.socialIcon} />
          </button>
          <button type="button" className={styles.socialBtn} aria-label="Continue with Facebook">
            <FacebookIcon className={styles.socialIcon} />
          </button>
        </div>
      </form>

      <p className={styles.footer}>
        Don&apos;t have an account? <Link href={signupHref} className={styles.signupLink}>Sign up</Link>
      </p>
    </div>
  );

  if (embedded) return cardContent;
  return <div className={styles.wrapper}>{cardContent}</div>;
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={24} height={24} aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={24} height={24} aria-hidden>
      <path
        fill="#1877F2"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </svg>
  );
}
