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
import './Weather.css';

const { Title } = Typography;

const cityCoordMap = {
  guangzhou: { name: '广州', coord: [113.37059678819445, 23.13521240234375] },
  beijing: { name: '北京', coord: [116.407396, 39.9042] },
  shanghai: { name: '上海', coord: [121.4737, 31.2304] },
};

const skyconMap = {
  CLEAR_DAY: '☀️ 晴（白天）',
  CLEAR_NIGHT: '🌙 晴（夜晚）',
  PARTLY_CLOUDY_DAY: '⛅ 多云（白天）',
  PARTLY_CLOUDY_NIGHT: '🌤️ 多云（夜晚）',
  CLOUDY: '☁️ 阴天',
  LIGHT_HAZE: '🌫️ 轻度雾霾',
  MODERATE_HAZE: '🌫️ 中度雾霾',
  HEAVY_HAZE: '🌫️ 重度雾霾',
  LIGHT_RAIN: '🌦️ 小雨',
  MODERATE_RAIN: '🌧️ 中雨',
  HEAVY_RAIN: '🌧️ 大雨',
  STORM_RAIN: '⛈️ 暴雨',
  LIGHT_SNOW: '🌨️ 小雪',
  MODERATE_SNOW: '🌨️ 中雪',
  HEAVY_SNOW: '❄️ 大雪',
  STORM_SNOW: '❄️ 暴雪',
  DUST: '🌪️ 扬尘',
  SAND: '🌪️ 沙尘',
  WIND: '💨 大风',
};


const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('guangzhou');

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/cyapi`); // mock json
      setWeather(res.data.data.result);
      setCity(res.data?.mtjson?.data || {});
    } catch (err) {
      console.error('获取天气失败:', err);
    } finally {
      setLoading(false);
    }
  };




  useEffect(() => {

    fetchWeather();
  }, []);

  if (loading) return <Spin size="large" tip="加载天气数据中..." style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }} fullscreen />;
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
    date: daily.skycon[idx].date.split('T')[0],
    skycon: `${skyconMap[daily.skycon[idx].value] || ''}`,
    max: item.max,
    min: item.min,
  }));

  const tempChartOption = {
    title: {
      text: '未来24小时温度变化',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        const item = params[0];
        return `${item.axisValue} 时<br/>温度：${item.data} ℃`;
      }
    },
    xAxis: {
      type: 'category',
      data: hourly.temperature.map(item => item.datetime.slice(11, 16)),
    },
    yAxis: {
      type: 'value',
      name: '℃'
    },
    series: [
      {
        data: hourly.temperature.map(item => item.value),
        type: 'line',
        smooth: true,
      },
    ],
  };

  const precipitationChartOption = {
    title: {
      text: '未来24小时降水变化',
      subtext: weather.hourly.description,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        const item = params[0];
        return `${item.axisValue} 时<br/>降水强度：${item.data} mm/h`;
      }
    },
    xAxis: {
      type: 'category',
      data: weather.hourly.precipitation.map(item => item.datetime.slice(11, 16)),
    },
    yAxis: {
      type: 'value',
      name: 'mm/h'
    },
    series: [
      {
        name: '降水强度',
        data: weather.hourly.precipitation.map(item => item.value),
        type: 'line',
        smooth: true,
        areaStyle: {},
      },
    ],
  };



  const precipitationMinuteChartOption = {
    title: {
      text: '未来2小时降水强度（逐分钟）',
      subtext: `${weather.minutely.description}（数据来源：彩云天气）`,
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const minute = params[0].axisValue;
        const value = params[0].data;
        return `+${minute}分钟<br/>降水强度：${value} mm/h`;
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: Array.from({ length: 120 }, (_, i) => i), // 0~119 分钟
      name: '分钟',
      axisLabel: {
        formatter: (val) => (val % 10 === 0 ? `+${val}m` : ''),
      },
    },
    yAxis: {
      type: 'value',
      name: 'mm/h',
      min: 0,
    },
    series: [
      {
        name: '降水强度',
        type: 'line',
        data: weather.minutely.precipitation_2h,
        areaStyle: {
          color: '#cce5ff',
        },
        smooth: true,
        lineStyle: {
          color: '#3399ff',
        },
      },
    ],
  };


  return (
    <div className="weather-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={5} style={{ textAlign: 'center' }}>
          {city?.province ? `${city.province}省 ` : ''}
          {city?.city ? `${city.city}市 ` : ''}
          {city?.district || ''}
        </Title>

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

        <Card
          title={null} // 不使用默认标题
        >
          <div style={{ textAlign: 'center', padding: '1px 0' }}>
            <h3 >当前天气</h3>
            <div style={{ color: '#888', textAlign: 'center', marginBottom: 12 }}>
              {weather.forecast_keypoint}
            </div>
          </div>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={12} md={8}>
              <Card title="温度">{hourly.temperature[0].value} ℃</Card>
            </Col>
            <Col xs={12} sm={12} md={8}>
              <Card title="湿度">{Math.round(hourly.humidity[0].value * 100)}%</Card>
            </Col>
            <Col xs={12} sm={12} md={8}>
              <Card title="天气">{skyconMap[hourly.skycon[0].value]} </Card>
            </Col>
            <Col xs={12} sm={12} md={8}>
              <Card title="体感温度">{weather.realtime.apparent_temperature} ℃</Card>
            </Col>
            <Col xs={12} sm={12} md={8}>
              <Card title="云量">{Math.round(weather.realtime.cloudrate * 100)}%</Card>
            </Col>
            <Col xs={12} sm={12} md={8}>
              <Card title="能见度">{weather.realtime.visibility} km</Card>
            </Col>
            <Col xs={12} sm={12} md={8}>
              <Card title="紫外线">{weather.realtime.life_index.ultraviolet.desc}</Card>
            </Col>
            <Col xs={12} sm={12} md={8}>
              <Card title="舒适度">{weather.realtime.life_index.comfort.desc}</Card>
            </Col>
            <Col xs={12} sm={12} md={8}>
              <Card title="空气质量">{weather.realtime.air_quality.description.chn} (PM2.5: {weather.realtime.air_quality.pm25})</Card>
            </Col>
            <Col xs={12} sm={12} md={8}>
              <Card title="风速">{weather.realtime.wind.speed} m/s</Card>
            </Col>
            <Col xs={12} sm={12} md={8}>
              <Card title="风向">{weather.realtime.wind.direction.toFixed(0)}°</Card>
            </Col>
            <Col xs={12} sm={12} md={8}>
              <Card title="气压">{(weather.realtime.pressure / 100).toFixed(1)} hPa</Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card title="降水强度">
                本地 {weather.realtime.precipitation.local.intensity} mm/h<br />
                附近 {weather.realtime.precipitation.nearest.intensity} mm/h（距离 {weather.realtime.precipitation.nearest.distance} km）
              </Card>
            </Col>
          </Row>
        </Card>

        <Card title={null}>
          <ReactECharts
            option={precipitationMinuteChartOption}
            style={{ width: '100%', height: 300 }}
          />
        </Card>

        <Card title={null}>
          <ReactECharts option={tempChartOption} style={{ width: '100%', height: 300 }} />
        </Card>
        <Card title={null}>
          <ReactECharts option={precipitationChartOption} style={{ width: '100%', height: 300 }} />
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

export default Weather;
