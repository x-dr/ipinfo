export async function onRequest({ request }) {
  const geo = request.eo;

  let mtjson = {};
  let mtlatlng = {};

  try {
    const mtres = await fetch(
      `https://apimobile.meituan.com/locate/v2/ip/loc?rgeo=true&ip=${geo.clientIp}`
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
