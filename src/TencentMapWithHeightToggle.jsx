import React, { useEffect, useRef, useCallback } from 'react';
import { Button } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const TencentMapWithHeightToggle = ({ latitude, longitude, height = 0 }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const center = React.useMemo(() => new window.TMap.LatLng(latitude, longitude), [latitude, longitude]);
  const centerHeight = React.useMemo(() => new window.TMap.LatLng(latitude, longitude, height), [latitude, longitude, height]);

  useEffect(() => {
    if (!window.TMap || !mapRef.current) return;

    const map = new window.TMap.Map(mapRef.current, {
      zoom: 17,
      center,
      pitch: 0,
      rotation: 0,
    });

    const marker = new window.TMap.MultiMarker({
      map,
      styles: {
        marker: new window.TMap.MarkerStyle({
          width: 20,
          height: 30,
          anchor: { x: 10, y: 30 },
        }),
      },
      geometries: [{ position: center, id: 'marker' }],
    });

    markerRef.current = marker;

    return () => {
      map.destroy();
      markerRef.current = null;
    };
  }, [center]);

  const setHeight = useCallback(
    (useHeight) => {
      if (!markerRef.current) return;
      const data = markerRef.current.getGeometryById('marker');
      if (!data) return;

      data.position = useHeight ? centerHeight : center;

      markerRef.current.updateGeometries([data]);
      markerRef.current.getMap().easeTo({
        pitch: useHeight ? 80 : 0,
        duration: 600,
      });
    },
    [center, centerHeight]
  );

  return (
    <div style={{ position: 'relative', height: '600px' }}>
    {/* <div style={{ position: 'relative', height: '100vh' }}> */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <Button icon={<ArrowUpOutlined />} onClick={() => setHeight(true)}>
          增加高度
        </Button>
        <Button icon={<ArrowDownOutlined />} onClick={() => setHeight(false)}>
          去除高度
        </Button>
      </div>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default TencentMapWithHeightToggle;
