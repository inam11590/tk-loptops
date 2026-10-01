import { Accessory } from "@/types";

/**
 * Curated laptop accessories for the "Frequently Bought Together" bundle section.
 */
export const ACCESSORIES: Accessory[] = [
  {
    id: "acc-bag-01",
    name: "TK Pro Ballistic Nylon 16\" Laptop Briefcase",
    category: "bag",
    price: 59,
    oldPrice: 79,
    image: "/images/accessories/laptop-bag.svg",
    shortSpec: "Water-repellent 1680D nylon, plush fleece compartment & luggage pass-through",
  },
  {
    id: "acc-mouse-01",
    name: "TK Precision Silent Wireless Ergonomic Mouse",
    category: "mouse",
    price: 39,
    oldPrice: 49,
    image: "/images/accessories/wireless-mouse.svg",
    shortSpec: "Dual Bluetooth 5.3 + 2.4GHz USB-C receiver, 4000 DPI optical sensor, 90-day battery",
  },
  {
    id: "acc-cooling-01",
    name: "TK CryoFlow Dual-Turbine Aluminum Cooling Pad",
    category: "cooling",
    price: 49,
    oldPrice: 65,
    image: "/images/accessories/cooling-pad.svg",
    shortSpec: "Anodized aluminum mesh deck, 5-stage height stand & whisper-quiet 1800 RPM fans",
  },
];
