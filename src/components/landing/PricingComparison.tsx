import { Check, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
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

const PricingComparison = () => {
  const { t } = useLandingLang();

  const plans = [
    t("pricing.free.name"),
    t("pricing.pro.name"),
    t("pricing.biz.name"),
    t("pricing.business.name"),
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-16"
    >
      <h3 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        {t("compare.title")}
      </h3>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr>
              <th className="w-[30%] pb-4 text-left" />
              {plans.map((plan) => (
                <th key={plan} className="w-[17.5%] pb-4 text-left text-sm font-bold text-foreground">
                  {plan}
                </th>
              ))}
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
