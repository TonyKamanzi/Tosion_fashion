"use client";

import { useState } from "react";

type NewsletterFormProps = {
    placeholder: string;
    buttonLabel: string;
    subscribedLabel: string;
};

export default function NewsletterForm({
    placeholder,
    buttonLabel,
    subscribedLabel,
}: NewsletterFormProps) {
    const [subscribed, setSubscribed] = useState(false);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                setSubscribed(true);
            }}
            className="flex border-b border-ink max-w-115 min-[900px]:ml-auto pb-3.5"
        >
            <input
                type="email"
                placeholder={placeholder}
                required
                className="flex-1 bg-transparent border-none outline-none font-sans text-[15px] text-ink placeholder:text-sage"
            />
            <button
                type="submit"
                className="bg-none border-none font-mono text-[12px] tracking-[0.08em] cursor-pointer text-wine whitespace-nowrap"
            >
                {subscribed ? subscribedLabel : buttonLabel}
            </button>
        </form>
    );
}
