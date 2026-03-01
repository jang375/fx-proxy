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

    const { date, currency } = req.query;
    if (!date || !currency) {
        return res.status(400).json({ error: '날짜와 통화 코드가 필요합니다.' });
    }

    for (const baseUrl of KEXIM_URLS) {
        try {
            for (let daysBack = 0; daysBack < 7; daysBack++) {
                const checkDate = subtractDays(date, daysBack);
                try {
                    const data = await fetchKexim(baseUrl, checkDate);
                    if (!data || !Array.isArray(data) || data.length === 0) continue;
                    const found = data.find(item => item.cur_unit === currency);
                    if (found) {
                        const rate = parseFloat(found.deal_bas_r.replace(/,/g, ''));
                        return res.status(200).json({ rate, ref_date: checkDate });
                    }
                } catch (e) { continue; }
            }
        } catch (e) { continue; }
    }
    return res.status(200).json({ rate: '데이터없음' });
};
