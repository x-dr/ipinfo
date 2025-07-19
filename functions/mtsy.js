export async function onRequest({ request }) {
    let latitude, longitude;
    if (request.method === 'OPTIONS') {
        // 处理 CORS 预检请求
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }
    const geo = request.eo;

    let mtjson = {};


    if (request.method == 'POST') {
        const body = await request.json();
        latitude = body.latitude;
        longitude = body.longitude;
    }

    if (!latitude || !longitude) {
        latitude = request.eo?.geo?.latitude;
        longitude = request.eo?.geo?.longitude;
    }

    try {

        const mtdata = await fetch(
            `https://apimobile.meituan.com/group/v1/city/latlng/${latitude},${longitude}?tag=0`
        );
        mtjson = await mtdata.json();

    } catch (error) {
        console.log('获取美团城市数据失败：', error);
        mtjson = {
            error: '获取美团城市数据失败',
            message: error.message,
            data: {}
        };
    }

    const res = JSON.stringify({
        geo: geo,
        data: mtjson || {},
    });
    return new Response(res, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
