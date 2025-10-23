// toggle card open/close
function toggleCard(id){ const el = document.getElementById(id); el?.classList.toggle('open'); }

// Email gate demo handler
document.addEventListener('submit', (e) => {
  const form = e.target;
  if (form && form.id === 'emailGate') {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]')?.value;
    // In production: POST to Formspree/Netlify forms or your Worker
    alert('✅ PDF sent (demo). Would send to: ' + email);
    form.reset();
  }
});

// copy tweet prompt helper
function copyTweetPrompt(){
  const prompt = `Write a 280-char tweet that warns indie-devs about Oracle's hidden egress fees and offers TriniCloud's 7% fair-proxy as the cure. Include emoji and a CTA to dm 'beta'.`;
  navigator.clipboard.writeText(prompt).then(()=>alert('Prompt copied! Paste into Claude, Kimi, or Gemini.'));
}
