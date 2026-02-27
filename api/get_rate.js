// SSL 인증서 검증 우회 (수출입은행 서버 인증서 문제)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API_KEY = "Sd7tfpc2JHRTt91gTbsilFeNAaoz9N2S";
const KEXIM_URL = "https://www.koreaexim.go.kr/site/program/financial/exchangeJSON";

function fetchKexim(dateStr) {
    const url = `${KEXIM_URL}?authkey=${API_KEY}&searchdate=${dateStr}&data=AP01`;
    return fetch(url).then(res => res.json());
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

    try {
        for (let daysBack = 0; daysBack < 7; daysBack++) {
            const checkDate = subtractDays(date, daysBack);
            try {
                const data = await fetchKexim(checkDate);
                if (!data || !Array.isArray(data) || data.length === 0) continue;

                const found = data.find(item => item.cur_unit === currency);
                if (found) {
                    const rate = parseFloat(found.deal_bas_r.replace(/,/g, ''));
                    return res.status(200).json({ rate: rate, ref_date: checkDate });
                }
            } catch (e) {
                continue;
            }
        }
        return res.status(200).json({ rate: '데이터없음' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
