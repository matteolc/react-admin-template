import React, { Component, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MuiDownloadIcon from '@material-ui/icons/GetApp';
import { showNotification as showNotificationAction } from 'react-admin';
import { SESSION_TOKEN } from '../authClient';
import downloadFile from '../downloadFile';
import { Button } from 'ra-ui-materialui';

class DownloadButton extends Component {

  state = {
      loading: false
  }
    
  download = () => {   
  	            
    const { 
        url,
        filename,
        showNotification,
        onClose,
    } = this.props;
      
    this.setState({ loading: true })
    
    fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem(SESSION_TOKEN)}` },
        responseType: 'arraybuffer'        
    })
    .then(response => response.blob())    
    .then(blob => downloadFile(blob, filename))
    .then(() => this.setState({ loading: false }))
    .then(() => onClose && onClose())
    .catch(error => {
        this.setState({ loading: false });
        showNotification('Error: could not download file', 'warning')
    })
  	  
  }    

    render() {

        const {
            loading,
        } = this.state;

        const {
            classes = {},
            title,
            icon,
        } = this.props;

        return <Button
            onClick={!loading && this.download}
            disabled={loading}
            label={loading ? "Processing.." : title}>
                {cloneElement(icon)}                
            </Button>            
    }
}	
	
DownloadButton.propTypes = {
    filename: PropTypes.string,
    url: PropTypes.string,
    icon: PropTypes.object,
};

DownloadButton.defaultProps = {
    icon: <MuiDownloadIcon/>,
}

export default connect(null, {
    showNotification: showNotificationAction,
})(DownloadButton);

