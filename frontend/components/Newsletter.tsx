"use client";

import { useState } from "react";

export default function Newsletter() {
    const [subscribed, setSubscribed] = useState(false);

    return (
        <section className="bg-bone-2 px-[5vw] py-22.5 grid grid-cols-1 min-[900px]:grid-cols-2 gap-10 items-center border-y border-ink/15">
            <h2 className="font-display font-medium text-[clamp(28px,3vw,40px)] leading-[1.05] tracking-[-0.01em] max-w-[14ch]">
                Get first access to new drops.
            </h2>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setSubscribed(true);
                }}
                className="flex border-b border-ink max-w-115 min-[900px]:ml-auto pb-3.5"
            >
                <input
                    type="email"
                    placeholder="Your email address"
                    required
                    className="flex-1 bg-transparent border-none outline-none font-sans text-[15px] text-ink placeholder:text-sage"
                />
                <button
                    type="submit"
                    className="bg-none border-none font-mono text-[12px] tracking-[0.08em] cursor-pointer text-wine whitespace-nowrap"
                >
                    {subscribed ? "Subscribed ✓" : "Subscribe →"}
                </button>
            </form>
        </section>
    );
}
