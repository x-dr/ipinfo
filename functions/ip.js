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
