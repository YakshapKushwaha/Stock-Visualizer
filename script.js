let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, fetching CSV...');
    fetch('dump.csv')
        .then(response => {
            if (!response.ok) throw new Error('CSV file not found or inaccessible');
            return response.text();
        })
        .then(csvText => {
            console.log('CSV fetched, parsing...');
            const data = Papa.parse(csvText, { header: true, skipEmptyLines: true }).data;
            console.log('Parsed data:', data);
            // Get unique index names
            const indices = [...new Set(data.map(item => item.index_name))];
            console.log('Unique indices:', indices);
            populateCompanyList(indices, data);
        })
        .catch(error => console.error('Error loading CSV:', error));
});

function populateCompanyList(indices, data) {
    const companyList = document.getElementById('company-list');
    console.log('Populating index list with:', indices);
    indices.forEach(index => {
        const item = document.createElement('div');
        item.className = 'list-group-item';
        item.textContent = index;
        item.addEventListener('click', () => {
            document.querySelectorAll('.list-group-item').forEach(el => 
                el.classList.remove('active'));
            item.classList.add('active');
            updateChart(index, data);
        });
        companyList.appendChild(item);
    });
}

function updateChart(index, data) {
    // Filter data for the selected index
    const indexData = data.filter(item => item.index_name === index);
    // Extract dates and closing values, handling NaN
    const dates = indexData.map(item => item.index_date);
    const closes = indexData.map(item => {
        const value = parseFloat(item.closing_index_value);
        return isNaN(value) ? null : value; // Convert NaN to null for Chart.js
    });

    document.getElementById('company-name').textContent = `${index} Index Value`;

    // Destroy previous chart instance if it exists
    if (chartInstance) {
        chartInstance.destroy();
    }

    const ctx = document.getElementById('stockChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Closing Index Value',
                data: closes,
                borderColor: '#007bff',
                tension: 0.1,
                fill: false,
                pointRadius: 3, // Show points on the line
                spanGaps: true // Connect gaps where data is null
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: { display: true, text: 'Date' }
                },
                y: {
                    title: { display: true, text: 'Index Value' },
                    beginAtZero: false // Adjust based on data range
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}