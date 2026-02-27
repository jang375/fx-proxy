const https = require('https');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const url = "https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=Sd7tfpc2JHRTt91gTbsilFeNAaoz9N2S&searchdate=20260227&data=AP01";
    
    https.get(url, { rejectUnauthorized: false }, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
            res.status(200).json({
                statusCode: response.statusCode,
                headers: response.headers,
                body: data.substring(0, 2000)
            });
        });
    }).on('error', (err) => {
        res.status(500).json({ error: err.message });
    });
};
```

Commit 후 이 URL로 접속해주세요:
```
https://fx-proxy.vercel.app/api/debug
