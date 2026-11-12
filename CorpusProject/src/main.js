import Papa from 'papaparse';
import corpusUrl from '../country-corpus.csv?url';
import '../styles.css';

const START_YEAR = 1944;
const END_YEAR = 2024;
const PAGE_SIZE = 20;
const KWIC_PAGE_SIZE = 50;
const MAX_KWIC_RESULTS = 1000;
const WORD_PATTERN = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;
const STOP_WORDS = new Set(
  `a about above after again against all am an and any are as at
  aren't be because been before being below between both but by can
  could did do does each few for from further go had has have having
  hadn't hasn't haven't he he'd he'll her here hers herself him
  himself his how he's i i'd i'll i'm i've if in into is it it'd
  it'll it's its itself just me more most my myself no nor not of
  off on once only or other our ours ourselves out over same she
  she'd she'll she's should so some such than that the their theirs
  them themselves then there these that's there's they they'd they'll
  they're they've this those through to too under until up very was
  wasn't we we'd we'll we're we've were weren't what what's when
  where which while who who's whom why will won't with would wouldn't
  you you'd you'll you're you've your yours yourself yourselves
  can't couldn't didn't doesn't don't`.split(/\s+/),
);

const state = {
  songs: [],
  tab: 'overview',
  fromYear: START_YEAR,
  toYear: END_YEAR,
  concordanceQuery: '',
  wholeWord: true,
  compareFirst: 'love',
  compareSecond: 'home',
  compareError: '',
  songQuery: '',
  songPage: 0,
  artistQuery: '',
  artistPage: 0,
  expandedArtistId: null,
  kwicPage: 0,
  expandedSongId: null,
};

const app = document.querySelector('#app');

function wordsIn(text) {
  return (text.toLocaleLowerCase().match(WORD_PATTERN) ?? []).map((word) => word.replaceAll('’', "'"));
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseCorpus(csvText) {
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
  });

  if (parsed.errors.length) {
    throw new Error(`Could not read the CSV: ${parsed.errors[0].message}`);
  }

  const songs = [];
  let outOfRangeYears = 0;

  for (const row of parsed.data) {
    const rawYear = (row.Year ?? '').trim();
    const year = Number(rawYear);
    const song = {
      id: (row.ID ?? '').trim(),
      year,
      chartPosition: (row['Chart Position'] ?? '').trim(),
      title: (row['Song Title'] ?? '').trim(),
      artist: (row['Artist or Group'] ?? '').trim(),
      lyrics: (row.Lyrics ?? '').trim(),
    };

    if (!Number.isInteger(year) || year < START_YEAR || year > END_YEAR) {
      outOfRangeYears += 1;
    } else {
      songs.push(song);
    }
  }

  if (outOfRangeYears > 0) {
    throw new Error(`The CSV has ${outOfRangeYears} row(s) with years outside 1944–2024.`);
  }

  if (songs.length === 0) {
    throw new Error('The CSV loaded, but no songs have years from 1944 to 2024.');
  }

  return songs;
}

function filteredSongs() {
  return state.songs.filter(
    (song) => song.year >= state.fromYear && song.year <= state.toYear,
  );
}

