import React from 'react';
import './App.css';
import { LocalTracks } from './LocalTracks'
import { LocalSpeaker } from './LocalSpeaker'
import _ from 'lodash'
import { RemoteTrack } from './RemoteTrack';
import { v4 as uuidv4 } from 'uuid'
import { LoginPage } from './LoginPage'
import {MyVideo} from './MyVideo'
import { MyChatBox } from './MyChatBox';

export class App extends React.Component {
  constructor (props) {
    //console.log("App::Constructor (props):", props)
    super(props)

    this.state = {
      //serverURL: 'alpha.jitsi.net',
      //roomId: 'e1202',
      selectedSpeakerDeviceId: '',
      defaultMicId: '',
      defaultVideoId: '',
      defaultSpeakerId: '',
      deviceList: [],
      //status: 'closed',
      lastError: '',
      remoteTrackIds: [],
     loaded: false,
      activeRoomId: null,
      messages: []
    }

    this.messages = [] ;
    
    /*[{
      name: "Prasanna",
      message: "First message which was sent in 1966",
      timestamp: "2020-12-01",
      type: 'remote'
  },{}
      name: "Asmita",
      message: "Second message which was sent in 1999",
      timestamp: "2021-13-01",
      type: 'remote'
  }, {
      name: "Sumedha",
      message: "Third message which was sent in 1999",
      timestamp: "2021-13-01",
      type: 'remote'
  }, {
      name: "Me",
      message: "Current message",
      timestamp: "2021-07-10",
      type: 'local'
  }, 


  ];*/

    console.log("APP() constructed ..........")
    //window.asmitaMeet = {}
    //window.asmitaMeet.remoteTracks = []
    //window.asmitaMeet.activeConnection = null
    //window.asmitaMeet.activeRoom = null
    console.log("App() asmita Meet updated with empty remoteTracks, activeConnection and activeRoom");
  }



  componentDidMount () {
    window.JitsiMeetJS.mediaDevices.enumerateDevices((devices) => {
      let newDeviceList = []
      for (let device of devices) {
              //console.log("App:DidMount(): device",device);
              //console.log("App:DidMount():  <Device Label, DeviceID, deviceKind>",{ name: device.label, id: device.deviceId, type: device.kind })
          // if (device.deviceId !== 'default' && device.deviceId !== 'communications') {
              newDeviceList.push({ name: device.label, id: device.deviceId, type: device.kind })
          // }
      }
      console.log("App:DidMount():  newDeviceList:",newDeviceList);
      let micId = (_.find(newDeviceList, { type: 'audioinput' }) || {}).id || 'none'
      let videoId = (_.find(newDeviceList, { type: 'videoinput' }) || {}).id || 'none'
      let speakerId = (_.find(newDeviceList, { type: 'audiooutput' }) || {}).id || 'none'
      console.log("App:DidMount  MicId,VideoId,SpeakerId", micId,videoId,speakerId)
      this.setState({
        deviceList: newDeviceList,
        defaultMicId: micId,
        defaultVideoId: videoId,
        defaultSpeakerId: speakerId,
        messages: this.messages,
        loaded: true
      })
      console.log("App:DidMount this.state is",this.state)
      
    })
  }

  // This has to be reviewed ( May be why empty)

  componentDidUpdate () {
    console.log("App:DidUpdate()   the state ",this.setState);
  }

  // coordinator message to pass from Chat send to Login Recive 

   onMessageRecvdOfApp = (id,msg,ns) => {
      console.log("App():onMessageRecvd:  ",id,msg,ns);
      this.messages.push({name:id, message:msg,timestamp:'29Aug2021',type:'local'})
      this.setState({ messages: this.messages });


   }


/////////////////////////////////////////////////////////////////////
///////////
/////////// on change events handled by Apps.... ( Needs to be reviewed the implications. )

  onSpeakerChanged = (newSpeaker) => {
    this.setState({
      selectedSpeakerDeviceId: newSpeaker.id
    })
  }

  onServerChanged = (event) => {
    this.setState({
      serverURL: event.target.value
    })
  }

  onRoomChanged = (event) => {
    this.setState({
      roomId: event.target.value
    })
  }

  //////////////////////////////////////// End of Review /////////////////////////////////////






  // This has to move to Login Page
  //
  //    
  //  steps given below. 
  /* 
  **     Track added  
  **                    if local do not do any ctions. 
  **            if added track is already in our remote list, do not do any thing
  **            as it is new 
  **                  get track details <id, participant owner, type of track, track itself >
  **                  add into our remote list
  **            
  **                  trigger the relevant update by doing a setstate ( as we have updated the remote track list )
  ** 
  **            
  **
  **
  */


