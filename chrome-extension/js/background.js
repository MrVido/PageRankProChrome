/**
 * Listen for messages from the popup script.
 */
 chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "performSEOAnalysis") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs.length === 0) {
                console.error("No active tab identified.");
                return;
            }
            const activeTab = tabs[0];
            // Execute the content script in the active tab
            chrome.scripting.executeScript({
                target: {tabId: activeTab.id},
                files: ['content.js']
            });
        });
    }
    // Optional: return true to indicate you wish to send a response asynchronously
    // This is required if sendResponse will be called after the listener function returns
    return true;
});

/**
 * Listen for analysis results from the content script.
 */
// In background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.from === "content" && message.subject === "SEOAnalysisResults") {
        // Store the results in chrome.storage.local
        chrome.storage.local.set({seoAnalysisResults: message.data}, () => {
            console.log("SEO analysis results saved.");
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.from === "content" && message.subject === "SEOAnalysisResults") {
        chrome.storage.local.set({seoAnalysisResults: message.data});
    }
});

