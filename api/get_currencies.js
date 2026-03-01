const https = require('https');

const API_KEY = "Sd7tfpc2JHRTt91gTbsilFeNAaoz9N2S";
const KEXIM_URLS = [
    "https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON",
    "https://www.koreaexim.go.kr/site/program/financial/exchangeJSON"
];

const FETCH_OPTIONS = {
    rejectUnauthorized: false,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
    }
};

function fetchKexim(baseUrl, dateStr) {
    const url = `${baseUrl}?authkey=${API_KEY}&searchdate=${dateStr}&data=AP01`;
    return new Promise((resolve, reject) => {
        https.get(url, FETCH_OPTIONS, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

function todayStr() {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    return now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0');
}

function subtractDays(dateStr, days) {
    const y = parseInt(dateStr.substring(0, 4));
    const m = parseInt(dateStr.substring(4, 6)) - 1;
    const d = parseInt(dateStr.substring(6, 8));
    const date = new Date(y, m, d - days);
    return date.getFullYear().toString() +
        String(date.getMonth() + 1).padStart(2, '0') +
        String(date.getDate()).padStart(2, '0');
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    for (const baseUrl of KEXIM_URLS) {
        try {
            for (let i = 0; i < 7; i++) {
                const dateStr = subtractDays(todayStr(), i);
                try {
                    const data = await fetchKexim(baseUrl, dateStr);
                    if (data && Array.isArray(data) && data.length > 0) {
                        const currencies = data.map(item => ({
                            code: item.cur_unit,
                            name: item.cur_nm
                        }));
                        return res.status(200).json(currencies);
                    }
                } catch (e) { continue; }
            }
        } catch (e) { continue; }
    }
    return res.status(200).json([]);
};
