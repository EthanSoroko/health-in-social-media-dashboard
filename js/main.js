/* global Chart, coreui */

/**
 * --------------------------------------------------------------------------
 * CoreUI Boostrap Admin Template main.js
 * Licensed under MIT (https://github.com/coreui/coreui-free-bootstrap-admin-template/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

/**
 * Dashboard (index.html)
 *
 * Loads data/subreddits.json and each ready community's files from data/subreddits/<name>/
 * (format: data/README.md), then draws everything for the community picked in the header:
 * - Stat cards with posts-per-year sparklines
 * - Main chart (posts per month), poster/post type doughnuts, posts list and predictions chart
 * - Compare Communities table (all ready communities side by side)
 *
 * All charts use Chart.js with CoreUI's custom tooltips and color variables.
 */

// Configure Chart.js defaults for custom tooltips
Chart.defaults.pointHitDetectionRadius = 1;
Chart.defaults.plugins.tooltip.enabled = false;
Chart.defaults.plugins.tooltip.mode = 'index';
Chart.defaults.plugins.tooltip.position = 'nearest';
Chart.defaults.plugins.tooltip.external = coreui.ChartJS.customTooltips;
Chart.defaults.defaultFontColor = coreui.Utils.getStyle('--cui-body-color');

// ---------------------------------------------------------------------------
// Helpers
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
const yearOf = time => new Date(time).getUTCFullYear();

const SHORT_DATE = {month: 'short', day: 'numeric', year: 'numeric'};
const MONTH_YEAR = {month: 'long', year: 'numeric'};
const formatRange = (from, to) => `${formatDate(from, SHORT_DATE)} to ${formatDate(to, SHORT_DATE)}`;
const pluralize = (count, word) => `${count.toLocaleString('en-US')} ${count === 1 ? word : `${word}s`}`;
const formatPercent = share => (share > 0 && share < 0.005 ? '<1%' : `${Math.round(share * 100)}%`);
const unique = values => [...new Set(values)];

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

// ---------------------------------------------------------------------------
// Data loading: data/subreddits.json lists the communities; each ready one has
// data/subreddits/<name>/posts.json and, if "predictions" is true, predictions.json
// ---------------------------------------------------------------------------
const fetchJSON = async path => {
  const response = await fetch(path, {cache: 'no-cache'});
  if (!response.ok) {
    throw new Error(`${path} could not be loaded (${response.status} ${response.statusText})`);
  }
  return response.json();
};

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

const loadSubreddit = async subreddit => {
  const folder = `data/subreddits/${encodeURIComponent(subreddit.name)}`;
  const [postsFile, predictionsFile] = await Promise.all([
    fetchJSON(`${folder}/posts.json`),
    // Only requested when listed, so a community without predictions doesn't log a 404
    subreddit.predictions ? fetchJSON(`${folder}/predictions.json`) : null
  ]);
  if (!Array.isArray(postsFile?.posts) || postsFile.posts.length === 0) {
    throw new Error(`${folder}/posts.json has no posts`);
  }

  // Oldest first (the sort is stable, so posts on the same day keep their file order)
  const posts = postsFile.posts
    .map(post => ({...post, what: [].concat(post.what ?? []), time: parseISODate(post.date)}))
    .sort((a, b) => a.time - b.time);
  const range = postsFile.range ?? {start: posts[0].date, end: posts.at(-1).date};
  const whoOrder = postsFile.who_order ?? unique(posts.map(post => post.who));
  const whatOrder = postsFile.what_order ?? unique(posts.flatMap(post => post.what));

  return {
    ...subreddit,
    posts,
    range,
    start: parseISODate(range.start),
    end: parseISODate(range.end),
    whoOrder,
    whatOrder,
    whoColors: colorsFor(whoOrder),
    whatColors: colorsFor(whatOrder),
    predictions: predictionsFile && {
      models: predictionsFile.models,
      categories: predictionsFile.categories,
      posts: predictionsFile.posts.map(([date, actual, ...predicted]) => ({time: parseISODate(date), actual, predicted}))
    }
  };
};

// ---------------------------------------------------------------------------
// Date range controls (shared by the dashboard charts)
// ---------------------------------------------------------------------------

