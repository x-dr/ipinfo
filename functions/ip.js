function isValidIP(ip) {
  const ipv4 = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
  const ipv6 = /^(([0-9a-fA-F]{1,4}):){7}([0-9a-fA-F]{1,4})$/;
  return ipv4.test(ip) || ipv6.test(ip);
}

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

  let geo = request.eo;

  if (request.method == 'POST') {
    const body = await request.json();
    clientIp = body.ip;
    geo.clientIp = clientIp ? clientIp : geo.clientIp;

  }
  if (!clientIp) {
    clientIp = geo.clientIp;
  }

  if (!isValidIP(clientIp)) {
    return new Response(JSON.stringify({ error: 'Invalid IP' }), { status: 400 });

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
