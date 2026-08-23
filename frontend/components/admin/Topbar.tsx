import type { ReactNode } from "react";

type TopbarProps = {
    eyebrow?: string;
    title?: ReactNode;
};

export default function Topbar({ eyebrow = "Overview", title }: TopbarProps) {
    return (
        <div className="flex items-center justify-between flex-wrap gap-5 mb-8.5">
            <div>
                <span className="block font-mono text-[10.5px] tracking-[0.18em] uppercase text-wine">
                    {eyebrow}
                </span>
                <h1 className="mt-1.5 font-display font-medium text-[30px] leading-[1.05] tracking-[-0.01em]">
                    {title ?? (
                        <>
                            Good morning, <em className="italic text-wine">Amara</em>
                        </>
                    )}
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2.5 bg-bone-2 border border-ink/15 py-2.5 px-4 min-w-70 rounded-sm">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sage shrink-0"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
                    <input
                        type="text"
                        placeholder="Search orders, products..."
                        className="bg-transparent outline-none font-sans text-[13.5px] text-ink w-full"
                    />
                </label>

                <button
                    type="button"
                    aria-label="Notifications"
                    className="w-9.5 h-9.5 border border-ink/15 flex items-center justify-center relative transition-colors duration-200 hover:border-ink cursor-pointer"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-wine"></span>
                </button>

                <button
                    type="button"
                    className="flex items-center gap-2 bg-ink text-bone py-3 px-5 text-[13px] font-medium tracking-[0.02em] transition-colors duration-200 hover:bg-wine cursor-pointer"
                >
                    + Add product
                </button>
            </div>
        </div>
    );
}
