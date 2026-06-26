let data = [];
let chart;

Papa.parse("data.csv", {

    download: true,

    header: true,

    skipEmptyLines: true,

    complete: function(results){

        data = results.data;

        initialize();

    }

});

function initialize() {

    const groupDropdown = document.getElementById("groupBy");
    const countryDropdown = document.getElementById("countryFilter");

    const columns = Object.keys(data[0]);

    // Populate Country filter
    countryDropdown.innerHTML = "";

    const allOption = document.createElement("option");
    allOption.value = "All";
    allOption.textContent = "All";
    countryDropdown.appendChild(allOption);

    const countries = [...new Set(data.map(r => r.Country).filter(Boolean))].sort();

    countries.forEach(country => {
        const option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        countryDropdown.appendChild(option);
    });

    // Populate Group By dropdown
    groupDropdown.innerHTML = "";

    columns
        .filter(c => c !== "Country")
        .forEach(col => {

            const option = document.createElement("option");
            option.value = col;
            option.textContent = col;

            groupDropdown.appendChild(option);

        });

    groupDropdown.selectedIndex = 0;

    groupDropdown.addEventListener("change", updateDashboard);
    countryDropdown.addEventListener("change", updateDashboard);

    updateDashboard();
}

function updateDashboard() {

    const groupColumn = document.getElementById("groupBy").value;
    const selectedCountry = document.getElementById("countryFilter").value;

    let filteredData = data;

    if (selectedCountry !== "All") {

        filteredData = data.filter(
            row => row.Country === selectedCountry
        );

    }

    const counts = {};

    filteredData.forEach(row => {

        const value = row[groupColumn] || "(Blank)";

        counts[value] = (counts[value] || 0) + 1;

    });

    const labels = Object.keys(counts).sort();

    const values = labels.map(label => counts[label]);

    updateTable(labels, values, groupColumn);

    updateChart(labels, values, groupColumn);

}

function updateTable(labels,values,column){

    document.querySelector("th").textContent=column;

    const tbody=document.getElementById("countTable");

    tbody.innerHTML="";

    labels.forEach((label,i)=>{

        const tr=document.createElement("tr");

        tr.innerHTML=`
            <td>${label}</td>
            <td>${values[i]}</td>
        `;

        tbody.appendChild(tr);

    });

}

function updateChart(labels,values,column){

    if(chart){

        chart.destroy();

    }

    chart=new Chart(document.getElementById("chart"),{

        type:"line",

        data:{

            labels:labels,

            datasets:[{

                label:"Count",

                data:values,

                tension:0.3,

                fill:false

            }]

        },

        options:{

            responsive:true,

            plugins:{
                legend:{
                    display:false
                },
                title:{
                    display:true,
                    text:column
                }
            }

        }

    });

}