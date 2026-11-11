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
// Posts with their date parsed once, oldest first (data: js/kallmann-posts-data.js)
const kallmannPosts = KALLMANN_POSTS.map(post => ({...post, time: parseISODate(post.date)}));

const countPostsPerMonth = (from, to) => {
  const labels = [];
  const counts = [];
  const indexByMonth = new Map();
  for (let time = monthStart(from); time <= to; time = nextMonth(time)) {
    indexByMonth.set(time, counts.length);
    labels.push(formatDate(time, {month: 'short', year: 'numeric'}));
    counts.push(0);
  }
  for (const post of kallmannPosts) {
    if (post.time >= from && post.time <= to) {
      counts[indexByMonth.get(monthStart(post.time))] += 1;
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

// ---------- Date range controls (shared by the dashboard charts) ----------
const DATA_START = parseISODate(KALLMANN_POSTS_RANGE.start);
const DATA_END = parseISODate(KALLMANN_POSTS_RANGE.end);
const LONG_DATE = {month: 'long', day: 'numeric', year: 'numeric'};
const formatRange = (from, to) => `${formatDate(from, LONG_DATE)} - ${formatDate(to, LONG_DATE)}`;
const pluralize = (count, word) => `${count.toLocaleString('en-US')} ${count === 1 ? word : `${word}s`}`;

// Wires up the `<prefix>-from`, `<prefix>-to`, `<prefix>-reset` and `<prefix>-error` elements.
// Calls onChange(from, to) with a valid range (UTC timestamps) clamped to the data's period.
// Returns a function that re-runs onChange with the current range (for other controls).
const setupDateRange = (prefix, onChange) => {
  const fromInput = document.getElementById(`${prefix}-from`);
  const toInput = document.getElementById(`${prefix}-to`);
  const errorElement = document.getElementById(`${prefix}-error`);

  const showError = message => {
    errorElement.textContent = message;
    fromInput.classList.toggle('is-invalid', Boolean(message));
    toInput.classList.toggle('is-invalid', Boolean(message));
  };

  const update = () => {
    if (!fromInput.value || !toInput.value) {
      showError('Enter both a start and an end date.');
      return;
    }
    if (fromInput.value > toInput.value) {
      showError('The start date must be on or before the end date.');
      return;
    }
    const from = Math.max(parseISODate(fromInput.value), DATA_START);
    const to = Math.min(parseISODate(toInput.value), DATA_END);
    if (from > to) {
      showError(`Data covers ${formatRange(DATA_START, DATA_END)}.`);
      return;
    }
    showError('');
    onChange(from, to);
  };

  const reset = () => {
    fromInput.value = KALLMANN_POSTS_RANGE.start;
    toInput.value = KALLMANN_POSTS_RANGE.end;
    update();
  };

  for (const input of [fromInput, toInput]) {
    input.min = KALLMANN_POSTS_RANGE.start;
    input.max = KALLMANN_POSTS_RANGE.end;
    input.addEventListener('change', update);
  }
  document.getElementById(`${prefix}-reset`).addEventListener('click', reset);
  reset();
  return update;
};

// Small DOM helper: element with optional class names and text (text is never parsed as HTML)
const createElement = (tag, className = '', text = '') => {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text) {
    element.textContent = text;
  }
  return element;
};

// ---------- Poster type / post type doughnuts (follow the line chart's date range) ----------
// Fixed color order, checked for color-vision deficiencies with the dataviz palette validator.
// A category keeps its color whatever its rank; "Unknown" is always neutral gray.
const CATEGORY_COLORS = ['#9b2018', '#c79e41', '#3862a7', '#5cc6b9', '#59894f'];
const NEUTRAL_COLOR = '#aab3c5';
const colorsFor = order => {
  const colors = new Map();
  let slot = 0;
  for (const name of order) {
    colors.set(name, name === 'Unknown' ? NEUTRAL_COLOR : CATEGORY_COLORS[slot++] || NEUTRAL_COLOR);
  }
  return colors;
};
const WHO_COLORS = colorsFor(KALLMANN_WHO_ORDER);
const WHAT_COLORS = colorsFor(KALLMANN_WHAT_ORDER);
const formatPercent = share => (share > 0 && share < 0.005 ? '<1%' : `${Math.round(share * 100)}%`);

const swatch = color => {
  const element = createElement('span', 'swatch');
  element.style.background = color;
  return element;
};

// Builds one doughnut with its legend table; returns update(countsByCategory, postCount) → total counted
const createBreakdown = (prefix, order, colors) => {
  const legend = document.getElementById(`${prefix}-legend`);
  const center = document.getElementById(`${prefix}-center`);
  const chart = new Chart(document.getElementById(`${prefix}-chart`), {
    type: 'doughnut',
    data: {
      labels: order,
      datasets: [{
        data: [],
        backgroundColor: order.map(name => colors.get(name)),
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 4
      }]
    },
    options: {
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: context => {
              const total = context.dataset.data.reduce((sum, count) => sum + count, 0);
              return `${context.label}: ${context.parsed} (${formatPercent(context.parsed / total)})`;
            }
          }
        }
      }
    }
  });

  return (counts, postCount) => {
    const rows = order.map(name => ({name, count: counts.get(name) || 0}));
    const total = rows.reduce((sum, row) => sum + row.count, 0);
    chart.data.datasets[0].data = rows.map(row => row.count);
    chart.update();

    center.replaceChildren(createElement('strong', '', postCount.toLocaleString('en-US')), createElement('span', '', postCount === 1 ? 'post' : 'posts'));

    const legendRows = rows.filter(row => row.count > 0).map(row => {
      const tr = createElement('tr');
      const name = createElement('td');
      name.append(swatch(colors.get(row.name)), row.name);
      tr.append(name, createElement('td', 'num', String(row.count)), createElement('td', 'num text-body-secondary', formatPercent(row.count / total)));
      return tr;
    });
    if (legendRows.length === 0) {
      const tr = createElement('tr');
      tr.append(createElement('td', 'text-body-secondary', 'No posts in this range.'));
      legendRows.push(tr);
    }
    const tbody = createElement('tbody');
    tbody.append(...legendRows);
    legend.replaceChildren(tbody);
    return total;
  };
};

