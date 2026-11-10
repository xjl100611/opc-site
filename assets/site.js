(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 移动端菜单 ---------- */
  var burger = document.querySelector('.burger');
  var mm = document.getElementById('mobileMenu');
  if (burger && mm) {
    var setMenu = function (open) {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      mm.setAttribute('data-open', open ? '1' : '0');
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        mm.setAttribute('tabindex', '-1');
        mm.focus({ preventScroll: true });
      }
    };
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        burger.focus();
      }
    });
    mm.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 820 && burger.getAttribute('aria-expanded') === 'true') setMenu(false);
    });
  }

  /* ---------- 滚动显现 ---------- */
  var rvs = document.querySelectorAll('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    for (var i = 0; i < rvs.length; i++) rvs[i].classList.add('on');
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('on');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    for (var j = 0; j < rvs.length; j++) io.observe(rvs[j]);
  }

  /* ---------- 标注线绘制 ---------- */
  var draws = document.querySelectorAll('.draw');
  if (reduce) {
    for (var d = 0; d < draws.length; d++) draws[d].classList.add('on');
  } else {
    requestAnimationFrame(function () {
      setTimeout(function () {
        for (var k = 0; k < draws.length; k++) draws[k].classList.add('on');
      }, 180);
    });
  }

  /* ---------- 筛选 ---------- */
  var chips = document.querySelectorAll('.chip[data-filter]');
  if (chips.length) {
    var items = document.querySelectorAll('[data-cat]');
    var apply = function (val) {
      var shown = 0;
      items.forEach(function (el) {
        var ok = val === 'all' || el.getAttribute('data-cat') === val;
        el.style.display = ok ? '' : 'none';
        if (ok) shown++;
      });
      var empty = document.getElementById('filterEmpty');
      if (empty) empty.style.display = shown ? 'none' : 'block';
    };
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
        c.setAttribute('aria-pressed', 'true');
        apply(c.getAttribute('data-filter'));
      });
    });
  }

  /* ---------- 预约表单 ---------- */
  var form = document.getElementById('visitForm');
  if (form) {
    var ok = document.getElementById('formNotice');
    var showErr = function (input, msg) {
      var box = input.closest('.field');
      var err = box ? box.querySelector('.err') : null;
      input.setAttribute('aria-invalid', 'true');
      if (err) {
        err.textContent = msg;
        err.setAttribute('data-show', '1');
      }
    };
    var clearErr = function (input) {
      var box = input.closest('.field');
      var err = box ? box.querySelector('.err') : null;
      input.removeAttribute('aria-invalid');
      if (err) {
        err.textContent = '';
        err.setAttribute('data-show', '0');
      }
    };

    form.querySelectorAll('input,select,textarea').forEach(function (el) {
      el.addEventListener('input', function () { clearErr(el); });
      el.addEventListener('change', function () { clearErr(el); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('#f-name');
      var tel = form.querySelector('#f-tel');
      var type = form.querySelector('#f-type');
      var firstBad = null;

      if (!name.value.trim()) { showErr(name, '填一下怎么称呼'); firstBad = firstBad || name; }
      var tv = tel.value.replace(/\s/g, '');
      var loose = form.getAttribute('data-tel') === 'loose';
      if (loose) {
        if (tv.length < 5) { showErr(tel, '留个手机号或微信号，方便我们回你'); firstBad = firstBad || tel; }
      } else if (!/^1[3-9]\d{9}$/.test(tv)) {
        showErr(tel, '填 11 位手机号，我们会用它确认时间'); firstBad = firstBad || tel;
      }
      if (!type.value) { showErr(type, '选一个你更关心的方向'); firstBad = firstBad || type; }

      if (firstBad) { firstBad.focus(); return; }

      var btn = form.querySelector('button[type="submit"]');
      var label = btn.textContent;
      btn.disabled = true;
      btn.textContent = '提交中…';

      setTimeout(function () {
        btn.disabled = false;
        btn.textContent = label;
        form.reset();
        form.querySelectorAll('.err').forEach(function (e) { e.textContent = ''; e.setAttribute('data-show', '0'); });
        form.querySelectorAll('[aria-invalid]').forEach(function (e) { e.removeAttribute('aria-invalid'); });
        if (ok) {
          ok.setAttribute('data-show', '1');
          ok.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
          ok.focus();
        }
      }, 700);
    });
  }





  /* ---------- 联系页：按 ?topic= 预选来意 ---------- */
  (function () {
    var sel = document.getElementById('f-type');
    if (!sel) return;
    var topic = null;
    try { topic = new URLSearchParams(location.search).get('topic'); } catch (e) {}
    if (!topic) return;
    var opt = sel.querySelector('option[value="' + topic + '"]');
    if (!opt) return;
    sel.value = topic;
    var note = document.getElementById('topicNote');
    if (note) {
      note.textContent = '你在了解：' + opt.textContent.trim() + '　（可选别的，也能改）';
      note.hidden = false;
    }
  })();

  /* ---------- 分导航当前项跟随锚点 ---------- */
  (function () {
    var here = (location.pathname.split('/').pop() || 'index.html');
    var hash = location.hash || '';
    var links = document.querySelectorAll('[data-sub]');
    if (!links.length) return;
    var match = null;
    links.forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('#');
      var file = href[0] || here;
      var h = href[1] ? '#' + href[1] : '';
      if (file === here && h === hash && !match) match = a;
    });
    if (!match) return;
    links.forEach(function (a) {
      var group = a.parentNode;
      if (group === match.parentNode) a.removeAttribute('aria-current');
    });
    match.setAttribute('aria-current', 'page');
  })();

  /* ---------- 首屏视频：静音循环 + 点击弹出完整片 ---------- */
  var heroVideo = document.getElementById('introVideo');
  var ctrlBtn = document.querySelector('.video-ctrl');
  var openBtn = document.querySelector('.video-open');
  var modal = document.getElementById('videoModal');
  var modalVideo = document.getElementById('modalVideo');
  var closeBtn = modal ? modal.querySelector('.vmodal-x') : null;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var setCtrl = function (paused) {
    if (!ctrlBtn) return;
    ctrlBtn.classList.toggle('is-paused', paused);
    ctrlBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
    ctrlBtn.setAttribute('aria-label', paused ? '播放' : '暂停');
  };

  if (heroVideo && ctrlBtn) {
    if (reduceMotion) {
      heroVideo.pause();
      heroVideo.removeAttribute('autoplay');
      setCtrl(true);
    }
    ctrlBtn.addEventListener('click', function () {
      if (heroVideo.paused) { heroVideo.play(); setCtrl(false); }
      else { heroVideo.pause(); setCtrl(true); }
    });
  }

  var loadingEl = document.getElementById('vmodalLoading');
  var videoUrl = 'assets/park-intro.mp4';
  var blobUrl = null;
  var blobLoading = false;

  var setLoading = function (text) {
    if (!loadingEl) return;
    if (text) { loadingEl.textContent = text; loadingEl.hidden = false; }
    else { loadingEl.hidden = true; }
  };

  var startPlayback = function () {
    if (!modalVideo) return;
    modalVideo.currentTime = 0;
    var p = modalVideo.play();
    if (p && p.catch) p.catch(function () {});
  };

  var loadFullVideo = function () {
    if (blobUrl || blobLoading) return;
    blobLoading = true;
    setLoading('正在加载…');
    fetch(videoUrl).then(function (res) {
      if (!res.ok) throw new Error('http');
      var total = Number(res.headers.get('Content-Length')) || 0;
      var reader = res.body && res.body.getReader ? res.body.getReader() : null;
      if (!reader) return res.blob();
      var chunks = [];
      var got = 0;
      var pump = function () {
        return reader.read().then(function (r) {
          if (r.done) return new Blob(chunks, { type: 'video/mp4' });
          chunks.push(r.value);
          got += r.value.length;
          if (total) setLoading('正在加载 ' + Math.round(got / total * 100) + '%');
          return pump();
        });
      };
      return pump();
    }).then(function (blob) {
      blobUrl = URL.createObjectURL(blob);
      modalVideo.preload = 'auto';
      modalVideo.src = blobUrl;
      modalVideo.load();
      blobLoading = false;
      setLoading(null);
      startPlayback();
    }).catch(function () {
      // 取不到就退回 <source>，能播但不能拖
      blobLoading = false;
      setLoading(null);
      startPlayback();
    });
  };

  var openModal = function () {
    if (!modal) return;
    if (heroVideo) heroVideo.pause();
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    if (blobUrl) { setLoading(null); startPlayback(); }
    else { loadFullVideo(); }
    if (closeBtn) closeBtn.focus();
  };
  var closeModal = function () {
    if (!modal || modal.hidden) return;
    if (modalVideo) { modalVideo.pause(); modalVideo.currentTime = 0; }
    modal.hidden = true;
    document.body.style.overflow = '';
    if (heroVideo && !reduceMotion) { heroVideo.play(); setCtrl(false); }
    if (openBtn) openBtn.focus();
  };

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  /* ---------- 主题切换 ---------- */
  var themeBtn = document.getElementById('themeBtn');
  var rootEl = document.documentElement;
  if (themeBtn) {
    var syncTheme = function () {
      var dark = rootEl.getAttribute('data-theme') === 'dark';
      themeBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
      var label = dark ? '切换到浅色模式' : '切换到深色模式';
      themeBtn.setAttribute('aria-label', label);
      themeBtn.setAttribute('title', label);
    };
    syncTheme();
    themeBtn.addEventListener('click', function () {
      var dark = rootEl.getAttribute('data-theme') === 'dark';
      if (dark) {
        rootEl.removeAttribute('data-theme');
        try { localStorage.setItem('cq-theme', 'light'); } catch (e) {}
      } else {
        rootEl.setAttribute('data-theme', 'dark');
        try { localStorage.setItem('cq-theme', 'dark'); } catch (e) {}
      }
      syncTheme();
    });
  }

  /* ---------- 登录演示表单 ---------- */
  var loginForm = document.getElementById('loginForm');
  if (loginForm) {
    var ln = document.getElementById('loginNotice');
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var tel = loginForm.querySelector('#l-tel');
      var pwd = loginForm.querySelector('#l-pwd');
      var bad = null;
      if (!/^1[3-9]\d{9}$/.test(tel.value.replace(/\s/g, ''))) {
        bad = tel; tel.setAttribute('aria-invalid', 'true');
      } else { tel.removeAttribute('aria-invalid'); }
      if (pwd.value.length < 6) {
        pwd.setAttribute('aria-invalid', 'true'); bad = bad || pwd;
      } else { pwd.removeAttribute('aria-invalid'); }
      if (bad) { bad.focus(); return; }
      if (ln) { ln.setAttribute('data-show', '1'); ln.focus(); }
    });
  }

  /* ---------- 平滑锚点 ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      t.setAttribute('tabindex', '-1');
      t.focus({ preventScroll: true });
    });
  });
})();
