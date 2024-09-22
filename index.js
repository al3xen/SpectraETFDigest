const getData = async () => {
    const urlObj = new URL(window.location.href);

    const params = new URLSearchParams(urlObj.search);

    const etfId = params.get("etfId");

    if (etfId === null || etfId === undefined) {
        alert("You need to pass etfId as a query parameter!");

        return []
    }

    const response = await fetch("https://gyqg80p7x0.execute-api.eu-central-1.amazonaws.com/prod?etfId=" + etfId)
    const dataObj = (await response.json());
    const data = [];

    for (const [key, value] of Object.entries(dataObj)) {
        if (key === 'id') continue;
        data.push(value);
    }

    console.log("GOT DATA:", data);

    return data
};

(async () => {
    const transactions = await getData();

    transactions.sort((a, b) => new Date(a.openDateTime) - new Date(b.openDateTime));

    const dailyTotals = {};

    transactions.forEach(transaction => {
        const date = new Date(transaction.openDateTime).toLocaleDateString();
        const value = transaction.volume * transaction.openPrice;

        const signedValue = transaction.type === "buy" ? value : -value;

        if (dailyTotals[date] === undefined) {
            dailyTotals[date] = signedValue;
        } else {
            dailyTotals[date] += signedValue;
        }
    });

    const chartLabels = Object.keys(dailyTotals);
    const chartData = Object.values(dailyTotals);

    chartData.forEach((value, index) => {
        if (index > 0)
            chartData[index] = chartData[index - 1] + value   
    })


    //doughnut code
    const etfValues = {};
    let totalValue = 0;

    transactions.forEach(transaction => {
        const value = transaction.volume * transaction.openPrice;
        if (transaction.type === "buy") {
            if (!etfValues[transaction.etfAlias]) {
                etfValues[transaction.etfAlias] = 0;
            }
            etfValues[transaction.etfAlias] += value;
            totalValue += value;
        } else if (transaction.type === "sell") {
            if (!etfValues[transaction.etfAlias]) {
                etfValues[transaction.etfAlias] = 0;
            }
            etfValues[transaction.etfAlias] -= value;
            totalValue -= value;
        }
    });

    const doughnutLabels = Object.keys(etfValues);
    const doughnutData = Object.values(etfValues);

    //graph for account value regardless of ETF
    const ctx = document.getElementById('myChart');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Account Value',
                data: chartData,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderColor: 'rgba(0, 0, 0,)',
                borderWidth: 1,
                fill: true
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: 'white'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: 'white'
                    },
                    title: {
                        display: true,
                        text: 'Date',
                        color: 'white'
                    }
                },
                y: {
                    ticks: {
                        color: 'white'
                    },
                    title: {
                        display: true,
                        text: 'Account Value',
                        color: 'white'
                    }
                }
            }
        }
    });

    //ETF values doughnut chart
    const doughnutCtx = document.getElementById('myChart2');
    new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
            labels: doughnutLabels,
            datasets: [{
                label: 'ETF Values',
                data: doughnutData,
                backgroundColor: [
                    'rgba(213, 184, 255, 1)',
                    'rgba(241, 231, 254, 1)',
                    'rgba(102, 51, 153, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderColor: [
                    'rgba(0, 0, 0, 1)',
                    'rgba(0, 0, 0, 1)',
                    'rgba(0, 0, 0, 1)',
                    'rgba(0, 0, 0, 1)',
                    'rgba(0, 0, 0, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: 'white'
                    }
                }
            }
        }
    });

    //Menu animation
    document.addEventListener('DOMContentLoaded', function () {
        const burgerMenu = document.getElementById('burgerMenu');
        const sidebarMenu = document.getElementById('sidebarMenu');
        const closeBtn = document.getElementById('closeBtn');
        const content = document.getElementById('content');

        burgerMenu.addEventListener('click', function () {
            sidebarMenu.style.width = '250px';
            content.style.marginLeft = '250px';
        });

        closeBtn.addEventListener('click', function () {
            sidebarMenu.style.width = '0';
            content.style.marginLeft = '0';
        });


    });
})();