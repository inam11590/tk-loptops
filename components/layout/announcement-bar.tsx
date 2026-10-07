import { ShieldCheck, Sparkles, Truck } from "lucide-react";
import { SITE_CONFIG, formatPrice, getSettings } from "@/lib/config";
import { Container } from "@/components/common/container";

/**
 * Top announcement bar displaying free delivery threshold and official warranty info.
 */
export function AnnouncementBar() {
  const settings = getSettings();

  return (
    <div
      role="region"
      aria-label="Store announcements"
      className="border-b border-white/10 bg-brand-navy py-2 text-xs text-slate-200 print:hidden"
    >
      <Container className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Truck
              className="h-3.5 w-3.5 text-blue-400"
              aria-hidden="true"
            />
            <span>
              Free express delivery on orders over{" "}
              <strong className="font-semibold text-white">
                {formatPrice(settings.shipping.freeDeliveryThreshold)}
              </strong>
            </span>
          </span>
          <span className="hidden text-slate-600 sm:inline" aria-hidden="true">
            |
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <ShieldCheck
              className="h-3.5 w-3.5 text-blue-400"
              aria-hidden="true"
            />
            <span>{settings.shipping.warrantyText || SITE_CONFIG.shipping.warrantyText} on all laptops</span>
          </span>
        </div>

        <div className="hidden items-center gap-1.5 text-slate-300 md:flex">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
          <span>Authorized HP &amp; Dell Partner</span>
          <span className="text-slate-600" aria-hidden="true">
            •
          </span>
          <a
            href={`tel:${settings.storeInfo.phone}`}
            className="font-semibold text-white underline-offset-4 hover:text-blue-400 hover:underline"
          >
            {settings.storeInfo.phone}
          </a>
        </div>
      </Container>
    </div>
  );
}
