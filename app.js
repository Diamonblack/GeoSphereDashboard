// STATE & CONFIG
const STATE = { weather: null, forecast: null, system: null };
let chartInstance = null;
let cpuChart = null;

// SVG ICONS MAP
const ICONS = {
    sun: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/><path stroke="currentColor" stroke-width="2" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>',
    rain: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 13v8M8 13v8M12 15v8"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/></svg>',
    snow: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 8l8 8M16 8l-8 8M12 3v18M3 12h18"/></svg>',
    storm: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>'
};

function getIcon(code) {
    if (code === 0) return ICONS.sun;
    if (code >= 1 && code <= 3) return ICONS.cloud;
    if (code >= 51 && code <= 67) return ICONS.rain;
    if (code >= 71 && code <= 77) return ICONS.snow;
    if (code >= 95) return ICONS.storm;
    return ICONS.cloud;
}

// --- CHARTS ---
function initCpuChart() {
    const ctx = document.getElementById('cpuChart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 30);
    gradient.addColorStop(0, 'rgba(255, 77, 109, 0.5)'); // Red/Pink
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    cpuChart = new Chart(ctx, {
        type: 'line',
        data: { labels: Array(30).fill(''), datasets: [{ 
            data: Array(30).fill(0), 
            borderColor: '#ff4d6d', backgroundColor: gradient, 
            borderWidth: 2, pointRadius: 0, tension: 0.4, fill: true 
        }]},
        options: {
            responsive: true, maintainAspectRatio: false,
            animation: { duration: 0 }, // Instant update
            plugins: { legend: {display:false}, tooltip: {enabled: false} }, // Pure visual
            scales: { x: {display:false}, y: {display:false, min:0, max:100} }
        }
    });
}

function initChart() {
    const ctx = document.getElementById('weatherChart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(51, 187, 255, 0.4)'); // Blueish
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [
            { 
                label: 'Temp', data: [], 
                borderColor: '#33bbff', backgroundColor: gradient, 
                borderWidth: 3, pointRadius: 0, tension: 0.4, fill: true, yAxisID: 'y' 
            },
            { 
                label: 'Rain', data: [], 
                borderColor: '#00ffcc', backgroundColor: '#00ffcc', 
                borderWidth: 0, barThickness: 4, type: 'bar', yAxisID: 'y1' 
            }
        ]},
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { display: false }, tooltip: {
                enabled: true, backgroundColor: 'rgba(5,5,5,0.9)', 
                titleColor: '#fff', bodyColor: '#ccc', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
                callbacks: {
                    title: (c) => new Date(c[0].label).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
                    label: (c) => `${c.dataset.label}: ${c.parsed.y} ${c.dataset.label==='Temp'?'°C':'mm'}`
                }
            }},
            scales: {
                x: { display: false },
                y: { display: true, position: 'left', grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888' } },
                y1: { display: false, position: 'right', min: 0, suggestedMax: 5 }
            }
        }
    });
}

// --- UPDATES ---
function updateClock() {
    const now = new Date();
    document.getElementById('digital-clock').innerText = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    document.getElementById('digital-date').innerText = now.toLocaleDateString(undefined, {weekday:'long', year:'numeric', month:'long', day:'numeric'}).toUpperCase();
}

function updateSystem() {
    if (!window.systemStats) return;
    const s = window.systemStats;
    
    // Update Text
    document.getElementById('sys-cpu-val').innerText = `${s.cpu}%`;
    document.getElementById('sys-ram-val').innerText = `${s.ram}%`;

    // Update Rings
    const maxC = 157;
    const cpuOffset = maxC - (s.cpu / 100) * maxC;
    const ramOffset = maxC - (s.ram / 100) * maxC;
    
    document.getElementById('ring-cpu').style.strokeDashoffset = cpuOffset;
    document.getElementById('ring-ram').style.strokeDashoffset = ramOffset;

    // Update CPU Chart
    if (cpuChart) {
        cpuChart.data.datasets[0].data.push(s.cpu);
        if (cpuChart.data.datasets[0].data.length > 30) {
            cpuChart.data.datasets[0].data.shift(); // Remove oldest
        }
        cpuChart.update();
    }
}

function updateWeather() {
    if (!window.weatherData) return;
    const data = window.weatherData;
    const p = data.properties.parameters;
    const ts = data.timestamps;
    
    // Find latest valid
    let i = ts.length - 1;
    while (i >= 0 && p.TL.data[i] === null) i--;
    if (i < 0) i = 0;

    // Helper
    const set = (id, val, unit='') => {
        const el = document.getElementById(id);
        if(el) el.innerText = val !== null ? `${val}${unit}` : '--';
    };

    set('main-temp', p.TL.data[i] ? p.TL.data[i].toFixed(1) : '--', '°');
    set('stat-wind', p.FFAM.data[i] ? (p.FFAM.data[i]*3.6).toFixed(1) : '--', ' km/h');
    set('stat-rain', p.RR.data[i], ' mm');
    set('stat-humidity', p.RF.data[i] ? p.RF.data[i].toFixed(0) : '--', '%');

    // Chart
    if (chartInstance) {
        chartInstance.data.labels = ts;
        chartInstance.data.datasets[0].data = p.TL.data;
        chartInstance.data.datasets[1].data = p.RR.data;
        chartInstance.update();
    }
    
    // Webcam
    const t = new Date().getTime();
    document.getElementById('webcam-bg').style.backgroundImage = `url('webcam_latest.jpg?t=${t}')`;
}

