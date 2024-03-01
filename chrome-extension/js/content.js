const expectedMetaTags = [
    { name: 'description', property: false },
    { name: 'viewport', property: false },
    { name: 'robots', property: false },
    { name: 'og:title', property: true },
    { name: 'og:description', property: true },
    { name: 'twitter:title', property: true },
    { name: 'twitter:description', property: true }
    // Add more tags as needed
  ];
  
// Extract meta tags information
function extractMetaTags() {
    const metaTags = document.getElementsByTagName('meta');
    const foundTags = {};
  
    // Collect existing meta tags
    Array.from(metaTags).forEach(tag => {
        const name = tag.getAttribute('name');
        const property = tag.getAttribute('property');
        const content = tag.getAttribute('content') || 'Present but empty';
  
        if (name) foundTags[name] = content;
        if (property) foundTags[property] = content;
    });
  
    // Correctly analyze against expected tags
    const analysisResult = expectedMetaTags.map(tag => ({
        key: tag.name,
        present: foundTags.hasOwnProperty(tag.name) ? true : false,
        content: foundTags[tag.name] || 'Not present'
    }));
  
    return analysisResult;
}

  

// Analyze the headings for proper usage and hierarchy
function analyzeHeadings() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let issues = [];

    const h1Tags = document.querySelectorAll('h1');
    if (h1Tags.length !== 1) {
        issues.push(`Found ${h1Tags.length} h1 tags, but there should be exactly one.`);
    }

    let lastLevel = 0;
    headings.forEach(h => {
        const level = parseInt(h.tagName.substring(1), 10);
        if (level > lastLevel + 1) {
            issues.push(`Heading structure skips from h${lastLevel} to h${level}, breaking the logical sequence.`);
        }
        lastLevel = level;
    });

    return {
        headings: Array.from(headings).map(h => ({
            tag: h.tagName,
            text: h.textContent.trim().substring(0, 50)
        })),
        issues
    };
}

// Check if images have alt text
function checkImagesForAltText() {
    const images = document.querySelectorAll('img');
    return Array.from(images).map(img => {
        const src = img.src;
        const alt = img.alt || 'No alt text';
        const hasAltText = img.hasAttribute('alt');
        // Extract the image name from the src URL
        const imageName = src.split('/').pop().split('#')[0].split('?')[0];

        return {
            src,
            imageName,
            alt,
            hasAltText
        };
    });
}


// Evaluate the presence and correctness of structured data (schema markup)
function evaluateStructuredData() {
    const structuredDataScripts = document.querySelectorAll('script[type="application/ld+json"]');
    return structuredDataScripts.length;
}

// Inspect social media meta tags (og: tags and twitter: tags) for proper configuration
function inspectSocialMediaTags() {
    const metaTags = document.querySelectorAll('meta');
    return Array.from(metaTags).filter(tag => 
        tag.getAttribute('property')?.startsWith('og:') || 
        tag.getAttribute('name')?.startsWith('twitter:')
    ).map(tag => ({
        propertyOrName: tag.getAttribute('property') || tag.getAttribute('name'),
        content: tag.getAttribute('content')
    }));
}
function safelyQuerySelectorAll(selector) {
    try {
        return document.querySelectorAll(selector);
    } catch (error) {
        console.error(`Error querying selector ${selector}:`, error);
        return [];
    }
}
function validateAltText(altText) {
    // Example of a basic validation: alt text should not be too short or generic
    const minLength = 5; // Minimum length of meaningful alt text
    const genericAltTexts = ['image', 'photo', 'placeholder'];
    if (altText.length < minLength || genericAltTexts.includes(altText.toLowerCase())) {
        return 'Alt text is not meaningful';
    }
    return true;
}
function enhancedMetaTagsAnalysis() {
    const metaTags = safelyQuerySelectorAll('meta');
    const linkTags = safelyQuerySelectorAll('link[rel="canonical"], link[rel="alternate"]');
    const analysisResults = [];

    // Existing meta tags analysis logic here...

    // Canonical and alternate links
    linkTags.forEach(link => {
        const rel = link.getAttribute('rel');
        const href = link.getAttribute('href');
        if (rel === 'canonical') {
            analysisResults.push({ key: 'canonical', href });
        } else if (rel === 'alternate' && link.hasAttribute('hreflang')) {
            analysisResults.push({ key: 'hreflang', href, hreflang: link.getAttribute('hreflang') });
        }
    });

    return analysisResults;
}

function keywordOptimizationAnalysis(keyword) {
    const bodyText = document.body.innerText;
    const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'gi'); // Basic regex for keyword
    const keywordCount = (bodyText.match(keywordRegex) || []).length;

    return {
        keyword,
        occurrences: keywordCount
    };
}
function pageStructureAnalysis() {
    const semanticElements = ['article', 'section', 'nav', 'footer'];
    const structure = {};

    semanticElements.forEach(element => {
        const foundElements = safelyQuerySelectorAll(element);
        structure[element] = foundElements.length;
    });

    return structure;
}

// Perform SEO analysis and log results
// Define performSEOAnalysis as a regular function
function performSEOAnalysis() {
    const metaTagsAnalysis = extractMetaTags();
    const headingsAnalysis = analyzeHeadings();
    const imagesAnalysis = checkImagesForAltText().map(img => ({
        ...img,
        altTextValidation: validateAltText(img.alt)
    }));
    const structuredDataCount = evaluateStructuredData();
    const socialMediaTagsAnalysis = inspectSocialMediaTags();

    // Log results for debugging
    console.log('Meta Tags Analysis:', metaTagsAnalysis);
    console.log('Heading Analysis:', headingsAnalysis.headings);
    if (headingsAnalysis.issues.length > 0) {
        console.log('Heading Issues:', headingsAnalysis.issues);
    }
    console.log('Images Alt Text Analysis:', imagesAnalysis);
    console.log('Structured Data Script Count:', structuredDataCount);
    console.log('Social Media Tags Analysis:', socialMediaTagsAnalysis);

    // Return the analysis results for further use
    return {
        metaTagsAnalysis,
        headingsAnalysis,
        imagesAnalysis,
        structuredDataCount,
        socialMediaTagsAnalysis
    };
}

// Respond to messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "performSEOAnalysis") {
        const analysisResults = performSEOAnalysis();
        sendResponse(analysisResults);
    }
    return true; // Indicates an asynchronous response
});

// Optionally, if you want to immediately send results upon script execution
// (Not recommended for all cases, depends on your extension's logic)
chrome.runtime.sendMessage({
    from: 'content',
    subject: 'SEOAnalysisResults',
    data: performSEOAnalysis()
});
