import { Suspense } from "react";
import SearchPage from "@/components/shop/SearchPage";

export default function Search() {
    return (
        <Suspense
            fallback={
                <div className="mt-20 bg-bone min-h-[calc(100vh-80px)] flex items-center justify-center">
                    <span className="font-mono text-[12px] text-sage tracking-[0.04em]">Loading...</span>
                </div>
            }
        >
            <SearchPage />
        </Suspense>
    );
}
