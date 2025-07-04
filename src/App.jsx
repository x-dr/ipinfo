import { useEffect, useState } from 'react';
import { Card, Descriptions, Button, message, Divider } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import './App.css';

function App() {
  const [ipInfo, setIpInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchIpInfo = async () => {
      setLoading(true);
      try {
        const res = await fetch('/ip');
        if (!res.ok) throw new Error(`请求失败，状态码 ${res.status}`);
        const data = await res.json();

        const geo = data.geo.geo || {};
        setIpInfo({
          ip: data.geo.clientIp || '',
          country: geo.countryName || '',
          province: geo.regionName || '',
          city: geo.cityName || '',
          district: '', // 你接口没提供区县，留空
          longitude: geo.longitude?.toString() || '',
          latitude: geo.latitude?.toString() || '',
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

  return (
    <div className="app-container">
      <Card
        title="IP 信息查询"
        variant="borderless"
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
              {/* <Descriptions.Item label="区县">{ipInfo.district || '-'}</Descriptions.Item> */}
              <Descriptions.Item label="经度">{ipInfo.longitude}</Descriptions.Item>
              <Descriptions.Item label="纬度">{ipInfo.latitude}</Descriptions.Item>
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
          <div>正在加载 IP 信息...</div>
        )}
      </Card>
    </div>
  );
}

export default App;
