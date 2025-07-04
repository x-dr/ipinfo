export async function onRequest({ request, params, env }) {

    
    
    const ip = params.ip || '8.8.8.8'; // Default to a known IP if none provided
   
    


    const res = await fetch(`https://pro.ip-api.com/json/${ip}?key=${env.IPKEY}lang=zh-CN&fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query`)
    const data = await res.json();
    if (data.status !== 'success') {
        return new Response(JSON.stringify({ error: data.message ,
            ip:  env.IPKEY
        }), {
            status: 400,
            headers: {
                'content-type': 'application/json; charset=UTF-8',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }

    return new Response("data", {
        headers: {
            'content-type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
        },
    });
}
