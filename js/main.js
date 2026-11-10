/* global Chart, coreui */

/**
 * --------------------------------------------------------------------------
 * CoreUI Boostrap Admin Template main.js
 * Licensed under MIT (https://github.com/coreui/coreui-free-bootstrap-admin-template/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

/**
 * Dashboard Charts
 *
 * This module initializes and manages all charts on the main Dashboard page (index.html).
 * It includes:
 * - Card charts (small charts in statistic cards)
 * - Main chart (large chart showing traffic/metrics over time)
 * - Custom tooltip configuration using CoreUI's ChartJS utilities
 * - Theme-aware chart updates (responds to dark/light mode changes)
 *
 * All charts use Chart.js with CoreUI's custom styling and color variables.
 */

// Configure Chart.js defaults for custom tooltips
Chart.defaults.pointHitDetectionRadius = 1;
Chart.defaults.plugins.tooltip.enabled = false;
Chart.defaults.plugins.tooltip.mode = 'index';
Chart.defaults.plugins.tooltip.position = 'nearest';
Chart.defaults.plugins.tooltip.external = coreui.ChartJS.customTooltips;
Chart.defaults.defaultFontColor = coreui.Utils.getStyle('--cui-body-color');
document.documentElement.addEventListener('ColorSchemeChange', () => {
  cardChart1.data.datasets[0].pointBackgroundColor = coreui.Utils.getStyle('--cui-primary');
  cardChart2.data.datasets[0].pointBackgroundColor = coreui.Utils.getStyle('--cui-info');
  mainChart.options.scales.x.grid.color = coreui.Utils.getStyle('--cui-border-color-translucent');
  mainChart.options.scales.x.ticks.color = coreui.Utils.getStyle('--cui-body-color');
  mainChart.options.scales.y.border.color = coreui.Utils.getStyle('--cui-border-color-translucent');
  mainChart.options.scales.y.grid.color = coreui.Utils.getStyle('--cui-border-color-translucent');
  mainChart.options.scales.y.ticks.color = coreui.Utils.getStyle('--cui-body-color');
  cardChart1.update();
  cardChart2.update();
  mainChart.update();
});

/**
 * Generates a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer between min and max
 */
const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const cardChart1 = new Chart(document.getElementById('card-chart1'), {
  type: 'line',
  data: {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [{
      label: 'My First dataset',
      backgroundColor: 'transparent',
      borderColor: 'rgba(255,255,255,.55)',
      pointBackgroundColor: coreui.Utils.getStyle('--cui-primary'),
      data: [65, 59, 84, 84, 51, 55, 40]
    }]
  },
  options: {
    plugins: {
      legend: {
        display: false
      }
    },
    maintainAspectRatio: false,
    scales: {
      x: {
        border: {
          display: false
        },
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          display: false
        }
      },
      y: {
        min: 30,
        max: 89,
        display: false,
        grid: {
          display: false
        },
        ticks: {
          display: false
        }
      }
    },
    elements: {
      line: {
        borderWidth: 1,
        tension: 0.4
      },
      point: {
        radius: 4,
        hitRadius: 10,
        hoverRadius: 4
      }
    }
  }
});
const cardChart2 = new Chart(document.getElementById('card-chart2'), {
  type: 'line',
  data: {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [{
      label: 'My First dataset',
      backgroundColor: 'transparent',
      borderColor: 'rgba(255,255,255,.55)',
      pointBackgroundColor: coreui.Utils.getStyle('--cui-info'),
      data: [1, 18, 9, 17, 34, 22, 11]
    }]
  },
  options: {
    plugins: {
      legend: {
        display: false
      }
    },
    maintainAspectRatio: false,
    scales: {
      x: {
        border: {
          display: false
        },
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          display: false
        }
      },
      y: {
        min: -9,
        max: 39,
        display: false,
        grid: {
          display: false
        },
        ticks: {
          display: false
        }
      }
    },
    elements: {
      line: {
        borderWidth: 1
      },
      point: {
        radius: 4,
        hitRadius: 10,
        hoverRadius: 4
      }
    }
  }
});

// eslint-disable-next-line no-unused-vars
const cardChart3 = new Chart(document.getElementById('card-chart3'), {
  type: 'line',
  data: {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [{
      label: 'My First dataset',
      backgroundColor: 'rgba(255,255,255,.2)',
      borderColor: 'rgba(255,255,255,.55)',
      data: [78, 81, 80, 45, 34, 12, 40],
      fill: true
    }]
  },
  options: {
    plugins: {
      legend: {
        display: false
      }
    },
    maintainAspectRatio: false,
    scales: {
      x: {
        display: false
      },
      y: {
        display: false
      }
    },
    elements: {
      line: {
        borderWidth: 2,
        tension: 0.4
      },
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 4
      }
    }
  }
});

// eslint-disable-next-line no-unused-vars
const cardChart4 = new Chart(document.getElementById('card-chart4'), {
  type: 'bar',
  data: {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April'],
    datasets: [{
      label: 'My First dataset',
      backgroundColor: 'rgba(255,255,255,.2)',
      borderColor: 'rgba(255,255,255,.55)',
      data: [78, 81, 80, 45, 34, 12, 40, 85, 65, 23, 12, 98, 34, 84, 67, 82],
      barPercentage: 0.6
    }]
  },
  options: {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawTicks: false
        },
        ticks: {
          display: false
        }
      },
      y: {
        border: {
          display: false
        },
        grid: {
          display: false,
          drawBorder: false,
          drawTicks: false
        },
        ticks: {
          display: false
        }
      }
    }
  }
});

