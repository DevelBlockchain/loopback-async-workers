import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

export default class ConfirmModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            title: '',
            body: <div></div>,
            action: () => console.log('ok button'),
        }
    }

    show = async (title, body, action) => {
        this.setState({
            showModal: true,
            title,
            body,
            action,
        });
    }

    handleClose = async () => {
        await this.setState({ showModal: false });
        if (this.props.handleClose) {
            this.props.handleClose();
        }
    }

    submit = async (event) => {
        event.preventDefault();
        await this.handleClose();
        await this.state.action();
        if (this.props.handleClose) {
            this.props.handleClose();
        }
    }

    render() {
        return (<Modal isOpen={this.state.showModal} toggle={this.handleClose} size="lg" centered>
            <ModalHeader toggle={this.handleClose}>
                {this.state.title}
            </ModalHeader>
            <ModalBody>
                {this.state.body}
            </ModalBody>
            <ModalFooter>
                <button className="btn btn-primary" onClick={this.submit}>OK</button>
                <button className="btn btn-secondary" onClick={this.handleClose}>Cancel</button>
            </ModalFooter>
        </Modal>)
    }
}
