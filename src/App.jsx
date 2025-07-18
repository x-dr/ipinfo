import React from 'react';
import { Tabs } from 'antd';
import { useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import Weather from './components/Weather';
import IPInfoPage from './components/IPInfoPage';
import GeolocationComponent from './components/GeolocationComponent';

const items = [
    { key: '/weather', label: '🌤 天气预报' },
    { key: '/ipinfo', label: '🌐 IP 信息' },
    { key: '/geolocation', label: '📍 位置定位' },
];

const App = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const activeKey = items.find(item => location.pathname.startsWith(item.key))?.key || '/weather';

    const onChange = (key) => {
        navigate(key);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 999,
                    background: '#fff',
                    textAlign: 'center',
                    //   boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
            >
                <Tabs
                    centered
                    activeKey={activeKey}
                    onChange={onChange}
                    items={items}
                />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                <Routes>
                    <Route path="/weather" element={<Weather />} />
                    <Route path="/ipinfo" element={<IPInfoPage />} />
                    <Route path="/geolocation" element={<GeolocationComponent />} />
                    <Route path="*" element={<Weather />} />
                </Routes>
            </div>
        </div>
    );
};

export default App;