// ---------------------------------------------------------------------------
// Main chart: r/kallmann_syndrome posts per month, filtered by a date range
// (data: js/kallmann-posts-data.js)
// ---------------------------------------------------------------------------

// All dates are handled as UTC midnight so local time zones can't shift a post into another day.
const parseISODate = value => {
  const [year, month, day] = value.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
};
const formatDate = (time, options) => new Date(time).toLocaleDateString('en-US', {timeZone: 'UTC', ...options});
const monthStart = time => {
  const date = new Date(time);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
};
const nextMonth = time => {
  const date = new Date(time);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
};

// Counts posts per month between `from` and `to` (inclusive). Months with no posts are included
// as 0. If the range starts or ends mid-month, only the days inside the range are counted.
const countPostsPerMonth = (from, to) => {
  const labels = [];
  const counts = [];
  const indexByMonth = new Map();
  for (let time = monthStart(from); time <= to; time = nextMonth(time)) {
    indexByMonth.set(time, counts.length);
    labels.push(formatDate(time, {month: 'short', year: 'numeric'}));
    counts.push(0);
  }
  for (const [day, count] of KALLMANN_DAILY_POSTS) {
    const time = parseISODate(day);
    if (time >= from && time <= to) {
      counts[indexByMonth.get(monthStart(time))] += count;
    }
  }
  return {labels, counts};
};

const mainChart = new Chart(document.getElementById('main-chart'), {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Posts',
      backgroundColor: `rgba(${coreui.Utils.getStyle('--cui-info-rgb')}, .1)`,
      borderColor: coreui.Utils.getStyle('--cui-info'),
      pointHoverBackgroundColor: '#fff',
      borderWidth: 2,
      data: [],
      fill: true,
      // Smooth curve that never overshoots below 0 between empty periods
      cubicInterpolationMode: 'monotone'
    }]
  },
  options: {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          color: coreui.Utils.getStyle('--cui-border-color-translucent'),
          drawOnChartArea: false
        },
        ticks: {
          color: coreui.Utils.getStyle('--cui-body-color'),
          maxRotation: 0,
          autoSkipPadding: 16
        }
      },
      y: {
        border: {
          color: coreui.Utils.getStyle('--cui-border-color-translucent')
        },
        beginAtZero: true,
        grid: {
          color: coreui.Utils.getStyle('--cui-border-color-translucent')
        },
        ticks: {
          color: coreui.Utils.getStyle('--cui-body-color'),
          maxTicksLimit: 6,
          precision: 0
        }
      }
    },
    elements: {
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 4,
        hoverBorderWidth: 3
      }
    }
  }
});

// ---------- Controls: date range ----------
const mainChartFrom = document.getElementById('main-chart-from');
const mainChartTo = document.getElementById('main-chart-to');
const mainChartError = document.getElementById('main-chart-error');
const mainChartSubtitle = document.getElementById('main-chart-subtitle');
const DATA_START = parseISODate(KALLMANN_POSTS_RANGE.start);
const DATA_END = parseISODate(KALLMANN_POSTS_RANGE.end);
const LONG_DATE = {month: 'long', day: 'numeric', year: 'numeric'};

const resetMainChartRange = () => {
  mainChartFrom.value = KALLMANN_POSTS_RANGE.start;
  mainChartTo.value = KALLMANN_POSTS_RANGE.end;
};

const showMainChartError = message => {
  mainChartError.textContent = message;
  mainChartFrom.classList.toggle('is-invalid', Boolean(message));
  mainChartTo.classList.toggle('is-invalid', Boolean(message));
};

const updateMainChart = () => {
  if (!mainChartFrom.value || !mainChartTo.value) {
    showMainChartError('Enter both a start and an end date.');
    return;
  }
  if (mainChartFrom.value > mainChartTo.value) {
    showMainChartError('The start date must be on or before the end date.');
    return;
  }
  // Keep the range inside the period the data covers
  const from = Math.max(parseISODate(mainChartFrom.value), DATA_START);
  const to = Math.min(parseISODate(mainChartTo.value), DATA_END);
  if (from > to) {
    showMainChartError(`Data covers ${formatDate(DATA_START, LONG_DATE)} to ${formatDate(DATA_END, LONG_DATE)}.`);
    return;
  }
  showMainChartError('');

  const {labels, counts} = countPostsPerMonth(from, to);
  const total = counts.reduce((sum, count) => sum + count, 0);
  mainChart.data.labels = labels;
  mainChart.data.datasets[0].data = counts;
  // With only a month or two there's no line to speak of, so show the points
  mainChart.data.datasets[0].pointRadius = counts.length < 3 ? 4 : 0;
  mainChart.update();

  mainChartSubtitle.textContent = `r/kallmann_syndrome, ${formatDate(from, LONG_DATE)} - ${formatDate(to, LONG_DATE)} · ${total.toLocaleString('en-US')} ${total === 1 ? 'post' : 'posts'}`;
};

for (const input of [mainChartFrom, mainChartTo]) {
  input.min = KALLMANN_POSTS_RANGE.start;
  input.max = KALLMANN_POSTS_RANGE.end;
  input.addEventListener('change', updateMainChart);
}
document.getElementById('main-chart-reset').addEventListener('click', () => {
  resetMainChartRange();
  updateMainChart();
});

resetMainChartRange();
updateMainChart();
