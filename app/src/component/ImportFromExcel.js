import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import LinearProgress from '@material-ui/core/LinearProgress';
import MuiUploadIcon from '@material-ui/icons/Publish';
import { withStyles } from '@material-ui/core/styles';
import { showNotification as showNotificationAction } from 'react-admin';
import Dropzone from 'react-dropzone';
import {baseApiUrl} from '../App';
import {SESSION_TOKEN} from '../authClient';

const styles = theme => ({
    dropZone: {
        background: '#efefef',
        cursor: 'pointer',
        padding: '1rem',
        textAlign: 'center',
        color: '#999',
        margin: '1em 0',
        fontFamily: "Work Sans,Helvetica,Arial,sans-serif",
    },
    preview: {},
    leftIcon: {
      marginRight: theme.spacing.unit,
    },
});

class Upload extends Component {

    state = {
        open: false,
        file: null,
        loading: false,
        error: null,
        partial: true,
        delayed: false,
    };

    onDrop = (files) => {
        const uploadedFile = files[0];
        this.setState({ file: uploadedFile });
    }

    handleSubmit = () => {

        const { 
            resource,
            uniqueKey,
        } = this.props;

        const { 
            file, 
            partial,
            delayed, 
        } = this.state;
        
        this.setState({ loading: true })

        var formData = new FormData();        
        formData.append('file', file);
        
        fetch(`${baseApiUrl}/upload?resource=${resource}&unique_key=${uniqueKey}&delayed=${delayed}&partial=${partial}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${localStorage.getItem(SESSION_TOKEN)}` },
          body: formData
        })
        .then(response => this.parseResponse(response))
        .catch(error => {
            this.setState({ loading: false, error: error })
            this.props.showNotification('Error: could not upload file', 'warning')
        })
    };

    parseResponse = (response) => {
        switch(response.status) {
            case 200:
                this.setState({ loading: false, open: false });
                break;
            case 400:                
                response.json().then(result => {
                    this.setState({ loading: false, error: result.errors.map(error => error.detail).join(' ') })
                });
                break;
            default:
                response.json().then(result => {
                    this.setState({ loading: false, error: result.error })
                });                
                
        }
    }

    handleOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    handleErrorClose = () => {
        this.setState({ error: null });
    };

    onRemove = file => () => {
        this.props.input.onChange(null);
    };    
  

    render() {
        const { 
            accept,
            children,
            label, 
            style, 
            allowFullUpload, 
            classes = {}, 
        } = this.props;

        const { 
            file, 
            loading, 
            error, 
            partial, 
            open,
            delayed,
        } = this.state;

        const elStyle = {
            ...style,
            display: 'inline-block'
        }

        return <div style={elStyle}>
            <Button 
                color="primary"
                onClick={this.handleOpen}>
                <MuiUploadIcon className={classes.leftIcon}/>
                {label}
            </Button>
            <Dialog 
                aria-labelledby="upload-dialog-title"
                open={open}>
                <DialogTitle id="upload-dialog-title">Import Data</DialogTitle>
                <DialogContent>
                    {loading
                        ? <LinearProgress mode="indeterminate"/>
                        : <span>
                            <DialogContentText>
                                Here you can import new data or update existing data.
                            </DialogContentText>
                            <Dropzone 
                                onDrop={ this.onDrop } 
                                accept={accept}
                                multiple={false} 
                                className={classes.dropZone}>
                                {file
                                    ? <a href={file.preview}>{file.name}</a>
                                    : "Drop a .xlsx file to upload, or click to select it."
                                }
                            </Dropzone>
                            <FormGroup>
                            {allowFullUpload && <FormControlLabel
                                control={
                                    <Checkbox
                                        color="primary"
                                        checked={ partial }
                                        onChange={ event => this.setState({ partial: event.target.checked }) }
                                    />}
                                label="Keep existing records?"/>
                            }
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        color="primary"
                                        checked={ delayed }
                                        onChange={ event => this.setState({ delayed: event.target.checked }) }
                                    />}
                                label="Import rows in the background?"/>
                            </FormGroup>
                        </span>
                    }
                </DialogContent>
                <DialogActions>
                    <Button 
                        color="primary"
                        onClick= { this.handleClose }>
                        Cancel
                    </Button>
                    <Button 
                        color="primary"
                        disabled= { file ? false : true }
                        onClick= { this.handleSubmit }>
                        Submit
                    </Button>                              
                </DialogActions>
            </Dialog>
            <Dialog
                aria-labelledby="error-dialog-title"
                open={error}>
                <DialogTitle id="error-dialog-title">An error has occurred</DialogTitle>
                <DialogContent>
                    <DialogContentText>{error}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button 
                        color="primary"
                        onClick= {this.handleErrorClose}>                    
                        Got it                    
                    </Button>                    
                </DialogActions>                
            </Dialog>

        </div>
    }

}

Upload.propTypes = {
    resource: PropTypes.string,
    label: PropTypes.string,
    allowFullUpload: PropTypes.bool,
};

Upload.defaultProps = {
    label: "Import",
    allowFullUpload: true,
    accept: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
};

export default withStyles(styles)(connect(null, {
    showNotification: showNotificationAction,
})(Upload));