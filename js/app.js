/**
 * Side B — 3D WebGL CD Jewel Case Player Controller
 * Pairs Three.js WebGL physics engine with audio playback and HUD controls.
 */
(function() {
  const discsData = window.discsData;
  const createCdCase = window.createCdCase;

  if (!discsData || !createCdCase) {
    console.error('Missing dependencies: discsData or createCdCase');
    return;
  }

  // --- State ---
  let currentIndex = 0;
  let isSpinning = true;
  let isPaused = false;
  let isPlayingAudio = false;
  let isOpen = false;
  let cdInstance = null;

  // --- DOM Elements ---
  const mainEl = document.getElementById('cd-main');
  const stageEl = document.getElementById('cd-stage');
  const failEl = document.getElementById('cd-fail');
  const srStatusEl = document.getElementById('cd-sr-status');
  const noteSideEl = document.getElementById('cd-note-side');
  const noteQuoteEl = document.getElementById('cd-note-quote');
  const railEl = document.getElementById('cd-rail');

  const btnSpin = document.getElementById('btn-spin');
  const btnOpen = document.getElementById('btn-open');
  const btnPause = document.getElementById('btn-pause');

  const playerBtn = document.getElementById('player-btn');
  const playerIconPlay = document.getElementById('player-icon-play');
  const playerIconPause = document.getElementById('player-icon-pause');
  const playerTitle = document.getElementById('player-title');
  const playerArtist = document.getElementById('player-artist');
  const playerFill = document.getElementById('player-fill');
  const playerScrub = document.getElementById('player-scrub');
  const playerCount = document.getElementById('player-count');
  const playerTime = document.getElementById('player-time');

  const audioEl = document.getElementById('cd-audio');

  // --- Dynamic Rail Thumbnails Generation ---
  if (railEl && railEl.children.length === 0) {
    discsData.forEach((d, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cd-thumb';
      btn.setAttribute('data-index', String(idx));
      btn.setAttribute('aria-label', `${d.artist} — ${d.name}`);
      btn.style.setProperty('--tilt', `${d.tilt || 0}deg`);
      if (idx === 0) {
        btn.setAttribute('data-active', 'true');
        btn.setAttribute('aria-current', 'true');
      }

      const img = document.createElement('img');
      img.src = d.thumb || d.art;
      img.alt = '';
      img.draggable = false;

      const bar = document.createElement('span');
      bar.className = 'cd-bar';
      bar.style.setProperty('--p', '0');

      btn.appendChild(img);
      btn.appendChild(bar);
      railEl.appendChild(btn);
    });
  }

  const thumbs = Array.from(railEl.querySelectorAll('.cd-thumb'));

  // --- Helper: Format seconds to M:SS ---
  function formatTime(secs) {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  // --- Update UI for current track ---
  function updateTrackUI(index) {
    currentIndex = index;
    const track = discsData[index];
    if (!track) return;

    // Screen reader announcement
    if (srStatusEl) {
      srStatusEl.textContent = `${track.artist} — ${track.name}${isOpen ? ', case open' : ''}`;
    }

    // Top-left narrative notes
    if (noteSideEl) {
      noteSideEl.textContent = `${track.side || 'Side A'} · ${track.year || 'Archive'}`;
    }
    if (noteQuoteEl) {
      noteQuoteEl.textContent = `"${track.message || track.quote || ''}"`;
    }

    // Floating Minimal Player
    if (playerTitle) playerTitle.textContent = track.name;
    if (playerArtist) playerArtist.textContent = track.artist;
    if (playerCount) {
      playerCount.textContent = `${String(index + 1).padStart(2, '0')}/${String(discsData.length).padStart(2, '0')}`;
    }
    if (playerFill) playerFill.style.width = '0%';
    if (playerTime) playerTime.textContent = '0:00';

    // Active thumbnail highlighting
    thumbs.forEach((th, i) => {
      if (i === index) {
        th.setAttribute('data-active', 'true');
        th.setAttribute('aria-current', 'true');
      } else {
        th.removeAttribute('data-active');
        th.removeAttribute('aria-current');
      }
    });

    // Smooth scroll thumbnail dock to active disc
    const activeThumb = thumbs[index];
    if (activeThumb && railEl) {
      const offset = activeThumb.offsetLeft - (railEl.clientWidth - activeThumb.offsetWidth) / 2;
      railEl.scrollTo({ left: offset, behavior: 'smooth' });
    }

    // Audio stream loading
    const wasPlaying = isPlayingAudio;
    if (audioEl) {
      audioEl.src = track.audio;
      audioEl.load();
      if (wasPlaying) {
        audioEl.play().then(() => {
          setIsPlayingAudio(true);
        }).catch(err => {
          console.warn('Playback interrupted:', err);
          setIsPlayingAudio(false);
        });
      }
    }
  }

  function setIsPlayingAudio(playing) {
    isPlayingAudio = playing;
    isPaused = !playing;

    if (playerIconPlay && playerIconPause) {
      if (playing) {
        playerIconPlay.style.display = 'none';
        playerIconPause.style.display = 'block';
      } else {
        playerIconPlay.style.display = 'block';
        playerIconPause.style.display = 'none';
      }
    }

    if (btnPause) {
      if (playing) {
        btnPause.setAttribute('aria-label', 'Pause');
        btnPause.setAttribute('aria-pressed', 'false');
        btnPause.removeAttribute('data-on');
      } else {
        btnPause.setAttribute('aria-label', 'Play');
        btnPause.setAttribute('aria-pressed', 'true');
        btnPause.setAttribute('data-on', 'true');
      }
    }
  }

  function togglePlay() {
    if (!audioEl) return;
    if (!audioEl.src && discsData[currentIndex]) {
      audioEl.src = discsData[currentIndex].audio;
    }

    if (audioEl.paused) {
      audioEl.play().then(() => {
        setIsPlayingAudio(true);
      }).catch(err => {
        console.warn('Playback gesture required:', err);
      });
    } else {
      audioEl.pause();
      setIsPlayingAudio(false);
    }
  }

  // --- Audio Event Listeners ---
  if (audioEl) {
    audioEl.addEventListener('timeupdate', () => {
      if (audioEl.duration > 0) {
        const p = (audioEl.currentTime / audioEl.duration) * 100;
        if (playerFill) playerFill.style.width = p + '%';
        if (playerTime) playerTime.textContent = formatTime(audioEl.currentTime);

        const activeBar = thumbs[currentIndex]?.querySelector('.cd-bar');
        if (activeBar) {
          activeBar.style.setProperty('--p', (p / 100).toFixed(4));
        }
      }
    });

    audioEl.addEventListener('ended', () => {
      cdInstance?.next();
    });

    audioEl.addEventListener('play', () => setIsPlayingAudio(true));
    audioEl.addEventListener('pause', () => setIsPlayingAudio(false));
  }

  // --- Scrubber Click & Drag ---
  if (playerScrub) {
    playerScrub.addEventListener('click', (e) => {
      if (audioEl && audioEl.duration > 0) {
        const rect = playerScrub.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        audioEl.currentTime = pos * audioEl.duration;
      }
    });
  }

  if (playerBtn) {
    playerBtn.addEventListener('click', togglePlay);
  }

  // --- Initialize 3D WebGL Jewel Case Engine ---
  try {
    cdInstance = createCdCase(stageEl, discsData, {
      record: false,
      getPaused: () => isPaused,
      getSpin: () => isSpinning,
      onIndex: (idx) => {
        updateTrackUI(idx);
      },
      onOpen: (open) => {
        isOpen = open;
        if (btnOpen) {
          btnOpen.setAttribute('aria-pressed', open ? 'true' : 'false');
          if (open) btnOpen.setAttribute('data-on', 'true');
          else btnOpen.removeAttribute('data-on');
        }
        if (srStatusEl && discsData[currentIndex]) {
          srStatusEl.textContent = `${discsData[currentIndex].artist} — ${discsData[currentIndex].name}${open ? ', case open' : ''}`;
        }
      },
      onProgress: (p) => {
        // Spin progress sync
      },
      onReady: () => {
        if (mainEl) mainEl.setAttribute('data-ready', 'true');
        updateTrackUI(0);
      },
      onFail: () => {
        if (failEl) failEl.setAttribute('data-show', 'true');
      }
    });
  } catch (err) {
    console.error('WebGL Initialization error:', err);
    if (failEl) failEl.setAttribute('data-show', 'true');
  }

  // --- Rail Thumbnail Clicks ---
  thumbs.forEach((th, idx) => {
    th.addEventListener('click', () => {
      if (currentIndex === idx) {
        togglePlay();
      } else {
        cdInstance?.goTo(idx);
      }
    });
  });

  // --- Tool Action Buttons ---
  if (btnSpin) {
    btnSpin.addEventListener('click', () => {
      isSpinning = !isSpinning;
      btnSpin.setAttribute('aria-pressed', isSpinning ? 'true' : 'false');
      if (isSpinning) btnSpin.setAttribute('data-on', 'true');
      else btnSpin.removeAttribute('data-on');
    });
  }

  if (btnOpen) {
    btnOpen.addEventListener('click', () => {
      cdInstance?.setOpen();
    });
  }

  if (btnPause) {
    btnPause.addEventListener('click', togglePlay);
  }

  // --- Keyboard Shortcuts ---
  window.addEventListener('keydown', (e) => {
    if (e.target && e.target.closest && e.target.closest('input, textarea, select')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      cdInstance?.next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      cdInstance?.prev();
    } else if (e.key === 'o' || e.key === 'O') {
      e.preventDefault();
      cdInstance?.setOpen();
    } else if (e.key === 's' || e.key === 'S') {
      e.preventDefault();
      btnSpin?.click();
    } else if (e.key === ' ') {
      e.preventDefault();
      togglePlay();
    }
  });

})();
