"use client";

import { motion } from "framer-motion";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export function OpenSourceFAQ() {
    const faqs = [
        {
            question: "Do I need to be an expert coder to contribute?",
            answer: "Not at all! Open source projects need all kinds of help, including documentation, design, testing, and translation. Many projects have 'good first issue' tags specifically for beginners."
        },
        {
            question: "What if I mess up the code?",
            answer: "That's what the review process is for! Maintainers will review your Pull Request (PR) before merging it. They will provide feedback and help you correct any mistakes. You can't break the main project just by submitting a PR."
        },
        {
            question: "How do I find a project to work on?",
            answer: "Start with tools you already use. Check if they are open source. Platforms like GitHub also have an 'Explore' section. Codeunia's OSCG 2026 is also a great place to start finding mentored projects."
        },
        {
            question: "Will I get paid for open source?",
            answer: "Most open source contributions are voluntary, but they build your portfolio and reputation, which can lead to job offers. Some programs (like GSoC, Outreachy, and sometimes OSCG) offer stipends or rewards."
        },
        {
            question: "What is a Pull Request (PR)?",
            answer: "A Pull Request is a way to notify project maintainers that you have completed a change and want them to review and merge it into the main codebase. It's the standard way to submit contributions."
        }
    ];

    return (
        <section className="py-24 bg-background">
            <div className="container px-4 mx-auto max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                        Frequently Asked <span className="text-primary">Questions</span>
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Common questions about getting started with open source.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left text-lg font-medium">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </motion.div>
            </div>
        </section>
    );
}
