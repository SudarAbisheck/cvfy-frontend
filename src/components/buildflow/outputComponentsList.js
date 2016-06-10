import React, {PropTypes} from 'react';
import RepoCard from '../stateless/cards';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import toastr from 'toastr';

toastr.options.closeButton = true;

class OutputComponentsList extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showDockerModalState: false,
      outputFieldName: ''
    };
    this.socket = props.socket;
    this.toggleDockerModalShow = this.toggleDockerModalShow.bind(this);
    this.updateOutputName = this.updateOutputName.bind(this);
  }

  componentWillMount() {
  }

  toggleDockerModalShow() {
    this.setState({showDockerModalState: !this.state.showDockerModalState});
  }

  updateOutputName(event) {
    this.setState({outputFieldName: event.target.value});
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
          header={'Image Output Component'}
          key={1}
          heading="Props"
          accessType={this.state.outputFieldName || "Type: Image Display - ID: None"}
          Language=""
          button_label="Modify"
          onDeployClick={() => this.toggleDockerModalShow()}/>
        <Dialog
          title="Modify Props"
          actions={action}
          modal
          open={this.state.showDockerModalState}
          onRequestClose={this.toggleDockerModalShow}>
          <TextField
            hintText="id of the image"
            type="text"
            value={this.state.outputFieldName}
            onChange={this.updateOutputName} /><br />
        </Dialog>
      </div>);
  }
}

OutputComponentsList.propTypes = {
  socket: PropTypes.object.isRequired
};

export default OutputComponentsList;