  onRoomTrackAdded = (track) => {
    if (track.isLocal() === true) {
      return
    }
    let newTrackId = track.getId()
    console.log(`Track Added: ${newTrackId}`)
    let matchTrack = _.find(this.remoteTracks, { id: newTrackId })
    if (matchTrack) {
      return
    }
    let trackInfo = {
      id: newTrackId,
      participantId: track.getParticipantId(),
      type: track.getType(),
      track: track
    }
    window.asmitaMeet.remoteTracks.push(trackInfo)
    this.setState({
      remoteTrackIds: _.map(window.asmitaMeet.remoteTracks, (rt) => { return { id: rt.id, participantId: rt.participantId } })
    })
  }

  // Move to login page
  // reverse the adding part, 
  /// do not do any thing for local track, get theid and remove it from the remote list
  //   set the state so that appropriate updates are done to the dependent function. <remoteTrackIDs = { <id,ownerid>, <id,ownerid>}

  onRoomTrackRemoved = (track) => {
    if (track.isLocal() === true) {
      return
    }
    let trackId = track.getId()
    window.asmitaMeet.remoteTracks = _.reject(window.asmitaMeet.remoteTracks, { id: trackId })
    this.setState({
      remoteTrackIds: _.map(window.asmitaMeet.remoteTracks, (rt) => { return { id: rt.id, participantId: rt.participantId } })
    })

  }

/*
  onConnectionSuccess = () => {
  
    const { roomId } = this.state
    try {
      window.asmitaMeet.activeRoom = window.asmitaMeet.activeConnection.initJitsiConference(roomId, {
        openBridgeChannel: true
      })
    
      window.asmitaMeet.activeRoom.addEventListener(window.JitsiMeetJS.events.conference.TRACK_ADDED, this.onRoomTrackAdded)
      window.asmitaMeet.activeRoom.addEventListener(window.JitsiMeetJS.events.conference.TRACK_REMOVED, this.onRoomTrackRemoved)
      // this.activeRoom.on(
      //     JitsiMeetJS.events.conference.CONFERENCE_JOINED,
      //     onConferenceJoined);
      //     this.activeRoom.on(JitsiMeetJS.events.conference.USER_JOINED, id => {
      //     console.log('user join');
      //     remoteTracks[id] = [];
      // });
      // this.activeRoom.on(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
      // this.activeRoom.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, track => {
      //     console.log(`${track.getType()} - ${track.isMuted()}`);
      // });
      // this.activeRoom.on(
      //     JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED,
      //     (userID, displayName) => console.log(`${userID} - ${displayName}`));
      //     this.activeRoom.on(
      //     JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED,
      //     (userID, audioLevel) => console.log(`${userID} - ${audioLevel}`));
      //     this.activeRoom.on(
      //     JitsiMeetJS.events.conference.PHONE_NUMBER_CHANGED,
      //     () => console.log(`${room.getPhoneNumber()} - ${room.getPhonePin()}`));
      window.asmitaMeet.activeRoom.join()
      this.setState({
        status: 'open',
        lastError: '',
        activeRoomId: uuidv4()
      })
    } catch (error) {
      this.setState({
        status: 'closed',
        lastError: error.message
      })
    }
  }

  onConnectionFailed = (a, b, c, d) => {
    this.setState({
      status: 'closed',
      lastError: a,
      activeRoomId: null
    })
  }

  onConnectionDisconnect = () => {
    window.asmitaMeet.activeConnection.removeEventListener(window.JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, this.onConnectionSuccess)
    window.asmitaMeet.activeConnection.removeEventListener(window.JitsiMeetJS.events.connection.CONNECTION_FAILED, this.onConnectionFailed)
    window.asmitaMeet.activeConnection.removeEventListener(window.JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, this.onConnectionDisconnect)
    window.asmitaMeet.activeRoom.removeEventListener(window.JitsiMeetJS.events.conference.TRACK_ADDED, this.onRoomTrackAdded)
    window.asmitaMeet.activeRoom.removeEventListener(window.JitsiMeetJS.events.conference.TRACK_REMOVED, this.onRoomTrackRemoved)

  }


  onConnect = () => {
    const { roomId, serverURL } = this.state
    this.setState({
      status: 'Joining...'
    })
    window.asmitaMeet.activeConnection = new window.JitsiMeetJS.JitsiConnection(null, null, {
      hosts: {
        domain: serverURL,
        muc: `conference.${serverURL}` // FIXME: use XEP-0030
      },
      serviceUrl:  `wss://${serverURL}/xmpp-websocket?room=${roomId}`,
      clientNode: `https://${serverURL}`
    })

    window.asmitaMeet.activeConnection.addEventListener(window.JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, this.onConnectionSuccess)
    window.asmitaMeet.activeConnection.addEventListener(window.JitsiMeetJS.events.connection.CONNECTION_FAILED, this.onConnectionFailed)
    window.asmitaMeet.activeConnection.addEventListener(window.JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, this.onConnectionDisconnect)
    window.asmitaMeet.activeConnection.connect()
  }

  onDisconnect = () => {
    if (window.asmitaMeet.activeRoom) {
      this.setState({
        status: 'Leaving...'
      })
      try {
        window.asmitaMeet.activeRoom.leave().then(() => {
          if (window.asmitaMeet.activeConnection) {
            window.asmitaMeet.activeConnection.disconnect()
          }
          this.setState({
            status: 'closed',
            remoteTracks: [],
            activeRoomId: null
          })
        })
      } catch (error) {
        this.setState({
          status: 'closed',
          lastError: error.message
        })
      }
    }
  }
*/




// array of RemoteTracks components are rendered ( each one is passed a current select speaker id)

