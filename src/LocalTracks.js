import React from 'react';
import _ from 'lodash'
import { componentGetCompareProps } from './Shared'
import './LocalTracks.css'

export class LocalTracks extends React.Component {
    constructor (props) {
        super(props)


        this.state = {
            selectedMicDeviceId: 'none',
            selectedVideoDeviceId: 'none',
            loaded: false,
            joinVidCall: false}
        
        this.videoRef = React.createRef()
        this.micRef = React.createRef()
        this.trackList = []
        //console.log('LocalTracks::Consructor', props)
        this.setVidCallFlagFx=props.setVidCallFlag
    }

    componentDidMount () {
        const { deviceList = [], defaultMicId, defaultVideoId, activeRoomId } = this.props

        window.JitsiMeetJS.createLocalTracks({ devices: ['audio', 'video']})
        .then((tracks) => {
            let deviceIds = _.map(deviceList, (nd) => nd.id)
            for (let track of tracks) {
                if (_.indexOf(deviceIds, track.deviceId) !== -1) {
                    this.trackList.push(track)
                }
            }
            this.setState({
                loaded: true,
                deviceList: deviceList,
                selectedMicDeviceId: defaultMicId,
                selectedVideoDeviceId: defaultVideoId,
            }, () => {
                this.updateLocalTrack(defaultMicId, 'set')
                this.updateLocalTrack(defaultVideoId, 'set')
                //console.log("LocalTracks:DidMount:  Join vid call", this.state.joinVidCall)

                if (activeRoomId && window.asmitaMeet.activeRoom && this.state.joinVidCall) {
                    
                    let videoTrack = _.find(this.trackList, (t) => { return t.deviceId === defaultVideoId })
                    let micTrack = _.find(this.trackList, (t) => { return t.deviceId === defaultMicId })
                    console.log("LocalTracks:DidMount Adding tracks to ActiveRoom", videoTrack, micTrack)
                    if (videoTrack) {
                        window.asmitaMeet.activeRoom.addTrack(videoTrack)
                    }
                    if (micTrack) {
                        window.asmitaMeet.activeRoom.addTrack(micTrack)
                    }
                }
            })
        })
    }

    onTrackStoppedEvent = (event) => {
        console.log(`Track Stopped`)
    }

    onTrackAudioOutputChangedEvent = (deviceId) => {
        console.log(`Track ${deviceId} audio output changed`)
    }

    updateLocalTrack = (deviceId, action = 'clear') => {
        if (action === 'clear') {
            let clearTrack = _.find(this.trackList, { deviceId: deviceId })
            if (clearTrack) {
                // eslint-disable-next-line default-case
                switch (clearTrack.getType()) {
                    case 'audio':
                    if (this.micRef.current) {
                        clearTrack.detach(this.micRef.current)
                        clearTrack.removeEventListener(window.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED, this.onTrackStoppedEvent);
                        clearTrack.removeEventListener(window.JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED, this.onTrackAudioOutputChangedEvent);
                        clearTrack.dispose()
                    }
                    break
                    case 'video':
                        if (this.videoRef.current) {
                            clearTrack.detach(this.videoRef.current)
                            clearTrack.dispose()
                        }
                    break
                }
            }
        } else if (action === 'set') {
            let setTrack = _.find(this.trackList, (t) => { return t.deviceId === deviceId })
            if (setTrack) {
            // eslint-disable-next-line default-case
                switch (setTrack.getType()) {
                    case 'audio':
                        if (this.micRef.current) {
                            setTrack.attach(this.micRef.current)
                            setTrack.addEventListener(window.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED, this.onTrackStoppedEvent);
                            setTrack.addEventListener(window.JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED, this.onTrackAudioOutputChangedEvent);
                            setTrack.mute()
                        }
                    break
                    case 'video':
                        if (setTrack && this.videoRef.current) {
                            setTrack.attach(this.videoRef.current)
                        }
                    break
                }
            }
        }
    }
    allowVidCall = () => {

        this.setState({
          joinVidCall:true
        });
        this.setVidCallFlagFx(true);
        
        
        //console.log("LocalTracks::allowVidCall - allowVidCall function called ");
    
    
      }
    
