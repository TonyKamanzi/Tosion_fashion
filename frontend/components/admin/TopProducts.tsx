"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import Panel from "./Panel";

type Product = {
    name: string;
    imageUrl: string;
    sold: number;
    revenue: number;
    delta: number;
};

export default function TopProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        void (async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/top-products`, { withCredentials: true });
                setProducts(res.data.items);
            } catch {
                // silent
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <Panel title="Top products">
            <div className="p-6">
                {loading ? (
                    <div>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`flex items-center gap-3.5 py-3.5 ${i < 4 ? "border-b border-ink/15" : ""}`}>
                                <div className="w-11.5 h-14 bg-bone-2 animate-pulse shrink-0"></div>
                                <div className="flex-1">
                                    <div className="h-3.5 bg-bone-2 w-28 mb-2 animate-pulse"></div>
                                    <div className="h-3 bg-bone-2 w-14 animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <p className="text-sm text-sage py-4 text-center">No product data yet</p>
                ) : (
                    <div>
                        {products.map((product, index) => (
                            <div
                                key={product.name}
                                className={`flex items-center gap-3.5 py-3.5 ${
                                    index < products.length - 1 ? "border-b border-ink/15" : ""
                                }`}
                            >
                                <div className="relative w-11.5 h-14 shrink-0 bg-bone-2 overflow-hidden">
                                    {product.imageUrl ? (
                                        <Image src={product.imageUrl} alt={product.name} fill sizes="46px" className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-bone-2"></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[13.5px] font-medium mb-0.75 whitespace-nowrap overflow-hidden text-ellipsis">
                                        {product.name}
                                    </h4>
                                    <div className="text-[11.5px] text-sage">{product.sold} sold</div>
                                </div>
                                <div className="font-mono text-[12.5px] text-right shrink-0">
                                    ${product.revenue.toLocaleString()}
                                    <span className={`block text-[10.5px] mt-0.75 ${product.delta >= 0 ? "text-good" : "text-wine"}`}>
                                        {product.delta >= 0 ? "↑" : "↓"} {Math.abs(product.delta)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Panel>
    );
}
