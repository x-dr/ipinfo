import { useEffect, useState } from 'react';
import { Card, Descriptions, Button, message, Divider, ConfigProvider, Switch, Input, Space, theme } from 'antd';
import { CopyOutlined, BulbOutlined } from '@ant-design/icons';
import './App.css';

// import TencentMapWithHeightToggle from './TencentMapWithHeightToggle';



function App() {
  const [ipInfo, setIpInfo] = useState(null);
  const [ipIntInfo, setIpIntInfo] = useState({ ip: '获取中...' });
  const [loading, setLoading] = useState(false);
  const [followSystem, setFollowSystem] = useState(null);
  const [darkMode, setDarkMode] = useState(null);


  useEffect(() => {
    const fetchIpInfo = async () => {
      setLoading(true);
      try {
        const res = await fetch('/ip');
        if (!res.ok) throw new Error(`请求失败，状态码 ${res.status}`);
        // const data = {
        //   "geo": {
        //     "geo": {
        //       "asn": 0,
        //       "countryName": "China",
        //       "countryCodeAlpha2": "CN",
        //       "countryCodeAlpha3": "CHN",
        //       "countryCodeNumeric": "156",
        //       "regionName": "Guangdong",
        //       "regionCode": "CN-GD",
        //       "cityName": "guang zhou",
        //       "latitude": 2.77,
        //       "longitude": 13.28064,
        //       "cisp": "Unknown"
        //     },
        //     "uuid": "4661962445463185641",
        //     "clientIp": "14.145.66.205"
        //   }
        // }
        const data = await res.json();

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


  // 初始化，从 localStorage 读取
  useEffect(() => {
    const savedFollow = localStorage.getItem('followSystem');
    const savedDark = localStorage.getItem('darkMode');

    if (savedFollow !== null) {
      setFollowSystem(savedFollow === 'true');
      if (savedFollow === 'true') {
        setDarkMode(null); // 跟随系统，后面监听系统设置
      } else {
        setDarkMode(savedDark === 'true');
      }
    } else {
      setFollowSystem(true); // 默认跟随系统
      setDarkMode(null);
    }
  }, []);

  // 监听系统主题，仅当跟随系统时生效
  useEffect(() => {
    if (followSystem !== true) return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    // 初始化同步一次
    setDarkMode(media.matches);

    const handler = e => setDarkMode(e.matches);

    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [followSystem]);

  // 状态改变保存 localStorage
  useEffect(() => {
    if (followSystem !== null) {
      localStorage.setItem('followSystem', String(followSystem));
    }
    if (darkMode !== null) {
      localStorage.setItem('darkMode', String(darkMode));
    }
  }, [followSystem, darkMode]);

  // 手动切换主题
  const onThemeSwitch = checked => {
    setFollowSystem(false);
    setDarkMode(checked);
  };

  // 切换是否跟随系统
  const onFollowSystemSwitch = checked => {
    setFollowSystem(checked);
    if (checked) {
      setDarkMode(null); // 交给系统监听控制
    }
  };

  if (followSystem === null || darkMode === null) {
    // 状态未初始化完成，避免闪烁，返回空或加载中
    return null;
  }

  return (


    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}

    >


      <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}>
          <Switch
            checked={darkMode}
            onChange={onThemeSwitch}
            checkedChildren={<BulbOutlined />}
            unCheckedChildren={<BulbOutlined />}
          />
        </div>

        <div>

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
                  <Descriptions.Item label="区县">{ipInfo.district || '-'}</Descriptions.Item>
                  <Descriptions.Item label="IP 溯源">{ipInfo.ipdetail || '-'}</Descriptions.Item>
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
              <div>正在加载 IP 信息...</div>
            )}
          </Card>


          {/* <Card
            title="IP 地图定位"
            className="card-wrapper"
            variant="borderless"
          >
            {ipInfo?.latitude && ipInfo?.longitude && (
              <TencentMapWithHeightToggle
                latitude={parseFloat(ipInfo.latitude)}
                longitude={parseFloat(ipInfo.longitude)}
                height={134} // 或者你需要的高度
              />
            )}

          </Card> */}
        </div>



      </div>
    </ConfigProvider>
  );
}

export default App;
