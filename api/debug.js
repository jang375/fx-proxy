const https = require('https');

function fetchRaw(url) {
    return new Promise((resolve, reject) => {
        const options = {
            rejectUnauthorized: false,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({
                status: res.statusCode,
                location: res.headers.location || 'none',
                body: data.substring(0, 2000)
            }));
        }).on('error', (err) => resolve({ error: err.message }));
    });
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
        const r1 = await fetchRaw("https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=Sd7tfpc2JHRTt91gTbsilFeNAaoz9N2S&searchdate=20260227&data=AP01");
        const r2 = await fetchRaw("https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=Sd7tfpc2JHRTt91gTbsilFeNAaoz9N2S&searchdate=20260227&data=AP01");
        return res.status(200).json({ new_domain: r1, old_domain: r2 });
    } catch (err) {
        return res.status(200).json({ error: err.message });
    }
};
