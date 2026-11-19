const navToggle = document.querySelector(".nav-toggle");
        const navLinks = document.querySelector(".nav-links");

        if (navToggle && navLinks) {
            navToggle.addEventListener("click", function () {
                const isOpen = navLinks.classList.toggle("open");
                navToggle.setAttribute("aria-expanded", isOpen);
                navToggle.textContent = isOpen ? "✕" : "☰";
                navToggle.setAttribute("aria-label", isOpen ? "Menu sluiten" : "Menu openen");
            });
        }