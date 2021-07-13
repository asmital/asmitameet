import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/templatemo-style.css'
import './fonts/font-awesome.min.css'
import './css/demo.css' 


import { LocalTracks } from './LocalTracks'
import { LocalSpeaker } from './LocalSpeaker'
import _ from 'lodash'
import { RemoteTrack } from './RemoteTrack';
import { v4 as uuidv4 } from 'uuid'
import { MyChatBox } from './MyChatBox'

import Button from 'react-bootstrap/Button';


let displaystring = "Asmita";

export class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      joinVidCall: false,
      serverURL: 'alpha.jitsi.net',
      roomId: 'e1202',
      participantName: 'amyat',
      selectedSpeakerDeviceId: '',
      defaultMicId: '',
      defaultVideoId: '',
      defaultSpeakerId: '',
      deviceList: [],
      status: 'closed',
      lastError: '',
      remoteTrackIds: [],
      loaded: false,
      activeRoomId: null,
      messages: [],
      participantList: [],
      strSanitizeFx: this.strSanitize,
    }
    this.messages = [];
    this.participantList = [];
    this.myfx = this.setVidCallFlagFx;


    window.asmitaMeet = {}
    window.asmitaMeet.remoteTracks = []
    window.asmitaMeet.activeConnection = null
    window.asmitaMeet.activeRoom = null
  }

  onMessageRecvdOfApp = (id, msg, ns) => {
    console.log("App():onMessageRecvd:  ", id, msg, ns);
    let tempjason = JSON.parse(msg)

    this.messages.push(tempjason)
    this.setState({ messages: this.messages });


  }
  /*
  onMessageGot = (id, msg, num) => {
    console.log('LoginPage::onMessageGot()  WE GOT MESSAGE FROM ALIENS', 'ID:', id, 'MSG:', msg, 'NUM:', num);
    this.onMessageRecvd(id,msg,num);
    console.log("LoginPage:onMessageGot(): passing the funciton to upper layer");
    this.messageRecvd = { id:id, msg:msg, num:num}
}*/
  setVidCallFlagFx = (flag) => {
    this.setState({
      joinVidCall: flag,
    })
    //console.log('App::setVidCallFlag - flag ', flag)
  }


  componentDidMount() {
    window.JitsiMeetJS.mediaDevices.enumerateDevices((devices) => {
      let newDeviceList = []
      for (let device of devices) {
        // if (device.deviceId !== 'default' && device.deviceId !== 'communications') {
        newDeviceList.push({ name: device.label, id: device.deviceId, type: device.kind })
        // }
      }
      let micId = (_.find(newDeviceList, { type: 'audioinput' }) || {}).id || 'none'
      let videoId = (_.find(newDeviceList, { type: 'videoinput' }) || {}).id || 'none'
      let speakerId = (_.find(newDeviceList, { type: 'audiooutput' }) || {}).id || 'none'
      this.setState({
        deviceList: newDeviceList,
        defaultMicId: micId,
        defaultVideoId: videoId,
        defaultSpeakerId: speakerId,
        messages: this.messages,
        loaded: true
      })

    })
  }

  componentDidUpdate() {

  }

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

  onConnectionSuccess = () => {
    const { roomId } = this.state
    try {
      window.asmitaMeet.activeRoom = window.asmitaMeet.activeConnection.initJitsiConference(roomId, {
        openBridgeChannel: true
      })
      window.asmitaMeet.activeRoom.addEventListener(window.JitsiMeetJS.events.conference.TRACK_ADDED, this.onRoomTrackAdded)
      window.asmitaMeet.activeRoom.addEventListener(window.JitsiMeetJS.events.conference.TRACK_REMOVED, this.onRoomTrackRemoved)
      window.asmitaMeet.activeRoom.addEventListener(window.JitsiMeetJS.events.conference.MESSAGE_RECEIVED, this.onMessageRecvdOfApp)
      /* window.asmitaMeet.activeRoom.on(
          JitsiMeetJS.events.conference.CONFERENCE_JOINED,
           onConferenceJoined);
          this.activeRoom.on(JitsiMeetJS.events.conference.USER_JOINED, id => {
          console.log('user join');
         remoteTracks[id] = [];
       }); */
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

      window.asmitaMeet.activeRoom.addEventListener(window.JitsiMeetJS.events.conference.USER_JOINED, this.onUserJoined);
      window.asmitaMeet.activeRoom.addEventListener(window.JitsiMeetJS.events.conference.USER_LEFT, this.onUserLeft);

      window.asmitaMeet.activeRoom.join()

      window.asmitaMeet.activeRoom.setDisplayName(this.state.participantName);

      window.asmitaMeet.activeRoom.setLocalParticipantProperty("naak", "mottha");
      window.asmitaMeet.activeRoom.setLocalParticipantProperty("tond", "vedavakra");

      window.asmitaMeet.activeRoom.setSubject("BlahButti");
      let tempMyUserId = window.asmitaMeet.activeRoom.myUserId();
      let tempList = window.asmitaMeet.activeRoom.getParticipants();

      let myName = this.state.participantName;
      this.participantList = [{ id: tempMyUserId, name: myName }];

      console.log("APP:ONCONNSUCC USER ID", tempMyUserId)
      console.log("APP:ONCONNSUCC USERs ID LIST", tempList)
      console.log("APP::ONCONSUCC:participantList", this.participantList)

      this.setState({
        status: 'open',
        lastError: '',
        activeRoomId: uuidv4(),
        participantList: this.participantList,
      })
    } catch (error) {
      this.setState({
        status: 'closed',
        lastError: error.message
      })
    }
  }
  onUserJoined = (id, user) => {
    let tempdisplayName = window.asmitaMeet.activeRoom.getParticipantById(id)._displayName;
    let tempID = id;
    console.log("APP:ONUSERJOINED: This guy joined lol", tempID, user, tempdisplayName);
    this.participantList = this.state.participantList;
    this.participantList.push({ id: tempID, name: tempdisplayName });
    this.setState({
      participantList: this.participantList
    });
  }
  onUserLeft = (id, user) => {
    let preList = this.state.participantList;
    let tempdisplayName = preList.find(p => p.id == id).name;
    let tempID = id;
    console.log("APP:ONUSERLEFT: This guy left lol", tempID, user, tempdisplayName);
    this.participantList = this.state.participantList;
    this.participantList = this.participantList.filter((p) => p.id != id);
    console.log("APP:ONUSERLEFT: List AFter Leaving", this.participantList);
    this.setState({
      participantList: this.participantList
    });
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
      serviceUrl: `wss://${serverURL}/xmpp-websocket?room=${roomId}`,
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
          this.messages=[]
          this.setState({
            status: 'closed',
            remoteTracks: [],
            activeRoomId: null,
            messages:[],
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
  allowVidCall = () => {

    this.setState({
      joinVidCall: true
    })


  }

  disableVidCall = () => {
    this.setState({
      joinVidCall: false
    })

  }
  strSanitize = (passedStr) => {
    console.log("Input string:", passedStr);

     //var demoString = "(123)-//[45Awr%6]-5675@4F%&k";

    var regex = /\W/g;
    var replacedString = passedStr.replace(regex, "_").toLowerCase();
    console.log("Output String:", replacedString);
    return replacedString ;
}

  renderRemoteTracks = (trackGroups = {}, selectedSpeakerDeviceId) => {
    if (this.state.status === 'closed' || this.state.joinVidCall === false) return <p></p>;
    let ret = []


    let participantIds = _.keys(trackGroups)
    console.log('APP::RENDEREMOTETRACKS::PARTICIPANTIDS', participantIds)

    if (participantIds.length === 0) {
      return null
    }
    for (let participantId of participantIds) {
      let tempParticipantName = this.state.participantList.find(p => p.id == participantId).name;
      console.log('APP::RENDEREMOTETRACKS::PARTICIPANNAMES', tempParticipantName)
      ret.push(<div key={participantId} className="B_Body_Block">
        <RemoteTrack trackIds={trackGroups[participantId]} selectedSpeakerDeviceId={selectedSpeakerDeviceId} participantName={tempParticipantName} />
      </div>)
    }


    return ret
  }
  
  render() {
    const { selectedSpeakerDeviceId, serverURL, roomId, status, lastError, defaultMicId, defaultVideoId, defaultSpeakerId, deviceList, loaded = false, remoteTrackIds = [], activeRoomId, setVidCallFlag } = this.state

    if (loaded === false) {
      return (
        <div className='App'>
          <div className='AppLoading'>
            <h3>Loading...</h3>
          </div>
        </div>
      )
    }

    let remoteTrackGroups = _.groupBy(remoteTrackIds, (rt) => {
      return rt.participantId
    })


    return (
      <div className="App2">



        {this.state.status === 'closed' ?
          <div className="App1">

            <div id="particles-js"></div>
          {/*}
            <ul className="cb-slideshow">
              <li>lim</li>
              <li>prasanna</li>
              <li>hari</li>
              <li>wedbamboo</li>
              <li>dokya war ushi</li>
              <li>Main</li>
            </ul>
            {*/}

            <div className="container-fluid">
              <div className="row cb-slideshow-text-container ">
                <div className="tm-content col-xl-6 col-sm-8 col-xs-8 ml-auto section">


                  <header className="mb-5 bigfonts">
                    <h1> Welcome to asmitameet! </h1>
                  </header>




                  <p className="mb-5"></p>
                  <p></p>


                  <form   className="subscribe-form" onSubmit={this.onConnect}>
                    <div className="row form-section">

                    <div className="col-md-7 col-sm-7 col-xs-7">
                        <input name="Your Name" onChange={(event) => { this.setState({ participantName: event.target.value }) }} type="text" className="form-control" id="nameid" placeholder="Your name...." required />
                      </div>

                      <div className="col-md-7 col-sm-7 col-xs-7">
                        <input name="roomName" onChange={(event) => { this.setState({ roomId: this.state.strSanitizeFx(event.target.value) }) }} type="text" className="form-control" id="roomnameid" placeholder="Room Name..." required />
                      </div>

                      


                      <div className="col-md-5 col-sm-5 col-xs-5">
                        <button type="submit" className="tm-btn-subscribe">Enter Room</button>
                      </div>

                    </div>
                  </form>
                  <div>{lastError}</div>


                  {/*}

                  <form action="#" method="get" className="subscribe-form">
                    <div className="row form-section">

                      <div className="col-md-7 col-sm-7 col-xs-7">
                        <input name="roomName" type="text" className="form-control" id="roomnameid" placeholder="Room Name..." required />
                      </div>

                      <div className="col-md-7 col-sm-7 col-xs-7">
                        <input name="Your Name" type="text" className="form-control" id="nameid" placeholder="Your name...." required />
                      </div>


                      <div className="col-md-5 col-sm-5 col-xs-5">
                        <button type="submit" className="tm-btn-subscribe">Enter Room</button>
                      </div>

                    </div>
                  </form>

                  {*/}






                </div>
              </div>
            </div>























                  

            <div className="TL">
                  {/*}
              <div>
                <span>Participant Name</span>
                <input type='text' value={this.state.participantName} onChange={(event) => { this.setState({ participantName: event.target.value }) }}>
                </input>
              </div>

              <div>Room: <input readOnly={status !== 'closed'} type='text' onChange={(event) => { this.setState({ roomId: event.target.value }) }} value={roomId} /></div>
              <div>
                {status === 'closed'
                  ? <button onClick={this.onConnect}>
                    Connect
                  </button>
                  : status === 'open' && this.state.joinVidCall === false
                    ? <button onClick={this.onDisconnect}>
                      Disconnect
                    </button>
                    : status === 'open' && this.state.joinVidCall === true ?
                      <p>Please leave vid call to disconnect</p> : <button disable={true}>{status}</button>
                }
              </div>
              <div>{lastError}</div>
                {*/}
            </div>
          </div>




          :



          <div className="App">




            <div className="TL">


            {/*}
              <div>
                <span>Participant Name</span>
                <input type='text' value={this.state.participantName} onChange={(event) => { this.setState({ participantName: event.target.value }) }}>
                </input>
              </div>

              <div>Room: <input readOnly={status !== 'closed'} type='text' onChange={(event) => { this.setState({ roomId: event.target.value }) }} value={roomId} /></div>
            
            
                      <div className="col-md-5 col-sm-5 col-xs-5">
                        <button type="submit" className="tm-btn-subscribe">Enter Room</button>
                      </div>

className="mb-5 bigfonts"
            
            
            {*/}

            <header className="mb-5 bigfonts"><h1>Room:   {this.state.roomId}</h1></header>
              <div className= "AsmitaCentreButton">
                {status === 'closed'
                  ? <button className="tm-btn-subscribe" onClick={this.onConnect}>
                    Connect
                  </button>
                  : status === 'open' && this.state.joinVidCall === false
                    ? <button className="tm-btn-subscribe" onClick={this.onDisconnect}>
                      Disconnect
                    </button>
                    : status === 'open' && this.state.joinVidCall === true ?
                      <p>Please leave vid call to disconnect</p> : <button className="tm-btn-subscribe" disable={true}>{status}</button>
                }
              </div>
              <div>{lastError}</div>
              {status === 'open' ?
                <MyChatBox messages={this.state.messages} participantName={this.state.participantName} participantNames={this.state.participantList} /> : <p> Connect first for message </p>
              }
            </div>






            <div className="TR">
              <div className="TR_Header">
                <header className="mb-5 bigfonts"><h1>{this.state.participantName + "(You!)"}</h1></header>

                {/*}
            <LocalSpeaker deviceList={deviceList} key='LocalSpeaker' defaultSpeakerId={defaultSpeakerId} onSpeakerChanged={this.onSpeakerChanged} />
            {*/}
              </div>
              <div className='TR_Body'>
                <div className="TR_Body_Block">
                  <LocalTracks setVidCallFlag={this.myfx} activeRoomId={activeRoomId} deviceList={deviceList} defaultMicId={defaultMicId} defaultVideoId={defaultVideoId} key='localTracks' />

                </div>

              </div>
            </div>






            <div className="B">

              <div className="B_Header">
                <header className="mb-5 bigfonts"><h1>Video Call Participants</h1></header>
              </div>
              <div className="B_Body">
                {this.renderRemoteTracks(remoteTrackGroups, selectedSpeakerDeviceId)}

              </div>


            </div>


          </div>}
      </div>
    )
  }
}
