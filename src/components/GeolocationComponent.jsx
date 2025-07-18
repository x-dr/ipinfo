import React, { useEffect, useState } from 'react';

function GeolocationComponent() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('你的浏览器不支持定位功能');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        setError(`定位失败：${err.message}`);
      }
    );
  }, []);

  return (
    <div>
      <h3>用户定位信息</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {location ? (
        <p>
          纬度：{location.latitude}，经度：{location.longitude}
        </p>
      ) : !error ? (
        <p>正在获取定位信息...</p>
      ) : null}
    </div>
  );
}

export default GeolocationComponent;
