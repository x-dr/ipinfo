export async function onRequest({ request }) {
    const geo = request.eo;
    let mtjson = {};

    try {
        const mtdata = await fetch(
            `https://apimobile.meituan.com/group/v1/city/latlng/${geo.geo.latitude},${geo.geo.longitude}?tag=0`
        );
        mtjson = await mtdata.json();
    } catch (error) {
        console.log('获取美团城市数据失败：', error);

    }

    try {
        const targetUrl = `https://starplucker.cyapi.cn/v3/alert/location?latitude=${geo.geo.latitude}&longitude=${geo.geo.longitude}`;

        const headers = {
            "Accept": "application/json",
            "version": "7.38.0",
            "Authorization": "Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6Ind0ZmI4NmQ5IiwidHlwIjoiSldUIn0.eyJhdWQiOlsid2VhdGhlciJdLCJleHAiOjE3NTMzNTY5MzMsImlhdCI6MTc1Mjc1MjEzMywic2lkIjoiNjgwYjI2NzFkM2YxNWU4YjlmOGNjYjhkIiwidXNlcl9pZCI6IjVlYTRmYzViN2YxNDhhMDAxMDdlMTY5NCIsImRldmljZV9pZCI6IjA3OTMyMThFLTVFMzItNEU3Ni05RTUxLUU5QTE1RTMyNkZEMiIsInVzZXJfdHlwZSI6MSwidmVyc2lvbiI6M30.Y2lsxgGkVUaFnWBiWtLIqoTdjloGeU7OTW7xS_5jelZdLjwHa302k60_CyIx80Vf6W9zSbPL8jgk1zp9ffQ2HA",
            "device-id": "0793218E-5E32-4E76-9E51-E9A15E326FD2",
            "app-name": "weather",
            "Accept-Language": "zh-CN",
            "Accept-Encoding": "gzip, deflate, br",
            "Content-Type": "application/json;charset=utf-8",
            "X-Request-ID": "4FC91D73-9DA6-4246-B0CB-A0E655A0F8C6",
            "os-type": "ios",
            "User-Agent": "weather/7.38.0 (iPhone15,2; iOS/16.4.1)",
            "Connection": "keep-alive"
        };

        const res = await fetch(targetUrl, { method: "GET", headers });
        const body = await res.json();

        const data = JSON.stringify({
            data: body,
            mtjson: mtjson || {},
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
