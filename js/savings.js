// Fetch live savings on page load
async function updateSavings(){
  try {
    const res = await fetch('https://price.trinicloud.workers.dev');
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.saved) {
      document.getElementById('saved-amount').textContent = '$' + (parseFloat(data.saved) * 1000).toFixed(2);
    }
  } catch (e) {
    document.getElementById('saved-amount') && (document.getElementById('saved-amount').textContent = '$0.30');
  }
}

document.addEventListener('DOMContentLoaded', updateSavings);