// Wires up the `<prefix>-from`, `<prefix>-to`, `<prefix>-reset` and `<prefix>-error` elements.
// Calls onChange(from, to) with a valid range (UTC timestamps) clamped to the community's period.
// setBounds(community) switches to another community's period and resets the inputs.
const createDateRange = (prefix, onChange) => {
  const fromInput = document.getElementById(`${prefix}-from`);
  const toInput = document.getElementById(`${prefix}-to`);
  const errorElement = document.getElementById(`${prefix}-error`);
  let bounds = null;

  const showError = message => {
    errorElement.textContent = message;
    fromInput.classList.toggle('is-invalid', Boolean(message));
    toInput.classList.toggle('is-invalid', Boolean(message));
  };

  const update = () => {
    if (!bounds) {
      return;
    }
    if (!fromInput.value || !toInput.value) {
      showError('Enter both a start and an end date.');
      return;
    }
    if (fromInput.value > toInput.value) {
      showError('The start date must be on or before the end date.');
      return;
    }
    const from = Math.max(parseISODate(fromInput.value), bounds.start);
    const to = Math.min(parseISODate(toInput.value), bounds.end);
    if (from > to) {
      showError(`Data covers ${formatRange(bounds.start, bounds.end)}.`);
      return;
    }
    showError('');
    onChange(from, to);
  };

  const reset = () => {
    fromInput.value = bounds.range.start;
    toInput.value = bounds.range.end;
    update();
  };

  for (const input of [fromInput, toInput]) {
    input.addEventListener('change', update);
  }
  document.getElementById(`${prefix}-reset`).addEventListener('click', () => bounds && reset());

  return {
    setBounds(community) {
      bounds = community;
      for (const input of [fromInput, toInput]) {
        input.min = community.range.start;
        input.max = community.range.end;
      }
      reset();
    }
  };
};

// The community currently shown (set by showSubreddit)
let current = null;

// ---------------------------------------------------------------------------
// Stat cards
// ---------------------------------------------------------------------------
const postsPerYear = community => {
  const years = [];
  for (let year = yearOf(community.start); year <= yearOf(community.end); year++) {
    years.push(year);
  }
  const counts = new Map(years.map(year => [year, 0]));
  for (const post of community.posts) {
    const year = yearOf(post.time);
    counts.set(year, (counts.get(year) || 0) + 1);
  }
  return {years, counts: years.map(year => counts.get(year))};
};

// Every post has a numeric comment count, so the total is meaningful
const hasCommentData = community => community.posts.every(post => Number.isFinite(post.comments));
const totalComments = community => community.posts.reduce((sum, post) => sum + post.comments, 0);
const patientShare = community => community.posts.filter(post => post.who === 'Patient').length / community.posts.length;
const busiestYear = community => {
  const {years, counts} = postsPerYear(community);
  const index = counts.indexOf(Math.max(...counts));
  return {year: years[index], count: counts[index]};
};

// Sparklines follow the CoreUI template's widget cards: line, line, area, bar.
// Line color follows the card's text color (white on maroon, dark on gold).
const sparkColor = (canvas, alpha) => {
  const rgb = getComputedStyle(canvas).color.match(/\d+/g).slice(0, 3).join(', ');
  return `rgba(${rgb}, ${alpha})`;
};
const createSparkline = (id, type, {fill = false} = {}) => {
  const canvas = document.getElementById(id);
  return new Chart(canvas, {
    type,
    data: {
      labels: [],
      datasets: [{
        label: 'Posts',
        data: [],
        borderColor: sparkColor(canvas, 0.55),
        backgroundColor: type === 'bar' || fill ? sparkColor(canvas, 0.2) : 'transparent',
        pointBackgroundColor: sparkColor(canvas, 1),
        fill,
        barPercentage: 0.6
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
          display: false,
          beginAtZero: true
        }
      },
      elements: {
        line: {
          borderWidth: fill ? 2 : 1,
          tension: 0.4
        },
        point: {
          radius: fill ? 0 : 4,
          hitRadius: 10,
          hoverRadius: 4
        }
      }
    }
  });
};
const sparklines = [
  createSparkline('card-chart1', 'line'),
  createSparkline('card-chart2', 'line'),
  createSparkline('card-chart3', 'line', {fill: true}),
  createSparkline('card-chart4', 'bar')
];

