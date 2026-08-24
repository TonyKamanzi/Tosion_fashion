import axios from "axios";
import NewsletterForm from "./NewsletterForm";

type NewsletterContent = {
    title: string;
    placeholder: string;
    buttonLabel: string;
    subscribedLabel: string;
};

// shown if the backend is unreachable — mirrors the seeded defaults
const FALLBACK_NEWSLETTER: NewsletterContent = {
    title: "Get first access to new drops.",
    placeholder: "Your email address",
    buttonLabel: "Subscribe →",
    subscribedLabel: "Subscribed ✓",
};

async function getNewsletter(): Promise<NewsletterContent> {
    try {
        const res = await axios.get<NewsletterContent>(
            "http://localhost:2000/newsletter",
            { timeout: 4000 }
        );
        return res.data;
    } catch {
        return FALLBACK_NEWSLETTER;
    }
}

export default async function Newsletter() {
    const content = await getNewsletter();

    return (
        <section className="bg-bone-2 px-[5vw] py-22.5 grid grid-cols-1 min-[900px]:grid-cols-2 gap-10 items-center border-y border-ink/15">
            <h2 className="font-display font-medium text-[clamp(28px,3vw,40px)] leading-[1.05] tracking-[-0.01em] max-w-[14ch]">
                {content.title}
            </h2>
            <NewsletterForm
                placeholder={content.placeholder}
                buttonLabel={content.buttonLabel}
                subscribedLabel={content.subscribedLabel}
            />
        </section>
    );
}