function artistIdentity(name) {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

function setTab(tab) {
  state.tab = tab;
  state.kwicPage = 0;
  state.songPage = 0;
  state.artistPage = 0;
  render();
}

function render() {
  const songs = filteredSongs();
  app.innerHTML = `
    <header class="site-header">
      <nav class="site-navbar" aria-label="Course site">
        <a class="site-brand" href="../">Lin211 Fall 2026</a>
        <button class="site-menu-toggle" type="button" aria-expanded="false" aria-controls="site-navigation" aria-label="Toggle navigation">
          <span class="menu-icon" aria-hidden="true"><i></i><i></i><i></i></span>
        </button>
        <div class="site-links" id="site-navigation">
          <a href="../">Home</a>
          <a href="../syllabus/Lin211-Fall2026-Syllabus.html">Syllabus</a>
          <a href="./" aria-current="page">Corpus Project</a>
          <a href="../slides/">Slides</a>
        </div>
      </nav>
    </header>

    <main id="top" class="site-content">
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">LIN 211 · CORPUS PROJECT</p>
          <h1>Country music lyrics corpus</h1>
          <p class="hero-description">Explore charting country songs from 1944 to 2024. Follow words across time, find them in context, and browse the artists & lyrics.</p>
          <button class="text-link" data-tab="concordance">Start with a word <span aria-hidden="true">↗</span></button>
        </div>
      </section>

      <section class="data-ribbon" aria-label="Corpus overview">
        <div class="ribbon-intro"><span class="small-caps">THE COLLECTION</span><span>Charting songs, selected years, collected by students in Lin 211, Fall 2026</span></div>
        <div class="stat"><strong>${state.songs.length}</strong><span>songs</span></div>
        <div class="stat"><strong>${new Set(state.songs.map((song) => artistIdentity(song.artist))).size}</strong><span>artists &amp; groups</span></div>
        <div class="stat"><strong>${new Set(state.songs.map((song) => Math.floor(song.year / 10) * 10)).size}</strong><span>decades</span></div>
      </section>

      <section class="workspace" aria-label="Corpus explorer">
        <div class="workspace-heading">
          <div>
            <p class="eyebrow">YOUR VIEW OF OUR CORPUS</p>
            <h2>${tabHeading()}</h2>
          </div>
          <div class="year-filter">
            <label for="from-year">Years</label>
            <select id="from-year" aria-label="First year in range">${yearOptions(state.fromYear)}</select>
            <span>to</span>
            <select id="to-year" aria-label="Last year in range">${yearOptions(state.toYear)}</select>
          </div>
        </div>
        <nav class="tool-tabs" aria-label="Corpus tools">
          <button class="tool-tab ${state.tab === 'overview' ? 'active' : ''}" data-tab="overview" aria-current="${state.tab === 'overview' ? 'page' : 'false'}">Explore</button>
          <button class="tool-tab ${state.tab === 'concordance' ? 'active' : ''}" data-tab="concordance" aria-current="${state.tab === 'concordance' ? 'page' : 'false'}">Word in Context</button>
          <button class="tool-tab ${state.tab === 'compare' ? 'active' : ''}" data-tab="compare" aria-current="${state.tab === 'compare' ? 'page' : 'false'}">Compare words &amp; phrases</button>
          <button class="tool-tab ${state.tab === 'artists' ? 'active' : ''}" data-tab="artists" aria-current="${state.tab === 'artists' ? 'page' : 'false'}">Browse artists</button>
          <button class="tool-tab ${state.tab === 'songs' ? 'active' : ''}" data-tab="songs" aria-current="${state.tab === 'songs' ? 'page' : 'false'}">Browse songs</button>
        </nav>

        <div class="tab-panel">
          ${state.tab === 'overview' ? renderOverview(songs) : ''}
          ${state.tab === 'concordance' ? renderConcordance(songs) : ''}
          ${state.tab === 'compare' ? renderComparison(songs) : ''}
          ${state.tab === 'artists' ? renderArtistBrowser(songs) : ''}
          ${state.tab === 'songs' ? renderSongBrowser(songs) : ''}
        </div>
      </section>

      <footer class="site-footer">
        <p><a href="https://linguistics.as.uky.edu/">Linguistics Department</a> - <a href="https://www.uky.edu/">University of Kentucky</a></p>
        <p>Lyrics are shown for classroom research and exploration.</p>
      </footer>
    </main>
  `;

  bindEvents();
}

function tabHeading() {
  if (state.tab === 'concordance') return 'Find a word in context';
  if (state.tab === 'compare') return 'Compare word and phrase frequencies';
  if (state.tab === 'artists') return 'Browse artists by song count';
  if (state.tab === 'songs') return 'Browse the songs';
  return 'Explore the timeline';
}

function yearOptions(selected) {
  const years = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, index) => START_YEAR + index);
  return years.map((year) => `<option value="${year}" ${year === selected ? 'selected' : ''}>${year}</option>`).join('');
}

