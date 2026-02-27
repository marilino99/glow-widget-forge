import { Check, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLandingLang } from "@/contexts/LandingLanguageContext";

type CellValue = boolean | string;

interface FeatureRow {
  label: string;
  values: [CellValue, CellValue, CellValue, CellValue];
}

interface FeatureCategory {
  category: string;
  rows: FeatureRow[];
}

interface PlanHeader {
  name: string;
  cta: string;
  planKey: string;
  price: string;
  suffix: string;
}

const PricingComparison = ({
  onCheckout,
  currencySymbol,
  isAnnual,
}: {
  onCheckout: (planKey: string) => void;
  currencySymbol: string;
  isAnnual: boolean;
}) => {
  const { t } = useLandingLang();
  const navigate = useNavigate();

  const planHeaders: PlanHeader[] = [
    { name: t("pricing.free.name"), cta: t("pricing.free.cta"), planKey: "free", price: `${currencySymbol}0`, suffix: "forever" },
    { name: t("pricing.pro.name"), cta: t("pricing.pro.cta"), planKey: "starter", price: `${currencySymbol}${currencySymbol === "€" ? (isAnnual ? "15" : "18") : (isAnnual ? "16" : "19")}`, suffix: "per month" },
    { name: t("pricing.biz.name"), cta: t("pricing.biz.cta"), planKey: "business", price: `${currencySymbol}${currencySymbol === "€" ? (isAnnual ? "38" : "48") : (isAnnual ? "39" : "49")}`, suffix: "per month" },
    { name: t("pricing.business.name"), cta: t("pricing.business.cta"), planKey: "enterprise", price: "", suffix: "" },
  ];

  const categories: FeatureCategory[] = [
    {
      category: t("compare.catCore"),
      rows: [
        { label: t("compare.aiWidgets"), values: ["1", "3", "10", t("compare.unlimited")] },
        { label: t("compare.aiResponses"), values: ["100", "2,000", "10,000", t("compare.unlimited")] },
        { label: t("compare.contactCard"), values: [true, true, true, true] },
        { label: t("compare.whatsapp"), values: [true, true, true, true] },
        { label: t("compare.faq"), values: [true, true, true, true] },
        { label: t("compare.productCarousel"), values: [true, true, true, true] },
        { label: t("compare.escalate"), values: [true, true, true, true] },
      ],
    },
    {
      category: t("compare.catAdvanced"),
      rows: [
        { label: t("compare.aiSummaries"), values: [false, true, true, true] },
        { label: t("compare.analytics"), values: [false, t("compare.basic"), t("compare.advanced"), t("compare.advanced")] },
        { label: t("compare.customBranding"), values: [false, true, true, true] },
        { label: t("compare.sizePosition"), values: [false, true, true, true] },
        { label: t("compare.instagram"), values: [false, true, true, true] },
        { label: t("compare.googleReviews"), values: [false, true, true, true] },
        { label: t("compare.prioritySupport"), values: [false, true, true, true] },
      ],
    },
    {
      category: t("compare.catEnterprise"),
      rows: [
        { label: t("compare.teamCollab"), values: [false, false, true, true] },
        { label: t("compare.apiAccess"), values: [false, false, false, true] },
        { label: t("compare.accountManager"), values: [false, false, false, true] },
        { label: t("compare.sla"), values: [false, false, false, true] },
        { label: t("compare.sso"), values: [false, false, false, true] },
        { label: t("compare.whiteLabel"), values: [false, false, false, true] },
      ],
    },
  ];

  const renderCell = (value: CellValue) => {
    if (value === true) return <Check className="mx-auto h-4 w-4 text-foreground" />;
    if (value === false) return <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" />;
    return <span className="text-sm text-foreground">{value}</span>;
  };

  const handleCta = (planKey: string) => {
    if (planKey === "free") navigate("/signup");
    else if (planKey === "starter" || planKey === "business") onCheckout(planKey);
    // enterprise: no action (contact sales)
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-16"
    >
      <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
        {t("compare.title")}
      </h2>

      <div className="mt-8">
        <table className="w-full border-collapse">
          <thead className="sticky top-16 z-10">
            <tr className="bg-background">
              <th className="w-[30%] pb-4 text-left" />
              {planHeaders.map((plan) => (
                <th key={plan.planKey} className="w-[17.5%] py-4 pr-4 text-left align-top bg-background">
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-bold text-foreground">{plan.name}</span>
                    {plan.planKey === "enterprise" ? (
                      <a href="#" className="text-sm font-normal text-foreground hover:text-muted-foreground hover:underline underline-offset-4 transition-colors">
                        Contact us →
                      </a>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-normal text-foreground">{plan.price}</span>
                          <span className="text-sm font-normal text-foreground">{plan.suffix}</span>
                        </div>
                        <Button
                          size="sm"
                          className="mt-1.5 w-full rounded-lg bg-foreground text-background hover:bg-foreground/90 text-sm font-semibold"
                          onClick={() => handleCta(plan.planKey)}
                        >
                          {plan.cta}
                        </Button>
                      </>
                    )}
                  </div>
                </th>
              ))}
            </tr>
            <tr>
              <td colSpan={5} className="h-px bg-border" />
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <>
                <tr key={`cat-${cat.category}`}>
                  <td
                    colSpan={5}
                    className="pt-8 pb-3 text-sm font-medium text-muted-foreground"
                  >
                    {cat.category}
                  </td>
                </tr>
                {cat.rows.map((row) => (
                  <tr
                    key={row.label}
                    className="border-t border-border"
                  >
                    <td className="py-3.5 pr-4 text-sm text-foreground">
                      {row.label}
                    </td>
                    {row.values.map((val, vi) => (
                      <td key={vi} className="py-3.5 text-center first:text-left">
                        {renderCell(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default PricingComparison;
