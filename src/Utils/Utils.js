export const getMixedStream = (streams) => {
  const audioContext = new AudioContext();
  const destination = audioContext.createMediaStreamDestination();
  streams.forEach(stream => {
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(destination);
  });

  return destination.stream;
}

export const getFilePlayer = (fileSrcPath) => {
  const player = new Audio();
  player.controls = "controls";
  player.src = fileSrcPath;

  return player
}

export const getFilePlayerStream = (player) => {
  return new Promise((resolve, reject) => {
    player.play();
    player.onplay = function () {
      const stream = player.captureStream();
      resolve(stream)
    }
  })

  // player.onended = function (e) {
      //   URL.revokeObjectURL(this.src);
      // }
  
}

export const getMicStream = () => {
  const constraints = {
    audio: true,
    video: false
  }
  return navigator.mediaDevices.getUserMedia(constraints);
}


export const recordUsingStream = ({
  stream,
  onRecorderStop
}) => {
  const chunks = []
  const recorder = new MediaRecorder(stream);
  recorder.start(0);
  recorder.ondataavailable = function (event) {
    chunks.push(event.data);
  };


  recorder.onstop = function (event) {
    const blob = new Blob(chunks, {
      "type": "audio/ogg; codecs=opus"
    });
    console.log("recording complete");
    const audioDownload = URL.createObjectURL(blob);
    const anchorDownloadURL = blob.type.replace(/.+\/|;.+/g, "")

    onRecorderStop({
      audioDownload,
      anchorDownloadURL
    })
  };

  return recorder
}

export const awaitForSeconds = (awaitSeconds = 2) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {resolve()}, awaitForSeconds*1000)
  })
}