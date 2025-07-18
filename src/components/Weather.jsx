import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  Card,
  Spin,
  Typography,
  Row,
  Col,
  Select,
  Alert,
  Space,
} from 'antd';
import ReactECharts from 'echarts-for-react';
import './WeatherDemo.css';

const { Title } = Typography;

const cityCoordMap = {
  guangzhou: { name: '广州', coord: [113.37059678819445, 23.13521240234375] },
  beijing: { name: '北京', coord: [116.407396, 39.9042] },
  shanghai: { name: '上海', coord: [121.4737, 31.2304] },
};

const skyconMap = {
  CLEAR_DAY: '☀️',
  CLEAR_NIGHT: '🌙',
  PARTLY_CLOUDY_DAY: '⛅',
  PARTLY_CLOUDY_NIGHT: '🌤️',
  CLOUDY: '☁️',
  LIGHT_HAZE: '🌫️',
  MODERATE_HAZE: '🌫️',
  HEAVY_HAZE: '🌫️',
  LIGHT_RAIN: '🌦️',
  MODERATE_RAIN: '🌧️',
  HEAVY_RAIN: '🌧️',
  STORM_RAIN: '⛈️',
  LIGHT_SNOW: '🌨️',
  MODERATE_SNOW: '🌨️',
  HEAVY_SNOW: '❄️',
  STORM_SNOW: '❄️',
  DUST: '🌪️',
  SAND: '🌪️',
  WIND: '💨',
};

const WeatherDemo = () => {
  const [cityKey, setCityKey] = useState('guangzhou');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    // const [lng, lat] = cityCoordMap[cityKey].coord;
    setLoading(true);
    try {
      const res = await axios.get(`/cyapi`); // mock json
      // console.log('获取天气数据:', res.data.data.result);
      
      setWeather(res.data.data.result);
    } catch (err) {
      console.error('获取天气失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  if (loading) return <Spin size="large" tip="加载天气数据中..." style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }} />;
  if (!weather) return <div>无天气数据</div>;

  const daily = weather.daily;
  const hourly = weather.hourly;
  const alerts = weather.alert?.content || [];

  const dailyColumns = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '天气', dataIndex: 'skycon', key: 'skycon' },
    { title: '最高温(℃)', dataIndex: 'max', key: 'max' },
    { title: '最低温(℃)', dataIndex: 'min', key: 'min' },
  ];

  const dailyData = daily.temperature.map((item, idx) => ({
    key: idx,
    date: daily.skycon[idx].date,
    skycon: `${skyconMap[daily.skycon[idx].value] || ''} ${daily.skycon[idx].value}`,
    max: item.max,
    min: item.min,
  }));

  const tempChartOption = {
    title: { text: '未来24小时温度变化' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: hourly.temperature.map(item => item.datetime.slice(11, 16)),
    },
    yAxis: { type: 'value', name: '℃' },
    series: [
      {
        data: hourly.temperature.map(item => item.value),
        type: 'line',
        smooth: true,
      },
    ],
  };

  return (
    <div className="weather-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* <Title level={2} className="weather-title">🌤 彩云天气</Title> */}

        {/* <Select
          value={cityKey}
          onChange={(v) => setCityKey(v)}
          options={Object.entries(cityCoordMap).map(([key, val]) => ({
            label: val.name,
            value: key,
          }))}
          style={{ width: 200 }}
        /> */}

        {alerts.length > 0 && alerts.map((item, idx) => (
          <Alert
            key={idx}
            message={item.title}
            description={item.description}
            type="warning"
            showIcon
            closable
          />
        ))}

        <Card title="当前天气">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}><Card title="温度">{hourly.temperature[0].value} ℃</Card></Col>
            <Col xs={24} sm={12} md={8}><Card title="湿度">{Math.round(hourly.humidity[0].value * 100)}%</Card></Col>
            <Col xs={24} sm={12} md={8}><Card title="天气">{skyconMap[hourly.skycon[0].value]} {hourly.skycon[0].value}</Card></Col>
          </Row>
        </Card>

        <Card title="24小时温度变化图">
          <ReactECharts option={tempChartOption} style={{ width: '100%', height: 300 }} />
        </Card>

        <Card title="16日天气预报">
          <Table
            dataSource={dailyData}
            columns={dailyColumns}
            pagination={false}
            bordered
            scroll={{ x: 'max-content' }}
          />
        </Card>
      </Space>
    </div>
  );
};

export default WeatherDemo;
