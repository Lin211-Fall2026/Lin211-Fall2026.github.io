import Papa from 'papaparse';
import corpusUrl from '../country-corpus.csv?url';
import './style.css';

const START_YEAR = 1944;
const END_YEAR = 2024;
const PAGE_SIZE = 20;
const KWIC_PAGE_SIZE = 50;
const MAX_KWIC_RESULTS = 1000;
const WORD_PATTERN = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;
const STOP_WORDS = new Set(
  `a about above after again against all am an and any are as at ain't aren't be because been before being
  below between both but by can could did do does doing down during each few for from further
  had has have having hadn't hasn't haven't he he'd he'll her here hers herself him himself his how he's i i'd i'll i'm i've
  if in into is it it'd it'll it's its itself
  just me more most my myself no nor not of off on once only or other our ours ourselves out over
  own same she she'd she'll she's should so some such than that the their theirs them themselves then there these
  that's there's they they'd they'll they're they've this those through to too under until up very was wasn't
  we we'd we'll we're we've were weren't what what's when where which while who who's whom why will won't
  with would wouldn't you you'd you'll you're you've your yours yourself yourselves can't couldn't didn't
  doesn't don't`.split(/\s+/),
);

const state = {
  songs: [],
  tab: 'overview',
  fromYear: START_YEAR,
  toYear: END_YEAR,
  concordanceQuery: '',
  wholeWord: true,
  songQuery: '',
  songPage: 0,
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

function setTab(tab) {
  state.tab = tab;
  state.kwicPage = 0;
  state.songPage = 0;
  render();
}

function render() {
  const songs = filteredSongs();
  app.innerHTML = `
    <header class="topbar">
      <a class="brand" href="#top" aria-label="Country Lines home">
        <span class="brand-mark" aria-hidden="true">CL</span>
        <span>COUNTRY <b>LINES</b></span>
      </a>
      <nav class="main-nav" aria-label="Main navigation">
        <button class="nav-button ${state.tab === 'overview' ? 'active' : ''}" data-tab="overview" aria-current="${state.tab === 'overview' ? 'page' : 'false'}">Explore</button>
        <button class="nav-button ${state.tab === 'concordance' ? 'active' : ''}" data-tab="concordance" aria-current="${state.tab === 'concordance' ? 'page' : 'false'}">Find a word</button>
        <button class="nav-button ${state.tab === 'songs' ? 'active' : ''}" data-tab="songs" aria-current="${state.tab === 'songs' ? 'page' : 'false'}">Browse songs</button>
      </nav>
      <span class="date-badge">1944 <i>—</i> 2024</span>
    </header>

    <main id="top">
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow"><span class="eyebrow-dot"></span> A small window into a big tradition</p>
          <h1>Country music,<br /><em>line by line.</em></h1>
          <p class="hero-description">What do country songs talk about? Follow the words across eight decades, find them in context, and make your own discoveries.</p>
          <button class="text-link" data-tab="concordance">Start with a word <span aria-hidden="true">↗</span></button>
        </div>
        <div class="hero-art" aria-hidden="true">
          <div class="sun"></div>
          <div class="horizon-line"></div>
          <span class="art-caption">WORDS HAVE<br />A PLACE &amp; TIME</span>
          <span class="art-year">’44—’24</span>
          <svg viewBox="0 0 420 300" role="presentation">
            <path class="hill hill-back" d="M0 190 Q80 100 170 175 T360 145 T520 150 V320 H0Z" />
            <path class="hill hill-front" d="M0 230 Q105 130 220 205 T420 180 V320 H0Z" />
            <path class="road" d="M190 300 C212 260 195 220 235 194 C270 171 264 149 291 130" />
            <path class="road-edge" d="M190 300 C212 260 195 220 235 194 C270 171 264 149 291 130" />
            <path class="road-mark" d="M192 300 C210 260 194 220 235 194 C267 171 261 149 291 130" />
            <path class="grass" d="M0 268 Q80 236 145 258 T280 245 T430 255 V320 H0Z" />
            <circle class="flower flower-one" cx="73" cy="254" r="3" />
            <circle class="flower flower-two" cx="333" cy="242" r="3" />
            <circle class="flower flower-three" cx="368" cy="268" r="2" />
          </svg>
        </div>
      </section>

      <section class="data-ribbon" aria-label="Corpus overview">
        <div class="ribbon-intro"><span class="small-caps">THE COLLECTION</span><span>Charting songs, selected years</span></div>
        <div class="stat"><strong>${state.songs.length}</strong><span>songs</span></div>
        <div class="stat"><strong>${new Set(state.songs.map((song) => song.artist)).size}</strong><span>artists &amp; groups</span></div>
        <div class="stat"><strong>${new Set(state.songs.map((song) => Math.floor(song.year / 10) * 10)).size}</strong><span>decades</span></div>
      </section>

      <section class="workspace" aria-label="Corpus explorer">
        <div class="workspace-heading">
          <div>
            <p class="eyebrow">YOUR VIEW OF THE CORPUS</p>
            <h2>${tabHeading()}</h2>
          </div>
          <div class="year-filter">
            <label for="from-year">Years</label>
            <select id="from-year" aria-label="First year in range">${yearOptions(state.fromYear)}</select>
            <span>to</span>
            <select id="to-year" aria-label="Last year in range">${yearOptions(state.toYear)}</select>
          </div>
        </div>

        <div class="tab-panel">
          ${state.tab === 'overview' ? renderOverview(songs) : ''}
          ${state.tab === 'concordance' ? renderConcordance(songs) : ''}
          ${state.tab === 'songs' ? renderSongBrowser(songs) : ''}
        </div>
      </section>

      <footer class="site-footer">
        <div><span class="brand-mark small" aria-hidden="true">CL</span><span>Country Lines <span class="footer-divider">/</span> A corpus explorer</span></div>
        <p>Lyrics are shown for classroom research and linguistic exploration.</p>
      </footer>
    </main>
  `;

  bindEvents();
}

function tabHeading() {
  if (state.tab === 'concordance') return 'Find a word in context';
  if (state.tab === 'songs') return 'Browse the songbook';
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
          <div><h3>Hits through the years</h3><p>Each mark is a song in the collection. Select a year to focus on it.</p></div>
          <span class="panel-index">01 / TIME</span>
        </div>
        <div class="timeline-wrap">
          <svg class="timeline-chart" viewBox="0 0 920 220" role="img" aria-label="Number of songs in the corpus by year">${renderTimeline(counts, visibleYears, maxYearCount)}</svg>
        </div>
        <div class="chart-legend"><span><i></i> Songs in the collection</span><span>Year range: ${state.fromYear}–${state.toYear}</span></div>
      </section>

      <section class="panel word-panel">
        <div class="panel-title-row">
          <div><h3>Words that come up</h3><p>Frequent words, with common grammatical words left out.</p></div>
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
      <div><span class="question-spark" aria-hidden="true">✳</span><div><h3>Not sure where to begin?</h3><p>Try one of these words and see what the surrounding lines reveal.</p></div></div>
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
      <div class="empty-prompt"><span class="prompt-orbit" aria-hidden="true">?</span><div><strong>One word can open up a whole songbook.</strong><p>Type a word above, or pick one to get started:</p><div class="suggestion-list">${['love', 'home', 'heart', 'road'].map((word) => `<button class="suggestion" data-word="${word}">${word}<span aria-hidden="true"> ↗</span></button>`).join('')}</div></div></div>
    `}
  `;
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
  const results = songs.filter((song) => !query || `${song.title} ${song.artist} ${song.lyrics}`.toLocaleLowerCase().includes(query));
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
  return `<nav class="pagination" aria-label="${kind === 'kwic' ? 'Concordance' : 'Song list'} pages">
    <button class="page-button" data-page="${kind}" data-direction="-1" ${page === 0 ? 'disabled' : ''}>← <span>Previous</span></button>
    <span>Page <strong>${page + 1}</strong> of ${pageCount}</span>
    <button class="page-button" data-page="${kind}" data-direction="1" ${page >= pageCount - 1 ? 'disabled' : ''}><span>Next</span> →</button>
  </nav>`;
}

function bindEvents() {
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
    render();
  });
  toYear?.addEventListener('change', () => {
    state.toYear = Number(toYear.value);
    if (state.toYear < state.fromYear) state.fromYear = state.toYear;
    state.kwicPage = 0;
    state.songPage = 0;
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

  app.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
      const offset = Number(button.dataset.direction);
      if (button.dataset.page === 'kwic') state.kwicPage += offset;
      else state.songPage += offset;
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
