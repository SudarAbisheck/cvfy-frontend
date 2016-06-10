import React, {PropTypes} from 'react';
import toastr from 'toastr';

toastr.options.closeButton = true;

class DockerSetup extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      data: []
    };
    this.socket = props.socket;
  }

  componentWillMount() {
    this.socket.on('sendDataToTerminal', (data) => {
      this.setState({data: [...this.state.data, data]});
    });
    this.socket.on('sendDataToTerminalError', (err) => {
      this.setState({data: [...this.state.data, err]});
    });
    this.socket.on('completedCloning', (status) => {
      if (status == '0') {
        toastr.success('Git clone successful');
      } else {
        toastr.error('Git clone failed');
      }
    });
    this.socket.on('completedDeployment', (status) => {
      if (status != '0') {
        toastr.error('Deployment failed');
      }
    });
  }

  render() {
    console.log(this.state.data);
    return (
      <div className="ui sixteen column centered grid">
        <div className="ten wide stackable column">
          <div className="ui card" style={{width: "100%"}}>
            <div className="content">
              <div className="ui padded raised segment container"
                   style={{height: "52vh", backgroundColor: "black",
                color: "white", overflowY: "scroll"}}>
                {this.state.data.map((data) =>
                  <p key={Math.random()}>{data}</p>
                )}
              </div>
            </div>
            <div className="extra content">
              <h4>Some Info</h4>
            </div>
          </div>
        </div>
      </div>);
  }
}

DockerSetup.propTypes = {
  socket: PropTypes.object.isRequired
};

export default DockerSetup;
