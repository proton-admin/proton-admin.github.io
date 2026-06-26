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

function initialize(){

    const dropdown = document.getElementById("groupBy");

    const columns = Object.keys(data[0]);

    columns.forEach(col=>{

        const option=document.createElement("option");

        option.value=col;

        option.textContent=col;

        dropdown.appendChild(option);

    });

    dropdown.selectedIndex=0;

    updateDashboard();

    dropdown.addEventListener("change",updateDashboard);

}

function updateDashboard(){

    const column=document.getElementById("groupBy").value;

    const counts={};

    data.forEach(row=>{

        const value=row[column] || "(Blank)";

        counts[value]=(counts[value]||0)+1;

    });

    const labels=Object.keys(counts).sort();

    const values=labels.map(l=>counts[l]);

    updateTable(labels,values,column);

    updateChart(labels,values,column);

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