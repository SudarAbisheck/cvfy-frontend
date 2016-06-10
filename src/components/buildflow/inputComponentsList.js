import React, {PropTypes} from 'react';
import RepoCard from '../stateless/cards';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import toastr from 'toastr';

toastr.options.closeButton = true;

class InputComponentsList extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showDockerModalState: false
    };
    this.socket = props.socket;
    this.toggleDockerModalShow = this.toggleDockerModalShow.bind(this);
  }

  componentWillMount() {
  }

  toggleDockerModalShow() {
    this.setState({showDockerModalState: !this.state.showDockerModalState});
  }

  render() {
    const action = [
      <FlatButton
        label="OK"
        key="1"
        primary
        keyboardFocused
        onTouchTap={this.toggleDockerModalShow}
      />
    ];

    return (
      <div>
        <RepoCard
          header={'Input Form'}
          key={1}
          heading="Props"
          accessType={'Type: Imageupload - Noname'}
          Language={'Target: No target'}
          button_label="Use"
          onDeployClick={() => this.toggleDockerModalShow()}/>
        <Dialog
          title="Modify Props"
          actions={action}
          modal
          open={this.state.showDockerModalState}
          onRequestClose={this.toggleDockerModalShow}>
          <TextField
            hintText="Name of the input field"
            value={this.state.username}
            onChange={this.onUsernameChange} /><br />
          <TextField
            hintText="Password"
            type="password"
            value={this.state.password}
            onChange={this.onPasswordChange} /><br />
        </Dialog>
      </div>);
  }
}

InputComponentsList.propTypes = {
  socket: PropTypes.object.isRequired
};

export default InputComponentsList;
