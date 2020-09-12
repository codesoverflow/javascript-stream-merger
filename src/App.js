import React, {useState, useRef} from 'react';
import './App.css';

import {
  getFilePlayer,
  getMicStream,
  getFilePlayerStream,
  
  getMixedStream,
  recordUsingStream
} from './Utils/Utils'


const App = () => {
  
  const [selectedFilePlayers, setSelectedFilePlayers] = useState([])
  const [micStream, setMicStream] = useState(null)
  const [recordingMeta, setRecordingMeta] = useState({})
  
  const recordData = useRef({
    recorder: null,
    selectedFilePlayerStreams: []
  }).current

  const allStreams = [...recordData.selectedFilePlayerStreams, micStream].filter(stream => !!stream)

  

  const handleFilesSelection = (event) => {
    const file = event.target.files[0];
    const player = getFilePlayer(URL.createObjectURL(file))
    setSelectedFilePlayers([...selectedFilePlayers, player])
  }

  const handleMicStream = () => {
    const getAudioMicStream = async () => {
      const audioMicStream =  await getMicStream()
      setMicStream(audioMicStream)
    }

    getAudioMicStream()
    
  }

  const handleRecording = () => {
    const startRecording = async () => {
      for (let selectedFilePlayer of selectedFilePlayers) {
        const filePlayerStream = await getFilePlayerStream(selectedFilePlayer)
        recordData.selectedFilePlayerStreams.push(filePlayerStream)
      }
    
      const allStreams = [...recordData.selectedFilePlayerStreams, micStream].filter(stream => !!stream)
      
      if (!allStreams.length) {
        return
      }
      const mixedStream = getMixedStream(allStreams)

      recordData.recorder = recordUsingStream({
        stream: mixedStream,
        onRecorderStop: (recordedMeta) => {
          setRecordingMeta(recordedMeta)
        }
      })
    }

    startRecording()
  }

  const handleStopRecording = () => {
    if(recordData.recorder ) {
      recordData.recorder.stop()
      //setSelectedFilePlayers([])
      selectedFilePlayers.forEach(player => player.pause())
    }
  }

  const handlePlayingRecordedAudio = () => {
    const recordingPlayer = new Audio();
    recordingPlayer.src = recordingMeta.audioDownload;
    recordingPlayer.play()
  }



  return <div>

  <input type="file" 
  //name="files[]" 
  accept="audio/*" 
  //multiple 
  onChange={handleFilesSelection} />

  <div>
    <p>Selected Players</p>
    <ul>
      {selectedFilePlayers.map((selectedFilePlayer, index) => {
        return <li key={index}>{index}</li>
      })}
    </ul>
  </div>

  <div>
    Is Mic Available {micStream? 'Yes': 'No'}
  </div>


  <button type="button" onClick={handleMicStream} >Get Mic Available</button>

  {(allStreams.length > 0 || selectedFilePlayers.length > 0) &&
  <>
   <button type="button" onClick={handleRecording} >Start</button>

   <button type="button" onClick={handleStopRecording} >Stop</button>
  </>
  }

  {recordingMeta.audioDownload && 
  <button type="button" onClick={handlePlayingRecordedAudio} >
  Play Recorded</button>}


  </div>
}


  

export default App;
