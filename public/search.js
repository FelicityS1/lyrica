document.getElementById("searchInput").addEventListener("input", async function () {
    const query = this.value.trim();
    const resultsContainer = document.getElementById("searchResults");

    if (query.length === 0) {
        resultsContainer.innerHTML = ""; 
        return;
    }

    try {
        const response = await fetch(`/search?query=${encodeURIComponent(query)}`);
        const results = await response.json();

        resultsContainer.innerHTML = results
            .map(song => `<div class="search-result">${song.title}</div>`)
            .join("");
    } catch (error) {
        console.error("Error fetching search results:", error);
    }
});