const updateStatCards = community => {
  const {years, counts} = postsPerYear(community);
  for (const chart of sparklines) {
    chart.data.labels = years.map(String);
    chart.data.datasets[0].data = counts;
    // Headroom so the line charts' points aren't clipped at the top of the card
    chart.options.scales.y.max = chart.config.type === 'line' && !chart.data.datasets[0].fill ? Math.max(...counts) * 1.15 : undefined;
    chart.update();
  }

  document.getElementById('stat-posts').textContent = community.posts.length.toLocaleString('en-US');

  // Comment counts come with each post; fall back to the test set size if they're missing
  const second = document.getElementById('stat-second');
  const secondLabel = document.getElementById('stat-second-label');
  if (hasCommentData(community)) {
    second.textContent = totalComments(community).toLocaleString('en-US');
    secondLabel.textContent = 'Comments';
  } else {
    second.textContent = community.predictions ? community.predictions.posts.length.toLocaleString('en-US') : 'n/a';
    secondLabel.textContent = 'Test posts';
  }

  document.getElementById('stat-patient-share').textContent = formatPercent(patientShare(community));

  const busiest = busiestYear(community);
  document.getElementById('stat-busiest-year').textContent = String(busiest.year);
  document.getElementById('stat-busiest-year-label').textContent = `Busiest year, ${pluralize(busiest.count, 'post')}`;
};

// ---------------------------------------------------------------------------
// Main chart: posts per month, filtered by a date range. Its range also drives
// the doughnuts and the posts list.
// ---------------------------------------------------------------------------