  renderRemoteTracks = (trackGroups = {}, selectedSpeakerDeviceId) => {
    let ret = []

    let participantIds = _.keys(trackGroups)

    if (participantIds.length === 0) {
      return null
    }
    for (let participantId of participantIds) {
      ret.push(<div key={participantId} className="B_Body_Block">
        <RemoteTrack trackIds={trackGroups[participantId]} selectedSpeakerDeviceId={selectedSpeakerDeviceId} />
      </div>)
    }

    return ret
  }

  render() {
    const { selectedSpeakerDeviceId, serverURL, roomId, status, lastError, defaultMicId, defaultVideoId, defaultSpeakerId, deviceList, loaded = false, remoteTrackIds = [], activeRoomId } = this.state

    if (loaded === false) {
      return (
        <div className='App'>
          <div className='AppLoading'>
            <h3>Loading...</h3>
          </div>
        </div>
      )
    }

    let remoteTrackGroups = _.groupBy(remoteTrackIds, (rt) => { return rt.participantId })

    return (
      <div className="App">
        
        <div className="TL">
          {/*}
          <div>Server: <input readOnly={status !== 'closed'} type='text' onChange={(event) => { this.setState({ serverURL: event.target.value })}}  value={serverURL} /></div>
          <div>Room: <input readOnly={status !== 'closed'} type='text' onChange={(event) => { this.setState({ roomId: event.target.value })}} value={roomId} /></div>
          {*/}

          <LoginPage onMessageRecvd={this.onMessageRecvdOfApp}  />
          
          <MyChatBox messages={this.state.messages}/>
          {/*}<div>
            {status === 'closed'
              ? <button onClick={this.onConnect}>
                Connect
              </button>
              : status === 'open'
                  ? <button onClick={this.onDisconnect}>
                      Disconnect
                    </button>
                  : <button disabled={true} >
                      {status}
                    </button>
            }
          </div>
          <div>{lastError}</div>{*/}
        </div>
        
        
        <div className="TR">
          <div className="TR_Header">
            <h3>Me</h3>
            {/*}
            <LocalSpeaker deviceList={deviceList} key='LocalSpeaker' defaultSpeakerId={defaultSpeakerId} onSpeakerChanged={this.onSpeakerChanged} />
            {*/}
          </div>


          <div className='TR_Body'>
            <div className="TR_Body_Block">
              {/*}
              <LocalTracks activeRoomId={activeRoomId} deviceList={deviceList} defaultMicId={defaultMicId} defaultVideoId={defaultVideoId} key='localTracks' />
              {*/}
              <MyVideo activeRoomId={activeRoomId} deviceList={deviceList} defaultMicId={defaultMicId} defaultVideoId={defaultVideoId} key='localTracks' />
            </div>
          </div>

        </div>

        <div className="B">
          
          <div className="B_Header">
            <h3>Remote Participants</h3>
          </div>

          <div className="B_Body">
          
            {this.renderRemoteTracks(remoteTrackGroups, selectedSpeakerDeviceId)}
            
          </div>
        </div>
      </div>
    )
  }
}