function renderOverview(songs) {
  const visibleYears = Array.from(
    { length: state.toYear - state.fromYear + 1 },
    (_, index) => state.fromYear + index,
  );
  const counts = new Map(visibleYears.map((year) => [year, 0]));
  for (const song of songs) counts.set(song.year, (counts.get(song.year) ?? 0) + 1);
  const wordCounts = new Map();
  const songCounts = new Map();

  for (const song of songs) {
    const inSong = new Set();
    for (const word of wordsIn(song.lyrics)) {
      if (STOP_WORDS.has(word)) continue;
      wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1);
      inSong.add(word);
    }
    for (const word of inSong) songCounts.set(word, (songCounts.get(word) ?? 0) + 1);
  }

  const topWords = [...wordCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 12);
  const maxWordCount = topWords[0]?.[1] ?? 1;
  const maxYearCount = Math.max(1, ...counts.values());

  return `
    <div class="explore-grid">
      <section class="panel timeline-panel">
        <div class="panel-title-row">
          <div><h3>Hits through the years</h3><p>Each mark is a song in the collection. Click a year to focus on it.</p></div>
          <span class="panel-index">01 / TIME</span>
        </div>
        <div class="timeline-wrap">
          <svg class="timeline-chart" viewBox="0 0 920 220" role="img" aria-label="Number of songs in our corpus by year">${renderTimeline(counts, visibleYears, maxYearCount)}</svg>
        </div>
        <div class="chart-legend"><span><i></i> Songs in the collection</span><span>Year range: ${state.fromYear}–${state.toYear}</span></div>
      </section>

      <section class="panel word-panel">
        <div class="panel-title-row">
          <div><h3>Frequent words</h3><p>Common grammatical words (e.g. 'the', 'of', 'an', etc.) excluded.</p></div>
          <span class="panel-index">02 / WORDS</span>
        </div>
        ${topWords.length ? `<div class="word-list">${topWords.map(([word, count], index) => `
          <button class="word-row" data-word="${escapeAttribute(word)}" aria-label="Search for ${escapeAttribute(word)}, ${count} occurrences">
            <span class="word-rank">${String(index + 1).padStart(2, '0')}</span>
            <span class="word-name">${escapeHtml(word)}</span>
            <span class="word-track"><i style="width:${Math.max(4, (count / maxWordCount) * 100)}%"></i></span>
            <span class="word-count">${count.toLocaleString()}</span>
          </button>`).join('')}</div>` : '<p class="empty-state">No words to show in this year range.</p>'}
        <p class="panel-footnote">Word counts show total uses. Select a word to see every matching line.</p>
      </section>
    </div>
    <section class="question-strip">
      <div><span class="question-spark" aria-hidden="true">✳</span><div><h3>Not sure where to begin?</h3><p>Try one of these words and see how the preceding and following words inform their meanings.</p></div></div>
      <div class="suggestion-list">${['love', 'home', 'heart', 'road'].map((word) => `<button class="suggestion" data-word="${word}">${word}<span aria-hidden="true"> ↗</span></button>`).join('')}</div>
    </section>
  `;
}

function renderTimeline(counts, years, maxCount) {
  const left = 44;
  const top = 14;
  const width = 848;
  const height = 152;
  const slot = years.length ? width / years.length : width;
  const barWidth = Math.max(3, Math.min(12, slot * 0.62));
  const gridLines = [0, Math.ceil(maxCount / 2), maxCount].filter((value, index, list) => list.indexOf(value) === index);
  const lines = gridLines.map((value) => {
    const y = top + height - (value / maxCount) * height;
    return `<line class="grid-line" x1="${left}" x2="${left + width}" y1="${y}" y2="${y}"/><text class="axis-label" x="${left - 10}" y="${y + 4}" text-anchor="end">${value}</text>`;
  }).join('');
  const bars = years.map((year, index) => {
    const count = counts.get(year) ?? 0;
    if (count === 0) return '';
    const barHeight = (count / maxCount) * height;
    const x = left + index * slot + (slot - barWidth) / 2;
    const y = top + height - barHeight;
    return `<rect class="year-bar" data-year="${year}" x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${barWidth.toFixed(2)}" height="${barHeight.toFixed(2)}" rx="2" tabindex="0" role="button" aria-label="${year}: ${count} ${count === 1 ? 'song' : 'songs'}"><title>${year}: ${count} ${count === 1 ? 'song' : 'songs'} (select to focus)</title></rect>`;
  }).join('');
  const decadeLabels = years.filter((year) => year % 10 === 0).map((year) => {
    const index = years.indexOf(year);
    const x = left + index * slot + slot / 2;
    return `<text class="axis-label decade-label" x="${x.toFixed(2)}" y="${top + height + 24}" text-anchor="middle">${year}</text>`;
  }).join('');
  return `${lines}${bars}${decadeLabels}`;
}