const updateWhoBreakdown = createBreakdown('who', KALLMANN_WHO_ORDER, WHO_COLORS);
const updateWhatBreakdown = createBreakdown('what', KALLMANN_WHAT_ORDER, WHAT_COLORS);
const breakdownSubtitle = document.getElementById('breakdown-subtitle');
const whatNote = document.getElementById('what-note');

const updateBreakdowns = (posts, from, to) => {
  const whoCounts = new Map();
  const whatCounts = new Map();
  for (const post of posts) {
    whoCounts.set(post.who, (whoCounts.get(post.who) || 0) + 1);
    for (const what of post.what) {
      whatCounts.set(what, (whatCounts.get(what) || 0) + 1);
    }
  }
  updateWhoBreakdown(whoCounts, posts.length);
  const labelTotal = updateWhatBreakdown(whatCounts, posts.length);

  // A few posts have more than one post type, so that doughnut counts labels rather than posts
  const multiLabel = posts.filter(post => post.what.length > 1).length;
  whatNote.textContent = labelTotal > posts.length ?
    `Counts labels, not posts: ${multiLabel} ${multiLabel === 1 ? 'post has' : 'posts have'} more than one post type.` :
    '';
  breakdownSubtitle.textContent = `${formatRange(from, to)} · ${pluralize(posts.length, 'post')}`;
};

// ---------- Posts list: 10 per page, filterable (follows the line chart's date range) ----------
const POSTS_PER_PAGE = 10;
const postsList = document.getElementById('posts-list');
const postsSummary = document.getElementById('posts-summary');
const postsPageInfo = document.getElementById('posts-page-info');
const postsPagination = document.getElementById('posts-pagination');
const postsWhoSelect = document.getElementById('posts-who');
const postsWhatSelect = document.getElementById('posts-what');
const postsState = {inRange: [], page: 1};

for (const name of KALLMANN_WHO_ORDER) {
  postsWhoSelect.add(new Option(name, name));
}
for (const name of KALLMANN_WHAT_ORDER) {
  postsWhatSelect.add(new Option(name, name));
}

const postTag = (label, colors) => {
  const tag = createElement('span', 'post-tag');
  tag.append(swatch(colors.get(label) || NEUTRAL_COLOR), label);
  return tag;
};

