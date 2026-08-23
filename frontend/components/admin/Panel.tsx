import type { ReactNode } from "react";

type PanelProps = {
    title: string;
    link?: string;
    children: ReactNode;
};

export default function Panel({ title, link, children }: PanelProps) {
    return (
        <section className="bg-white border border-ink/15">
            <div className="flex justify-between items-center py-5.5 px-6 border-b border-ink/15">
                <h3 className="font-display font-medium text-lg leading-[1.05] tracking-[-0.01em]">{title}</h3>
                {link && (
                    <a href="#" className="font-mono text-[11px] tracking-wider text-wine hover:underline">
                        {link}
                    </a>
                )}
            </div>
            {children}
        </section>
    );
}
