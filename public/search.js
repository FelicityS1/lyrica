document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");
    const searchResultsDiv = document.getElementById("searchResults");

    searchForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const query = searchInput.value.trim();

        if (!query) return;

        try {
            const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
            const results = await response.json();

            // Clear previous results
            searchResultsDiv.innerHTML = "";

            if (results.length === 0) {
                searchResultsDiv.innerHTML = "<p>No results found.</p>";
                return;
            }

            // Display search results
            results.forEach(song => {
                const songElement = document.createElement("div");
                songElement.innerHTML = `
                    <a href="/song/${song._id}">${song.title} by ${song.artist}</a>
                `;
                searchResultsDiv.appendChild(songElement);
            });
        } catch (error) {
            console.error("Error searching:", error);
            searchResultsDiv.innerHTML = "<p>Error fetching results.</p>";
        }
    });
});