function renderConcordance(songs) {
  const query = state.concordanceQuery.trim();
  const matches = query ? findOccurrences(songs, query, state.wholeWord) : [];
  const visibleMatches = matches.slice(0, MAX_KWIC_RESULTS);
  const pageCount = Math.ceil(visibleMatches.length / KWIC_PAGE_SIZE);
  const page = Math.min(state.kwicPage, Math.max(0, pageCount - 1));
  const pageMatches = visibleMatches.slice(page * KWIC_PAGE_SIZE, (page + 1) * KWIC_PAGE_SIZE);

  return `
    <div class="concordance-intro"><span class="concordance-icon" aria-hidden="true">“ ”</span><p>A <strong>concordance</strong> puts each use of a word beside the words around it. Read across to spot patterns; compare years to see what changes.</p></div>
    <form class="search-form" id="concordance-form">
      <label for="concordance-query">What word or phrase are you curious about?</label>
      <div class="search-row"><span class="search-icon" aria-hidden="true"></span><input id="concordance-query" type="search" value="${escapeAttribute(state.concordanceQuery)}" placeholder="Try “home”, “freedom”, or “on the road”" autocomplete="off" /><button class="primary-button" type="submit">Find in lyrics <span aria-hidden="true">↗</span></button></div>
      <label class="checkbox-label"><input id="whole-word" type="checkbox" ${state.wholeWord ? 'checked' : ''} /><span>Match whole words (turn off to find a word inside longer words)</span></label>
    </form>
    ${query ? `
      <div class="results-heading"><div><p class="eyebrow">YOUR CONCORDANCE</p><h3><span class="query-word">${escapeHtml(query)}</span> <span class="result-total">${matches.length.toLocaleString()} ${matches.length === 1 ? 'match' : 'matches'}</span></h3></div><span class="panel-index">${state.fromYear}—${state.toYear}</span></div>
      ${matches.length ? `
        <div class="kwic-head" aria-hidden="true"><span>LEFT CONTEXT</span><span>SEARCHED WORD</span><span>RIGHT CONTEXT</span><span>SONG</span></div>
        <div class="kwic-list">${pageMatches.map(renderKwicRow).join('')}</div>
        ${matches.length > MAX_KWIC_RESULTS ? `<p class="limit-note">Showing the first ${MAX_KWIC_RESULTS.toLocaleString()} matches. Narrow the year range to explore a smaller sample.</p>` : ''}
        ${renderPagination(page, pageCount, 'kwic')}
      ` : '<div class="empty-state large"><span aria-hidden="true">∅</span><strong>No matches in this year range.</strong><p>Try another spelling or expand the years.</p></div>'}
    ` : `
      <div class="empty-prompt"><span class="prompt-orbit" aria-hidden="true">?</span><div><strong>Context can change a word entirely!</strong><p>Type a word above, or pick one to get started:</p><div class="suggestion-list">${['love', 'home', 'heart', 'road'].map((word) => `<button class="suggestion" data-word="${word}">${word}<span aria-hidden="true"> ↗</span></button>`).join('')}</div></div></div>
    `}
  `;
}

function renderComparison(songs) {
  const firstTokens = normalizeComparisonString(state.compareFirst);
  const secondTokens = normalizeComparisonString(state.compareSecond);
  const canCompare = firstTokens && secondTokens
    && firstTokens.join(' ') !== secondTokens.join(' ');

  return `
    <div class="compare-intro">
      <span class="compare-icon" aria-hidden="true">↗</span>
      <p>Compare a word or phrase over time. Rates are shown per 100 lyric words, so years with more lyrics are not automatically higher. Matching ignores capitalization and punctuation, treats curly and straight apostrophes alike, and counts phrases when their words occur consecutively. </p>
    </div>
    <form class="compare-form" id="compare-form">
      <label for="compare-first">First word or phrase<input id="compare-first" type="text" value="${escapeAttribute(state.compareFirst)}" maxlength="60" autocomplete="off" /></label>
      <label for="compare-second">Second word or phrase<input id="compare-second" type="text" value="${escapeAttribute(state.compareSecond)}" maxlength="60" autocomplete="off" /></label>
      <button class="primary-button" type="submit">Compare <span aria-hidden="true">↗</span></button>
    </form>
    ${state.compareError ? `<p class="compare-error" role="alert">${escapeHtml(state.compareError)}</p>` : ''}
    ${canCompare
      ? renderFrequencyComparison(songs, [
        { label: state.compareFirst.trim(), tokens: firstTokens },
        { label: state.compareSecond.trim(), tokens: secondTokens },
      ])
      : '<div class="empty-state large"><strong>Enter two different words or phrases to compare.</strong><p>Use a word or short phrase in each field.</p></div>'}
  `;
}

function normalizeComparisonString(value) {
  const tokens = wordsIn(value);
  return tokens.length ? tokens : null;
}

function countTokenSequence(tokens, sequence) {
  let matches = 0;
  for (let start = 0; start <= tokens.length - sequence.length; start += 1) {
    let matchesSequence = true;
    for (let offset = 0; offset < sequence.length; offset += 1) {
      if (tokens[start + offset] !== sequence[offset]) {
        matchesSequence = false;
        break;
      }
    }
    if (matchesSequence) matches += 1;
  }
  return matches;
}

