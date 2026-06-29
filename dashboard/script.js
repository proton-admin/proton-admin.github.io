// ======================================================
// Dashboard Configuration
// ======================================================

const CONFIG = {

    DATASETS: [
        {
            name: "TTSH Local Data (All)",
            file: "ttsh-local-data-all.csv"
        },
        {
            name: "TTSH Local Data (No Duplicates)",
            file: "ttsh-local-data-no-duplicates.csv"
        },
        {
            name: "PROTON Data (Online)",
            file: "proton-online-data.csv"
        }
    ],

    CATEGORY_COLUMN: "Category",
    VALUE_COLUMN: "Count",
    FILTER_COLUMN: "Filter"

};


// ======================================================
// Global State
// ======================================================

let currentDataset = CONFIG.DATASETS[0];

let data = [];
let filteredData = [];

let chart = null;


// ======================================================
// Startup
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    createDatasetButtons();

    attachEventListeners();

    loadDataset(currentDataset);

});


// ======================================================
// Event Listeners
// ======================================================

function attachEventListeners() {

    document
        .getElementById("filterDropdown")
        .addEventListener("change", updateDashboard);

    document
        .getElementById("searchBox")
        .addEventListener("input", updateDashboard);

}


// ======================================================
// Dataset Switch Buttons
// ======================================================

function createDatasetButtons() {

    const container =
        document.getElementById("datasetSwitcher");

    container.innerHTML = "";

    CONFIG.DATASETS.forEach(dataset => {

        const button = document.createElement("button");

        button.className = "dataset-btn";

        if (dataset.file === currentDataset.file) {

            button.classList.add("active");

        }

        button.textContent = dataset.name;

        button.onclick = () => {

            currentDataset = dataset;

            document
                .querySelectorAll(".dataset-btn")
                .forEach(b => b.classList.remove("active"));

            button.classList.add("active");

            loadDataset(dataset);

        };

        container.appendChild(button);

    });

}


// ======================================================
// Load CSV
// ======================================================

function loadDataset(dataset) {

    Papa.parse(dataset.file, {

        download: true,

        header: true,

        skipEmptyLines: true,

        dynamicTyping: true,

        complete: function(results) {

            data = results.data;

            populateFilterDropdown();

            updateDashboard();

        }

    });

}


// ======================================================
// Populate Filter Dropdown
// ======================================================

function populateFilterDropdown() {

    const dropdown =
        document.getElementById("filterDropdown");

    const previousValue = dropdown.value;

    dropdown.innerHTML = "";

    const uniqueValues = [

        ...new Set(

            data

                .map(row => row[CONFIG.FILTER_COLUMN])

                .filter(value =>
                    value !== undefined &&
                    value !== null &&
                    String(value).trim() !== ""
                )

        )

    ].sort();

    console.log(data);

    uniqueValues.forEach(value => {

        dropdown.add(new Option(value, value));

    });

    if ([...dropdown.options].some(o => o.value === previousValue)) {

        dropdown.value = previousValue;

    }

}


// ======================================================
// Apply Filters
// ======================================================

function applyFilters() {

    filteredData = [...data];

    const selectedFilter =
        document.getElementById("filterDropdown").value;

    const search =
        document.getElementById("searchBox")
            .value
            .trim()
            .toLowerCase();

    if (selectedFilter !== "All") {

        filteredData = filteredData.filter(row =>

            row[CONFIG.FILTER_COLUMN] === selectedFilter

        );

    }

    if (search !== "") {

        filteredData = filteredData.filter(row =>

            Object.values(row).some(value =>

                String(value)
                    .toLowerCase()
                    .includes(search)

            )

        );

    }

}


// ======================================================
// Main Update Function
// ======================================================

function updateDashboard() {

    applyFilters();

    updateChart();

    updateSummaryTable();

    updateRawTable();

}

// ======================================================
// Chart
// ======================================================

function updateChart() {

    const labels = filteredData.map(row =>
        row[CONFIG.CATEGORY_COLUMN]
    );

    const values = filteredData.map(row =>
        Number(row[CONFIG.VALUE_COLUMN]) || 0
    );

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(
        document.getElementById("chart"),
        {
            type: "bar",

            data: {
                labels: labels,

                datasets: [
                    {
                        label: CONFIG.VALUE_COLUMN,
                        data: values,
                        borderWidth: 1
                    }
                ]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false
                    }

                },

                scales: {

                    y: {

                        beginAtZero: true

                    }

                }

            }

        }
    );

}


// ======================================================
// Summary Table
// ======================================================

function updateSummaryTable() {

    const tbody =
        document.getElementById("countTable");

    tbody.innerHTML = "";

    filteredData.forEach(row => {

        const tr = document.createElement("tr");

        tr.innerHTML = `

            <td>${row[CONFIG.CATEGORY_COLUMN]}</td>

            <td>${Number(
                row[CONFIG.VALUE_COLUMN]
            ).toLocaleString()}</td>

        `;

        tbody.appendChild(tr);

    });

}


// ======================================================
// Raw Data Table
// ======================================================

function updateRawTable() {

    const table =
        document.getElementById("rawTable");

    table.innerHTML = "";

    if (filteredData.length === 0) {

        table.innerHTML =
            "<tr><td>No matching rows.</td></tr>";

        return;

    }

    const columns =
        Object.keys(filteredData[0]);



    // ---------- Header ----------

    const thead =
        document.createElement("thead");

    const headerRow =
        document.createElement("tr");

    columns.forEach(column => {

        const th =
            document.createElement("th");

        th.textContent = column;

        headerRow.appendChild(th);

    });

    thead.appendChild(headerRow);

    table.appendChild(thead);



    // ---------- Body ----------

    const tbody =
        document.createElement("tbody");

    filteredData.forEach(row => {

        const tr =
            document.createElement("tr");

        columns.forEach(column => {

            const td =
                document.createElement("td");

            td.textContent = row[column];

            tr.appendChild(td);

        });

        tbody.appendChild(tr);

    });

    table.appendChild(tbody);

}