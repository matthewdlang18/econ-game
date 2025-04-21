// Investment Odyssey - Charts

// Chart instances
let portfolioChart = null;
let priceHistoryChart = null;
let allocationChart = null;
let performanceChart = null;
let resultsChart = null;
let correlationHeatmap = null;

// Chart colors
const chartColors = {
  'S&P 500': 'rgba(54, 162, 235, 1)',
  'Bonds': 'rgba(75, 192, 192, 1)',
  'Real Estate': 'rgba(255, 159, 64, 1)',
  'Gold': 'rgba(255, 205, 86, 1)',
  'Commodities': 'rgba(153, 102, 255, 1)',
  'Bitcoin': 'rgba(255, 99, 132, 1)',
  portfolio: 'rgba(46, 123, 228, 1)',
  cash: 'rgba(201, 203, 207, 1)'
};

// Initialize charts
function initializeCharts() {
  // Create initial portfolio chart
  const portfolioCtx = document.getElementById('portfolio-chart').getContext('2d');
  portfolioChart = new Chart(portfolioCtx, {
    type: 'line',
    data: {
      labels: ['Start'],
      datasets: [{
        label: 'Portfolio Value',
        data: [10000],
        borderColor: chartColors.portfolio,
        backgroundColor: 'rgba(46, 123, 228, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Value: ${formatCurrency(context.raw)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            }
          }
        }
      }
    }
  });

  // Create price history chart
  const priceHistoryCtx = document.getElementById('price-history-chart').getContext('2d');
  priceHistoryChart = new Chart(priceHistoryCtx, {
    type: 'line',
    data: {
      labels: ['Start'],
      datasets: []
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
            }
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            }
          }
        }
      }
    }
  });

  // Create allocation chart
  const allocationCtx = document.getElementById('allocation-chart').getContext('2d');
  allocationChart = new Chart(allocationCtx, {
    type: 'doughnut',
    data: {
      labels: ['Cash'],
      datasets: [{
        data: [10000],
        backgroundColor: [chartColors.cash],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
            }
          }
        }
      }
    }
  });

  // Create performance chart
  const performanceCtx = document.getElementById('performance-chart').getContext('2d');
  performanceChart = new Chart(performanceCtx, {
    type: 'bar',
    data: {
      labels: ['Return'],
      datasets: [{
        label: 'Portfolio',
        data: [0],
        backgroundColor: chartColors.portfolio
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.raw.toFixed(2)}%`;
            }
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: function(value) {
              return `${value}%`;
            }
          }
        }
      }
    }
  });

  // Create correlation heatmap
  createCorrelationHeatmap();
}

// Create correlation heatmap
function createCorrelationHeatmap() {
  try {
    // Check if matrix chart type is available
    if (!Chart.controllers.matrix) {
      console.error('Matrix chart type not available. Skipping correlation heatmap.');
      return;
    }

    const correlationCtx = document.getElementById('correlation-heatmap').getContext('2d');

    // Correlation matrix data
    const assets = ['S&P 500', 'Bonds', 'Real Estate', 'Gold', 'Commodities', 'Bitcoin'];
    const correlationMatrix = [
      [1.0000, -0.5169, 0.3425, 0.0199, 0.1243, 0.4057],  // S&P 500
      [-0.5169, 1.0000, 0.0176, 0.0289, -0.0235, -0.2259], // Bonds
      [0.3425, 0.0176, 1.0000, -0.4967, -0.0334, 0.1559],  // Real Estate
      [0.0199, 0.0289, -0.4967, 1.0000, 0.0995, -0.5343],  // Gold
      [0.1243, -0.0235, -0.0334, 0.0995, 1.0000, 0.0436],  // Commodities
      [0.4057, -0.2259, 0.1559, -0.5343, 0.0436, 1.0000]   // Bitcoin
    ];

    // Create a simple table instead of matrix chart if not available
    if (!Chart.controllers.matrix) {
      const container = document.querySelector('.correlation-container');
      container.innerHTML = '';

      const table = document.createElement('table');
      table.className = 'correlation-table';

      // Create header row
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      headerRow.appendChild(document.createElement('th')); // Empty corner cell

      for (const asset of assets) {
        const th = document.createElement('th');
        th.textContent = asset;
        headerRow.appendChild(th);
      }

      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Create body rows
      const tbody = document.createElement('tbody');

      for (let i = 0; i < assets.length; i++) {
        const row = document.createElement('tr');

        // Row header
        const th = document.createElement('th');
        th.textContent = assets[i];
        row.appendChild(th);

        // Correlation values
        for (let j = 0; j < assets.length; j++) {
          const td = document.createElement('td');
          td.textContent = correlationMatrix[i][j].toFixed(4);

          // Add color coding
          const value = correlationMatrix[i][j];
          if (value < 0) {
            const intensity = Math.min(Math.abs(value) * 2, 1);
            td.style.backgroundColor = `rgba(255, ${Math.round(255 * (1 - intensity))}, ${Math.round(255 * (1 - intensity))}, 1)`;
          } else if (value > 0) {
            const intensity = Math.min(value * 2, 1);
            td.style.backgroundColor = `rgba(${Math.round(255 * (1 - intensity))}, ${Math.round(255 * (1 - intensity))}, 255, 1)`;
          }

          row.appendChild(td);
        }

        tbody.appendChild(row);
      }

      table.appendChild(tbody);
      container.appendChild(table);
      return;
    }

    // Prepare data for heatmap
    const data = [];
    for (let i = 0; i < assets.length; i++) {
      for (let j = 0; j < assets.length; j++) {
        data.push({
          x: assets[j],
          y: assets[i],
          v: correlationMatrix[i][j]
        });
      }
    }

    // Create heatmap
    correlationHeatmap = new Chart(correlationCtx, {
      type: 'matrix',
      data: {
        datasets: [{
          data: data,
          backgroundColor: function(context) {
            const value = context.dataset.data[context.dataIndex].v;

            // Color scale: red for negative, white for zero, blue for positive
            if (value < 0) {
              const intensity = Math.min(Math.abs(value) * 2, 1);
              return `rgba(255, ${Math.round(255 * (1 - intensity))}, ${Math.round(255 * (1 - intensity))}, 1)`;
            } else {
              const intensity = Math.min(value * 2, 1);
              return `rgba(${Math.round(255 * (1 - intensity))}, ${Math.round(255 * (1 - intensity))}, 255, 1)`;
            }
          },
          borderColor: 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          width: function(context) {
            return 30;
          },
          height: function(context) {
            return 30;
          }
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              title: function() {
                return '';
              },
              label: function(context) {
                const data = context.dataset.data[context.dataIndex];
                return `${data.y} to ${data.x}: ${data.v.toFixed(4)}`;
              }
            }
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 90,
              minRotation: 0
            }
          },
          y: {
            reverse: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Error creating correlation heatmap:', error);

    // Fallback to a simple message if chart creation fails
    const container = document.querySelector('.correlation-container');
    if (container) {
      container.innerHTML = '<div class="error-message">Unable to display correlation matrix. Please check the console for details.</div>';
    }
  }
}

// Update charts with game state and player state
function updateCharts(gameState, playerState) {
  updatePortfolioChart(playerState);
  updatePriceHistoryChart(gameState);
  updateAllocationChart(gameState, playerState);
  updatePerformanceChart(playerState);
}

// Update portfolio chart
function updatePortfolioChart(playerState) {
  const labels = Array.from({ length: playerState.portfolioValueHistory.length }, (_, i) => i === 0 ? 'Start' : `Round ${i}`);

  portfolioChart.data.labels = labels;
  portfolioChart.data.datasets[0].data = playerState.portfolioValueHistory;
  portfolioChart.update();
}

// Update price history chart
function updatePriceHistoryChart(gameState) {
  const labels = Array.from({ length: gameState.roundNumber + 1 }, (_, i) => i === 0 ? 'Start' : `Round ${i}`);

  // Clear existing datasets
  priceHistoryChart.data.datasets = [];

  // Add dataset for each asset
  for (const asset in gameState.priceHistory) {
    priceHistoryChart.data.datasets.push({
      label: asset,
      data: gameState.priceHistory[asset],
      borderColor: chartColors[asset],
      backgroundColor: 'transparent',
      borderWidth: 2,
      tension: 0.4
    });
  }

  priceHistoryChart.data.labels = labels;
  priceHistoryChart.update();
}

// Update allocation chart
function updateAllocationChart(gameState, playerState) {
  const labels = ['Cash'];
  const data = [playerState.cash];
  const backgroundColor = [chartColors.cash];

  // Add data for each asset in portfolio
  for (const asset in playerState.portfolio) {
    const quantity = playerState.portfolio[asset];
    if (quantity > 0) {
      const value = quantity * gameState.assetPrices[asset];
      labels.push(asset);
      data.push(value);
      backgroundColor.push(chartColors[asset]);
    }
  }

  allocationChart.data.labels = labels;
  allocationChart.data.datasets[0].data = data;
  allocationChart.data.datasets[0].backgroundColor = backgroundColor;
  allocationChart.update();
}

// Update performance chart
function updatePerformanceChart(playerState) {
  const initialValue = playerState.portfolioValueHistory[0];
  const currentValue = playerState.portfolioValueHistory[playerState.portfolioValueHistory.length - 1];
  const totalReturn = ((currentValue - initialValue) / initialValue) * 100;

  performanceChart.data.datasets[0].data = [totalReturn];
  performanceChart.update();
}

// Create results chart
function createResultsChart(portfolioValueHistory) {
  const resultsCtx = document.getElementById('results-chart').getContext('2d');

  if (resultsChart) {
    resultsChart.destroy();
  }

  const labels = Array.from({ length: portfolioValueHistory.length }, (_, i) => i === 0 ? 'Start' : `Round ${i}`);

  resultsChart = new Chart(resultsCtx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Portfolio Value',
        data: portfolioValueHistory,
        borderColor: chartColors.portfolio,
        backgroundColor: 'rgba(46, 123, 228, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Value: ${formatCurrency(context.raw)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            }
          }
        }
      }
    }
  });
}

// Format currency
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

// Export functions
window.Charts = {
  initializeCharts,
  updateCharts,
  createResultsChart
};
