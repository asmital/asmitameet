import React from 'react';
import './MessageItem.css';

export class MessageItem extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            message: props.message ? props.message : null,
            timestamp: props.timestamp || Date.now(),
            sender: props.sender || "Unknown",
        }


    }
    toCurrentDate = (timestamp) => {
        var formats=['jan','feb','mar','apr','may','jun','july',
                        'aug','sept','oct','nov','dec']
        let currTime = new Date(timestamp);
        let dd = currTime.getDate() ; 
        let mm = currTime.getMonth();
        let hours = currTime.getHours();
        let mins = currTime.getMinutes();

        let retString =  dd + "-" + formats[mm] + "" + "  " + hours + ":" + mins ; 
        return retString ; 
        //return currTime.toString();

    }
    render() {
        return (
            <div className="MessageItem">
                <div className="chatbox1">
                <div className="chatbox__messages_user-message">
                    <div className="chatbox__messages__user-message--ind-message">

                        <p className="name">{this.state.sender}</p>
                        <p className="timeStamp"> {this.toCurrentDate(this.state.timestamp)}</p>
                        <p className="message">{this.state.message}</p>
                    </div>
                </div>
                </div>
            </div>
        )
    }

}