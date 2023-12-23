const scrapeEmails = document.getElementById('scrapeEmails');
const applyFiltersButton = document.getElementById('applyFilters');
const list = document.getElementById('emailList');

let emailList = [];
let supportFilterValue = '';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	// Get emails
	const { emails } = request;

    emailList = Array.from(new Set(emails));


    displayEmails();
});

scrapeEmails.addEventListener('click', async () => {
	// Get current active tab
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		func: scrapeEmailsFromPage,
	});
});


applyFiltersButton.addEventListener('click', () => {

    supportFilterValue = document.getElementById('supportFilter').value.trim().toLowerCase();


    displayEmails();
});

function scrapeEmailsFromPage() {
	// RegEx to parse emails from html code
	const emailRegEx = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

	// Parse emails from the HTML of the page
	const emails = document.body.innerHTML.match(emailRegEx);

	// Send emails to popup
	chrome.runtime.sendMessage({ emails });
}

function displayEmails() {
    // Clear the existing list
    list.innerHTML = '';

    // Check for filter and sort options

    const supportFilter = email => supportFilterValue === '' || email?.split('@')?.[1]?.includes(supportFilterValue);
    const sortFilter = (a, b) => a.localeCompare(b);

    // Apply filters and sort the email list
    const filteredAndSortedEmails = emailList
        .filter(supportFilter)
        .sort(sortFilter);

    // Display emails on popup
    if (filteredAndSortedEmails == null || filteredAndSortedEmails.length === 0) {
        const li = document.createElement('li');
        li.innerText = 'No emails found';
        list.appendChild(li);
    } else {
        // Display filtered and sorted emails
        filteredAndSortedEmails.forEach((email) => {
            const li = document.createElement('li');
            li.innerText = email;
            list.appendChild(li);
        });
    }
}