//resize
let videoStyle = {};
if (videoWidth && videoHeight) {
  height = height - (isFullscreen ? 0 : CONTROLBAR_HEIGHT);
  let [tw, th] = videoAngle % 180 ? [height, width] : [width, height];
  if (Math.abs(tw / th - videoWidth / videoHeight) < 0.1) {
    //黑边优化
    videoStyle = {
      width,
      height,
      transform:
        videoAngle % 180
          ? `rotate(${videoAngle}deg) scale(${tw / th},${th /
              tw}) translateZ(0)`
          : `rotate(${videoAngle}deg) translateZ(0)`,
      objectFit: "fill"
    };
  } else {
    //正常resize
    let scale =
      videoAngle % 180 ? Math.max(videoHeight / videoWidth, height / width) : 1;
    videoStyle = {
      width,
      height,
      transform: `rotate(${videoAngle}deg) scale(${scale}) translateZ(0)`
    };
  }
}
