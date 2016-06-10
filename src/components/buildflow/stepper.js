import React, { PropTypes } from 'react';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import DockerSetup from './dockerSetup';

class HorizontalLinearStepper extends React.Component {
  constructor(props) {
    super();
    this.state = {
      finished: false,
      stepIndex: 0
    };
    this.socket = props.socket;
    this.handleNext = this.handleNext.bind(this);
    this.handlePrev = this.handlePrev.bind(this);
    this.getStepContent = this.getStepContent.bind(this);
  }

  handleNext() {
    const {stepIndex} = this.state;
    this.setState({
      stepIndex: stepIndex + 1,
      finished: stepIndex >= 2
    });
  }

  handlePrev() {
    const {stepIndex} = this.state;
    if (stepIndex > 0) {
      this.setState({stepIndex: stepIndex - 1});
    }
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return <DockerSetup socket={this.socket}/>;
      case 1:
        return 'Configure Input component';
      case 2:
        return 'Configure Output component';
      case 3:
        return 'Demo';
      default:
        return 'tocttou was here!';
    }
  }

  render() {
    const {finished, stepIndex} = this.state;

    return (
      <div style={{width: '100%', margin: 'auto'}}>
        <Stepper activeStep={stepIndex}>
          <Step>
            <StepLabel>Setup backend code</StepLabel>
          </Step>
          <Step>
            <StepLabel>Configure Input component</StepLabel>
          </Step>
          <Step>
            <StepLabel>Configure Output component</StepLabel>
          </Step>
          <Step>
            <StepLabel>Demo</StepLabel>
          </Step>
        </Stepper>
        <div>
          <div className="row">
            {this.getStepContent(stepIndex)}
          </div>
          <div>
            <div style={{marginTop: 12}}>
              <FlatButton
                label="Back"
                disabled={stepIndex === 0}
                onTouchTap={this.handlePrev}
                style={{marginRight: 12}}
              />
              <RaisedButton
                label={stepIndex === 2 ? 'Finish' : 'Next'}
                primary
                onTouchTap={this.handleNext}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

HorizontalLinearStepper.propTypes = {
  socket: PropTypes.object.isRequired
};

export default HorizontalLinearStepper;
