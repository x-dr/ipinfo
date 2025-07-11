import React, { useEffect, useRef, useState } from 'react';
import SpeedTest from '@cloudflare/speedtest';

const SpeedTestComponent = () => {
  const engineRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    engineRef.current = new SpeedTest({ autoStart: false });
    const engine = engineRef.current;

    engine.onRunningChange = (isRunning) => {
      setRunning(isRunning);
    };

    engine.onResultsChange = () => {
      if (!engine.isFinished) {
        setResult(engine.results.raw);
      }
    };

    engine.onFinish = (results) => {
        console.log('测速结果:', results);
        
      setResult(results.getSummary());
    };

    engine.onError = (e) => {
      console.error(e);
      setError(e.message || '测速出错');
      setRunning(false);
    };

    return () => {
      // 这里不要调用 engine.stop()
      engineRef.current = null;
    };
  }, []);

  const handleStart = () => {
    setError(null);
    setResult(null);
    engineRef.current?.play();
  };

  const renderResult = () => {
    if (!result) return null;
    if (result.download && result.upload) {
      return (
        <div>
          <p>下载速度: {(result.download / 1e6).toFixed(2)} Mbps</p>
          <p>上传速度: {(result.upload / 1e6).toFixed(2)} Mbps</p>
          <p>延迟: {result.ping ? result.ping.toFixed(2) : 'N/A'} ms</p>
        </div>
      );
    }
    return (
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {JSON.stringify(result, null, 2)}
      </pre>
    );
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 400, margin: '20px auto' }}>
      <button onClick={handleStart} disabled={running} style={{ padding: '8px 16px', fontSize: 16 }}>
        {running ? '测速中...' : '开始测速'}
      </button>

      {error && <p style={{ color: 'red' }}>错误：{error}</p>}

      <div style={{ marginTop: 20 }}>
        {renderResult()}
      </div>
    </div>
  );
};

export default SpeedTestComponent;