function updateSolarCycle(f) {
    if (!f || !f.daily) return;

    const todayRise = new Date(f.daily.sunrise[0]);
    const todaySet = new Date(f.daily.sunset[0]);
    const now = new Date();

    // Labels
    document.getElementById('label-sunrise').innerText = todayRise.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    document.getElementById('label-sunset').innerText = todaySet.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

    // Calc Pct
    let pct = (now - todayRise) / (todaySet - todayRise);
    if (pct < 0) pct = 0; 
    if (pct > 1) pct = 1; 

    // Arc Offset (Length 210)
    const maxLen = 210;
    const offset = maxLen - (maxLen * pct);
    document.getElementById('solar-path').style.strokeDashoffset = offset;

    // Dot Position (Quadratic Bezier)
    // P0=(10,55), P1=(100,-20), P2=(190,55)
    const t = pct;
    const x = Math.pow(1-t, 2) * 10 + 2 * (1-t) * t * 100 + Math.pow(t, 2) * 190;
    const y = Math.pow(1-t, 2) * 55 + 2 * (1-t) * t * -20 + Math.pow(t, 2) * 55;

    const dot = document.getElementById('sun-dot');
    dot.setAttribute('cx', x);
    dot.setAttribute('cy', y);
    dot.style.opacity = (pct <= 0 || pct >= 1) ? 0.3 : 1;
}

function updateForecast() {
    if (!window.forecastData) return;
    const f = window.forecastData;
    
    updateSolarCycle(f);

    const hDiv = document.getElementById('forecast-hourly');
    const dDiv = document.getElementById('forecast-daily');
    
    hDiv.innerHTML = '';
    dDiv.innerHTML = '';

    // HOURLY
    const nowH = new Date().getHours();
    let start = f.hourly.time.findIndex(t => new Date(t).getHours() === nowH);
    if (start === -1) start = 0;
    
    for(let i=start; i<start+12 && i<f.hourly.time.length; i++) {
        const d = new Date(f.hourly.time[i]);
        const time = d.getHours().toString().padStart(2,'0');
        const temp = Math.round(f.hourly.temperature_2m[i]);
        const icon = getIcon(f.hourly.weathercode[i]);
        const rainProb = f.hourly.precipitation_probability[i];
        
        const barHeight = Math.max(4, rainProb/2);
        const barClass = rainProb > 0 ? 'fc-rain-active' : '';

        hDiv.innerHTML += `
            <div class="fc-card">
                <span class="fc-t" style="font-size:0.7rem; color:#888;">${time}</span>
                <div class="fc-i" style="width:24px; color:${f.hourly.weathercode[i]===0?'#ffcc00':'#e0e0e0'}">${icon}</div>
                <span class="fc-v" style="font-family:monospace; font-weight:bold;">${temp}°</span>
                <div class="fc-rain-bar ${barClass}" style="height:${barHeight}px;"></div>
                <div class="fc-tooltip">
                    <span style="color:#fff; font-weight:bold;">${time}:00</span>
                    <span style="color:#aaa;">${temp}°C</span>
                    <span style="color:${rainProb>30?'#00ffcc':'#666'}">${rainProb}% Rain</span>
                </div>
            </div>`;
    }

    // DAILY
    for(let i=0; i<5; i++) {
        const d = new Date(f.daily.time[i]);
        const day = d.toLocaleDateString('en-US', {weekday:'short'});
        const max = Math.round(f.daily.temperature_2m_max[i]);
        const min = Math.round(f.daily.temperature_2m_min[i]);
        const icon = getIcon(f.daily.weathercode[i]);
        
        const sr = new Date(f.daily.sunrise[i]).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
        const ss = new Date(f.daily.sunset[i]).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

        dDiv.innerHTML += `
            <div class="daily-row">
                <div class="dr-main">
                    <div class="dr-left" style="display:flex; align-items:center; gap:12px;">
                        <div style="width:22px; color:${f.daily.weathercode[i]===0?'#ffcc00':'#ccc'}">${icon}</div>
                        <span class="dr-day" style="font-size:0.9rem; font-weight:500;">${day}</span>
                    </div>
                    <div class="dr-right" style="display:flex; align-items:center; gap:10px;">
                        <span class="dr-temp" style="font-family:var(--font-mono); color:var(--accent-temp); font-weight:bold;">${max}°</span>
                        <span style="font-size:0.75rem; color:var(--text-secondary); min-width:30px; text-align:right;">${min}°</span>
                    </div>
                </div>
                <div class="dr-details">
                    <div class="detail-bit"><span class="bit-icon">☀</span> ${sr}</div>
                    <div class="detail-bit"><span class="bit-icon" style="color:#ff5555;">↓</span> ${ss}</div>
                </div>
            </div>`;
    }
}

function loadData() {
    const s = document.createElement('script');
    s.src = `weather_data.js?t=${new Date().getTime()}`;
    s.onload = () => {
        updateWeather();
        updateForecast();
        updateSystem();
    };
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1000);
}

// BOOT
initChart();
initCpuChart(); // New CPU Monitor
updateClock();
loadData();

// MEDIA CONTROLS
const btnPlay = document.getElementById('btn-play');
const mediaArt = document.getElementById('media-art');
let isPlaying = true;

btnPlay.addEventListener('click', () => {
    isPlaying = !isPlaying;
    const icon = btnPlay.querySelector('svg');
    if (isPlaying) {
        // Play Icon
        icon.innerHTML = '<path d="M8 5v14l11-7z"/>';
        mediaArt.classList.remove('paused');
    } else {
        // Pause Icon
        icon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        mediaArt.classList.add('paused');
    }
});

setInterval(updateClock, 1000);
setInterval(loadData, 20000);
