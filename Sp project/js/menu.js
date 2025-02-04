// Write code for fetching menu details using Axios API
// Assuming menu data is fetched from an API endpoint
function filterMenuByCategory() {
    const selectedCategory = document.getElementById('categorySelector').value;
    const rows = document.querySelectorAll('#menuTable tbody tr');

    rows.forEach(row => {
        const category = row.getAttribute('data-category');
        if (selectedCategory === "" || category === selectedCategory) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}
