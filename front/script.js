async function getRecommendation() {
  console.log("✅ script.js aktif");

  const game = document.getElementById('gameInput').value;
  const resultList = document.getElementById('resultList');
  if (!resultList) {
    console.error('❌ #resultList tidak ditemukan!');
    return;
  }

  resultList.innerHTML = 'Loading...';

  try {
    const res = await fetch(`/recommend?game=${encodeURIComponent(game)}`);
    const data = await res.json();

    resultList.innerHTML = '';

    if (data.error) {
      resultList.innerHTML = `<li>Error: ${data.error}</li>`;
      return;
    }

    data.recommended.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.name} (similarity: ${item.similarity.toFixed(3)})`;
      resultList.appendChild(li);
    });
  } catch (err) {
    resultList.innerHTML = `<li>❌ Gagal mengambil data</li>`;
    console.error(err);
  }
}
