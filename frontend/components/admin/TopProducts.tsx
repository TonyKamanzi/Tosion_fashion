import Image from "next/image";
import Panel from "./Panel";

const products = [
    {
        name: "Wool Overcoat",
        sold: 142,
        amount: "$46,576",
        delta: "↑ 18%",
        img: "https://picsum.photos/id/1025/100/120",
    },
    {
        name: "Ribbed Knit Sweater",
        sold: 98,
        amount: "$14,504",
        delta: "↑ 9%",
        img: "https://picsum.photos/id/1035/100/120",
    },
    {
        name: "Tailored Trousers",
        sold: 76,
        amount: "$12,768",
        delta: "↑ 4%",
        img: "https://picsum.photos/id/1050/100/120",
    },
    {
        name: "Leather Crossbody",
        sold: 54,
        amount: "$11,448",
        delta: "↑ 2%",
        img: "https://picsum.photos/id/1074/100/120",
    },
];

export default function TopProducts() {
    return (
        <Panel title="Top products">
            <div className="p-6">
                {products.map((product, index) => (
                    <div
                        key={product.name}
                        className={`flex items-center gap-3.5 py-3.5 ${
                            index < products.length - 1 ? "border-b border-ink/15" : ""
                        }`}
                    >
                        <div className="relative w-11.5 h-14 shrink-0 bg-bone-2 overflow-hidden">
                            <Image src={product.img} alt={product.name} fill sizes="46px" className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-[13.5px] font-medium mb-0.75 whitespace-nowrap overflow-hidden text-ellipsis">
                                {product.name}
                            </h4>
                            <div className="text-[11.5px] text-sage">{product.sold} sold</div>
                        </div>
                        <div className="font-mono text-[12.5px] text-right shrink-0">
                            {product.amount}
                            <span className="block text-good text-[10.5px] mt-0.75">{product.delta}</span>
                        </div>
                    </div>
                ))}
            </div>
        </Panel>
    );
}
