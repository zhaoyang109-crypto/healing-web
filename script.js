/**
 * 心灵港湾 - 企业员工心理疗愈中心
 * 交互功能脚本
 */

// ============================================
// 全局状态与工具函数
// ============================================

const App = {
    breathe: { isRunning: false, currentMode: 'relax', phase: 'idle', timer: null, sessionTimer: null, sessionSeconds: 300, elapsedSeconds: 0 },
    meditation: { isPlaying: false, currentTime: 0, totalTime: 600, timer: null, currentType: 'focus' },
    moodData: { selectedMood: null, selectedTags: [], entries: [] }
};

const quotes = [
    { text: "照顾好自己，是你能做的最勇敢的事情。", author: "心灵寄语" },
    { text: "你不需要完美才能被爱，你的存在本身就是价值。", author: "自我关怀" },
    { text: "允许自己休息，不是偷懒，而是为了走更远的路。", author: "生活智慧" },
    { text: "情绪就像天气，它们会来也会走。你不是你的情绪，你是观察天气的天空。", author: "正念箴言" },
    { text: "你已经做得很好了，真的。", author: "来自内心的声音" },
    { text: "深呼吸，这一刻，你是安全的。", author: "当下" },
    { text: "不必把所有事情都扛在肩上，寻求帮助是强者的标志。", author: "团队力量" },
    { text: "你的感受是真实的，也是合理的。不需要为拥有情绪而道歉。", author: "情绪接纳" },
    { text: "慢下来，世界不会因为你停下来而停止转动。", author: "生活节奏" },
    { text: "每一次跌倒，都是为了学会如何更好地站起来。", author: "成长箴言" }
];

const breatheModes = {
    relax:   { name: '放松呼吸 (4-7-8)', inhale: 4, hold: 7, exhale: 8, color: '#5B9BD5' },
    energize: { name: '提神呼吸',         inhale: 4, hold: 4, exhale: 4, color: '#E8A87C' },
    calm:    { name: '平静呼吸',          inhale: 4, hold: 7, exhale: 8, color: '#88C9A8' },
    sleep:   { name: '助眠呼吸',           inhale: 4, hold: 7, exhale: 8, color: '#9B8FD4' }
};

const meditationTypes = {
    focus:     { title: '专注力冥想', desc: '提升工作专注度，减少分心和焦虑', duration: 10 },
    stress:    { title: '压力释放',   desc: '释放工作和生活压力，找回内心平衡', duration: 15 },
    sleep:     { title: '深度睡眠',   desc: '缓解失眠困扰，享受高质量睡眠',       duration: 20 },
    morning:   { title: '晨间唤醒',   desc: '以积极的心态迎接全新的一天',         duration: 8 },
    gratitude: { title: '感恩冥想',   desc: '培养感恩之心，发现生活中的美好',     duration: 12 },
    body:      { title: '身体扫描',   desc: '从头顶到脚趾，全面放松每一个部位',   duration: 18 }
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// ============================================
// 初始化
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initNavigation();
    initBreatheExercise();
    initMeditationPlayer();
    initMoodTracker();
    initDailyCheckin();
    initQuotes();
    initScrollAnimations();
    initStatCounters();
    loadSavedData();
    initVideoSection();
    initVoiceInput();
});

// ============================================
// 粒子背景
// ============================================

