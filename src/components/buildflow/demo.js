import React, {PropTypes} from 'react';
import RaisedButton from 'material-ui/RaisedButton';

class DemoComponent extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      outputFile: ''
    };
    this.updateOutputFileContents = this.updateOutputFileContents.bind(this);
    this.doUpload = this.doUpload.bind(this);
  }

  doUpload() {
    const form_data = new FormData($('#upload-file')[0]);
    let that = this;
    $.ajax({
      type: 'POST',
      url: sessionStorage.getItem('target'),
      data: form_data,
      contentType: false,
      cache: false,
      processData: false,
      async: false,
      success: function(data) {
        that.updateOutputFileContents(data);
      }
    });
  }

  updateOutputFileContents(content) {
    this.setState({outputFile: content});
  }

  render() {
    const styles = {
      button: {
        margin: 12
      },
      exampleImageInput: {
        cursor: 'pointer',
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        width: '100%',
        opacity: 0
      }
    };

    return (
      <div className="row fluid grid">
        <div className="center aligned row">
          <div className="ui twelve column grid centered">
            <div className="six wide stackable centered column">
              <form id="upload-file" encType="multipart/form-data">
                <div className="ui segment">
                  <RaisedButton
                    label="Choose an Image"
                    labelPosition="before"
                    style={styles.button}>
                    <input type="file" name="file" style={styles.exampleImageInput} />
                  </RaisedButton>
                  <RaisedButton label="Upload" primary onClick={this.doUpload}/>
                </div>
              </form>
            </div>
            <div className="six wide stackable centered column">
              <div className="ui segment">
                <img src={this.state.outputFile} id="updateMe"/>
              </div>
            </div>
          </div>
        </div>
      </div>);
  }
}

DemoComponent.propTypes = {
  socket: PropTypes.object.isRequired
};

export default DemoComponent;
