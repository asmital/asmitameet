import React from 'react';
import './MyChatBox.css';
import { MessageItem } from './MessageItem';


export class MyChatBox extends React.Component {
    constructor(props) {
        super(props);

        this.messages = props.messages;

        this.participantName = props.participantName;
        this.participantNames = props.participantNames;



        this.state = {
            listofMessages: this.props.messages,
            currentMessage: '',
        }

    }

    componentDidMount() {
        //console.log("MyChatBox: DidMount():");
    }


    componentDidUpdate(prevProps) {
        if (prevProps.messages !== this.props.messages) {
            this.setState({ listofMessages: this.props.messages });
        }
    }

    onSend = () => {

        console.log("MyChatBox:  onSend()");

        if (this.state.currentMessage === "") {
            console.log("ChatBox::onSend()  - no point in sending an empty message : STOP IT");
        } else {
            console.log("ChatBox::OnSend()  - Sending a text message to the world", this.state.currentMessage);

            let tempText = this.state.currentMessage;
            let tempName = this.participantName;
            let tempTimestamp = Date.now();
            console.log('Timestamp:', tempTimestamp);
            /*
            this.messages=this.state.listofMessages;
            this.messages.push({
                name: tempName,
                message: tempText,
                timestamp: tempTimestamp,
                type: tempType,
            });
            this.setState({listofMessages:this.messages});
            */
            console.log('Seeing active room', window.asmitaMeet.activeRoom);
            if (window.asmitaMeet.activeRoom) {
                let tempString = JSON.stringify({
                    name: tempName,
                    message: tempText,
                    timestamp: tempTimestamp
                })
                window.asmitaMeet.activeRoom.sendTextMessage(tempString);
                console.log('Sending JSOn stringify to room', tempString);
            }
        }


    }
    displaylistofMessages = () => {
        let ret = []
        let n = this.state.listofMessages.length;
        if (n < 5) {

            this.state.listofMessages.map((m) => (

                ret.push(<MessageItem key={m.timestamp + m.message} message={m.message} sender={m.name} timestamp={m.timestamp}> </MessageItem>)))
        }
        else {
            for(let i=n-5;i<n;i++){
                let m=this.state.listofMessages[i];
                ret.push(<MessageItem key={m.timestamp + m.message} message={m.message} sender={m.name} timestamp={m.timestamp}> </MessageItem>)

            }

                
        }



        return ret;



    }

    render() {

        const boxStyle = {
            color: "#346789",
            background: "linear-gradient(120deg, rgba(23, 190, 187, 1), rgba(240, 166, 202, 1))",
            overflow: "hidden"
        }
        return (
            <div className="MyChatBox" key={this.props}>
            
                <div className="chatbox" >
                    <div className="chatbox__user-list">
                        <h1>Chat Participants</h1>
                        {this.participantNames.map(
                            participant =>
                                <div className='chatbox__user--active' key={participant.id}>
                                    <p>{participant.name}</p> </div>
                        )}
                    </div>
                </div>

                <div className="Chat"  >
                    <div className="chatbox__messages">
                        {/*}<h3>Message List</h3>{*/}
                        {
                            this.displaylistofMessages()}
                        {/*}
                            this.state.listofMessages.map((m) => (

                            <MessageItem key={m.timestamp+m.message} message={m.message} sender={m.name} timestamp={m.timestamp}> </MessageItem>
                            
                        )){*/}


                    </div>
                </div>

                <div className="Sendbox">
                    <div className="InputText">
                        {/*}<span>Message to Send: </span>{*/}
                        <input type='text' placeholder="Enter a message" value={this.state.currentMessage}
                            onChange={(event) => { this.setState({ currentMessage: event.target.value }) }}>
                        </input>
                        <button className="sendButton" onClick={this.onSend}>
                        <i class="far fa-paper-plane" ></i>
                        </button>
                    </div>
                </div>




                {/*}  <div style={mystyle}>
                    <div>
                        <h3> Chat Box State</h3>
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