import React, { PropTypes } from 'react';
import { Link, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getRepo, checkDockerfile } from '../../api/Github/getOneRepo';
import { startDeployment } from '../../api/Github/startDeployment';
import * as loginActions from '../../actions/loginActions';
import * as userActions from '../../actions/userActions';
import HorizontalLinearStepper from '../buildflow/stepper';
import CircularProgress from 'material-ui/CircularProgress';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import toastr from 'toastr';
import io from 'socket.io-client';

let socket = io();
toastr.options.closeButton = true;

class DeploymentPage extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showOutput: 'hidden',
      currentRepo: {},
      showDockerModalState: false,
      dockerModalError: ''
    };
    this.toggleShow = this.toggleShow.bind(this);
    this.toggleDockerModalShow = this.toggleDockerModalShow.bind(this);
  }

  componentWillMount() {
    getRepo(this.props.params.repoId)
      .then(currentRepo => {
        this.setState({currentRepo: JSON.parse(currentRepo)});
      }).then(() => {
        this.toggleShow();
      }).then(() => {
          checkDockerfile(this.props.params.repoId).then(status => {
            toastr.success('docker-compose.yml found')
            startDeployment(socket, status).then(() => {
              toastr.success('Started deployment for: ' + this.state.currentRepo.name);
            }).catch(err => {
              toastr.error(err);
            });
          }).catch(err => {
            this.setState({dockerModalError: err});
            this.toggleDockerModalShow();
          });
      })
      .catch(err => {
        toastr.error(err);
      });
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.currentRepo != nextProps.currentRepo) {
      this.setState({currentRepo: nextProps.currentRepo});
    }
  }


  toggleShow() {
    this.setState({showOutput: this.state.showOutput == 'visible' ? 'hidden' : 'visible'});
  }

  toggleDockerModalShow() {
    this.setState({showDockerModalState: !this.state.showDockerModalState});
  }

  render() {
    const action = [
      <FlatButton
        label="Go Back"
        key="1"
        primary
        keyboardFocused
        onTouchTap={this.toggleDockerModalShow}
      />
    ];

    return (
      <div className="ui relaxed stackable grid fluid container">


        {this.state.showOutput == 'hidden' &&
        <div className="centered row" style={{marginTop: "30vh"}}>
          <CircularProgress size={1.5} />
        </div>}

        {this.state.currentRepo &&
        <div className="sixteen wide column stretched row" style={{visibility: this.state.showOutput}}>
          <div className="row" >
            <h1>{this.state.currentRepo.name}</h1>
          </div>

          <div className="ui horizontal divider row" >
            <span><hr /></span>
          </div>

          <div className="row" >
            <h4 className="text">{this.state.currentRepo.description}</h4>
          </div>

          <div className="sixteen wide column row stretched" >
            <HorizontalLinearStepper socket={socket}/>
          </div>

        </div>}

        <Dialog
          title={this.state.dockerModalError}
          actions={action}
          modal
          open={this.state.showDockerModalState}
          onRequestClose={this.toggleDockerModalShow}>
          We require docker-compose.yml to proceed with the deployment.
          Please see <Link to="/about">documentation</Link>.
        </Dialog>
      </div>
    );
  }
}

DeploymentPage.propTypes = {
  login: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
  loginactions: PropTypes.object.isRequired,
  useractions: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    login: state.login,
    user: state.user
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loginactions: bindActionCreators(loginActions, dispatch),
    useractions: bindActionCreators(userActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DeploymentPage);