      disableVidCall = () => {
        this.setState({
          joinVidCall:false
        })
        this.setVidCallFlagFx(false);
        
    
      }
    

    componentDidUpdate (prevProps, prevState) {


        const selectedVideoDeviceId = componentGetCompareProps('selectedVideoDeviceId', this.state, prevState, '')

        if (selectedVideoDeviceId.HasChanged) {
            if (selectedVideoDeviceId.Previous !== '') {
                this.updateLocalTrack(selectedVideoDeviceId.Previous, 'clear')
            }
            if (selectedVideoDeviceId.Current !== '') {
                this.updateLocalTrack(selectedVideoDeviceId.Current, 'set' )
            }
        }

        const selectedMicDeviceId = componentGetCompareProps('selectedMicDeviceId', this.state, prevState, '')

        if (selectedMicDeviceId.HasChanged) {
            if (selectedMicDeviceId.Previous !== '') {
                this.updateLocalTrack(selectedMicDeviceId.Previous, 'clear')
            }
            if (selectedMicDeviceId.Current !== '') {
                this.updateLocalTrack(selectedMicDeviceId.Current, 'set' )
            }
        }

        const activeRoomId = componentGetCompareProps('activeRoomId', this.props, prevProps, '')
        
        //if (activeRoomId.HasChanged) {
            //log("LocalTracks:Update:  Join vid call", this.state.joinVidCall)
            if (activeRoomId.Current && window.asmitaMeet.activeRoom && this.state.joinVidCall) {
                const { selectedMicDeviceId, selectedVideoDeviceId } = this.state
                let videoTrack = _.find(this.trackList, (t) => { return t.deviceId === selectedVideoDeviceId })
                let micTrack = _.find(this.trackList, (t) => { return t.deviceId === selectedMicDeviceId })
                if (videoTrack) {
                    window.asmitaMeet.activeRoom.addTrack(videoTrack)
                }
                if (micTrack) {
                    window.asmitaMeet.activeRoom.addTrack(micTrack)
                }
            }
        //}
    }

    componentWillUnmount () {
        const { selectedMicDeviceId, selectedVideoDeviceId } = this.state

        this.updateLocalTrack(selectedMicDeviceId, 'clear')
        this.updateLocalTrack(selectedVideoDeviceId, 'clear')
    }

    onCameraChange = (event) => {
        this.setState({selectedVideoDeviceId: event.target.value});
    }

    onMicrophoneChange = (event) => {
        this.setState({selectedMicDeviceId: event.target.value});
    }

    render () {
        const { selectedVideoDeviceId, selectedMicDeviceId, deviceList = [] } = this.state


        return <div className='local_track'>
            {/*}<div className='local_track_controls'>
                <span>Camera</span>
                <select value={selectedVideoDeviceId} onChange={this.onCameraChange}>
                    {_.map(_.concat([{ name: 'none', id: 'none', type: 'none' }], _.filter(deviceList, { type: 'videoinput' })), (d) => {
                        return <option key={d.id} value={d.id}>{d.name}</option>
                    })}
                </select>
                <span>Microphone</span>
                <select value={selectedMicDeviceId} onChange={this.onMicrophoneChange}>
                    {_.map(_.filter(deviceList, { type: 'audioinput' }), (d) => {
                        return <option key={d.id} value={d.id}>{d.name}</option>
                    })}
                </select>
            </div>{*/}
            <div>
              { this.state.joinVidCall === false
                ? <button className="tm-btn-subscribe" onClick={this.allowVidCall}>
                  Join Vid Call
                </button>
                : this.state.joinVidCall === true
                  ? <button className="tm-btn-subscribe" onClick={this.disableVidCall}>
                    Leave Vid Call
                  </button>
                  : <p></p>
              }
            </div>
            <div className='local_track_body'>
                <video autoPlay='1' ref={this.videoRef}/>
            </div>
            {/* <div>
                <audio autoPlay='1' muted='true' ref={this.micRef} />
            </div> */}
        </div>

    }
}