const postItem = post => {
  const item = createElement('li', 'list-group-item py-3');
  const title = createElement('a', 'post-title', post.title || '(untitled post)');
  if (/^https:\/\/(www\.)?reddit\.com\//.test(post.url)) {
    title.href = post.url;
    title.target = '_blank';
    title.rel = 'noopener noreferrer';
  }

  const meta = createElement('div', 'd-flex flex-wrap align-items-center gap-2 small text-body-secondary my-1');
  meta.append(
    createElement('span', '', formatDate(post.time, {month: 'short', day: 'numeric', year: 'numeric'})),
    postTag(post.who, WHO_COLORS),
    ...post.what.map(what => postTag(what, WHAT_COLORS))
  );

  item.append(title, meta);
  if (post.snippet) {
    item.append(createElement('p', 'mb-1', post.snippet));
  }
  item.append(createElement('div', 'small text-body-secondary', `${pluralize(post.score, 'point')} · ${pluralize(post.comments, 'comment')}`));
  return item;
};

// Page numbers to show: first, last, and the current page's neighbours, with gaps marked null
const visiblePages = (current, count) => {
  const pages = [...new Set([1, current - 1, current, current + 1, count])]
    .filter(page => page >= 1 && page <= count)
    .sort((a, b) => a - b);
  const withGaps = [];
  for (const [index, page] of pages.entries()) {
    if (index > 0 && page - pages[index - 1] > 1) {
      withGaps.push(null);
    }
    withGaps.push(page);
  }
  return withGaps;
};

const pageItem = (label, page, {active = false, disabled = false, ariaLabel = ''} = {}) => {
  const item = createElement('li', `page-item${active ? ' active' : ''}${disabled ? ' disabled' : ''}`);
  const button = createElement('button', 'page-link', label);
  button.type = 'button';
  button.disabled = disabled;
  if (ariaLabel) {
    button.setAttribute('aria-label', ariaLabel);
  }
  if (active) {
    button.setAttribute('aria-current', 'page');
  }
  button.addEventListener('click', () => {
    postsState.page = page;
    renderPosts();
  });
  item.append(button);
  return item;
};

const renderPagination = pageCount => {
  if (pageCount <= 1) {
    postsPagination.replaceChildren();
    return;
  }
  const {page} = postsState;
  const items = [pageItem('‹', page - 1, {disabled: page === 1, ariaLabel: 'Previous page'})];
  for (const number of visiblePages(page, pageCount)) {
    if (number === null) {
      const gap = createElement('li', 'page-item disabled');
      gap.append(createElement('span', 'page-link', '…'));
      items.push(gap);
    } else {
      items.push(pageItem(String(number), number, {active: number === page, ariaLabel: `Page ${number}`}));
    }
  }
  items.push(pageItem('›', page + 1, {disabled: page === pageCount, ariaLabel: 'Next page'}));
  postsPagination.replaceChildren(...items);
};

function renderPosts() {
  const who = postsWhoSelect.value;
  const what = postsWhatSelect.value;
  const matches = postsState.inRange.filter(post => (!who || post.who === who) && (!what || post.what.includes(what)));
  const pageCount = Math.max(1, Math.ceil(matches.length / POSTS_PER_PAGE));
  postsState.page = Math.min(Math.max(postsState.page, 1), pageCount);

  const start = (postsState.page - 1) * POSTS_PER_PAGE;
  const pagePosts = matches.slice(start, start + POSTS_PER_PAGE);
  postsList.replaceChildren(...(pagePosts.length > 0 ?
    pagePosts.map(post => postItem(post)) :
    [createElement('li', 'list-group-item py-4 text-center text-body-secondary', 'No posts match these filters in this date range.')]));

  postsPageInfo.textContent = matches.length > 0 ?
    `Showing ${start + 1}–${start + pagePosts.length} of ${pluralize(matches.length, 'post')}` :
    '';
  renderPagination(pageCount);
}

for (const select of [postsWhoSelect, postsWhatSelect]) {
  select.addEventListener('change', () => {
    postsState.page = 1;
    renderPosts();
  });
}

const updatePostsList = (posts, from, to) => {
  postsState.inRange = [...posts].reverse(); // newest first
  postsState.page = 1;
  postsSummary.textContent = `${formatRange(from, to)} · newest first`;
  renderPosts();
};

