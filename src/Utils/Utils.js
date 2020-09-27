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

const timeDifference = 1000

export const recordUsingStream = ({
  stream,
  onRecorderStop
}) => {
  const chunks = []
  const recorder = new MediaRecorder(stream);
  recorder.start(0);
  const recordingId = new Date().getTime()
  let lastChunkEmitTime = new Date().getTime()
  
  storeChunks(recordingId, chunks);
  recorder.ondataavailable = function (event) {
    chunks.push(event.data);
    const isTimeCrossedForEmit = new Date().getTime() - lastChunkEmitTime >= timeDifference
    if (isTimeCrossedForEmit) {
      lastChunkEmitTime = new Date().getTime()
      storeChunks(recordingId, chunks);
    }
  };


  recorder.onstop = function (event) {
    storeChunks(recordingId, chunks);
    onRecorderStop({
      recordingId
    })
  };

  return recorder
}

export const getRecording = (recordingId) => {
  const chunksFromLocalStorage = getFromLocalStorage(recordingId)

  const blob = new Blob(chunksFromLocalStorage, {
    "type": "audio/ogg; codecs=opus"
  });
  //console.log("recording complete");
  const audioDownload = URL.createObjectURL(blob);
  const anchorDownloadURL = blob.type.replace(/.+\/|;.+/g, "")

  return {
    audioDownload,
    anchorDownloadURL
  }
}

const storeChunks = async (recordingId, chunks) => {
  const serializedChunks = await getSerializedChunks(chunks)
  saveInLocalStorage(recordingId, serializedChunks)
}

const getFromLocalStorage = (recordingId) => {
  const stringifiedArray = localStorage.getItem(recordingId)
  const chunks = getDeserilizedChunks(stringifiedArray)
  return chunks
}

const saveInLocalStorage = (recordingId, serializedChunks) => {
  localStorage.setItem(recordingId, serializedChunks)
}

export function getAllStorage() {

  // var values = [],
  //   keys = Object.keys(localStorage),
  //   i = keys.length;

  // while (i--) {
  //   values.push(localStorage.getItem(keys[i]));
  // }

  return Object.keys(localStorage);
}

const getDeserilizedChunks = (stringifiedArray) => {
  
  const parsedArray = JSON.parse(stringifiedArray)
  const chunks = []

  for (let stringifiedChunk of parsedArray) {
    const uint8Array = new Uint8Array(Object.values(stringifiedChunk))
    const blob = new Blob([uint8Array.buffer], {
      type: "audio/webm;codecs=opus"
    })
    chunks.push(blob)
  }

  return chunks
}

const getSerializedChunks = async (chunks) => {
  const storableArray = []
  for (let chunk of chunks) {
    const arrayBuffer = await chunk.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    storableArray.push(uint8Array)
  }

  return JSON.stringify(storableArray)
}



export const awaitForSeconds = (awaitSeconds = 2) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {resolve()}, awaitForSeconds*1000)
  })
}