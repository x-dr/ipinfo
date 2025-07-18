export async function onRequest({ request }) {
    const geo = request.eo;

    try {
        // const targetUrl = `https://starplucker.cyapi.cn/v3/alert/location?latitude=${geo.geo.latitude}&longitude=${geo.geo.longitude}`;
        const weatherUrl = `https://api.caiyunapp.com/v2.5/Y2FpeXVuX25vdGlmeQ==/${geo.geo.longitude},${geo.geo.latitude}/weather?dailysteps=16&hourlysteps=120&alert=true&begin=${Math.round(new Date().getTime()/1000)}`;
        const headers = {
            'Host': 'api.caiyunapp.com',
            'Connection': 'keep-alive',
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip,compress,br,deflate',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.61(0x18003d2c) NetType/WIFI Language/zh_CN',
            'Referer': 'https://servicewechat.com/wx123456/94/page-frame.html'
        };


        const res = await fetch(weatherUrl, { method: "GET", headers });
        const body = await res.json();

        const data = JSON.stringify({
            data: body,
        });

        return new Response(data, {
            status: res.status,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*", // 开启 CORS 访问
            },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });

    }


}
