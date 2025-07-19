import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, Alert } from 'antd';

const { Title, Paragraph, Text } = Typography;

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
    <Card
      style={{ maxWidth: 400, margin: '40px auto', textAlign: 'center' }}
      hoverable
    >
      <Title level={3}>用户定位信息</Title>

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} />}

      {location ? (
        <Paragraph>
          纬度：<Text strong>{location.latitude}</Text>，经度：<Text strong>{location.longitude}</Text>
        </Paragraph>
      ) : !error ? (
        <Spin tip="正在获取定位信息..." size="large" />
      ) : null}
    </Card>
  );
}

export default GeolocationComponent;
