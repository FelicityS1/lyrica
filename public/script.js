// Toggle "Show More" for lyrics
function toggleLyrics() {
    const lyrics = document.getElementById("lyricsText");
    const button = document.getElementById("showMoreBtn");

    if (lyrics.classList.contains("expanded")) {
        lyrics.style.maxHeight = "200px";
        button.innerText = "Show More";
    } else {
        lyrics.style.maxHeight = "none";
        button.innerText = "Show Less";
    }

    lyrics.classList.toggle("expanded");
}

// Back to Top button
window.onscroll = function () {
    scrollFunction();
};

function scrollFunction() {
    const button = document.getElementById("backToTopBtn");
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        button.style.display = "block";
    } else {
        button.style.display = "none";
    }
}

function backToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

function toggleLyrics() {
    const hiddenLyrics = document.querySelector('.hidden-lyrics');
    const showMoreBtn = document.getElementById('showMoreBtn');
    
    if (hiddenLyrics.classList.contains('showing')) {
        // "Show Less"
        hiddenLyrics.classList.remove('showing');
        showMoreBtn.textContent = 'Show More';
        hiddenLyrics.style.maxHeight = '0'; // Collapse
    } else {
        // "Show More"
        hiddenLyrics.classList.add('showing');
        showMoreBtn.textContent = 'Show Less';

        hiddenLyrics.style.maxHeight = hiddenLyrics.scrollHeight + 'px'; // Expand to its full height
    }
}

window.addEventListener("scroll", updateProgressBar);

function updateProgressBar() {
    const progressBar = document.getElementById("progressBar");
    const scrollPosition = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercentage = (scrollPosition / documentHeight) * 100;
    
    // Set the width of the progress bar based on scroll percentage
    progressBar.style.width = scrollPercentage + "%";
}

document.getElementById("contactLink").addEventListener("click", function (event) {
    event.preventDefault();

    // Fetch and insert the modal HTML into the page (if it's not already loaded)
    fetch("contactModal.html")
        .then((response) => response.text())
        .then((data) => {
            // Insert the modal into the page (if not already inserted)
            if (!document.getElementById("contactModal")) {
                document.getElementById("modal-container").innerHTML = data;
            }


            var modalElement = document.getElementById("contactModal");
            var modal = new bootstrap.Modal(modalElement);
            modal.show();

            const form = document.getElementById("contactForm");
            const confirmationMessage = document.getElementById("confirmationMessage");
            const confirmDismissButton = document.getElementById("confirmDismiss");

            // Add event listener to the "Submit" button
            document.querySelector("#contactModal .btn-primary").addEventListener("click", function () {

                if (!form.checkValidity()) {

                    form.reportValidity();
                    return;
                }

                // Show confirmation message
                confirmationMessage.classList.remove("d-none");

                // Disable the Submit button
                this.setAttribute("disabled", "true");


                form.reset();

                // Add click event listener to confirmation "OK" button
                confirmDismissButton.addEventListener("click", function () {

                    modal.hide();

                    // Reset modal state for future use
                    confirmationMessage.classList.add("d-none");
                    document.querySelector("#contactModal .btn-primary").removeAttribute("disabled");
                });
            });

            // Reset the form and states when the modal is dismissed
            modalElement.addEventListener("hidden.bs.modal", function () {

                form.reset();
                confirmationMessage.classList.add("d-none");
                document.querySelector("#contactModal .btn-primary").removeAttribute("disabled");
            });
        });
});




document.addEventListener('DOMContentLoaded', function () {
    const feedbackForm = document.getElementById('feedbackForm');
    const modal = new bootstrap.Modal(document.getElementById('feedbackModal'));

    feedbackForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission
        
        modal.show();
        
        feedbackForm.reset();
    });
});

document.getElementById("searchInput").addEventListener("input", function() {
    const query = this.value.toLowerCase();
    const results = songs.filter(song => song.title.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query));
    displayResults(results);
});


// Search Function
const songs = [
    { title: "Neko (Cat)", artist: "DISH//", link: "neko.html" },
    { title: "Dancing With Your Ghost", artist: "Sasha Alex Sloan", link: "DancingWithYourGhost.html" },
    { title: "Vandalize", artist: "One OK Rock", link: "vandalize.html" },
    { title: "Out of Love", artist: "Alessia Cara", link: "OutofLove.html" },
    { title: "Speak the Name/Call the Name", artist: "Indiana Bible College", link: "SpeaktheName.html" }
];

document.getElementById("searchInput").addEventListener("input", function () {
    const query = this.value.toLowerCase().trim(); // Get the user's input
    const resultsContainer = document.getElementById("liveSearchResults");
    resultsContainer.innerHTML = ''; // Clear previous results

    if (!query) {
        resultsContainer.style.display = 'none'; // Hide the popup if the query is empty
        return;
    }

    const results = songs.filter(song =>
        song.title.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query)
    );

    if (results.length > 0) {
        const ul = document.createElement('ul');
        results.forEach(song => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${song.link}">${song.title}</a> by ${song.artist}`;
            ul.appendChild(li);
        });
        resultsContainer.appendChild(ul);
        resultsContainer.style.display = 'block'; // Show the popup
    } else {
        resultsContainer.innerHTML = "<p>No results found.</p>";
        resultsContainer.style.display = 'block'; // Show the popup with "no results" message
    }
});

// Hide results when clicking outside
document.addEventListener("click", function (event) {
    const resultsContainer = document.getElementById("liveSearchResults");
    const searchInput = document.getElementById("searchInput");

    if (!searchInput.contains(event.target) && !resultsContainer.contains(event.target)) {
        resultsContainer.style.display = 'none';
    }
});
