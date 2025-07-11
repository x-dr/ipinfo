export async function onRequest({ request }) {
  const geo = request.eo;

  let mtjson = {};

  try {
    const mtres = await fetch(
      `https://apimobile.meituan.com/locate/v2/ip/loc?rgeo=true&ip=${geo.clientIp}`
    );
    const mtlatlon = await mtres.json();

    const mtdata = await fetch(
      `https://apimobile.meituan.com/group/v1/city/latlng/${mtlatlon.data.lat},${mtlatlon.data.lon}?tag=0`
    );
    mtjson = await mtdata.json();

  } catch (error) {
    console.log('获取美团城市数据失败：', error);
  }

  const res = JSON.stringify({
    geo: geo,
    meituan: mtjson || {},
  });
  return new Response(res, {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
