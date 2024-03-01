document.addEventListener('DOMContentLoaded', () => {
    // Retrieve the stored SEO analysis results from chrome.storage.local
    chrome.storage.local.get(['seoAnalysisResults'], function(result) {
        if (result.seoAnalysisResults) {
            // If results exist, display them
            displayAnalysisResults(result.seoAnalysisResults);
            // Optionally clear the stored results after displaying
            chrome.storage.local.remove(['seoAnalysisResults']);
        } else {
            // Handle the case where no results are found, e.g., analysis not yet performed
            document.getElementById('results').textContent = 'No analysis results. Please perform an analysis.';
        }
    });
});

function displayAnalysisResults(analysisResults) {
    // Directly call display functions for each part of the analysis
    displayMetaTagsAnalysis(analysisResults.metaTagsAnalysis);
    displayHeadingsAnalysis(analysisResults.headingsAnalysis);
    displayImagesAnalysis(analysisResults.imagesAnalysis);
    displayStructuredDataCount(analysisResults.structuredDataCount);
    displaySocialMediaTagsAnalysis(analysisResults.socialMediaTagsAnalysis);
}

function displayMetaTagsAnalysis(metaTagsAnalysis) {
    const metaResultsElement = document.getElementById('metaTagsResults');
    metaTagsAnalysis.forEach(tag => {
        const item = document.createElement('div');
        item.textContent = `${tag.key}: ${tag.present ? tag.content : 'Not present'}`;
        metaResultsElement.appendChild(item);
    });
}

function displayHeadingsAnalysis(headingsAnalysis) {
    const headingsResultsElement = document.getElementById('headingsResults');
    headingsAnalysis.headings.forEach(heading => {
        const item = document.createElement('div');
        item.textContent = `${heading.tag}: ${heading.text}`;
        headingsResultsElement.appendChild(item);
    });

    headingsAnalysis.issues.forEach(issue => {
        const issueItem = document.createElement('div');
        issueItem.textContent = `Issue: ${issue}`;
        issueItem.style.color = 'red';
        headingsResultsElement.appendChild(issueItem);
    });
}

function displayImagesAnalysis(imagesAnalysis) {
    const imagesResultsElement = document.getElementById('imagesResults');
    imagesAnalysis.forEach(img => {
        const item = document.createElement('div');
        item.textContent = `Image: ${img.imageName}, Alt Text: ${img.alt} (${img.altTextValidation ? img.altTextValidation : 'Valid'})`;
        if (!img.hasAltText || img.altTextValidation !== true) {
            item.style.color = 'red';
        }
        imagesResultsElement.appendChild(item);
    });
}

function displayStructuredDataCount(structuredDataCount) {
    const structuredDataElement = document.getElementById('structuredDataResults');
    const item = document.createElement('div');
    item.textContent = `Structured Data Scripts Found: ${structuredDataCount}`;
    structuredDataElement.appendChild(item);
}

function displaySocialMediaTagsAnalysis(socialMediaTagsAnalysis) {
    const socialMediaResultsElement = document.getElementById('socialMediaResults');
    socialMediaTagsAnalysis.forEach(tag => {
        const item = document.createElement('div');
        item.textContent = `${tag.propertyOrName}: ${tag.content}`;
        socialMediaResultsElement.appendChild(item);
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.subject === "SEOAnalysisResults") {
        displayAnalysisResults(message.data);
    }
});