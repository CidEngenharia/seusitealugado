document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("search-form");
  const nicheSelect = document.getElementById("niche");
  const cityInput = document.getElementById("city");
  const neighborhoodInput = document.getElementById("neighborhood");
  const resultsContainer = document.getElementById("results-container");
  const resultsList = document.getElementById("results-list");
  const loading = document.getElementById("loading");
  const errorMessage = document.getElementById("error-message");

  // Endpoint local padrão de dev
  const API_URL = "http://localhost:3000/api/market-radar/search";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const niche = nicheSelect.value;
    const city = cityInput.value.trim();
    const neighborhood = neighborhoodInput.value.trim();
    const fullCity = city + (neighborhood ? `, ${neighborhood}` : "");

    // Mostrar loader, ocultar outros elementos
    loading.classList.remove("hidden");
    resultsContainer.classList.add("hidden");
    errorMessage.classList.add("hidden");
    resultsList.innerHTML = "";

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s de timeout na extensão

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          niche,
          city: fullCity,
          radius: 5000,
          tenantId: "extensao-chrome"
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("Erro na comunicação com o servidor.");

      const data = await res.json();
      loading.classList.add("hidden");

      if (data.competitors && data.competitors.length > 0) {
        resultsContainer.classList.remove("hidden");
        // Mostrar apenas os 3 concorrentes mais próximos para não sobrecarregar a popup
        data.competitors.slice(0, 3).forEach((comp) => {
          const div = document.createElement("div");
          div.className = "competitor-item";
          div.innerHTML = `
            <div className="competitor-name">${comp.name}</div>
            <div className="competitor-meta">
              <span className="rating">★ ${comp.rating.toFixed(1)} <span style="font-weight: normal; color: #64748b">(${comp.reviews_count})</span></span>
              <span>${comp.distance_km} km</span>
              <span style="font-weight: 500; color: #10b981">${comp.price_level}</span>
            </div>
          `;
          resultsList.appendChild(div);
        });
      } else {
        errorMessage.innerText = "Nenhum concorrente encontrado para esta busca.";
        errorMessage.classList.remove("hidden");
      }
    } catch (err) {
      loading.classList.add("hidden");
      console.error(err);
      errorMessage.innerText = "Não foi possível conectar à plataforma. Certifique-se de que o servidor local está rodando em http://localhost:3000.";
      errorMessage.classList.remove("hidden");
    }
  });
});
