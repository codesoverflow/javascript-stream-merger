import React, {useState, useEffect} from 'react';
import '../App.css';

import {
  getAllStorage,
  getRecording
} from '../Utils/Utils'

const recordingPlayer = new Audio();

const PlayerList = () => {
  
  // const [recordings, setRecordings] = useState([])

  // useEffect(() => {
  //   setRecordings(getAllStorage())
  // }, [])
  
  const recordings = getAllStorage()

  const handlePlayingRecordedAudio = (recording, isPlaying, buttonElement) => {
    const {audioDownload} = getRecording(recording)
    recordingPlayer.src = audioDownload;
    if(recordingPlayer.onended === null ) {
      recordingPlayer.onended = function() {
        recordingPlayer.pause()
        buttonElement.innerText = 'Play'
      }
    }
    isPlaying ? recordingPlayer.pause() : recordingPlayer.play()
  }



  return <div>
  <div className="recordingListHeading">
    All Recordings
  </div>
    <ul>
      {recordings.map(recording => {
        return <li key={recording}>
          {recording} - <button onClick={function(event) {
            //console.dir( event.target)
            event.persist()
            const button = event.target
            const isPlaying = button.innerText === 'Pause'
            button.innerText = isPlaying ? 'Play' : 'Pause'
            handlePlayingRecordedAudio(recording, isPlaying, event.target)
          }}>Play</button>
        </li>
      })}
    </ul>
  </div>


  
}


  

export default PlayerList;
