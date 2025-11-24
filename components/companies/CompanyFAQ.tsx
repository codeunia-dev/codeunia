"use client"

import { motion } from "framer-motion"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
    {
        question: "How long does verification take?",
        answer: "Most applications are reviewed within 24-48 hours. You'll receive an email notification once your company is verified and ready to start hosting events.",
    },
    {
        question: "What documents are required for verification?",
        answer: "You'll need to provide business registration documents, your company website URL, and an official company email domain. All documents are securely stored and virus-scanned.",
    },
    {
        question: "Can I invite team members to help manage events?",
        answer: "Yes! You can invite unlimited team members with role-based permissions. Assign roles like Owner, Admin, Editor, or Viewer to control what each team member can do.",
    },
    {
        question: "Is there a cost to host events on Codeunia?",
        answer: "Currently, hosting events on Codeunia is completely free for all verified companies. We may introduce premium features in the future, but the core platform will remain free.",
    },
    {
        question: "What types of events can I host?",
        answer: "You can host workshops, hackathons, webinars, conferences, networking events, and any tech-related gatherings. Both online and in-person events are supported.",
    },
    {
        question: "Can I edit events after publishing?",
        answer: "Yes, admins and editors can update event details anytime. Changes are reflected immediately, and registered participants are notified of significant updates.",
    },
    {
        question: "How do I track event performance?",
        answer: "Your dashboard provides real-time analytics including views, registrations, attendance, and engagement metrics. You can also export detailed reports as CSV files.",
    },
    {
        question: "What happens if my company is rejected?",
        answer: "If your application is rejected, you'll receive an email with the specific reason. You can address the issues and resubmit your application for review.",
    },
]

export function CompanyFAQ() {
    return (
        <section className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent"></div>

            <div className="container px-4 mx-auto relative z-10">
                <motion.div
                    className="text-center space-y-6 mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <div className="flex flex-col items-center justify-center gap-4">
                        <button className="bg-slate-800 no-underline group relative shadow-2xl shadow-zinc-900 rounded-full p-px text-sm font-semibold leading-6 text-white inline-block cursor-default">
                            <span className="absolute inset-0 overflow-hidden rounded-full">
                                <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                            </span>
                            <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10">
                                <span>FAQ</span>
                            </div>
                            <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                        </button>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                        Frequently Asked{" "}
                        <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                            Questions
                        </span>
                    </h2>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Everything you need to know about hosting events on Codeunia
                    </p>
                </motion.div>

                <motion.div
                    className="max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {faqs.map((faq, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index}`}
                                className="border border-primary/10 rounded-lg px-6 bg-background/50 backdrop-blur-sm hover:border-primary/20 transition-colors"
                            >
                                <AccordionTrigger className="text-left hover:no-underline py-4">
                                    <span className="font-semibold text-lg">{faq.question}</span>
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground pb-4">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </motion.div>
            </div>
        </section>
    )
}
