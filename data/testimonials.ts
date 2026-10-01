export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  purchasedModel: string;
  text: string;
  date: string;
}

/**
 * Customer testimonials for TK Laptop home page social proof section.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "rev-01",
    name: "Marcus Vance",
    role: "Principal Cloud Architect",
    company: "Vanguard Systems",
    avatar: "/images/avatars/avatar-1.svg",
    rating: 5,
    purchasedModel: "Dell XPS 14 (9440) Platinum Edition",
    text: "TK Laptop delivered my factory-sealed Dell XPS 14 in under 24 hours. The OLED panel and 32GB LPDDR5x configuration matched the exact Dell service tag, and their pre-purchase engineering chat was genuinely helpful.",
    date: "2 weeks ago",
  },
  {
    id: "rev-02",
    name: "Dr. Elena Rostova",
    role: "Computational Biologist",
    company: "Helix Labs",
    avatar: "/images/avatars/avatar-2.svg",
    rating: 5,
    purchasedModel: "HP Spectre x360 14 2-in-1 OLED",
    text: "I needed an ultrabook that could handle heavy data visualization during flights while staying whisper-quiet. The Spectre x360 from TK Laptop arrived with full HP warranty registration and zero bloatware.",
    date: "1 month ago",
  },
  {
    id: "rev-03",
    name: "Devon Brooks",
    role: "Lead 3D Environment Artist",
    company: "Arcadia Interactive",
    avatar: "/images/avatars/avatar-3.svg",
    rating: 5,
    purchasedModel: "HP OMEN Transcend 16 Gaming",
    text: "Best price I found anywhere on the RTX 4070 OMEN Transcend 16. Unreal Engine 5 viewport performance is buttery smooth on the 240Hz OLED screen, and the packaging was double-boxed with custom foam.",
    date: "3 weeks ago",
  },
  {
    id: "rev-04",
    name: "Priya Nair",
    role: "VP of Operations",
    company: "FinScale Global",
    avatar: "/images/avatars/avatar-4.svg",
    rating: 5,
    purchasedModel: "HP EliteBook 840 G11 Enterprise",
    text: "We standardized our remote leadership team on HP EliteBook 840s through TK Laptop. Transparent pricing, instant invoice generation, and responsive warranty support make them our go-to hardware partner.",
    date: "1 month ago",
  },
];
