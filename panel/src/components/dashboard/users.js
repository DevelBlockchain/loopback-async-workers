import React, { Fragment } from 'react';
import Api from '../../api/api';
import DinamicTable from '../common/dinamic-table';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import OverlayLoading from '../common/overlay-loading';
import ConfirmModal from '../common/confirm-modal';

export default class Users extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            modal: false,
            id: null,
            form: {
                username: '',
                password: '',
            }
        }
    }

    componentDidMount = () => {
        this.updateTable();
    }

    updateTable = async () => {
        await this.setState({ loading: true });
        let req = await Api.get('/auth/users');
        if (!req.error) {
            let rows = req.data;
            let cols = [
                'Username',
                'Password',
                'See',
                'Del',
            ]
            rows = rows.map(row => {
                return [
                    row.username,
                    `***********`,
                    row,
                    row,
                ]
            })
            this.table.updateTable(cols, rows);
        }
        await this.setState({ loading: false });
    }

    openRow = (row) => {
        this.setState({
            modal: true,
            id: row.id,
            form: {
                username: row.username,
                password: '',
            }
        })
    }

    newRow = () => {
        this.setState({
            modal: true,
            id: null,
            form: {
                username: '',
                password: '',
            }
        })
    }

    saveRow = async () => {
        await this.setState({ loading: true });
        if (this.state.id) {
            await Api.post(`set_password/${this.state.id}`, this.state.form)
        } else {
            await Api.post(`signup`, this.state.form)
        }
        this.updateTable();
        this.setState({ modal: false, loading: false })
    }

    handleChange = (event) => {
        let form = this.state.form
        let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
        form[event.target.name] = value
        this.setState({ form })
    }

    deleteRow = async (row) => {
        this.confirm.show('Attention!', <>
            <h4>This action cannot be undone</h4>
        </>, async () => {
            await Api.del(`users/${row.id}`);
            this.updateTable();
        })
    }

    toggleModal = () => {
        this.setState({ modal: !this.state.modal })
    }

    render() {
        return (
            <Fragment>
                <OverlayLoading show={this.state.loading} />
                <div className="container-fluid pt-5">
                    <div className="row">
                        <div className="col-sm-12">
                            <div className="card">
                                <div className="card-header">
                                    <h5>Users List</h5>
                                </div>
                                <div className="card-body">
                                    <DinamicTable
                                        size="5"
                                        ref={ref => this.table = ref}
                                        openRow={this.openRow}
                                        deleteRow={this.deleteRow}
                                    />
                                    <button className="btn btn-primary" onClick={this.newRow}>New User</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Modal isOpen={this.state.modal} toggle={this.toggleModal} centered>
                    <ModalHeader toggle={this.toggleModal}>{this.state.id ? 'Edit' : 'New'} user</ModalHeader>
                    <ModalBody>
                        <div className="row">
                            <div className="col">
                                <div className="form-group">
                                    <label>Username</label>
                                    <input className="form-control"
                                        type="text"
                                        placeholder="admin@gmail.com"
                                        name="username"
                                        value={this.state.form.username}
                                        onChange={this.handleChange} />
                                </div>
                            </div>
                            <div className="col">
                                <div className="form-group">
                                    <label>Password</label>
                                    <input className="form-control"
                                        type="pass"
                                        placeholder="**********"
                                        name="password"
                                        value={this.state.form.password}
                                        onChange={this.handleChange} />
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <button className="btn btn-primary" onClick={this.saveRow}>SaveChanges</button>
                        <button className="btn btn-secondary" onClick={this.toggleModal}>Cancel</button>
                    </ModalFooter>
                </Modal>
                <ConfirmModal ref={ref => this.confirm = ref} />
            </Fragment>
        );
    }
}