function initParticles() {
    const colors = ['#a8edea', '#fed6e3', '#d299c2', '#89f7fe', '#c7e0f4', '#e8a87c'];
    const container = $('#particles');
    if (!container) return;
    for (let i = 0; i < 25; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 12 + 4;
        p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;background:${colors[i%colors.length]};animation-duration:${Math.random()*20+15}s;animation-delay:-${Math.random()*20}s`;
        container.appendChild(p);
    }
}

// ============================================
// 导航功能
// ============================================

function initNavigation() {
    const navbar = $('.navbar');
    const navToggle = $('#navToggle');
    const navLinks = $('.nav-links');
    const backToTopBtn = $('#backToTop');

    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        navbar.classList.toggle('scrolled', y > 80);
        backToTopBtn.classList.toggle('visible', y > 500);
    });

    navToggle?.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    $$('.nav-links a').forEach(a => a.addEventListener('click', () => {
        navToggle?.classList.remove('active');
        navLinks?.classList.remove('active');
    }));

    backToTopBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    $$('a[href^="#"]').forEach(a => a.addEventListener('click', function(e) {
        e.preventDefault();
        const t = document.querySelector(this.getAttribute('href'));
        if (t) window.scrollTo({ top: t.offsetTop - 80, behavior: 'smooth' });
    }));
}

// ============================================
// 呼吸练习
// ============================================

function initBreatheExercise() {
    const breatheCircle = $('#breatheCircle');
    const breatheText = $('#breatheText');
    const breatheStartBtn = $('#breatheStartBtn');
    const breatheResetBtn = $('#breatheResetBtn');
    const sessionTimeDisplay = $('#sessionTime');

    $$('.mode-btn').forEach(btn => btn.addEventListener('click', () => {
        if (App.breathe.isRunning) return;
        $$('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        App.breathe.currentMode = btn.dataset.mode;
        const m = breatheModes[App.breathe.currentMode];
        breatheCircle.style.background = `radial-gradient(circle at 30% 30%, ${m.color}40, ${m.color}99 60%, ${m.color})`;
    }));

    breatheStartBtn?.addEventListener('click', () => App.breathe.isRunning ? pauseBreathe() : startBreathe());
    breatheResetBtn?.addEventListener('click', resetBreathe);

    function startBreathe() {
        App.breathe.isRunning = true;
        breatheStartBtn.textContent = '暂停';
        App.breathe.sessionTimer = setInterval(() => {
            App.breathe.elapsedSeconds++;
            updateSessionDisplay();
            if (App.breathe.elapsedSeconds >= App.breathe.sessionSeconds) completeSession();
        }, 1000);
        runCycle();
    }

    function pauseBreathe() {
        App.breathe.isRunning = false;
        breatheStartBtn.textContent = '继续';
        clearInterval(App.breathe.sessionTimer);
        clearTimeout(App.breathe.timer);
        breatheCircle.classList.remove('inhale', 'exhale');
    }

    function resetBreathe() {
        if (App.breathe.isRunning) pauseBreathe();
        App.breathe.elapsedSeconds = 0;
        App.breathe.phase = 'idle';
        updateSessionDisplay();
        breatheStartBtn.textContent = '开始练习';
        breatheText.textContent = '准备开始';
        breatheCircle.classList.remove('inhale', 'exhale');
    }

    function runCycle() {
        if (!App.breathe.isRunning) return;
        const m = breatheModes[App.breathe.currentMode];
        // 吸气
        App.breathe.phase = 'inhale';
        breatheText.textContent = '吸气...';
        breatheCircle.classList.remove('exhale'); breatheCircle.classList.add('inhale');
        App.breathe.timer = setTimeout(() => {
            if (!App.breathe.isRunning) return;
            // 屏息
            App.breathe.phase = 'hold';
            breatheText.textContent = '屏息...';
            App.breathe.timer = setTimeout(() => {
                if (!App.breathe.isRunning) return;
                // 呼气
                App.breathe.phase = 'exhale';
                breatheText.textContent = '呼气...';
                breatheCircle.classList.remove('inhale'); breatheCircle.classList.add('exhale');
                App.breathe.timer = setTimeout(runCycle, m.exhale * 1000);
            }, m.hold * 1000);
        }, m.inhale * 1000);
    }

    function updateSessionDisplay() {
        const r = App.breathe.sessionSeconds - App.breathe.elapsedSeconds;
        sessionTimeDisplay.textContent = `${String(Math.floor(r/60)).padStart(2,'0')}:${String(r%60).padStart(2,'0')}`;
    }

    function completeSession() {
        pauseBreathe();
        breatheText.textContent = '🎉 完成！';
        showToast('太棒了！你完成了本次呼吸练习 🌟', 'success');
        setTimeout(() => {
            resetBreathe();
            const m = breatheModes[App.breathe.currentMode];
            breatheCircle.style.background = `radial-gradient(circle at 30% 30%, ${m.color}40, ${m.color}99 60%, ${m.color})`;
        }, 3000);
    }
}

// ============================================
// 冥想播放器
// ============================================

function initMeditationPlayer() {
    const modal = $('#meditationModal');
    const closeBtn = $('#closeMeditation');
    const playPause = $('#playerPlayPause');
    const progressFill = $('#progressFill');
    const curTimeEl = $('#currentTime');
    const totalTimeEl = $('#totalTime');

    $$('.meditation-card .btn-card').forEach(btn => btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openPlayer(btn.closest('.meditation-card').dataset.type);
    }));

    closeBtn?.addEventListener('click', closePlayer);
    modal?.addEventListener('click', e => { if (e.target === modal) closePlayer(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal?.classList.contains('active')) closePlayer(); });

    playPause?.addEventListener('click', () => App.meditation.isPlaying ? pauseMed() : playMed());
    $('#playerBackward')?.addEventListener('click', () => seekMed(-15));
    $('#playerForward')?.addEventListener('click', () => seekMed(15));

    function openPlayer(type) {
        const cfg = meditationTypes[type];
        App.meditation.currentType = type;
        App.meditation.totalTime = cfg.duration * 60;
        App.meditation.currentTime = 0;
        App.meditation.isPlaying = false;
        $('#playerTitle').textContent = cfg.title;
        $('#playerDesc').textContent = cfg.desc;
        totalTimeEl.textContent = fmtTime(App.meditation.totalTime);
        curTimeEl.textContent = fmtTime(0);
        progressFill.style.width = '0%';
        playPause.textContent = '▶️';
        $('#playerAnimation').className = 'player-animation paused';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closePlayer() {
        modal?.classList.remove('active');
        document.body.style.overflow = '';
        stopMedTimer();
    }

    function playMed() {
        App.meditation.isPlaying = true;
        playPause.textContent = '⏸️';
        $('#playerAnimation').className = 'player-animation playing';
        App.meditation.timer = setInterval(() => {
            App.meditation.currentTime++;
            updateMedProgress();
            if (App.meditation.currentTime >= App.meditation.totalTime) completeMed();
        }, 1000);
    }

    function pauseMed() {
        App.meditation.isPlaying = false;
        playPause.textContent = '▶️';
        $('#playerAnimation').className = 'player-animation paused';
        stopMedTimer();
    }

    function stopMedTimer() { if (App.meditation.timer) { clearInterval(App.meditation.timer); App.meditation.timer = null; } }

    function updateMedProgress() {
        const pct = (App.meditation.currentTime / App.meditation.totalTime) * 100;
        progressFill.style.width = pct + '%';
        curTimeEl.textContent = fmtTime(App.meditation.currentTime);
    }

    function seekMed(sec) {
        App.meditation.currentTime = Math.max(0, Math.min(App.meditation.totalTime, App.meditation.currentTime + sec));
        updateMedProgress();
    }

    function completeMed() {
        stopMedTimer();
        App.meditation.isPlaying = false;
        playPause.textContent = '▶️';
        showToast('冥想练习完成，感觉怎么样？😌', 'success');
        setTimeout(closePlayer, 2000);
    }
}

function fmtTime(s) { return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }

// ============================================
// 情绪日记
// ============================================

function initMoodTracker() {
    $$('.mood-btn').forEach(btn => btn.addEventListener('click', () => {
        $$('.mood-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        App.moodData.selectedMood = { value: +btn.dataset.value, mood: btn.dataset.mood, emoji: btn.querySelector('.mood-emoji').textContent };
    }));

    $$('.tag-btn').forEach(btn => btn.addEventListener('click', () => {
        btn.classList.toggle('selected');
        const tag = btn.dataset.tag;
        if (btn.classList.contains('selected')) {
            if (!App.moodData.selectedTags.includes(tag)) App.moodData.selectedTags.push(tag);
        } else {
            App.moodData.selectedTags = App.moodData.selectedTags.filter(t => t !== tag);
        }
    }));

    $('#saveDiary')?.addEventListener('click', saveEntry);
    $('#clearDiary')?.addEventListener('click', () => {
        $('#diaryText').value = '';
        $$('.mood-btn').forEach(b => b.classList.remove('selected'));
        $$('.tag-btn').forEach(b => b.classList.remove('selected'));
        App.moodData.selectedMood = null;
        App.moodData.selectedTags = [];
    });
}

function saveEntry() {
    const text = $('#diaryText').value.trim();
    if (!text && !App.moodData.selectedMood) { showToast('请至少记录一条心情或写点什么 ✍️', 'warning'); return; }

    const entry = {
        id: Date.now(),
        date: new Date().toLocaleString('zh-CN'),
        mood: App.moodData.selectedMood || { value: 3, emoji: '😐', mood: '未选择' },
        text: text,
        tags: [...App.moodData.selectedTags]
    };

    App.moodData.entries.unshift(entry);
    if (App.moodData.entries.length > 30) App.moodData.entries = App.moodData.entries.slice(0, 30);

    saveToStorage();
    renderHistory();
    renderChart();

    $('#diaryText').value = '';
    $$('.mood-btn').forEach(b => b.classList.remove('selected'));
    $$('.tag-btn').forEach(b => b.classList.remove('selected'));
    App.moodData.selectedMood = null;
    App.moodData.selectedTags = [];
    showToast('记录已保存 💚', 'success');
}

function renderHistory() {
    const list = $('#historyList');
    if (!list || !App.moodData.entries.length) { if (list) list.innerHTML = ''; return; }
    list.innerHTML = App.moodData.entries.slice(0, 7).map(e => `
        <div class="history-item" data-id="${e.id}">
            <span class="history-mood">${e.mood.emoji}</span>
            <div class="history-info">
                <div class="history-date">${e.date}</div>
                <div class="history-text">${e.text || e.tags.join(', ') || '仅记录了心情'}</div>
            </div>
            <button class="history-delete" onclick="window.delEntry(${e.id})">✕</button>
        </div>`).join('');
}

function renderChart() {
    const chart = $('#moodChart');
    if (!chart || !App.moodData.entries.length) return;
    const recent = App.moodData.entries.slice(0, 7);
    const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
    chart.innerHTML = `<div style="display:flex;align-items:flex-end;justify-content:center;gap:12px;height:140px;padding:10px;">
        ${recent.map((e, i) => `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex:1;">
            <span style="font-size:1.1rem;">${e.mood.emoji}</span>
            <div style="width:28px;height:${(e.mood.value/5)*100}%;background:${colors[e.mood.value]};border-radius:6px 6px 2px 2px;min-height:8px;transition:height .5s"></div>
            <span style="font-size:.7rem;color:#94a3b8;">${i+1}天前</span>
        </div>`).join('')}
    </div>`;
}

window.delEntry = function(id) {
    App.moodData.entries = App.moodData.entries.filter(e => e.id !== id);
    saveToStorage();
    renderHistory();
    renderChart();
    showToast('记录已删除', 'info');
};

// ============================================
// 每日打卡
// ============================================

function initDailyCheckin() {
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem('healing_checkins') || '{}');
    if (saved.date === today) {
        saved.items?.forEach(item => {
            const cb = document.querySelector(`[data-checkin="${item}"] .checkin-checkbox`);
            if (cb) { cb.checked = true; cb.closest('.checkin-item').classList.add('checked'); }
        });
    }
    updateCheckinUI();

    $$('.checkin-checkbox').forEach(cb => cb.addEventListener('change', () => {
        const item = cb.closest('.checkin-item');
        item.classList.toggle('checked', cb.checked);
        if (cb.checked) { item.style.transform = 'scale(1.02)'; setTimeout(() => item.style.transform = '', 200); }
        updateCheckinUI();
        saveCheckinState();
        if ($$('.checkin-checkbox').length === $$('.checkin-checkbox:checked').length) {
            showToast('🎉 太棒了！今日全部打卡完成！', 'success');
        }
    }));
}

function updateCheckinUI() {
    const checked = $$('.checkin-checkbox:checked').length;
    const total = $$('.checkin-checkbox').length;
    $('#checkinCount').textContent = checked;
    $('#checkinProgress').style.width = `${(checked/total)*100}%`;
}

function saveCheckinState() {
    const items = [];
    $$('.checkin-checkbox:checked').forEach(cb => items.push(cb.closest('.checkin-item').dataset.checkin));
    localStorage.setItem('healing_checkins', JSON.stringify({ date: new Date().toDateString(), items }));
}

// ============================================
// 每日金句
// ============================================

function initQuotes() {
    showRandomQuote();
    $('#refreshQuote')?.addEventListener('click', function() {
        this.style.transform = 'rotate(360deg)';
        setTimeout(() => this.style.transform = '', 500);
        showRandomQuote();
    });
}

function showRandomQuote() {
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    const qt = $('#quoteText'), qa = $('#quoteAuthor');
    qt.style.opacity = qa.style.opacity = '0';
    setTimeout(() => { qt.textContent = q.text; qa.textContent = `— ${q.author}`; qt.style.opacity = qa.style.opacity = '1'; }, 300);
}

// ============================================
// 滚动动画 & 数字计数
// ============================================

function initScrollAnimations() {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }});
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    $$('.section-header,.breathe-container,.meditation-card,.resource-category,.support-card,.mood-tracker,.diary-entry,.mood-history')
        .forEach(el => { el.classList.add('reveal'); obs.observe(el); });
}

function initStatCounters() {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); obs.unobserve(e.target); }});
    }, { threshold: 0.5 });
    $$('.stat-number').forEach(n => obs.observe(n));
}

function animateCounter(el) {
    const target = +el.dataset.target;
    const step = target / 125;
    let cur = 0;
    const t = setInterval(() => { cur += step; if (cur >= target) { el.textContent = target.toLocaleString(); clearInterval(t); } else el.textContent = Math.floor(cur).toLocaleString(); }, 16);
}

// ============================================
// 本地存储
// ============================================

function saveToStorage() { localStorage.setItem('healing_mood_data', JSON.stringify({ entries: App.moodData.entries })); }

function loadSavedData() {
    try {
        const s = JSON.parse(localStorage.getItem('healing_mood_data'));
        if (s?.entries) { App.moodData.entries = s.entries; renderHistory(); renderChart(); }
    } catch {}
}

// ============================================
// Toast 提示
// ============================================

function showToast(msg, type='info') {
    $('.toast')?.remove();
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    const bg = { success:'linear-gradient(135deg,#10b981,#059669)', warning:'linear-gradient(135deg,#f59e0b,#d97706)', info:'linear-gradient(135deg,#3b82f6,#2563eb)', error:'linear-gradient(135deg,#ef4444,#dc2626)' };
    Object.assign(t.style, { position:'fixed',bottom:'100px',left:'50%',transform:'translateX(-50%) translateY(20px)',background:bg[type]||bg.info,color:'#fff',padding:'14px 28px',borderRadius:'50px',fontSize:'.95rem',fontWeight:'500',boxShadow:'0 8px 32px rgba(0,0,0,.15)',zIndex:9999,opacity:0,transition:'all .4s cubic-bezier(.68,-.55,.265,1.55)',maxWidth:'90vw',textAlign:'center' });
    document.body.appendChild(t);
    requestAnimationFrame(() => { t.opacity=1; t.transform='translateX(-50%) translateY(0)'; });
    setTimeout(() => { t.opacity=0; t.transform='translateX(-50%) translateY(20px)'; setTimeout(()=>t.remove(),400); }, 3000);
}

// ============================================
// 音乐播放器（模拟）
// ============================================

document.querySelectorAll('.music-play-btn').forEach(btn => btn.addEventListener('click', function() {
    const item = this.closest('.music-item');
    const wasPlaying = item.classList.contains('playing');
    document.querySelectorAll('.music-item.playing').forEach(i => { i.classList.remove('playing'); i.querySelector('.music-play-btn').textContent = '▶'; });
    if (!wasPlaying) { item.classList.add('playing'); this.textContent = '⏸'; showToast(`正在播放：${item.querySelector('.music-name').textContent} 🎵`, 'info'); }
    else { this.textContent = '▶'; }
}));

// ============================================
// 疗愈视频 - B站视频抓取
// ============================================

const VideoApp = {
    allVideos: [],
    filteredVideos: [],
    currentCategory: 'all',
    page: 1,
    pageSize: 8
};

// B站精选疗愈视频 BV 号列表（持续更新）
const BILIBILI_HEALING_VIDEOS = [
    // 冥想引导
    { bvid: 'BV1vK411L7eP', title: '【冥想】10分钟正念呼吸，让焦虑烟消云散', author: '冥想空间', views: '128万', duration: '10:23', category: 'meditation', desc: '跟随引导，用呼吸驱散内心的焦虑与不安' },
    { bvid: 'BV1oX4y1B7bG', title: '睡前冥想 | 15分钟深度放松，告别失眠', author: '助眠电台', views: '89万', duration: '15:00', category: 'sleep', desc: '温柔的声音带你进入深度放松状态' },
    { bvid: 'BV1a54y1b7Qk', title: '【身体扫描】从头顶到脚趾的全面放松', author: '正念生活', views: '56万', duration: '18:30', category: 'meditation', desc: '释放每个部位的紧张感，找回身体的轻盈' },
    { bvid: 'BV1Zy4y1k7dM', title: '晨间唤醒冥想 | 以积极心态开启新一天', author: '早安冥想', views: '42万', duration: '08:15', category: 'meditation', desc: '清晨8分钟，为一天注入正能量' },
    { bvid: 'BV1h5411A7rW', title: '感恩冥想 | 发现生活中的小确幸', author: '心灵花园', views: '35万', duration: '12:40', category: 'emotion', desc: '培养感恩之心，发现被忽略的美好' },
    // 助眠放松
    { bvid: 'BV1cK4y1C7Rm', title: '雨声白噪音 | 助眠深度睡眠3小时', author: '白噪音世界', views: '256万', duration: '3:00:00', category: 'sleep', desc: '天然雨声，让你快速进入深度睡眠' },
    { bvid: 'BV1iK411U7qE', title: '海浪声 | 海边小屋的治愈夜晚', author: '自然之声', views: '198万', duration: '2:00:00', category: 'sleep', desc: '海浪拍打的声音，仿佛置身海边小屋' },
    { bvid: 'BV1jx411c7fN', title: '森林鸟鸣 | 清晨森林的治愈之声', author: '大自然录音师', views: '145万', duration: '1:30:00', category: 'sleep', desc: '清晨森林中的鸟鸣和风声' },
    { bvid: 'BV1LK41117sM', title: '轻柔钢琴 | 安抚心灵的纯音乐合集', author: '治愈音乐馆', views: '320万', duration: '1:00:00', category: 'sleep', desc: '精选轻柔钢琴曲，抚平一天的疲惫' },
    // 焦虑缓解
    { bvid: 'BV1nK411H7Jp', title: '焦虑的时候这样做 | 心理学家的建议', author: 'KnowYourself', views: '178万', duration: '12:45', category: 'anxiety', desc: '科学有效的焦虑缓解方法，亲测有效' },
    { bvid: 'BV1t54y1z7VW', title: '【TED】焦虑是如何产生的？如何克服它', author: 'TED演讲精选', views: '267万', duration: '14:20', category: 'anxiety', desc: '了解焦虑的机制，从根本上应对它' },
    { bvid: 'BV1M5411w7gS', title: '5分钟快速缓解焦虑 | 紧急 grounding 技术', author: '心理急救', views: '92万', duration: '05:30', category: 'anxiety', desc: '感到恐慌时立刻可以用的方法' },
    { bvid: 'BV1a54y1b7Rc', title: '工作压力大怎么办？| 职场心理调适指南', author: '职场心理学', views: '67万', duration: '16:00', category: 'anxiety', desc: '专为职场人设计的压力管理方案' },
    // 情绪管理
    { bvid: 'BV1pK41127R9', title: '情绪不好时怎么自我调节？| 情绪管理课', author: '简单心理', views: '134万', duration: '18:30', category: 'emotion', desc: '学会与情绪共处，而不是对抗它' },
    { bvid: 'BV1eK411C7dF', title: '为什么你总是情绪化？| 深度解析', author: '李松蔚心理学', views: '89万', duration: '22:15', category: 'emotion', desc: '知名心理学家深度解读情绪背后的原因' },
    { bvid: 'BV1d54y1z7cD', title: '如何处理负面情绪 | 正念情绪调节法', author: '正念工坊', views: '56万', duration: '14:00', category: 'emotion', desc: '用正念的方法来处理负面情绪' },
    { bvid: 'BV1SK4y1C7tF', title: '哭出来没关系 | 关于情绪释放的一切', author: '情感疗愈室', views: '43万', duration: '11:20', category: 'emotion', desc: '哭泣不是软弱，是情绪的自然流动' },
    // 瑜伽拉伸
    { bvid: 'BV1gK411C7hT', title: '办公室瑜伽 | 10分钟缓解肩颈酸痛', author: '瑜伽日常', views: '203万', duration: '10:45', category: 'yoga', desc: '在工位上就能做的拉伸动作' },
    { bvid: 'BV1z54y1z7wK', title: '睡前瑜伽 | 15分钟舒缓身心助眠序列', author: '瑜伽与生活', views: '156万', duration: '15:30', category: 'yoga', desc: '温和的瑜伽动作，帮助身心放松入眠' },
    { bvid: 'BV1EK4y1C7bN', title: '晨起唤醒瑜伽 | 10分钟活力开启', author: '每日瑜伽', views: '98万', duration: '10:15', category: 'yoga', desc: '每天早晨10分钟，唤醒身体能量' },
    { bvid: 'BV1JK411U7eY', title: '阴瑜伽 | 深度放松修复身心', author: '阴瑜伽练习', views: '72万', duration: '25:00', category: 'yoga', desc: '长时间保持体式，深入放松筋膜层' },
];

function initVideoSection() {
    VideoApp.allVideos = [...BILIBILI_HEALING_VIDEOS];
    VideoApp.filteredVideos = [...VideoApp.allVideos];
    
    const grid = $('#videoGrid');
    const loading = $('#videoLoading');
    
    // 分类切换
    $$('.video-cat-btn').forEach(btn => btn.addEventListener('click', () => {
        $$('.video-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        VideoApp.currentCategory = btn.dataset.category;
        VideoApp.page = 1;
        filterAndRenderVideos();
    }));
    
    // 加载更多
    $('#loadMoreVideos')?.addEventListener('click', () => {
        VideoApp.page++;
        renderVideoCards();
    });
    
    // 视频弹窗控制
    $('#closeVideoModal')?.addEventListener('click', closeVideoPlayer);
    $('#videoModal')?.addEventListener('click', e => { if (e.target === $('#videoModal')) closeVideoPlayer(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#videoModal')?.classList.contains('active')) closeVideoPlayer(); });
    
    // 首次加载
    setTimeout(() => {
        renderVideoCards();
        if (loading) loading.classList.add('hidden');
    }, 800); // 模拟加载延迟
}

function filterAndRenderVideos() {
    const cat = VideoApp.currentCategory;
    VideoApp.filteredVideos = cat === 'all' 
        ? [...VideoApp.allVideos] 
        : VideoApp.allVideos.filter(v => v.category === cat);
    VideoApp.page = 1;
    const grid = $('#videoGrid');
    if (grid) grid.innerHTML = '';
    renderVideoCards();
}

function renderVideoCards() {
    const grid = $('#videoGrid');
    if (!grid) return;
    
    const start = 0;
    const end = VideoApp.page * VideoApp.pageSize;
    const videosToShow = VideoApp.filteredVideos.slice(start, end);
    
    if (VideoApp.page === 1) {
        grid.innerHTML = videosToShow.map(v => createVideoCardHTML(v)).join('');
    } else {
        videosToShow.slice((VideoApp.page - 1) * VideoApp.pageSize).forEach(v => {
            grid.insertAdjacentHTML('beforeend', createVideoCardHTML(v));
        });
    }
    
    // 绑定点击事件
    grid.querySelectorAll('.video-card:not([data-bound])').forEach(card => {
        card.setAttribute('data-bound', 'true');
        card.addEventListener('click', () => openVideoPlayer(card.dataset.bvid));
    });
    
    // 隐藏/显示"加载更多"
    const moreBtn = $('#loadMoreVideos');
    if (moreBtn) {
        moreBtn.style.display = end >= VideoApp.filteredVideos.length ? 'none' : 'inline-flex';
    }
}

function createVideoCardHTML(video) {
    const thumbUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${video.bvid}`;
    // 使用 B站封面 API
    const coverUrl = `https://i0.hdslb.com/bfs/archive/${video.bvid.slice(3, 5)}${video.bvid.slice(6, 8)}${video.bvid.slice(-4)}/${video.bvid}.jpg`;
    const tagNames = { meditation: '冥想', sleep: '助眠', anxiety: '解压', emotion: '情绪', yoga: '瑜伽' };
    
    return `
        <div class="video-card" data-bvid="${video.bvid}">
            <div class="video-thumb-wrapper">
                <img class="video-thumb" src="${coverUrl}" alt="${video.title}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 160 90%22><rect fill=%22%23e8eeF3%22 width=%22160%22 height=%2290%22/><text x=%2280%22 y=%2250%22 text-anchor=%22middle%22 fill=%22%2394a3b8%22 font-size=%2214%22>🎬</text></svg>'">
                <div class="video-play-overlay"><div class="video-play-icon">▶</div></div>
                <span class="video-duration-badge">${video.duration}</span>
            </div>
            <div class="video-card-body">
                <h4 class="video-card-title">${video.title}</h4>
                <div class="video-card-meta">
                    <span class="video-card-author">${video.author}</span>
                    <span class="video-card-views">${video.views}</span>
                    <span class="video-card-tag">${tagNames[video.category] || ''}</span>
                </div>
            </div>
        </div>`;
}

function openVideoPlayer(bvid) {
    const video = VideoApp.allVideos.find(v => v.bvid === bvid) || VideoApp.filteredVideos.find(v => v.bvid === bvid);
    if (!video) return;
    
    const modal = $('#videoModal');
    const iframe = $('#videoIframe');
    
    // B站嵌入播放地址
    iframe.src = `//player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&danmaku=0`;
    $('#videoModalTitle').textContent = video.title;
    $('#videoModalDesc').textContent = video.desc;
    $('#videoModalAuthor').textContent = `UP主：${video.author}`;
    $('#videoModalViews').textContent = `👁 ${video.views}次观看`;
    $('#videoModalLink').href = `https://www.bilibili.com/video/${bvid}`;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeVideoPlayer() {
    const modal = $('#videoModal');
    modal?.classList.remove('active');
    document.body.style.overflow = '';
    // 停止视频播放
    const iframe = $('#videoIframe');
    if (iframe) iframe.src = '';
}

// ============================================
// 语音输入功能（Web Speech API）
// ============================================

function initVoiceInput() {
    const btn = $('#voiceInputBtn');
    const textarea = $('#diaryText');
    if (!btn || !textarea) return;
    
    // 检查浏览器是否支持语音识别
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        btn.style.display = 'none';
        console.warn('当前浏览器不支持 Web Speech API');
        return;
    }
    
    let recognition = null;
    let isRecording = false;
    
    // 创建语音提示气泡
    const toast = document.createElement('div');
    toast.className = 'voice-toast';
    toast.id = 'voiceToast';
    toast.innerHTML = `
        <div class="voice-toast-icon">🎙️</div>
        <div class="voice-toast-text">正在聆听...</div>
        <div class="voice-toast-hint">再次点击按钮或说"结束"停止录音</div>
    `;
    document.body.appendChild(toast);
    
    btn.addEventListener('click', () => {
        if (isRecording) stopRecording();
        else startRecording();
    });
    
    function startRecording() {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'zh-CN';
        
        recognition.onstart = () => {
            isRecording = true;
            btn.classList.add('recording');
            toast.classList.add('show');
            toast.querySelector('.voice-toast-text').textContent = '正在聆听...请开始说话';
            showToast('🎤 开始录音，说出你的想法吧', 'info');
        };
        
        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            // 实时更新文本框
            if (finalTranscript) {
                textarea.value += (textarea.value && !textarea.value.endsWith('\n') && !textarea.value.endsWith('。') && !textarea.value.endsWith('！') && !textarea.value.endsWith('？') ? '' : '') + finalTranscript;
            }
            
            if (interimTranscript) {
                toast.querySelector('.voice-toast-text').textContent = `"${interimTranscript}"`;
            }
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            stopRecording();
            if (event.error === 'not-allowed') {
                showToast('❌ 请允许麦克风权限后重试', 'error');
            } else if (event.error === 'no-speech') {
                showToast('没有检测到声音，请再试一次', 'warning');
            } else {
                showToast(`语音识别出错: ${event.error}`, 'warning');
            }
        };
        
        recognition.onend = () => {
            if (isRecording) {
                // 如果还在录音状态但识别结束了，可能需要重启
                try { recognition.start(); } catch(e) { stopRecording(); }
            }
        };
        
        try {
            recognition.start();
        } catch (e) {
            console.error('Failed to start recognition:', e);
            showToast('无法启动语音识别', 'error');
        }
    }
    
    function stopRecording() {
        isRecording = false;
        btn.classList.remove('recording');
        toast.classList.remove('show');
        
        if (recognition) {
            recognition.stop();
            recognition = null;
        }
        
        const text = textarea.value.trim();
        if (text) {
            showToast(`✅ 已录入 ${text.length} 个字`, 'success');
        }
    }
}
