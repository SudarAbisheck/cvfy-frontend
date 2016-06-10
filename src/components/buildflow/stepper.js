import React, { PropTypes } from 'react';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentForward from 'material-ui/svg-icons/content/forward';
import DockerSetup from './dockerSetup';
import InputComponentsList from './inputComponentsList';

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
        return <InputComponentsList />;
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

          <FloatingActionButton
            onMouseDown={this.handleNext}>
            <ContentForward />
          </FloatingActionButton>

        </Stepper>
        <div>
          <div className="row">
            {this.getStepContent(stepIndex)}
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
