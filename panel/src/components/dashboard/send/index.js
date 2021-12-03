import React, { Fragment } from 'react';
import BywiseAPI from '../../../api/api';
import { toast } from 'react-toastify';
import { Modal, ModalHeader, ModalFooter } from 'reactstrap';
import OverlayLoading from '../../common/overlay-loading';
import DialogModal from '../../common/dialog-modal';
import ConfirmModal from '../../common/confirm-modal';
import SendMensage from './text';
import SendFile from './file';
import SendCommand from './command';
import SendJSON from './json';

const TX_TYPES_NAMES = ['TEXT', 'JSON', 'FILE', 'COMMAND'];
const TX_TYPES = ['string', 'json', 'file', 'command'];


export default class Send extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            modal: false,
            id: null,
            wallets: [],
            accounts: [],
            data: null,
            form: {
                account: '',
                to: 'BWS0000000000000000000000000000000000000000000',
                type: '',
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
        let wallets = req.data;
        let accounts = wallets.map(wallet => `${wallet.name} - ${wallet.address}`);
        await this.setState({ loading: false, wallets, accounts });
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



    trySend = async (data = '') => {
        let address = this.state.form.account.split(' - ')[1];
        let type = '';
        TX_TYPES_NAMES.forEach((name, i) => {
            if (this.state.form.type === name) {
                type = TX_TYPES[i];
            }
        });
        if (!type) {
            toast.error('select type of transaction');
            return;
        }
        let to = this.state.form.to;
        let tx = {
            from: address,
            to,
            amount: "0",
            type,
            data,
        };
        let req = await BywiseAPI.post(`/users-transactions`, tx);
        if (req.error) return;
        this.dialog.show('Transaction send!', <>
            <span>TxId: <a target="_blank" rel="noopener noreferrer" href={`${process.env.REACT_APP_EXPLORER_HOST}/tx/${req.data.hash}`} >{req.data.hash}</a></span>
        </>)
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
                                    <h5>Send</h5>
                                </div>
                                <div className="card-body">
                                    <div className="form-group">
                                        <label>From</label>
                                        <select className="form-control digits"
                                            name="account"
                                            value={this.state.form.account}
                                            onChange={this.handleChange}>
                                            <option></option>
                                            {this.state.accounts.map(account => <option key={account}>{account}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>To</label>
                                        <input className="form-control"
                                            type="text"
                                            placeholder="BWS0000000000000000000000000000000000000000000"
                                            name="to"
                                            value={this.state.form.to}
                                            onChange={this.handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Transaction Type</label>
                                        <select className="form-control digits"
                                            name="type"
                                            value={this.state.form.type}
                                            onChange={this.handleChange}>
                                            <option></option>
                                            {TX_TYPES_NAMES.map(type => <option key={type}>{type}</option>)}
                                        </select>
                                    </div>
                                    {this.state.form.type === 'TEXT' && <SendMensage trySend={this.trySend} />}
                                    {this.state.form.type === 'JSON' && <SendJSON trySend={this.trySend} />}
                                    {this.state.form.type === 'FILE' && <SendFile trySend={this.trySend} />}
                                    {this.state.form.type === 'COMMAND' && <SendCommand trySend={this.trySend} />}
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