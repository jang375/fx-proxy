const https = require('https');

function fetchRaw(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { rejectUnauthorized: false }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({
                status: res.statusCode,
                location: res.headers.location || 'none',
                body: data.substring(0, 500)
            }));
        }).on('error', reject);
    });
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
        const result = await fetchRaw("https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=Sd7tfpc2JHRTt91gTbsilFeNAaoz9N2S&searchdate=20260227&data=AP01");
        return res.status(200).json(result);
    } catch (err) {
        return res.status(200).json({ error: err.message });
    }
};
