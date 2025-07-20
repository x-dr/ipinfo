export async function onRequest({ request }) {
  let clientIp;


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

  if (request.method == 'POST') {
    const body = await request.json();
    clientIp = body.ip;
  }
  if (!clientIp) {
    clientIp = geo.clientIp;
  }

  let mtjson = {};
  let mtlatlng = {};

  try {
    const mtres = await fetch(
      `https://apimobile.meituan.com/locate/v2/ip/loc?rgeo=true&ip=${clientIp}`
    );
    mtlatlng = await mtres.json();


    const mtdata = await fetch(
      `https://apimobile.meituan.com/group/v1/city/latlng/${mtlatlng.data.lat},${mtlatlng.data.lng}?tag=0`
    );
    mtjson = await mtdata.json();

  } catch (error) {
    console.log('获取美团城市数据失败：', error);
  }

  const res = JSON.stringify({
    geo: geo,
    mtlatlng: mtlatlng || {},
    meituan: mtjson || {},
  });
  return new Response(res, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
