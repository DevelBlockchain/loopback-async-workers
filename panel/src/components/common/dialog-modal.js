import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

export default class DialogModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            title: '',
            body: <div></div>,
        }
    }

    show = async (title, body) => {
        this.setState({
            showModal: true,
            title,
            body,
        });
    }

    handleClose = async () => {
        await this.setState({ showModal: false });
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
                <button className="btn btn-primary" onClick={this.handleClose}>OK</button>
            </ModalFooter>
        </Modal>)
    }
}
