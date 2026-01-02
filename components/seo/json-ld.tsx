import React from 'react';

interface PersonJsonLdProps {
    url: string;
    name: string;
    image: string;
    jobTitle: string;
    sameAs: string[];
    description: string;
}

export function PersonJsonLd({
    url,
    name,
    image,
    jobTitle,
    sameAs,
    description,
}: PersonJsonLdProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": `${url}#person`,
        "name": name,
        "url": url,
        "image": image,
        "jobTitle": jobTitle,
        "description": description,
        "sameAs": sameAs,
        "worksFor": {
            "@type": "Organization",
            "@id": "https://codeunia.com/#organization"
        }
    };

    const sanitizedJson = JSON.stringify(schema).replace(/</g, '\\u003c');

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: sanitizedJson }}
        />
    );
}
