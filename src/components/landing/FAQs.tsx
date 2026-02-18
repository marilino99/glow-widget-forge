import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { motion } from 'framer-motion'
import { useLandingLang } from '@/contexts/LandingLanguageContext'

export default function FAQs() {
  const { t } = useLandingLang();

  const faqItems = [
    { id: 'item-1', question: t('faq.q1'), answer: t('faq.a1') },
    { id: 'item-2', question: t('faq.q2'), answer: t('faq.a2') },
    { id: 'item-3', question: t('faq.q3'), answer: t('faq.a3') },
    { id: 'item-4', question: t('faq.q4'), answer: t('faq.a4') },
    { id: 'item-5', question: t('faq.q5'), answer: t('faq.a5') },
    { id: 'item-6', question: t('faq.q6'), answer: t('faq.a6') },
    { id: 'item-7', question: t('faq.q7'), answer: t('faq.a7') },
  ];

  return (
    <section id="faq" className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">{t('faq.title')}</h2>
          <p className="mt-4 text-muted-foreground text-base md:text-lg">{t('faq.subtitle')}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-left text-base font-medium">{item.question}</AccordionTrigger>
                <AccordionContent><p className="text-muted-foreground">{item.answer}</p></AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t('faq.contact')}{' '}
            <a href="#" className="text-foreground underline underline-offset-4 hover:text-foreground/80">{t('faq.contactLink')}</a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
