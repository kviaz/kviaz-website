async function loadInclude(id, file) {
    const container = document.getElementById(id);

    if (!container) return;

    try {
        const response = await fetch(file);

        if (!response.ok) {
            throw new Error(`Unable to load ${file}`);
        }

        container.innerHTML = await response.text();
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadInclude("site-header", "/assets/includes/header.html");
    loadInclude("site-footer", "/assets/includes/footer.html");
});