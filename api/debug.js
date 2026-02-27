const https = require('https');
const http = require('http');

function fetchWithRedirect(url, maxRedirects) {
    maxRedirects = maxRedirects || 5;
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const options = { rejectUnauthorized: false, headers: { 'User-Agent': 'Mozilla/5.0' } };
        client.get(url, options, (res) => {
            if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location && maxRedirects > 0) {
                let nextUrl = res.headers.location;
                if (nextUrl.startsWith('/')) {
                    const parsed = new URL(url);
                    nextUrl = parsed.origin + nextUrl;
                }
                return resolve(fetchWithRedirect(nextUrl, maxRedirects - 1));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data.substring(0, 2000) }));
        }).on('error', reject);
    });
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
        const result = await fetchWithRedirect("https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=Sd7tfpc2JHRTt91gTbsilFeNAaoz9N2S&searchdate=20260227&data=AP01");
        return res.status(200).json(result);
    } catch (err) {
        return res.status(200).json({ error: err.message });
    }
};
