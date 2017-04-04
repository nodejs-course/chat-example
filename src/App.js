import React, { Component } from 'react';
import './Chat.css';
import moment from 'moment';

const socket = window.io(window.SOCKET_SERVER);

class App extends Component {

  constructor(){
    super();

    this.state = {
      clients: 0,
      messageText: '',
      messagesList: []
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.updateClients = this.updateClients.bind(this);
    this.addMessage = this.addMessage.bind(this);
  }

  componentDidMount() {
    socket.on('message', (msg) => {
      console.log(`type: ${msg.type}`);
      console.log(`payload:`, msg.payload);
      switch (msg.type) {
        case 'clientsLength':
          this.updateClients(msg.payload);
          break;
        case 'message':
          this.addMessage(msg.payload);
          break;
        default:
          return false;
      }
    });
  }

  handleChange(event) {
    this.setState({messageText: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();

    if(this.state.messageText !== '') {
      let newMessage = {
        text: this.state.messageText,
        date: Date.now()
      };

      socket.emit('chat:message', newMessage);
      this.addMessage({...newMessage, self: true });

      this.setState({
        messageText: ''
      })
    }
  }

  addMessage(message) {
    this.setState({
      messagesList: this.state.messagesList.concat([message])
    })
  }

  updateClients(count) {
    this.setState({
      clients: count
    })
  }

  renderMessage(msg){
    const {self, text, date} = msg;
    return(
      <li key={date} className={(self)?'Chat-message self':'Chat-message other'}>
        <div className="avatar"><img src={(self)?'http://i.imgur.com/HYcn9xO.png':'http://i.imgur.com/DY6gND0.png'} draggable="false"/></div>
        <div className="msg">
          <p>{text}</p>
          <time>{moment().format('LLLL')}</time>
        </div>
      </li>
    )
  }

  render() {
    const { messagesList } = this.state;
    return (
      <div className="Chat">
        <div className="Chat-header">
          <h2>Chat Example: {this.state.clients} clients connected.</h2>
        </div>
        <ul className={(messagesList.length)?'Chat-main':'Chat-main empty-list'} >
          {(messagesList.length)
            ? messagesList.map(msg => this.renderMessage(msg))
            : <li className="Chat-empty-list">No messages</li>
          }
        </ul>
        <form className="Chat-input-box" onSubmit={this.handleSubmit}>
          <input placeholder="Message" className="Chat-input" type="text" value={this.state.messageText} onChange={this.handleChange} />
          <input className="Chat-send-btn" type="submit" value="Send"/>
        </form>
      </div>
    );
  }
}

export default App;
