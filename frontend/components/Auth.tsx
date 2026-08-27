"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

// Which form is currently visible: "login" (Sign In) or "register" (Create Account)
type Tab = "login" | "register";

// shape returned by POST /auth/login and GET /auth/me
type SessionUser = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
};


export default function Auth() {
    // tab state controls which panel is shown; starts on the login form
    const [tab, setTab] = useState<Tab>("login");
    const router = useRouter();
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    // login form fields
    const [loginEmail, setLoginEmail] = useState<string>("");
    const [loginPassword, setLoginPassword] = useState<string>("");
    // feedback shown under the active form
    const [notice, setNotice] = useState<string>("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await axios.post(
                `${API_URL}/auth/register`,
                { firstName, lastName, email, password },
                { withCredentials: true }
            );

            // account created — send the user to the login form to sign in
            setNotice("Account created successfully. Sign in to continue.");
            setFirstName("");
            setLastName("");
            setEmail("");
            setPassword("");
            setTab("login");
        } catch {
            setNotice("Registration failed. Try a different email.");
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await axios.post<SessionUser>(
                `${API_URL}/auth/login`,
                { email: loginEmail, password: loginPassword },
                { withCredentials: true }
            );

            // admins go to the dashboard; customers go to the shop
            router.replace(res.data.role === "admin" ? "/admin" : "/");
        } catch {
            setNotice("Invalid email or password.");
        }
    }
    return (
        <div className="bg-bone min-h-screen flex flex-col">
            {/* Minimal auth header: brand logo + link back to the shop */}
            <header className="flex items-center justify-between py-5 px-[5vw] border-b border-ink/15">
                <div className="font-display font-semibold text-2xl tracking-[0.02em]">
                    TOSION
                </div>
                <Link
                    href="/"
                    className="font-mono text-[12px] tracking-wider flex items-center gap-2 text-sage hover:text-wine transition-colors"
                >
                    ← Back to shop
                </Link>
            </header>

            {/* Split layout: left = image panel, right = form panel (stacks on mobile) */}
            <div className="flex-1 grid grid-cols-1 min-[860px]:grid-cols-2">
                {/* Left panel — decorative editorial image with an overlay quote */}
                <div className="relative overflow-hidden bg-ink min-h-[34vh] min-[860px]:min-h-0">
                    <Image
                        src="https://picsum.photos/id/1027/1000/1400"
                        alt="Editorial fashion image"
                        fill
                        loading="eager"
                        sizes="(min-width: 860px) 50vw, 100vw"
                        className="object-cover grayscale-35 contrast-[1.05]"
                        
                    />
                    <div className="absolute left-9 right-9 bottom-9 text-bone">
                        <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-gold block mb-3.5">
                            Members
                        </span>
                        <h2 className="font-display font-normal italic text-[clamp(24px,2.4vw,34px)] leading-[1.3] max-w-[20ch]">
                            &ldquo;Fewer pieces, worn longer — access starts here.&rdquo;
                        </h2>
                    </div>
                </div>

                {/* Right panel — contains the tab switcher and the active form */}
                <div className="flex items-center justify-center px-[6vw] py-14 min-[860px]:px-[5vw] min-[860px]:py-[6vw] border-t min-[860px]:border-t-0 min-[860px]:border-l border-ink/15">
                    <div className="w-full max-w-100">
                        {/* Tabs — clicking one switches between the Sign In / Create Account panels */}
                        <div className="flex mb-11 border-b border-ink/15">
                            {(
                                [
                                    { key: "login", label: "Sign In" },
                                    { key: "register", label: "Create Account" },
                                ] as const
                            ).map((t) => (
                                <button
                                    key={t.key}
                                    type="button"
                                    onClick={() => {
                                        setTab(t.key);
                                        setNotice("");
                                    }}
                                    // active tab gets ink text + a wine underline (scaleX animation)
                                    className={`font-mono text-[12px] tracking-[0.08em] uppercase pb-4 mr-8 relative text-sage transition-colors duration-300 after:absolute after:left-0 after:right-0 after:-bottom-px after:h-0.5 after:bg-wine after:transition-transform after:duration-300 ${
                                        tab === t.key
                                            ? "text-ink after:scale-x-100"
                                            : "after:scale-x-0"
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {tab === "login" ? (
                            /* ---------- LOGIN / SIGN IN FORM ---------- */
                            <div key="login" className="animate-fade">
                                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-wine">
                                    Welcome back
                                </span>
                                <h1 className="font-display font-medium text-[32px] leading-[1.05] tracking-[-0.01em] mt-3.5 mb-2">
                                    Sign in to{" "}
                                    <em className="italic font-normal text-wine">
                                        Tosion
                                    </em>
                                </h1>
                                <p className="text-sage text-[14px] leading-[1.6] mb-9">
                                    Access your orders, saved pieces, and early drop
                                    access.
                                </p>

                                <form onSubmit={handleLogin}>
                                    {/* Email field: underline-styled input, mono uppercase label */}
                                    <div className="mb-6">
                                        <label
                                            htmlFor="login-email"
                                            className="block font-mono text-[10.5px] tracking-widest uppercase text-sage mb-2.5"
                                        >
                                            Email
                                        </label>
                                        <input
                                            id="login-email"
                                            type="email"
                                            placeholder="you@email.com"
                                            required
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                            className="w-full bg-transparent border-b border-ink pt-2.5 pb-3 px-0.5 font-sans text-[15px] text-ink outline-none transition-colors focus:border-wine placeholder:text-[#B7B3A6]"
                                        />
                                    </div>
                                    {/* Password field */}
                                    <div className="mb-6">
                                        <label
                                            htmlFor="login-password"
                                            className="block font-mono text-[10.5px] tracking-widest uppercase text-sage mb-2.5"
                                        >
                                            Password
                                        </label>
                                        <input
                                            id="login-password"
                                            type="password"
                                            placeholder="••••••••"
                                            required
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            className="w-full bg-transparent border-b border-ink pt-2.5 pb-3 px-0.5 font-sans text-[15px] text-ink outline-none transition-colors focus:border-wine placeholder:text-[#B7B3A6]"
                                        />
                                    </div>

                                    {/* Remember me checkbox + "forgot password?" link */}
                                    <div className="flex items-center justify-between mb-8 text-[13px]">
                                        <label className="flex items-center gap-2.25 text-sage cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                className="w-3.5 h-3.5 accent-wine"
                                            />
                                            Remember me
                                        </label>
                                        <a
                                            href="#"
                                            className="font-mono text-[11.5px] tracking-[0.04em] text-wine hover:underline"
                                        >
                                            Forgot password?
                                        </a>
                                    </div>

                                    {/* Main submit button — ink background, turns wine on hover */}
                                    <button
                                        type="submit"
                                        className="group flex items-center justify-center gap-3 bg-ink text-bone w-full py-4 px-6.5 font-sans font-medium text-[13px] tracking-[0.04em] cursor-pointer transition-colors hover:bg-wine"
                                    >
                                        Sign in
                                        <span className="transition-transform duration-300 group-hover:translate-x-1.25">
                                            →
                                        </span>
                                    </button>

                                    {/* Inline feedback for login attempts */}
                                    {notice && tab === "login" && (
                                        <p className="mt-5 font-mono text-[11px] tracking-[0.04em] text-wine">
                                            {notice}
                                        </p>
                                    )}
                                </form>

                                {/* "or continue with" divider with hairline rules on both sides */}
                                <div className="flex items-center gap-4 my-8 font-mono text-[10.5px] tracking-widest uppercase text-sage">
                                    <span className="flex-1 h-px bg-ink/15" />
                                    or continue with
                                    <span className="flex-1 h-px bg-ink/15" />
                                </div>

                                {/* Social login buttons (Google + Apple) — styling only for now */}
                                <a href={`${API_URL}/auth/google`}
                                    type="button"
                                    className="flex items-center justify-center gap-2.5 bg-transparent text-ink w-full py-3.5 px-5 mb-3 font-sans text-[13.5px] font-medium border border-ink cursor-pointer transition-all hover:bg-ink hover:text-bone"
                                >
                                    <svg width="16" height="16" viewBox="0 0 48 48">
                                        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.3 29.4 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.8l6-6C33.5 6.5 29 5 24 5 13 5 4 14 4 25s9 20 20 20 20-9 20-20c0-1.4-.1-2.7-.4-4.5z" />
                                        <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 16 19 13 24 13c2.8 0 5.3 1 7.3 2.8l6-6C33.5 6.5 29 5 24 5c-7.7 0-14.3 4.4-17.7 10.7z" />
                                        <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.3C29.2 36.4 26.7 37 24 37c-5.3 0-9.8-3.4-11.4-8.1l-6.5 5C9.6 40.4 16.2 45 24 45z" />
                                        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.9 2.6-2.6 4.8-4.9 6.3l6.2 5.3C40.8 36 44 30.9 44 25c0-1.4-.1-2.7-.4-4.5z" />
                                    </svg>
                                    Continue with Google
                                </a>
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-2.5 bg-transparent text-ink w-full py-3.5 px-5 mb-3 font-sans text-[13.5px] font-medium border border-ink cursor-pointer transition-all hover:bg-ink hover:text-bone"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.514 0-1.994-.89-3.72-.89-1.696 0-2.278.92-3.72.92-1.417 0-2.475-1.32-3.483-2.66C3.32 18.11 2 14.94 2 11.94c0-4.55 2.965-6.98 5.85-6.98 1.5 0 2.75.99 3.7.99.9 0 2.32-1.05 4.03-1.05.66 0 3.02.06 4.58 2.28-.12.08-2.73 1.6-2.73 4.86 0 3.87 3.42 5.14 3.5 5.14z" />
                                    </svg>
                                    Continue with Apple
                                </button>

                                {/* Switch to the Create Account panel */}
                                <p className="text-center mt-8 text-[13.5px] text-sage">
                                    Don&apos;t have an account?{" "}
                                    <button
                                        type="button"
                                        onClick={() => setTab("register")}
                                        className="bg-none border-none font-sans font-medium text-wine cursor-pointer underline underline-offset-[3px]"
                                    >
                                        Create one
                                    </button>
                                </p>
                            </div>
                        ) : (
                            /* ---------- SIGN UP / CREATE ACCOUNT FORM ---------- */
                            <div key="register" className="animate-fade">
                                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-wine">
                                    New here
                                </span>
                                <h1 className="font-display font-medium text-[32px] leading-[1.05] tracking-[-0.01em] mt-3.5 mb-2">
                                    Create your{" "}
                                    <em className="italic font-normal text-wine">
                                        account
                                    </em>
                                </h1>
                                <p className="text-sage text-[14px] leading-[1.6] mb-9">
                                    Join for early access to new drops and member-only
                                    pricing.
                                </p>

                                <form
                                 onSubmit={handleRegister}
                                >
                                    {/* First & last name side by side (stacks to one column on mobile) */}
                                    <div className="grid grid-cols-1 min-[860px]:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label
                                                htmlFor="reg-first"
                                                className="block font-mono text-[10.5px] tracking-widest uppercase text-sage mb-2.5"
                                            >
                                                First name
                                            </label>
                                            <input
                                                id="reg-first"
                                                type="text"
                                                placeholder="First name"
                                                required
                                                    className="w-full bg-transparent border-b border-ink pt-2.5 pb-3 px-0.5 font-sans text-[15px] text-ink outline-none transition-colors focus:border-wine placeholder:text-[#B7B3A6]"
                                                    onChange={(e) => setFirstName(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="reg-last"
                                                className="block font-mono text-[10.5px] tracking-widest uppercase text-sage mb-2.5"
                                            >
                                                Last name
                                            </label>
                                            <input
                                                id="reg-last"
                                                type="text"
                                                placeholder="Last name"
                                                required
                                                className="w-full bg-transparent border-b border-ink pt-2.5 pb-3 px-0.5 font-sans text-[15px] text-ink outline-none transition-colors focus:border-wine placeholder:text-[#B7B3A6]"
                                                onChange={(e) => setLastName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    {/* Email field */}
                                    <div className="mb-6">
                                        <label
                                            htmlFor="reg-email"
                                            className="block font-mono text-[10.5px] tracking-widest uppercase text-sage mb-2.5"
                                        >
                                            Email
                                        </label>
                                        <input
                                            id="reg-email"
                                            type="email"
                                            placeholder="you@email.com"
                                            required
                                            className="w-full bg-transparent border-b border-ink pt-2.5 pb-3 px-0.5 font-sans text-[15px] text-ink outline-none transition-colors focus:border-wine placeholder:text-[#B7B3A6]"
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    {/* Password field (new account password) */}
                                    <div className="mb-6">
                                        <label
                                            htmlFor="reg-password"
                                            className="block font-mono text-[10.5px] tracking-widest uppercase text-sage mb-2.5"
                                        >
                                            Password
                                        </label>
                                        <input
                                            id="reg-password"
                                            type="password"
                                            placeholder="Minimum 8 characters"
                                            required
                                            className="w-full bg-transparent border-b border-ink pt-2.5 pb-3 px-0.5 font-sans text-[15px] text-ink outline-none transition-colors focus:border-wine placeholder:text-[#B7B3A6]"
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>

                                    {/* Optional: subscribe the new account to early-access emails */}
                                    <div className="flex items-center justify-between mb-7 text-[13px]">
                                        <label className="flex items-center gap-2.25 text-sage cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                className="w-3.5 h-3.5 accent-wine"
                                            />
                                            Sign me up for early access to drops
                                        </label>
                                    </div>

                                    {/* Main submit button — ink background, turns wine on hover */}
                                    <button
                                        type="submit"
                                        className="group flex items-center justify-center gap-3 bg-ink text-bone w-full py-4 px-6.5 font-sans font-medium text-[13px] tracking-[0.04em] cursor-pointer transition-colors hover:bg-wine"
                                    >
                                        Create account
                                        <span className="transition-transform duration-300 group-hover:translate-x-1.25">
                                            →
                                        </span>
                                    </button>

                                    {/* Inline feedback for registration attempts */}
                                    {notice && tab === "register" && (
                                        <p className="mt-5 font-mono text-[11px] tracking-[0.04em] text-wine">
                                            {notice}
                                        </p>
                                    )}
                                </form>

                                {/* Legal notice with links to terms & privacy */}
                                <p className="mt-5 text-[12px] text-sage leading-[1.6]">
                                    By creating an account you agree to our{" "}
                                    <a
                                        href="#"
                                        className="text-wine underline underline-offset-2"
                                    >
                                        Terms of Service
                                    </a>{" "}
                                    and{" "}
                                    <a
                                        href="#"
                                        className="text-wine underline underline-offset-2"
                                    >
                                        Privacy Policy
                                    </a>
                                    .
                                </p>

                                {/* Switch back to the Sign In panel */}
                                <p className="text-center mt-8 text-[13.5px] text-sage">
                                    Already have an account?{" "}
                                    <button
                                        type="button"
                                        onClick={() => setTab("login")}
                                        className="bg-none border-none font-sans font-medium text-wine cursor-pointer underline underline-offset-[3px]"
                                    >
                                        Sign in
                                    </button>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
