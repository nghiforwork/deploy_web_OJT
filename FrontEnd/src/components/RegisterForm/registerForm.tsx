"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOGIN } from "@/constants/routes";
import styles from "./registerForm.module.scss";

interface RegisterFormProps {
  embedded?: boolean;
}

export default function RegisterForm({ embedded }: RegisterFormProps) {
  const pathname = usePathname();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const signinHref = embedded ? `${pathname}?auth=login` : LOGIN;

  const cardContent = (
    <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.heading}>Create Account</h1>
          <p className={styles.subtitle}>Join SHOP.CO and start shopping</p>
        </header>

        <form className={styles.form}>
          <div className={styles.nameRow}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName" className={styles.label}>
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                placeholder="John"
                className={styles.input}
                autoComplete="given-name"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lastName" className={styles.label}>
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                placeholder="Doe"
                className={styles.input}
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                className={styles.input}
                autoComplete="email"
              />
              <span className={styles.inputIcon} aria-hidden>
                <MailIcon />
              </span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                className={styles.input}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <ul className={styles.passwordRequirements}>
              <li>At least 8 characters</li>
              <li>Upper &amp; lowercase letters</li>
              <li>At least one number</li>
            </ul>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className={styles.input}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div className={styles.termsRow}>
            <input
              id="terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className={styles.checkbox}
            />
            <label htmlFor="terms" className={styles.termsLabel}>
              I agree to the{" "}
              <Link href="/terms" className={styles.termsLink}>
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className={styles.termsLink}>
                Privacy Policy
              </Link>
            </label>
          </div>

          <button type="submit" className={styles.btnPrimary}>
            Create Account
          </button>

          <div className={styles.divider}>
            <span className={styles.dividerText}>Or sign up with</span>
          </div>

          <div className={styles.socialGrid}>
            <button type="button" className={styles.socialBtn} aria-label="Sign up with Google">
              <GoogleIcon className={styles.socialIcon} />
            </button>
            <button type="button" className={styles.socialBtn} aria-label="Sign up with Facebook">
              <FacebookIcon className={styles.socialIcon} />
            </button>
          </div>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link href={signinHref} className={styles.signinLink}>Sign in</Link>
        </p>
      </div>
  );

  if (embedded) return cardContent;
  return <div className={styles.signupWrapper}>{cardContent}</div>;
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={24} height={24} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={24} height={24} aria-hidden>
      <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
