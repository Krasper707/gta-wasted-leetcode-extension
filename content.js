const FAILURE_KEYWORDS = [
  "Wrong Answer",
  "Time Limit Exceeded",
  "Memory Limit Exceeded",
  "Runtime Error",
  "Compile Error",
];

// variable to hold our cleanup timer so that  we can cancel it.
let cleanupTimer = null;


let wastedAudio = new Audio(chrome.runtime.getURL("assets/wasted.mp3"));

function initializeAudio() {
  console.log("Audio permissions unlocked by user interaction.");
  wastedAudio.play().catch(() => {});
  wastedAudio.pause();
  wastedAudio.currentTime = 0;
}

document.addEventListener('mousedown', initializeAudio, { once: true });


// --- CORE LOGIC ---

function cleanupEffect() {
  // If a timer is scheduled, cancel it immediately.
  if (cleanupTimer) {
    clearTimeout(cleanupTimer);
    cleanupTimer = null;
  }
  
  // Find and remove the overlay if it exists.
  const overlay = document.getElementById('wasted-overlay');
  if (overlay) {
    overlay.remove();
  }

  // Remove the grayscale class from the body.
  document.body.classList.remove("wasted-effect-active");
  console.log("Wasted effect cleaned up.");
}

function triggerWastedEffect() {
  console.log("WASTED: A submission has failed. Triggering effect.");

  if (document.body.classList.contains("wasted-effect-active")) {
    return;
  }

  document.body.classList.add("wasted-effect-active");

  const overlay = document.createElement("div");
  overlay.id = "wasted-overlay";
  const wastedText = document.createElement("h1");
  wastedText.id = "wasted-text";
  wastedText.innerText = "WASTED";
  
  overlay.appendChild(wastedText);
  document.body.appendChild(overlay);

  wastedAudio.currentTime = 0;
  wastedAudio.play();

  // Schedule the cleanup function to run after 4 seconds.
  cleanupTimer = setTimeout(cleanupEffect, 4000);
}



//OBSERVER FOR SUBMISSION RESULTS
const SUBMISSION_RESULT_SELECTOR = 'h3[class*="text-red-60"], [data-e2e-locator="console-result"]';
const submissionObserver = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.addedNodes.length) {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) { 
          const resultElement = node.querySelector(SUBMISSION_RESULT_SELECTOR);
          if (resultElement && FAILURE_KEYWORDS.some(k => resultElement.innerText.includes(k))) {
            triggerWastedEffect();
          }
        }
      });
    }
  }
});
submissionObserver.observe(document.body, { childList: true, subtree: true });


// OBSERVER FOR PAGE NAVIGATION
let currentUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== currentUrl) {
    console.log("Navigation detected. Cleaning up effects.");
    currentUrl = window.location.href;
    cleanupEffect(); // Run cleanup immediately on URL change.
  }
}, 250); // Check the URL 4 times per second.


console.log("LeetCode Wasted Screen extension is active and waiting for a submission...");