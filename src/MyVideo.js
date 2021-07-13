import React from 'react';
import { LocalTracks } from './LocalTracks'
import { LocalSpeaker } from './LocalSpeaker'
//import _ from 'lodash'
import { RemoteTrack } from './RemoteTrack';
import { v4 as uuidv4 } from 'uuid'
//import { MessageItem } from './MessageItem';

export class MyVideo extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            localVideoId: null,  // tthe chosen video track , the chosen video id being played locally
            localVideoAV: null,   // the chosen video track av , being played
            localMicId: null,  // the chosen audio input id currently getting input from locally from local mic
            localAudioAV: null, // the chosen audio track currently getting input from lcoally from local mic. 
            listOfAvees: [],   // list of all avess ( tracks ) which are there locally being played. 
        }
        this.videoRef = React.createRef(); // the selected div for local video 
        this.micRef = React.createRef(); // the selected div for local audio not used though.... 
        this.avees = [] ; // these are local all avs related to my videos
        this.props = props

        console.log("MyVideo:Constructor: props", props);
    }

    //
    // take care to do post loading processing for the component ( - the parameters are passed as 
    //     from top  as  deviceList ,  defaultVideoId and activeRoomId     
    //   
    //
    componentDidMount() {
        console.log("MyVideo:DidMount(): **  ", "Component mounted getting all the local Audio Videos",this.props);
        const { passedDevices = [], passeddefaultMicId, passeddefaultVideoId, passedactiveRoomId } = this.props ;
        console.log("MyVideo:DidMount Passed props etc<passedList,defMic, defVideo, activeroom", 
            passedDevices, passeddefaultMicId, passeddefaultVideoId, passedactiveRoomId )

         

        let tempVideoId = null;
        let tempMicId = null;
        let tempVideoAV = null;
        let tempAudioAV = null;



        // ask jitsi to give and register local tracks  which are type audio and video 
        // Bug : the jitsi does not give microsoft Cams as a proper device ( TODO )
        // 
        // 
        window.JitsiMeetJS.createLocalTracks({ devices: ['audio', 'video'] })
            .then((latestAvees) => {
                console.log("MyVideo:DidMount:Got multiple local AVEES", latestAvees);
                let passedDevicesIds = passedDevices.map(passedAV => passedAV.id);
       

                console.log('MyVideo:DidMount, tempIds', passedDevicesIds) ;

                for (let av of latestAvees) {
                    console.log("MyVideo.DidMount() got an av:<av,kind,trackid, id>", av, av.track.kind, av.track.id, av.id);
                    if (av.track.kind === 'video') {
                        console.log("MyVideo:DidMount tempVideoID and av audio device is set", av.track.id, av)
                        tempVideoId = av.track.id;
                        tempVideoAV = av;
                    }
                    if (av.track.kind === 'audio') {
                        console.log("MyVideo:DidMount tempMicId audio device is set", av.track.id, av)
                        tempMicId = av.track.id;
                        tempAudioAV = av;
                    }
                    if ( av.track.id in passedDevicesIds) {
                            console.log("MyVideo::DidMount(): av's Id is not in the passed device lists",av.track.id);
                    }
                    this.avees.push(av);  // change if the discovered device id is not in the passed list, then add
                }

                // now i have discovered Ids and passed Ids, and default mic and video to play
                // TODO update the state with that passed Default Ids for mic/video 
                // time being just print it 

                console.log("MyVideo:Didmount(): locally and default comparision", 
                    "tempMic",tempMicId, "defaultmic:",passeddefaultMicId, "tempVideo:",tempVideoId, "passedVideo:",passeddefaultVideoId);
                this.setState({
                    listOfAvees: this.avees,
                    localVideoId: tempVideoId, // TODO change to passed default if valid 
                    localMicId: tempMicId,  // TODO  change to passed default if valid
                    localVideoAV: tempVideoAV,
                    localAudioAV: tempAudioAV
                }, () => {
                    console.log("MyVideo:DidMount:, what is activeRoom in my State? ", window.asmitaMeet.activeRoom);
                    console.log("MyVideo:DidMount:, what is activeConnection in my State? ", window.asmitaMeet.activeConnection);

                    // later on take the set it means attach to the display local video  and to the room
                    // TODO this may not be the place where you attach to the room, 
                    // TODO  handle the passed activeRoom that may be null and you may not have any activeRoom 
                    this.updateLocalTrack(this.state.localAudioAV, 'set')
                    this.updateLocalTrack(this.state.localVideoAV, 'set')
                    if (window.asmitaMeet.activeRoom) { // BUG this was not passed  TODO
                        if (this.state.localVideoAV) {
                            console.log("MyVideo:DidMount() deferred Setstate fx, adding localVideoAV")
                            window.asmitaMeet.activeRoom.addTrack(this.state.localVideoAV) ; // why to stored full av? 
                        }
                        if (this.state.localAudioAV) {
                            console.log("MyVideo:DidMount() deferred Setstate fx, adding localAudioAV")
                            window.asmitaMeet.activeRoom.addTrack(this.state.localAudioAV) ; // why state should have this
                        }
                    }
                    else {
                        console.log("MyVideo.ComponentDidMount no active room so it is not assigned yet may be error");
                    }




                });
            });



    }
    componentDidUpdate() {
        console.log("MyVideo:DidUpdate():  ", "TBD Actions - Component mounted");
    }


    updateLocalTrack = (av, action = 'clear') => {
        console.log("MyVideo::updateLocalTrack():av:", av, "action:", action)
        if (action === 'clear') {

            if (av) {
                // eslint-disable-next-line default-case
                switch (av.getType()) {
                    case 'audio':
                        if (this.micRef.current) {
                            console.log("MyVideo:updateLocalTracks(): audio div detaching");
                            av.detach(this.micRef.current)
                            //av.removeEventListener(window.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED, this.onTrackStoppedEvent);
                            //av.removeEventListener(window.JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED, this.onTrackAudioOutputChangedEvent);
                            av.dispose()
                        }
                        break
                    case 'video':
                        if (this.videoRef.current) {
                            console.log("MyVideo:UpdateLocalTracks: video div detatching")
                            av.detach(this.videoRef.current)
                            av.dispose()
                        }
                        break
                }
            }
        } else if (action === 'set') {

            if (av) {
                // eslint-disable-next-line default-case
                switch (av.getType()) {
                    case 'audio':
                        if (this.micRef.current) {
                            console.log("MyVideo:updateLocalTracks(): audio div attching");
                            
                            av.attach(this.micRef.current)
                            //av.addEventListener(window.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED, this.onTrackStoppedEvent);
                            //av.addEventListener(window.JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED, this.onTrackAudioOutputChangedEvent);
                            av.mute()
                        }
                        break
                    case 'video':
                        if (av && this.videoRef.current) {
                            console.log("MyVideo:UpdateLocalTracks: video div attaching")
                            av.attach(this.videoRef.current)
                        }
                        break
                }
            }
        }
    }


    render() {

        const mystyle = {
            color: "red"
        }
        return (

            <div className="MyVideo">
                <div>
                    <h1>My Video</h1>
                    <div>
                        <video id="LocalVid" autoPlay="1" ref={this.videoRef} width="360" height="200" >

                        </video>
                    </div>
                </div>

                {/*}
                <div style={mystyle}>
                    
                    <div>
                        <h3> My Video's state </h3>
                        <pre>
                            {JSON.stringify(this.state, null, 2)}
                        </pre>
                    </div>
                   
                </div>
                {*/}

            </div>

        )
    }



}