// ---------- Main chart: posts per month (its date range also drives the doughnuts and posts list) ----------
const mainChartSubtitle = document.getElementById('main-chart-subtitle');
setupDateRange('main-chart', (from, to) => {
  const {labels, counts} = countPostsPerMonth(from, to);
  const total = counts.reduce((sum, count) => sum + count, 0);
  mainChart.data.labels = labels;
  mainChart.data.datasets[0].data = counts;
  // With only a month or two there's no line to speak of, so show the points
  mainChart.data.datasets[0].pointRadius = counts.length < 3 ? 4 : 0;
  mainChart.update();
  mainChartSubtitle.textContent = `r/kallmann_syndrome, ${formatRange(from, to)} · ${pluralize(total, 'post')}`;

  const postsInRange = kallmannPosts.filter(post => post.time >= from && post.time <= to);
  updateBreakdowns(postsInRange, from, to);
  updatePostsList(postsInRange, from, to);
});

// ---------------------------------------------------------------------------
// Predictions chart: actual vs. predicted category counts for the test set
// (data: js/kallmann-predictions-data.js, built by scripts/build_predictions_data.py)
// ---------------------------------------------------------------------------
const predictionsModelSelect = document.getElementById('predictions-chart-model');
const predictionsSubtitle = document.getElementById('predictions-chart-subtitle');
const predictionPosts = KALLMANN_PREDICTION_POSTS.map(([date, actual, ...predicted]) => ({
  time: parseISODate(date),
  actual,
  predicted
}));

for (const [index, model] of KALLMANN_PREDICTION_MODELS.entries()) {
  predictionsModelSelect.add(new Option(model.name, String(index)));
}

const predictionsChart = new Chart(document.getElementById('predictions-chart'), {
  type: 'bar',
  data: {
    labels: KALLMANN_PREDICTION_CATEGORIES,
    datasets: [{
      label: 'Actual',
      backgroundColor: coreui.Utils.getStyle('--cui-primary'),
      data: []
    }, {
      label: 'Predicted',
      backgroundColor: coreui.Utils.getStyle('--cui-info'),
      data: []
    }]
  },
  options: {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: coreui.Utils.getStyle('--cui-body-color'),
          boxWidth: 12
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: coreui.Utils.getStyle('--cui-body-color')
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Posts',
          color: coreui.Utils.getStyle('--cui-body-color')
        },
        border: {
          color: coreui.Utils.getStyle('--cui-border-color-translucent')
        },
        grid: {
          color: coreui.Utils.getStyle('--cui-border-color-translucent')
        },
        ticks: {
          color: coreui.Utils.getStyle('--cui-body-color'),
          precision: 0
        }
      }
    }
  }
});

let predictionsRange = [DATA_START, DATA_END];
const updatePredictionsChart = () => {
  const [from, to] = predictionsRange;
  const modelIndex = Number(predictionsModelSelect.value);
  const model = KALLMANN_PREDICTION_MODELS[modelIndex];
  const posts = predictionPosts.filter(post => post.time >= from && post.time <= to);

  const actualCounts = KALLMANN_PREDICTION_CATEGORIES.map(category => posts.filter(post => post.actual === category).length);
  const predictedCounts = KALLMANN_PREDICTION_CATEGORIES.map(category => posts.filter(post => post.predicted[modelIndex] === category).length);
  const correct = posts.filter(post => post.predicted[modelIndex] === post.actual).length;

  predictionsChart.data.datasets[0].data = actualCounts;
  predictionsChart.data.datasets[1].label = `Predicted (${model.name})`;
  predictionsChart.data.datasets[1].data = predictedCounts;
  predictionsChart.update();

  const accuracy = posts.length === 0 ?
    'no test posts in this range' :
    `${pluralize(posts.length, 'test post')} · ${model.name} labeled ${correct} correctly (${Math.round((100 * correct) / posts.length)}%)`;
  predictionsSubtitle.textContent = `${formatRange(from, to)} · ${accuracy}`;
};

predictionsModelSelect.addEventListener('change', updatePredictionsChart);
setupDateRange('predictions-chart', (from, to) => {
  predictionsRange = [from, to];
  updatePredictionsChart();
});