// Counts posts per month between `from` and `to` (inclusive). Months with no posts are included
// as 0. If the range starts or ends mid-month, only the days inside the range are counted.
const countPostsPerMonth = (posts, from, to) => {
  const labels = [];
  const counts = [];
  const indexByMonth = new Map();
  for (let time = monthStart(from); time <= to; time = nextMonth(time)) {
    indexByMonth.set(time, counts.length);
    labels.push(formatDate(time, {month: 'short', year: 'numeric'}));
    counts.push(0);
  }
  for (const post of posts) {
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

document.documentElement.addEventListener('ColorSchemeChange', () => {
  mainChart.options.scales.x.grid.color = coreui.Utils.getStyle('--cui-border-color-translucent');
  mainChart.options.scales.x.ticks.color = coreui.Utils.getStyle('--cui-body-color');
  mainChart.options.scales.y.border.color = coreui.Utils.getStyle('--cui-border-color-translucent');
  mainChart.options.scales.y.grid.color = coreui.Utils.getStyle('--cui-border-color-translucent');
  mainChart.options.scales.y.ticks.color = coreui.Utils.getStyle('--cui-body-color');
  mainChart.update();
});

// ---------------------------------------------------------------------------
// Poster type / post type doughnuts (follow the line chart's date range)
// ---------------------------------------------------------------------------
const swatch = color => {
  const element = createElement('span', 'swatch');
  element.style.background = color;
  return element;
};

// Builds one doughnut with its legend table; returns update(order, colors, counts, postCount) → total counted
const createBreakdown = prefix => {
  const legend = document.getElementById(`${prefix}-legend`);
  const center = document.getElementById(`${prefix}-center`);
  const chart = new Chart(document.getElementById(`${prefix}-chart`), {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [],
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

  return (order, colors, counts, postCount) => {
    const rows = order.map(name => ({name, count: counts.get(name) || 0}));
    const total = rows.reduce((sum, row) => sum + row.count, 0);
    chart.data.labels = order;
    chart.data.datasets[0].backgroundColor = order.map(name => colors.get(name));
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

const updateWhoBreakdown = createBreakdown('who');
const updateWhatBreakdown = createBreakdown('what');
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
  updateWhoBreakdown(current.whoOrder, current.whoColors, whoCounts, posts.length);
  const labelTotal = updateWhatBreakdown(current.whatOrder, current.whatColors, whatCounts, posts.length);

  // A few posts have more than one post type, so that doughnut counts labels rather than posts
  const multiLabel = posts.filter(post => post.what.length > 1).length;
  whatNote.textContent = labelTotal > posts.length ?
    `Counts labels, not posts: ${multiLabel} ${multiLabel === 1 ? 'post has' : 'posts have'} more than one post type.` :
    '';
  breakdownSubtitle.textContent = `${formatRange(from, to)}, ${pluralize(posts.length, 'post')}`;
};

// ---------------------------------------------------------------------------
// Posts list: 10 per page, filterable (follows the line chart's date range)
// ---------------------------------------------------------------------------
const POSTS_PER_PAGE = 10;
const postsList = document.getElementById('posts-list');
const postsSummary = document.getElementById('posts-summary');
const postsPageInfo = document.getElementById('posts-page-info');
const postsPagination = document.getElementById('posts-pagination');
const postsWhoSelect = document.getElementById('posts-who');
const postsWhatSelect = document.getElementById('posts-what');
const postsState = {inRange: [], page: 1};

// Refills a filter dropdown with a community's categories, keeping its "All ..." first option
const setFilterOptions = (select, names) => {
  select.length = 1;
  for (const name of names) {
    select.add(new Option(name, name));
  }
  select.value = '';
};

const postBadge = (label, variant) => createElement('span', `badge text-bg-${variant}`, label);

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
    createElement('span', '', formatDate(post.time, SHORT_DATE)),
    postBadge(post.who, 'primary'),
    ...post.what.map(what => postBadge(what, 'info'))
  );

  item.append(title, meta);
  if (post.snippet) {
    item.append(createElement('p', 'mb-1', post.snippet));
  }
  const stats = [Number.isFinite(post.score) && pluralize(post.score, 'point'), Number.isFinite(post.comments) && pluralize(post.comments, 'comment')].filter(Boolean);
  if (stats.length > 0) {
    item.append(createElement('div', 'small text-body-secondary', stats.join(', ')));
  }
  return item;
};

// Page numbers to show: first, last, and the current page's neighbours, with gaps marked null
const visiblePages = (currentPage, count) => {
  const pages = [...new Set([1, currentPage - 1, currentPage, currentPage + 1, count])]
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
    `Showing ${start + 1} to ${start + pagePosts.length} of ${pluralize(matches.length, 'post')}` :
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
  postsSummary.textContent = `${formatRange(from, to)}, newest first`;
  renderPosts();
};

const mainChartSubtitle = document.getElementById('main-chart-subtitle');
const mainRange = createDateRange('main-chart', (from, to) => {
  const {labels, counts} = countPostsPerMonth(current.posts, from, to);
  const total = counts.reduce((sum, count) => sum + count, 0);
  mainChart.data.labels = labels;
  mainChart.data.datasets[0].data = counts;
  // With only a month or two there's no line to speak of, so show the points
  mainChart.data.datasets[0].pointRadius = counts.length < 3 ? 4 : 0;
  mainChart.update();
  mainChartSubtitle.textContent = `${current.display_name}, ${formatRange(from, to)}, ${pluralize(total, 'post')}`;

  const postsInRange = current.posts.filter(post => post.time >= from && post.time <= to);
  updateBreakdowns(postsInRange, from, to);
  updatePostsList(postsInRange, from, to);
});

// ---------------------------------------------------------------------------
// Predictions chart: actual vs. predicted category counts for the test set
// (data/subreddits/<name>/predictions.json, built by scripts/build_predictions_data.py)
// ---------------------------------------------------------------------------
const predictionsModelSelect = document.getElementById('predictions-chart-model');
const predictionsSubtitle = document.getElementById('predictions-chart-subtitle');
const predictionsControls = document.getElementById('predictions-controls');
const predictionsContent = document.getElementById('predictions-content');
const predictionsEmpty = document.getElementById('predictions-empty');

const predictionsChart = new Chart(document.getElementById('predictions-chart'), {
  type: 'bar',
  data: {
    labels: [],
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

let predictionsRange = null;
const updatePredictionsChart = () => {
  const {predictions} = current;
  if (!predictions || !predictionsRange) {
    return;
  }
  const [from, to] = predictionsRange;
  const modelIndex = Number(predictionsModelSelect.value);
  const model = predictions.models[modelIndex];
  const posts = predictions.posts.filter(post => post.time >= from && post.time <= to);

  const actualCounts = predictions.categories.map(category => posts.filter(post => post.actual === category).length);
  const predictedCounts = predictions.categories.map(category => posts.filter(post => post.predicted[modelIndex] === category).length);
  const correct = posts.filter(post => post.predicted[modelIndex] === post.actual).length;

  predictionsChart.data.labels = predictions.categories;
  predictionsChart.data.datasets[0].data = actualCounts;
  predictionsChart.data.datasets[1].label = `Predicted (${model.name})`;
  predictionsChart.data.datasets[1].data = predictedCounts;
  predictionsChart.update();

  // Range and post count on one line, the model's accuracy on its own line
  const accuracy = posts.length === 0 ?
    'No test posts in this range' :
    `${model.name}: ${correct} of ${posts.length} correct (${Math.round((100 * correct) / posts.length)}%)`;
  predictionsSubtitle.replaceChildren(
    createElement('div', '', `${current.display_name}, ${formatRange(from, to)}, ${pluralize(posts.length, 'test post')}`),
    createElement('div', '', accuracy)
  );
};

predictionsModelSelect.addEventListener('change', updatePredictionsChart);
const predictionsDateRange = createDateRange('predictions-chart', (from, to) => {
  predictionsRange = [from, to];
  updatePredictionsChart();
});

const updatePredictionsSection = community => {
  const hasPredictions = Boolean(community.predictions?.posts.length);
  predictionsControls.classList.toggle('d-none', !hasPredictions);
  predictionsContent.classList.toggle('d-none', !hasPredictions);
  predictionsEmpty.classList.toggle('d-none', hasPredictions);
  if (!hasPredictions) {
    predictionsRange = null;
    predictionsSubtitle.textContent = community.display_name;
    return;
  }
  predictionsModelSelect.length = 0;
  for (const [index, model] of community.predictions.models.entries()) {
    predictionsModelSelect.add(new Option(model.name, String(index)));
  }
  predictionsDateRange.setBounds(community);
};

// ---------------------------------------------------------------------------
// Compare Communities: the stat cards' numbers as percentages, one column per community
// ---------------------------------------------------------------------------
const compareContent = document.getElementById('compare-content');

const renderCompare = communities => {
  if (communities.length < 2) {
    compareContent.replaceChildren(createElement('p', 'text-body-secondary mb-0', 'More communities will be added.'));
    return;
  }

  const allPosts = communities.reduce((sum, community) => sum + community.posts.length, 0);
  const withComments = communities.filter(hasCommentData);
  const allComments = withComments.reduce((sum, community) => sum + totalComments(community), 0);
  const shareOf = (community, test) => community.posts.filter(test).length / community.posts.length;

  const sections = [{
    title: 'Overview',
    rows: [
      ['Share of all posts', community => formatPercent(community.posts.length / allPosts)],
      ['Share of all comments', community => (hasCommentData(community) && allComments > 0 ? formatPercent(totalComments(community) / allComments) : 'n/a')],
      ['Patient posters', community => formatPercent(patientShare(community))],
      ['Posts in busiest year', community => {
        const busiest = busiestYear(community);
        return `${formatPercent(busiest.count / community.posts.length)} (${busiest.year})`;
      }]
    ]
  }, {
    title: 'Poster Type',
    rows: unique(communities.flatMap(community => community.whoOrder))
      .map(name => [name, community => formatPercent(shareOf(community, post => post.who === name))])
  }, {
    title: 'Post Type',
    rows: unique(communities.flatMap(community => community.whatOrder))
      .map(name => [name, community => formatPercent(shareOf(community, post => post.what.includes(name)))])
  }];

  const table = createElement('table', 'table table-sm mb-0');
  const headRow = createElement('tr');
  headRow.append(createElement('th', '', ''));
  for (const community of communities) {
    const th = createElement('th', 'text-end', community.display_name);
    th.scope = 'col';
    th.append(createElement('div', 'small fw-normal text-body-secondary', pluralize(community.posts.length, 'post')));
    headRow.append(th);
  }
  const thead = createElement('thead');
  thead.append(headRow);
  table.append(thead);

  for (const section of sections) {
    const tbody = createElement('tbody');
    const titleRow = createElement('tr');
    const titleCell = createElement('th', 'text-body-secondary pt-3', section.title);
    titleCell.colSpan = communities.length + 1;
    titleCell.scope = 'colgroup';
    titleRow.append(titleCell);
    tbody.append(titleRow);
    for (const [label, value] of section.rows) {
      const tr = createElement('tr');
      const th = createElement('th', 'fw-normal', label);
      th.scope = 'row';
      tr.append(th, ...communities.map(community => createElement('td', 'text-end', value(community))));
      tbody.append(tr);
    }
    table.append(tbody);
  }

  const wrapper = createElement('div', 'table-responsive');
  wrapper.append(table);
  compareContent.replaceChildren(wrapper, createElement('div', 'small text-body-secondary mt-2', 'A post can have more than one post type, so those rows can add up to more than 100%.'));
};

// ---------------------------------------------------------------------------
// Header: community dropdown and subtitle
// ---------------------------------------------------------------------------
const subredditSelect = document.getElementById('subreddit-select');
const loadError = document.getElementById('load-error');
const loaded = new Map(); // name → community data

const showLoadErrors = messages => {
  loadError.replaceChildren(...messages.map(message => createElement('div', '', message)));
  loadError.classList.toggle('d-none', messages.length === 0);
};

const showSubreddit = name => {
  current = loaded.get(name);
  updateStatCards(current);
  setFilterOptions(postsWhoSelect, current.whoOrder);
  setFilterOptions(postsWhatSelect, current.whatOrder);
  mainRange.setBounds(current);
  updatePredictionsSection(current);
};

subredditSelect.addEventListener('change', () => showSubreddit(subredditSelect.value));

const init = async () => {
  let subreddits;
  try {
    subreddits = await fetchJSON('data/subreddits.json');
  } catch (error) {
    showLoadErrors([`${error.message}. Serve the dashboard with "python3 -m http.server" instead of opening the file directly.`]);
    subredditSelect.replaceChildren(new Option('No data'));
    return;
  }

  const ready = subreddits.filter(subreddit => subreddit.ready);
  const results = await Promise.allSettled(ready.map(subreddit => loadSubreddit(subreddit)));
  const errors = [];
  for (const [index, result] of results.entries()) {
    if (result.status === 'fulfilled') {
      loaded.set(result.value.name, result.value);
    } else {
      errors.push(`${ready[index].display_name}: ${result.reason.message}`);
    }
  }
  showLoadErrors(errors);

  // Communities without data (not ready yet, or failed to load) stay listed but can't be picked
  subredditSelect.replaceChildren(...subreddits.map(subreddit => {
    const isLoaded = loaded.has(subreddit.name);
    let label = subreddit.display_name;
    if (!subreddit.ready) {
      label += ' (coming soon)';
    } else if (!isLoaded) {
      label += ' (could not load)';
    }
    const option = new Option(label, subreddit.name);
    option.disabled = !isLoaded;
    return option;
  }));

  const communities = [...loaded.values()];
  renderCompare(communities);
  if (communities.length === 0) {
    return;
  }

  const start = Math.min(...communities.map(community => community.start));
  const end = Math.max(...communities.map(community => community.end));
  document.getElementById('page-subtitle').textContent =
    `Reddit posts from rare-disease communities, ${formatDate(start, MONTH_YEAR)} to ${formatDate(end, MONTH_YEAR)}`;

  subredditSelect.disabled = false;
  subredditSelect.value = communities[0].name;
  showSubreddit(communities[0].name);
  highlightCurrentSection();
};

// ---------------------------------------------------------------------------
// Sidebar jump links: highlight the section in view
// ---------------------------------------------------------------------------
const sectionLinks = [...document.querySelectorAll('[data-section-link]')];
const sectionTargets = sectionLinks.map(link => document.querySelector(link.getAttribute('href')));

function highlightCurrentSection() {
  // The current section is the last one whose top has scrolled past a line just below where the
  // jump links leave a section (or the last section, once the page is scrolled to the bottom).
  const CURRENT_LINE = 160; // px from the top of the window; sections land just below the sticky header
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  let currentIndex = 0;
  for (const [index, target] of sectionTargets.entries()) {
    if (target.getBoundingClientRect().top <= CURRENT_LINE) {
      currentIndex = index;
    }
  }
  if (atBottom) {
    currentIndex = sectionTargets.length - 1;
  }
  for (const [index, link] of sectionLinks.entries()) {
    link.classList.toggle('is-current', index === currentIndex);
    if (index === currentIndex) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  }
}

window.addEventListener('scroll', highlightCurrentSection, {passive: true});
window.addEventListener('resize', highlightCurrentSection);
highlightCurrentSection();

// On small screens the sidebar covers the page, so close it after jumping to a section
for (const link of sectionLinks) {
  link.addEventListener('click', () => {
    if (window.matchMedia('(max-width: 991.98px)').matches) {
      coreui.Sidebar.getInstance(document.querySelector('#sidebar'))?.hide();
    }
  });
}

init();