function renderFrequencyComparison(songs, terms) {
  if (songs.length === 0) {
    return '<div class="empty-state large"><strong>No songs in this year range.</strong><p>Expand the year filters to compare frequencies.</p></div>';
  }

  const years = Array.from(
    { length: state.toYear - state.fromYear + 1 },
    (_, index) => state.fromYear + index,
  );
  const annual = new Map(years.map((year) => [year, { tokens: 0, counts: [0, 0] }]));
  let totalTokens = 0;
  const totalCounts = [0, 0];

  for (const song of songs) {
    const year = annual.get(song.year);
    const tokens = wordsIn(song.lyrics);
    year.tokens += tokens.length;
    totalTokens += tokens.length;

    for (let index = 0; index < terms.length; index += 1) {
      const count = countTokenSequence(tokens, terms[index].tokens);
      year.counts[index] += count;
      totalCounts[index] += count;
    }
  }

  const data = years.map((year) => ({ year, ...annual.get(year) }));
  const rates = data.flatMap((entry) => entry.tokens
    ? entry.counts.map((count) => (count / entry.tokens) * 100)
    : []);
  const maximumRate = rates.length ? Math.max(...rates) : 0;
  const yMaximum = niceFrequencyCeiling(maximumRate);
  const totalRates = totalCounts.map((count) => totalTokens ? (count / totalTokens) * 100 : 0);

  return `
    <section class="panel compare-chart-panel">
      <div class="panel-title-row">
        <div><h3>Word or phrase frequency by year</h3><p>Occurrences per 100 lyric words from each year.</p></div>
        <span class="panel-index">${state.fromYear}—${state.toYear}</span>
      </div>
      <div class="frequency-chart-wrap">
        <svg class="frequency-chart" viewBox="0 0 920 320" role="img" aria-label="Frequency per 100 lyric words for ${escapeAttribute(terms[0].label)} and ${escapeAttribute(terms[1].label)} by year">
          ${renderFrequencySvg(data, terms, yMaximum)}
        </svg>
      </div>
      <div class="frequency-legend">
        ${terms.map((term, index) => `
          <div class="frequency-legend-item">
            <span class="frequency-series series-${index === 0 ? 'a' : 'b'}"></span>
            <strong>${escapeHtml(term.label)}</strong>
            <span>${totalCounts[index].toLocaleString()} uses · ${formatFrequency(totalRates[index])} per 100 words overall</span>
          </div>`).join('')}
      </div>
    </section>
  `;
}

function renderFrequencySvg(data, terms, yMaximum) {
  const left = 64;
  const top = 18;
  const width = 826;
  const height = 220;
  const x = (year) => left + (
    state.toYear === state.fromYear
      ? width / 2
      : ((year - state.fromYear) / (state.toYear - state.fromYear)) * width
  );
  const y = (rate) => top + height - (rate / yMaximum) * height;
  const ticks = [0, yMaximum / 2, yMaximum];
  const grid = ticks.map((tick) => {
    const position = y(tick);
    return `<line class="frequency-grid-line" x1="${left}" x2="${left + width}" y1="${position}" y2="${position}" /><text class="frequency-axis-label" x="${left - 10}" y="${position + 4}" text-anchor="end">${formatFrequency(tick)}</text>`;
  }).join('');

  const decadeTicks = data.filter((entry) => entry.year % 10 === 0).map((entry) => entry.year);
  const xTicks = decadeTicks.length
    ? decadeTicks
    : [...new Set([state.fromYear, state.toYear])];
  const labels = xTicks.map((year) =>
    `<text class="frequency-axis-label" x="${x(year)}" y="${top + height + 24}" text-anchor="middle">${year}</text>`,
  ).join('');

  const lines = terms.map((term, seriesIndex) => {
    let path = '';
    let connected = false;
    for (const entry of data) {
      if (entry.tokens === 0) {
        connected = false;
        continue;
      }
      const rate = (entry.counts[seriesIndex] / entry.tokens) * 100;
      path += `${connected ? 'L' : 'M'}${x(entry.year).toFixed(2)},${y(rate).toFixed(2)} `;
      connected = true;
    }
    return `<path class="frequency-line series-${seriesIndex === 0 ? 'a' : 'b'}" d="${path.trim()}" />`;
  }).join('');

  const points = data.flatMap((entry) => {
    if (entry.tokens === 0) return [];
    return terms.map((term, seriesIndex) => {
      const count = entry.counts[seriesIndex];
      const rate = (count / entry.tokens) * 100;
      const series = seriesIndex === 0 ? 'a' : 'b';
      return `<circle class="frequency-point series-${series}" cx="${x(entry.year).toFixed(2)}" cy="${y(rate).toFixed(2)}" r="3.5" tabindex="0"><title>${entry.year}: ${escapeHtml(term.label)} occurred ${count} ${count === 1 ? 'time' : 'times'} in ${entry.tokens.toLocaleString()} words (${formatFrequency(rate)} per 100)</title></circle>`;
    });
  }).join('');

  return `${grid}${lines}${points}${labels}`;
}

