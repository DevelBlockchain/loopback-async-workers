import React, { Fragment } from 'react';
import BywiseAPI from '../../api/api';
import DinamicTable from '../common/dinamic-table';
import { Modal, ModalHeader, ModalFooter } from 'reactstrap';
import OverlayLoading from '../common/overlay-loading';
import DialogModal from '../common/dialog-modal';
import ConfirmModal from '../common/confirm-modal';

export default class Wallet extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            modal: false,
            id: null,
            form: {
                name: ''
            }
        }
    }

    componentDidMount = () => {
        this.updateTable();
    }

    updateTable = async () => {
        await this.setState({ loading: true });

        let req = await BywiseAPI.get('/my-wallets');
        if (req.error) return;
        let rows = req.data;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            req = await BywiseAPI.get(`/wallets/${row.address}`, {}, false);
            if (!req.error) {
                row.balance = req.data.balance;
            } else {
                row.balance = "0";
            }
        }
        let cols = [
            'Created',
            'Name',
            'Address',
            'Credits',
            'See-Seed',
            'Del',
        ]
        rows = rows.map(row => {
            return [
                (new Date(row.created)).toLocaleString(),
                row.name,
                row.address,
                row.balance,
                row,
                row,
            ]
        })
        this.table.updateTable(cols, rows);
        await this.setState({ loading: false });
    }

    newRow = () => {
        this.setState({
            modal: true,
            id: null,
        })
    }

    saveRow = async () => {
        await this.setState({ loading: true });
        let req = await BywiseAPI.post(`/my-wallets`, {
            name: this.state.form.name
        });
        if(!req.error) {
            this.dialog.show('New Wallet has created')
        }
        this.updateTable();
        this.setState({ modal: false, loading: false })
    }

    openRow = async (row) => {
        await this.setState({ loading: true });
        let req = await BywiseAPI.get(`/my-wallets/${row.id}/seed`);
        this.dialog.show('Wallet seed', <>
            <h3>Seed: <strong>{req.data.value}</strong></h3>
        </>)
        this.setState({ modal: false, loading: false })
    }

    deleteRow = async (row) => {
        this.confirm.show('Attention!', <>
            <h4>This action cannot be undone</h4>
        </>, async () => {
            await BywiseAPI.del(`/my-wallets/${row.id}`);
            this.updateTable();
        })
    }

    handleChange = (event) => {
        let form = this.state.form
        let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
        form[event.target.name] = value
        this.setState({ form })
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
                                    <h5>Wallets</h5>
                                </div>
                                <div className="card-body">
                                    <DinamicTable
                                        size="5"
                                        ref={ref => this.table = ref}
                                        openRow={this.openRow}
                                        deleteRow={this.deleteRow}
                                    />
                                    <div className="input-group">
                                        <input className="form-control"
                                            type="text"
                                            name="name"
                                            placeholder="Wallet's name"
                                            value={this.state.form.name}
                                            onChange={this.handleChange} />
                                        <div className="input-group-append">
                                            <button className="btn btn-primary" onClick={this.newRow}>New Wallet</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Modal isOpen={this.state.modal} toggle={this.toggleModal} centered>
                    <ModalHeader toggle={this.toggleModal}>Do you want to create a new Wallet</ModalHeader>
                    <ModalFooter>
                        <button className="btn btn-primary" onClick={this.saveRow}>Yes</button>
                        <button className="btn btn-secondary" onClick={this.toggleModal}>Cancel</button>
                    </ModalFooter>
                </Modal>
                <ConfirmModal ref={ref => this.confirm = ref} />
                <DialogModal ref={ref => this.dialog = ref} />
            </Fragment>
        );
    }
}