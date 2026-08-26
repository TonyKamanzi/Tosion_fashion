"use client";

import Link from "next/link";

type Step = { num: number; label: string; href?: string };

const DEFAULT_STEPS: Step[] = [
    { num: 1, label: "Bag", href: "/bag" },
    { num: 2, label: "Shipping" },
    { num: 3, label: "Payment" },
];

type Props = {
    currentStep: 1 | 2 | 3;
    steps?: Step[];
};

export default function StepsBar({ currentStep, steps = DEFAULT_STEPS }: Props) {
    return (
        <div className="flex items-center gap-2.5 pt-7 px-[5vw] font-mono text-[11.5px] tracking-[0.05em] uppercase">
            {steps.map((step, i) => {
                const isActive = step.num === currentStep;
                const isPast = step.num < currentStep;
                const content = (
                    <span className="flex items-center gap-2">
                        <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                                isActive
                                    ? "border border-wine bg-wine text-bone"
                                    : isPast
                                        ? "border border-wine bg-wine text-bone"
                                        : "border border-sage text-sage"
                            }`}
                        >
                            {step.num}
                        </span>
                        {step.label}
                    </span>
                );

                return (
                    <span key={step.num} className="flex items-center gap-2.5">
                        {i > 0 && <span className="w-9 h-px bg-ink/14" />}
                        <span className={isActive || isPast ? "text-ink" : "text-sage"}>
                            {step.href && isPast ? (
                                <Link href={step.href} className="hover:text-wine transition-colors">
                                    {content}
                                </Link>
                            ) : (
                                content
                            )}
                        </span>
                    </span>
                );
            })}
        </div>
    );
}
