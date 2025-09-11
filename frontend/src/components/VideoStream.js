import React from 'react';

const VideoStream = () => {
  return (
    <div className="video-panel">
      <div className="video-placeholder">
        <div style={{ fontSize: '3rem' }}>📹</div>
        <p>视频流显示区域</p>
        <p>机械臂末端USB相机画面</p>
      </div>
    </div>
  );
};

export default VideoStream;