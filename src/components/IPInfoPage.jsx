import { useEffect, useState } from 'react';
import { Spin, Card, Descriptions, Button, message, Divider } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import './IPInfoPage.css';




function IPInfoPage() {
  const [ipInfo, setIpInfo] = useState(null);
  const [ipIntInfo, setIpIntInfo] = useState({ ip: '获取中...' });
  const [geoInfo, setGeoInfo] = useState("获取中..."); // 🌐 位置溯源数据

  const [loading, setLoading] = useState(false);



  useEffect(() => {
    const fetchIpInfo = async () => {
      setLoading(true);
      try {
        const res = await fetch('/ip');
        if (!res.ok) throw new Error(`请求失败，状态码 ${res.status}`);

        let data;
        try {
          data = await res.json();
        } catch (e) {
          data = {
            geo: {
              geo: {
                asn: 0,
                countryName: "China",
                countryCodeAlpha2: "CN",
                countryCodeAlpha3: "CHN",
                countryCodeNumeric: "156",
                regionName: "Guangdong",
                regionCode: "CN-GD",
                cityName: "guang zhou",
                latitude: 2.77,
                longitude: 13.28064,
                cisp: "Unknown"
              },
              uuid: "4661962445463185641",
              clientIp: "14.145.66.205"
            }
          };
        }

        const geo = data.geo.geo || {};
        const meituan = data?.meituan?.data || {};
        setIpInfo({
          ip: data.geo.clientIp || '',
          country: meituan.country || geo.countryName || '',
          province: meituan.province || geo.regionName || '',
          city: meituan.city || geo.cityName || '',
          district: meituan.district || "", // 你接口没提供区县，留空
          longitude: geo.longitude?.toString() || '',
          latitude: geo.latitude?.toString() || '',
          ipdetail: meituan
            ? `${meituan.country || ''} ${meituan.province || ''} ${meituan.city || ''}` +
            `${meituan.district || ''}${meituan.detail || ''}${meituan.areaName ? `(${meituan.areaName})` : ''}`
            : '定位信息不可用',
          ua: navigator.userAgent, // 直接用浏览器的UA

        });
      } catch (error) {
        message.error('获取IP信息失败：' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIpInfo();
  }, []);

  useEffect(() => {
    const fetchIntIpInfo = async () => {
      try {
        const res = await fetch('https://ip.xxd.workers.dev/');
        const data = await res.json();
        setIpIntInfo({
          ip: data.clientIp || '获取失败',
        });
      } catch (error) {
        setIpIntInfo({
          ip: '获取失败',
        });
        console.log('获取境外 IP 失败：' + error.message);

      }
    };
    fetchIntIpInfo();
  }, []);


  const handleCopy = async () => {
    if (!ipInfo) return;
    const text = `${ipInfo.ip} ${ipInfo.province} ${ipInfo.city}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      message.success('已复制 IP + 省份 + 城市 到剪贴板');
    } catch (error) {
      message.error('复制失败');
    }
  };


  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("浏览器不支持定位");
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch('/mtsy', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ latitude, longitude }),
            });
            const data = await res.json();
            const mtsy = data?.data?.data || {};
            console.log('位置溯源数据：', mtsy);
            
            const sydata = mtsy
              ? `${mtsy.country || ''} ${mtsy.province || ''} ${mtsy.city || ''}` +
              `${mtsy.district || ''}${mtsy.detail || ''}${mtsy.areaName ? `(${mtsy.areaName})` : ''}`
              : '定位信息不可用'


            setGeoInfo(sydata);
          } catch (err) {
            console.error('获取位置溯源失败：', err);
            setGeoInfo('位置溯源失败');
          }
        },
        (err) => {
          console.warn('定位失败：', err.message);
          setGeoInfo('无法获取定位');
        },
        {
          enableHighAccuracy: false,
          timeout: 3000,
          maximumAge: 0,
        }
      );
    } else {
      setGeoInfo('浏览器不支持定位');
    }
  }, []);

  return (



    <div className={`app-container `}>
      <div>
        <Card
          title={null}
          // variant="borderless"
          className="card-wrapper"
          loading={loading}
        >
          {ipInfo ? (
            <>
              <Descriptions column={1} bordered>
                <Descriptions.Item label="IP 地址">{ipInfo.ip}</Descriptions.Item>
                <Descriptions.Item label="国家">{ipInfo.country}</Descriptions.Item>
                <Descriptions.Item label="省份">{ipInfo.province}</Descriptions.Item>
                <Descriptions.Item label="城市">{ipInfo.city}</Descriptions.Item>
                <Descriptions.Item label="区县">{ipInfo.district || '-'}</Descriptions.Item>
                <Descriptions.Item label="IP 溯源">{ipInfo.ipdetail || '-'}</Descriptions.Item>
                <Descriptions.Item label="位置溯源">{geoInfo}</Descriptions.Item>
                <Descriptions.Item label="经度">{ipInfo.longitude}</Descriptions.Item>
                <Descriptions.Item label="纬度">{ipInfo.latitude}</Descriptions.Item>
                <Descriptions.Item label="境外IP">{ipIntInfo.ip}</Descriptions.Item>
                <Descriptions.Item label="浏览器 UA">
                  <div style={{ wordBreak: 'break-all' }}>{ipInfo.ua}</div>
                </Descriptions.Item>
              </Descriptions>

              <Divider />
              <Button
                type="primary"
                icon={<CopyOutlined />}
                onClick={handleCopy}
                disabled={loading}
              >
                复制 IP + 省份 + 城市
              </Button>
            </>
          ) : (
            <Spin size="large" tip="加载数据中..." style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }} fullscreen />
          )}
        </Card>
      </div>
    </div>
  );
}

export default IPInfoPage;
