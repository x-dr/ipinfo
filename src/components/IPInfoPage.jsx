import { useEffect, useState } from 'react';
import { Spin, Card, Descriptions, Button, Typography, message, Divider, Input } from 'antd';
import { CopyOutlined, SmileFilled, SmileOutlined } from '@ant-design/icons';
import './IPInfoPage.css';
const { Text } = Typography;


function isValidIP(ip) {
  const ipv4 = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
  const ipv6 = /^(([0-9a-fA-F]{1,4}):){7}([0-9a-fA-F]{1,4})$/;
  return ipv4.test(ip) || ipv6.test(ip);
}

function parseIpData(data, fallbackIp = '') {
  const geo = data.geo?.geo || {};
  const meituan = data?.meituan?.data || {};

  return {
    ip: data.geo?.clientIp || fallbackIp,
    country: meituan.country || geo.countryName || '',
    province: meituan.province || geo.regionName || '',
    city: meituan.city || geo.cityName || '',
    district: meituan.district || '',
    longitude: geo.longitude?.toString() || '',
    latitude: geo.latitude?.toString() || '',
    ipdetail: meituan
      ? `${meituan.country || ''} ${meituan.province || ''} ${meituan.city || ''}` +
      `${meituan.district || ''}${meituan.detail || ''}${meituan.areaName ? `(${meituan.areaName})` : ''}`
      : '定位信息不可用',
    ua: navigator.userAgent,
  };
}

function IPInfoPage() {
  const [ipInfo, setIpInfo] = useState(null);
  const [ipIntInfo, setIpIntInfo] = useState({ ip: '获取中...' });
  const [geoInfo, setGeoInfo] = useState("获取中...");
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

        setIpInfo(parseIpData(data));
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
        setIpIntInfo({ ip: data.clientIp || '获取失败' });
      } catch (error) {
        setIpIntInfo({ ip: '获取失败' });
        console.log('获取境外 IP 失败：' + error.message);
      }
    };
    fetchIntIpInfo();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoInfo('浏览器不支持定位');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch('/mtsy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude }),
          });
          const data = await res.json();
          const mtsy = data?.data?.data || {};
          const sydata = mtsy
            ? `${mtsy.country || ''} ${mtsy.province || ''} ${mtsy.city || ''}` +
            `${mtsy.district || ''}${mtsy.detail || ''}${mtsy.areaName ? `(${mtsy.areaName})` : ''}`
            : '定位信息不可用';
          setGeoInfo(sydata);
        } catch (err) {
          console.error('获取位置溯源失败：', err);
          // setGeoInfo('位置溯源失败');
          setGeoInfo(<span style={{ color: 'red' }}>位置溯源失败</span>);

        }
      },
      (err) => {
        console.warn('定位失败：', err.message);
        setGeoInfo(<span style={{ color: 'red' }}>无法获取定位</span>);
      },
      { enableHighAccuracy: false, timeout: 3000, maximumAge: 0 }
    );
  }, []);

  const handleSearchIP = async (ip) => {
    if (!ip) return;
    if (!isValidIP(ip)) {
      message.warning('请输入合法的 IPv4 或 IPv6 地址');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('https://ip.tryxd.cn/ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ip: ip.trim() })


      });
      const data = await res.json();
      setIpInfo(parseIpData(data, ip));
    } catch (err) {
      message.error('查询失败：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div>
        <div className="input-container">
          <Input.Search
            placeholder="输入 IPv4 或 IPv6 地址查询"
            enterButton="查询"
            onSearch={handleSearchIP}
            allowClear
            style={{ width: '100%', maxWidth: 400 }}
          />
        </div>

        <Card className="card-wrapper" loading={loading}>
          {ipInfo ? (
            <>
              <Descriptions column={1} bordered>
                <Descriptions.Item label="IP 地址">
                  <Text
                    copyable={{ tooltips: ['复制', '复制成功'] }}>
                    {ipInfo.ip}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="国家">{ipInfo.country}</Descriptions.Item>
                <Descriptions.Item label="省份">{ipInfo.province}</Descriptions.Item>
                <Descriptions.Item label="城市">{ipInfo.city}</Descriptions.Item>
                <Descriptions.Item label="区县">{ipInfo.district || '-'}</Descriptions.Item>
                <Descriptions.Item label="IP 溯源">
                  <Text copyable={{ tooltips: ['复制', '复制成功'] }}>
                    {ipInfo.ipdetail}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="位置溯源">
                  <Text copyable={{ tooltips: ['复制', '复制成功'] }}>
                    {geoInfo}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="经度">{ipInfo.longitude}</Descriptions.Item>
                <Descriptions.Item label="纬度">{ipInfo.latitude}</Descriptions.Item>
                <Descriptions.Item label="境外IP">
                  <Text copyable={{ tooltips: ['复制', '复制成功'] }}>
                    {ipIntInfo.ip}
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item label="浏览器 UA">
                  <div style={{ wordBreak: 'break-all' }}>
                    <Text copyable={{ tooltips: ['复制', '复制成功'] }}>
                      {ipInfo.ua}
                    </Text>
                  </div>
                </Descriptions.Item>
              </Descriptions>
              <Divider />

            </>
          ) : (
            <Spin
              size="large"
              tip="加载数据中..."
              style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}
              fullscreen
            />
          )}
        </Card>
      </div>
    </div>
  );
}

export default IPInfoPage;
