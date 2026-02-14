import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { motion } from 'framer-motion'

const faqItems = [
  {
    id: 'item-1',
    question: 'What is Widjett and how does it work?',
    answer: 'Widjett is a SaaS platform that lets you build beautiful support & sales widgets for your website. You design your widget in our visual editor, customize every detail, and publish it with a single line of code — no developers needed.',
  },
  {
    id: 'item-2',
    question: 'How do I add a widget to my website?',
    answer: 'Once you\'ve created your widget, we generate a single <script> tag. Paste it anywhere in your site\'s HTML and the widget appears instantly. It works with WordPress, Shopify, Webflow, Squarespace, and any custom-built site.',
  },
  {
    id: 'item-3',
    question: 'Can I fully customize the look and feel?',
    answer: 'Yes — colors, fonts, position, icons, animations, and even custom CSS are all configurable. On Pro and Business plans you can also remove the Widjett branding for a fully white-label experience.',
  },
  {
    id: 'item-4',
    question: 'How does the AI-powered response feature work?',
    answer: 'Widjett\'s AI reads your knowledge base and automatically drafts replies to common visitor questions. It learns over time and can reduce your support workload by up to 60%, so your team can focus on complex issues.',
  },
  {
    id: 'item-5',
    question: 'Is there a free plan?',
    answer: 'Absolutely. The Free plan includes 1 widget and 100 conversations per month — forever. No credit card required. When you\'re ready to scale, you can upgrade to Pro or Business at any time.',
  },
  {
    id: 'item-6',
    question: 'Can I use multiple widgets on different pages?',
    answer: 'Yes! On Pro and Business plans you can create unlimited widgets, each with its own design and behavior. Assign different widgets to different pages or domains from a single dashboard.',
  },
  {
    id: 'item-7',
    question: 'What kind of analytics do I get?',
    answer: 'Widjett tracks conversation volume, response times, visitor satisfaction, and conversion events. Pro plans include advanced analytics with funnel breakdowns and exportable reports.',
  },
]

export default function FAQs() {
  return (
    <section id="faq" className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-muted-foreground text-base md:text-lg">
            Quick answers to the most common questions about Widjett.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-left text-base font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Can't find what you're looking for?{' '}
            <a href="#" className="text-foreground underline underline-offset-4 hover:text-foreground/80">
              Contact our support team
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
