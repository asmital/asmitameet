import React from 'react';
//import './LoginPage.css';
import { LocalTracks } from './LocalTracks'
import { LocalSpeaker } from './LocalSpeaker'
//import _ from 'lodash'
import { RemoteTrack } from './RemoteTrack';
import { v4 as uuidv4 } from 'uuid'

export class LoginPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            roomName: 'e1202',
            status: 'closed',
            participantName: 'Amyat',
            errorMessage: '',
            serverURL: 'alpha.jitsi.net',
            roomId: null

        }

        window.asmitaMeet = {}
        window.asmitaMeet.activeRoom = null;
        window.asmitaMeet.activeConnection = null;

        this.onMessageRecvd = props.onMessageRecvd ;
        console.log("LoginPage::Constructor: Passed Properties",props)

    }

    componentDidMount() {
        console.log("LoginPage::DidMount():Login page mounted", this.props);
    }
    componentDidUpdate() {
        console.log("LoginPage::didUpdate():Login page updated");

    }
    onConnect = () => {
        // Called when button is pressed
        console.log("LoginPage::onConnect:Connect button pressed")
        let roomName = this.state.roomName
        console.log("LoginPage::onConnect:Room is", roomName)
        this.setState({
            status: 'Joining...'
        })
        console.log("LoginPage::onConnect:Room is", roomName, "window:", window)
        console.log("LoginPage::onConnect:Making an active JitsiConnection connection in <window.asmitaMeet is>:", window.asmitaMeet)
        window.asmitaMeet.activeConnection = new window.JitsiMeetJS.JitsiConnection(null, null, {
            hosts: {
                domain: this.state.serverURL,
                muc: `conference.${this.state.serverURL}`
            },
            serviceUrl: `wss://${this.state.serverURL}/xmpp-websocket?room=${roomName}`,
            clientNode: `https://${this.state.serverURL}`
        })
        console.log('LoginPage::onConnect:Babs is sleepy but we connected, activeConnection got:', window.asmitaMeet.activeConnection);


        window.asmitaMeet.activeConnection.addEventListener(window.JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, this.onConDisconnection)
        window.asmitaMeet.activeConnection.addEventListener(window.JitsiMeetJS.events.connection.CONNECTION_FAILED, this.onConFailure)
        window.asmitaMeet.activeConnection.addEventListener(window.JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, this.onConSuccess)
        console.log("LoginPage::onConnect: after JitsiConnection, we get an activeconnection to the active connection we will connect, activeConnection:", window.activeConnection)
        window.asmitaMeet.activeConnection.connect()

    }


    onConSuccess = () => {
        console.log("LoginPage::onConSuccess:connection success");
        let myroom = this.state.roomName;
        console.log("LoginPage::onConSuccess:Connection: Room name is ", myroom)
        try {
            window.asmitaMeet.activeRoom = window.asmitaMeet.activeConnection.initJitsiConference(myroom, { openBridgeChannel: true })
            console.log("LoginPage::onConSuccess: Got the active room", window.asmitaMeet.activeRoom);
            window.asmitaMeet.activeRoom.addEventListener(window.JitsiMeetJS.events.conference.MESSAGE_RECEIVED, this.onMessageGot)
            window.asmitaMeet.activeRoom.addEventListener(window.JitsiMeetJS.events.conference.TRACK_ADDED, this.onRoomTrackAdded)
            window.asmitaMeet.activeRoom.addEventListener(window.JitsiMeetJS.events.conference.TRACK_REMOVED, this.onRoomTrackRemoved)
            window.asmitaMeet.activeRoom.setDisplayName(this.state.participantName);
            window.asmitaMeet.activeRoom.join()
            this.setState({
                status: 'open',
                errorMessage: '',
                roomId: uuidv4()
            })
            console.log("LoginPage::onConSuccess:initJitsiConference is successful ****",window.asmitaMeet.activeRoom);
               // window.asmitaMeet.activeRoom.getParticipants())
                 /*   .then((parties) => {
                        console.log(parties);

                    })); */
        }
        catch (error) {
            console.log("LoginPage::onConSuccess(): Conference openning: error is caught for initJitsiConference")
            this.setState({
                status: 'closed',
                errorMessage: error.message,
            })
        }
    }
    onConFailure = (e, f, g, h) => {
        console.log("LoginPage::onConFailure(): Connection failed", e);
        this.setState({
            state: 'closed',
            roomId: null,
            errorMessage: e,

        })

    }
    onConDisconnection() {
        console("LoginPage::onConDisconnection(): Disconnecting now - removing all listeners")
        window.asmitaMeet.activeConnection.removeEventListener(window.JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, this.onConSuccess)
        window.asmitaMeet.activeConnection.removeEventListener(window.JitsiMeetJS.events.connection.CONNECTION_FAILED, this.onConFailure)
        window.asmitaMeet.activeConnection.removeEventListener(window.JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, this.onConDisconnection)
        window.asmitaMeet.activeRoom.removeEventListener(window.JitsiMeetJS.events.conference.TRACK_ADDED, this.onRoomTrackAdded)
        window.asmitaMeet.activeRoom.removeEventListener(window.JitsiMeetJS.events.conference.TRACK_REMOVED, this.onRoomTrackRemoved)
        console.log("LoginPage::onConDisconnection(): finished")

    }

    onMessageGot = (id, msg, num) => {
        console.log('LoginPage::onMessageGot()  WE GOT MESSAGE FROM ALIENS', 'ID:', id, 'MSG:', msg, 'NUM:', num);
        this.onMessageRecvd(id,msg,num);
        console.log("LoginPage:onMessageGot(): passing the funciton to upper layer");
        this.messageRecvd = { id:id, msg:msg, num:num}
    }

    onRoomTrackAdded = () => {
        console.log('LoginPage::OnRoomTrackAddedCB():room track added')
    }
    onRoomTrackRemoved = () => {
        console.log('LoginPage::OnTrackRemovedCB(): room track removed')
    }



    onDisconnect = () => {
        console.log('LoginPage::onDisconnect', 'We disconnected');
        if (window.asmitaMeet.activeRoom) {
            this.setState({
                status: 'Leaving the chat room',
            })
            try {
                window.asmitaMeet.activeRoom.leave().then(() => {
                    if (window.asmitaMeet.activeConnection) {
                        window.asmitaMeet.activeConnection.disconnect()
                    }
                    this.setState({
                        status: 'closed',
                        //remoteTracks: [],
                        roomId: null
                    })
                })
            } catch (error) {
                console.log('LoginPage::onDisconnect()', 'Error', error);
                this.setState({
                    status: 'closed',
                    errorMessage: error.message
                })
            }
        }
    }

    render() {
        const mystyle = {
            color: "grey"


        };

        return (
            <div className="LoginPage">
                <div>
                    <span>RoomName</span>
                    <input type='text' value={this.state.roomName} onChange={(event) => { this.setState({ roomName: event.target.value }) }}>

                    </input>
                </div>
                <div>
                    <span>Participant Name</span>
                    <input type='text' value={this.state.participantName} onChange={(event) => { this.setState({ participantName: event.target.value }) }}>
                    </input>
                </div>


                <div style={mystyle}>
                    {/*}
                    <h3> This is the debugging board where the stuff related to state and other variables are displayed</h3> 
                    <ul>
                        <li>  Room:   {this.state.roomName} </li>
                        <li>  Status: {this.state.status}</li>
                        <li>  Participant Name: {this.state.participantName}</li>
                        <li>  Error Message if any: {this.state.errorMessage}</li>
                        <li>  Backend URL: {this.state.serverURL}</li>
                        <li>  roomID : {this.state.roomId}</li>
                    </ul>
                    {*/}
                    {/*}

                    <div>
                        <h3> Login Page's state </h3>
                        <pre>
                            {JSON.stringify(this.state, null, 2)}
                        </pre>
                    </div>

                    {*/}
                    {/*}


                    <div>
                        <h4> The state of the connection and room </h4>
                        <b> Browser' Connection: </b>
                        <div><pre>  { JSON.stringify(window.asmitaMeet.activeConnection,null,2) } </pre></div>
                        <b> Connection' Room: </b>
                        <div><pre>    { JSON.stringify(window.asmitaMeet.activeRoom,null,2)  }</pre></div>
                    </div>
                    {*/}

                    <hr>

                    </hr>
                    <br>

                    </br>


                </div>




                <div>
                    {this.state.status === 'closed' ? <button onClick={this.onConnect}>
                        Connect
                    </button>
                        : this.state.status === 'open'
                            ? <button onClick={this.onDisconnect}>
                                Disconnect
                            </button>
                            : <button disabled={true} >
                                {this.state.status}
                            </button>}
                </div>

            </div>
        )

    }
}