function niceFrequencyCeiling(value) {
  if (!Number.isFinite(value) || value <= 0) return 0.1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

function formatFrequency(value) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function findOccurrences(songs, query, wholeWord) {
  let pattern;
  try {
    pattern = new RegExp(escapeRegex(query), 'giu');
  } catch {
    return [];
  }

  const results = [];
  for (const song of songs) {
    pattern.lastIndex = 0;
    for (const match of song.lyrics.matchAll(pattern)) {
      const start = match.index;
      const end = start + match[0].length;
      if (wholeWord && (isWordCharacter(song.lyrics[start - 1]) || isWordCharacter(song.lyrics[end]))) continue;
      const left = song.lyrics.slice(0, start).trim().split(/\s+/).slice(-5).join(' ');
      const right = song.lyrics.slice(end).trim().split(/\s+/).slice(0, 5).join(' ');
      results.push({ song, left, match: match[0], right });
    }
  }
  return results;
}

function isWordCharacter(character) {
  return character !== undefined && /[\p{L}\p{N}_'’]/u.test(character);
}

function renderKwicRow({ song, left, match, right }) {
  return `<article class="kwic-row">
    <span class="kwic-left">${escapeHtml(left)}</span>
    <mark class="kwic-match">${escapeHtml(match)}</mark>
    <span class="kwic-right">${escapeHtml(right)}</span>
    <button class="kwic-song" data-song-id="${escapeAttribute(song.id)}" title="Open ${escapeAttribute(song.title)}">${escapeHtml(song.title)}<small>${song.year} · ${escapeHtml(song.artist)}</small></button>
  </article>`;
}

function renderSongBrowser(songs) {
  const query = state.songQuery.trim().toLocaleLowerCase();
  const results = songs
    .filter((song) => !query || `${song.title} ${song.artist} ${song.lyrics}`.toLocaleLowerCase().includes(query))
    .sort((a, b) => a.year - b.year || Number(a.chartPosition) - Number(b.chartPosition));
  const pageCount = Math.ceil(results.length / PAGE_SIZE);
  const page = Math.min(state.songPage, Math.max(0, pageCount - 1));
  const pageSongs = results.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return `
    <div class="song-browser-tools">
      <div><p class="eyebrow">THE SONGBOOK</p><p class="browser-explainer">Browse the collection by year, artist, title, or a word in the lyrics.</p></div>
      <label class="song-search"><span class="sr-only">Search song titles, artists, and lyrics</span><span class="search-icon" aria-hidden="true"></span><input id="song-query" type="search" value="${escapeAttribute(state.songQuery)}" placeholder="Search songs, artists, or lyrics" autocomplete="off" /></label>
    </div>
    <p class="browse-count">${results.length.toLocaleString()} ${results.length === 1 ? 'song' : 'songs'} in ${state.fromYear}–${state.toYear}</p>
    ${pageSongs.length ? `<div class="song-list">${pageSongs.map((song) => renderSongCard(song, query)).join('')}</div>${renderPagination(page, pageCount, 'songs')}` : '<div class="empty-state large"><span aria-hidden="true">∅</span><strong>No songs found.</strong><p>Try a different search or year range.</p></div>'}
  `;
}

function renderArtistBrowser(songs) {
  const query = state.artistQuery.trim().toLocaleLowerCase();
  const artistMap = new Map();

  for (const song of songs) {
    const name = song.artist.trim().replace(/\s+/g, ' ');
    const key = artistIdentity(name);
    const artist = artistMap.get(key) ?? { key, name, songs: [], spellings: new Map() };
    artist.songs.push(song);
    artist.spellings.set(name, (artist.spellings.get(name) ?? 0) + 1);
    artistMap.set(key, artist);
  }

  for (const artist of artistMap.values()) {
    artist.name = [...artist.spellings.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
  }

  const results = [...artistMap.values()]
    .filter((artist) => artist.name.toLocaleLowerCase().includes(query))
    .sort((a, b) => b.songs.length - a.songs.length || a.name.localeCompare(b.name));
  const pageCount = Math.ceil(results.length / PAGE_SIZE);
  const page = Math.min(state.artistPage, Math.max(0, pageCount - 1));
  const pageArtists = results.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return `
    <div class="song-browser-tools">
      <div><p class="eyebrow">THE ARTISTS</p><p class="browser-explainer">Browse artists and groups, ranked by how many songs they have in this year range. Expand a name to see its songs.</p></div>
      <label class="song-search"><span class="sr-only">Search artist and group names</span><span class="search-icon" aria-hidden="true"></span><input id="artist-query" type="search" value="${escapeAttribute(state.artistQuery)}" placeholder="Search artists or groups" autocomplete="off" /></label>
    </div>
    <p class="browse-count">${results.length.toLocaleString()} ${results.length === 1 ? 'artist or group' : 'artists and groups'} found in ${state.fromYear}–${state.toYear}, ranked by song count</p>
    ${pageArtists.length ? `
      <div class="artist-list">
        ${pageArtists.map((artist, index) => {
          const expanded = state.expandedArtistId === artist.key;
          const artistSongs = artist.songs.sort((a, b) => a.year - b.year || Number(a.chartPosition) - Number(b.chartPosition));
          return `<section class="artist-card ${expanded ? 'expanded' : ''}">
            <button class="artist-summary" data-artist-id="${escapeAttribute(artist.key)}" aria-expanded="${expanded}">
              <span class="artist-rank">${(page * PAGE_SIZE + index + 1).toString().padStart(2, '0')}</span>
              <span class="artist-name">${escapeHtml(artist.name)}</span>
              <span class="artist-song-count">${artistSongs.length} ${artistSongs.length === 1 ? 'song' : 'songs'}</span>
              <span class="expand-icon" aria-hidden="true">${expanded ? '−' : '+'}</span>
            </button>
            ${expanded ? `<div class="artist-songs song-list">${artistSongs.map((song) => renderSongCard(song, '')).join('')}</div>` : ''}
          </section>`;
        }).join('')}
      </div>
      ${renderPagination(page, pageCount, 'artists')}
    ` : '<div class="empty-state large"><span aria-hidden="true">∅</span><strong>No artists found.</strong><p>Try a different search or year range.</p></div>'}
  `;
}

function renderSongCard(song, query) {
  const expanded = state.expandedSongId === song.id;
  return `<article class="song-card ${expanded ? 'expanded' : ''}">
    <button class="song-summary" data-song-id="${escapeAttribute(song.id)}" aria-expanded="${expanded}">
      <span class="song-year">${song.year}</span>
      <span class="song-main"><strong>${escapeHtml(song.title)}</strong><small>${escapeHtml(song.artist)}</small></span>
      <span class="song-position">${song.chartPosition ? `#${escapeHtml(song.chartPosition)}` : ''}</span>
      <span class="expand-icon" aria-hidden="true">${expanded ? '−' : '+'}</span>
    </button>
    ${expanded ? `<div class="song-lyrics"><div class="lyrics-label">LYRICS <span>·</span> ${song.year}</div><p>${renderHighlightedLyrics(song.lyrics, query)}</p></div>` : ''}
  </article>`;
}

function renderHighlightedLyrics(lyrics, query) {
  if (!query) return escapeWithBreaks(lyrics);
  const lowerLyrics = lyrics.toLocaleLowerCase();
  const lowerQuery = query.toLocaleLowerCase();
  let cursor = 0;
  let markup = '';
  let index = lowerLyrics.indexOf(lowerQuery);
  while (index !== -1) {
    markup += `${escapeWithBreaks(lyrics.slice(cursor, index))}<mark>${escapeWithBreaks(lyrics.slice(index, index + query.length))}</mark>`;
    cursor = index + query.length;
    index = lowerLyrics.indexOf(lowerQuery, cursor);
  }
  return `${markup}${escapeWithBreaks(lyrics.slice(cursor))}`;
}

function escapeWithBreaks(text) {
  return escapeHtml(text).replace(/\r?\n/g, '<br>');
}

function renderPagination(page, pageCount, kind) {
  if (pageCount <= 1) return '';
  const label = kind === 'kwic' ? 'Concordance' : kind === 'artists' ? 'Artist list' : 'Song list';
  return `<nav class="pagination" aria-label="${label} pages">
    <button class="page-button" data-page="${kind}" data-direction="-1" ${page === 0 ? 'disabled' : ''}>← <span>Previous</span></button>
    <span>Page <strong>${page + 1}</strong> of ${pageCount}</span>
    <button class="page-button" data-page="${kind}" data-direction="1" ${page >= pageCount - 1 ? 'disabled' : ''}><span>Next</span> →</button>
  </nav>`;
}

function bindEvents() {
  const menuToggle = app.querySelector('.site-menu-toggle');
  menuToggle?.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    app.querySelector('#site-navigation')?.classList.toggle('open', !expanded);
  });

  app.querySelectorAll('[data-tab]').forEach((button) => {
    button.addEventListener('click', () => setTab(button.dataset.tab));
  });
  app.querySelectorAll('[data-word]').forEach((button) => {
    button.addEventListener('click', () => {
      state.concordanceQuery = button.dataset.word;
      setTab('concordance');
    });
  });

  const fromYear = app.querySelector('#from-year');
  const toYear = app.querySelector('#to-year');
  fromYear?.addEventListener('change', () => {
    state.fromYear = Number(fromYear.value);
    if (state.fromYear > state.toYear) state.toYear = state.fromYear;
    state.kwicPage = 0;
    state.songPage = 0;
    state.artistPage = 0;
    render();
  });
  toYear?.addEventListener('change', () => {
    state.toYear = Number(toYear.value);
    if (state.toYear < state.fromYear) state.fromYear = state.toYear;
    state.kwicPage = 0;
    state.songPage = 0;
    state.artistPage = 0;
    render();
  });

  app.querySelectorAll('.year-bar').forEach((bar) => {
    const selectYear = () => {
      state.fromYear = Number(bar.dataset.year);
      state.toYear = Number(bar.dataset.year);
      render();
    };
    bar.addEventListener('click', selectYear);
    bar.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectYear();
      }
    });
  });

  app.querySelector('#concordance-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    state.concordanceQuery = app.querySelector('#concordance-query').value.trim();
    state.kwicPage = 0;
    render();
    app.querySelector('#concordance-query')?.focus();
  });
  app.querySelector('#compare-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    state.compareFirst = app.querySelector('#compare-first').value.trim();
    state.compareSecond = app.querySelector('#compare-second').value.trim();
    const firstTokens = normalizeComparisonString(state.compareFirst);
    const secondTokens = normalizeComparisonString(state.compareSecond);
    let focusId = '#compare-first';

    if (!firstTokens) {
      state.compareError = 'Enter a word or phrase in the first field.';
    } else if (!secondTokens) {
      focusId = '#compare-second';
      state.compareError = 'Enter a word or phrase in the second field.';
    } else if (firstTokens.join(' ') === secondTokens.join(' ')) {
      focusId = '#compare-second';
      state.compareError = 'Choose two different words or phrases to compare.';
    } else {
      state.compareError = '';
    }

    render();
    if (state.compareError) app.querySelector(focusId)?.focus();
  });
  app.querySelector('#whole-word')?.addEventListener('change', (event) => {
    state.wholeWord = event.target.checked;
    state.kwicPage = 0;
    render();
  });
  app.querySelector('#song-query')?.addEventListener('input', (event) => {
    const cursor = event.target.selectionStart;
    state.songQuery = event.target.value;
    state.songPage = 0;
    render();
    const input = app.querySelector('#song-query');
    input.focus();
    input.setSelectionRange(cursor, cursor);
  });
  app.querySelector('#artist-query')?.addEventListener('input', (event) => {
    const cursor = event.target.selectionStart;
    state.artistQuery = event.target.value;
    state.artistPage = 0;
    render();
    const input = app.querySelector('#artist-query');
    input.focus();
    input.setSelectionRange(cursor, cursor);
  });

  app.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
      const offset = Number(button.dataset.direction);
      if (button.dataset.page === 'kwic') state.kwicPage += offset;
      else if (button.dataset.page === 'artists') state.artistPage += offset;
      else state.songPage += offset;
      render();
    });
  });

  app.querySelectorAll('[data-artist-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.expandedArtistId = state.expandedArtistId === button.dataset.artistId
        ? null
        : button.dataset.artistId;
      render();
    });
  });

  app.querySelectorAll('[data-song-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const song = state.songs.find((item) => item.id === button.dataset.songId);
      if (!song) return;
      state.expandedSongId = state.expandedSongId === song.id ? null : song.id;
      if (state.tab === 'concordance') {
        state.tab = 'songs';
        state.songQuery = song.title;
        const matchingSongs = filteredSongs().filter((item) =>
          `${item.title} ${item.artist} ${item.lyrics}`.toLocaleLowerCase().includes(state.songQuery.toLocaleLowerCase()),
        );
        const songIndex = matchingSongs.findIndex((item) => item.id === song.id);
        state.songPage = songIndex >= 0 ? Math.floor(songIndex / PAGE_SIZE) : 0;
      }
      render();
    });
  });
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function escapeAttribute(text) {
  return escapeHtml(text);
}

async function start() {
  try {
    const response = await fetch(corpusUrl);
    if (!response.ok) throw new Error(`The CSV request failed (${response.status}).`);
    state.songs = parseCorpus(await response.text());
    render();
  } catch (error) {
    app.innerHTML = `<main class="error-state"><p class="eyebrow">CORPUS COULD NOT LOAD</p><h1>Something went wrong.</h1><p>${escapeHtml(error.message)}</p><p>Check that <code>country-corpus.csv</code> is present and try again.</p></main>`;
    console.error(error);
  }
}

start();
