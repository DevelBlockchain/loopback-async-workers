import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Api from '../../api/api';

export default class ShowTx extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            params: [{ title: '', value: '' }],
            id: '',
            txId: '',
            loading: false,
            showTx: false,
            tx: {
                function: "",
                blockHash: "",
                blockNumber: 0,
                from: "",
                to: "",
                value: "",
                gas: 0,
                gasPrice: "",
                inputs: [{
                    name: "",
                    type: "",
                    value: ""
                }]
            }
        }
    }

    checkIsAccount = (accounts, address) => {
        let str = address;
        accounts.forEach(item => {
            if (item.address === address) {
                str = `(${item.account}) ${address}`;
            }
        })
        return str;
    }

    show = async (id) => {
        let req = await Api.get('users');
        if (req.error) return;
        let users = req.data;
        req = await Api.get('wallet/accounts');
        if (req.error) return;
        let accounts = req.data;
        req = await Api.get('tx-ids/' + id);
        if (req.error) return;
        let tx = req.data;
        tx.username = '';
        users.forEach(user => {
            if (user.id === tx.usersId) {
                tx.username = user.username;
            }
        })
        let params = [];
        params.push({ title: 'TxId', value: <a rel="noopener noreferrer" target="_blank" href={tx.url} >{tx.txId}</a> });
        params.push({ title: 'Created', value: (new Date(tx.created)).toLocaleString() });
        params.push({ title: 'Created by', value: tx.username });
        params.push({ title: 'Operation', value: tx.operation });
        params.push({ title: 'Account', value: tx.account });
        params.push({ title: 'Fee', value: tx.fee + " BNB" });
        if (tx.from) params.push({ title: 'From', value: this.checkIsAccount(accounts, tx.from) });
        if (tx.to) params.push({ title: 'To', value: this.checkIsAccount(accounts, tx.to) });
        if (tx.amount) params.push({ title: 'Amount', value: tx.amount });
        if (tx.data) params.push({ title: 'Data', value: JSON.stringify(tx.data) });

        this.setState({
            showModal: true,
            params,
            id: id,
            txId: tx.txId,
        });
    }

    showTx = async () => {
        await this.setState({ loading: true });
        let req = await Api.get('tx-ids/decode/' + this.state.txId);
        if (req.error) return;
        this.setState({
            showTx: true,
            loading: false,
            tx: req.data,
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
            <ModalHeader toggle={this.handleClose}>Transaction</ModalHeader>
            <ModalBody>
                <ul className="list-group">
                    {this.state.params.map(p => <li key={p.title} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>{`${p.title}: `}</span>
                        {p.value}
                    </li>)}
                </ul>
                <h5 className="mb-0 m-t-30">Decode Transaction</h5>
                <p>Get transaction on the blockchain and decode the input</p>
                {this.state.showTx === false && <button className="btn btn-outline-secondary" disabled={this.state.loading} onClick={this.showTx}>{this.state.loading ? 'Loading...' : 'Show'}</button>}
                {this.state.showTx === true && <blockquote class="blockquote mt-3">
                    <code>{JSON.stringify(this.state.tx, null, 4).split('\n').map((line, i) => <p
                        key={`line-${i}`}
                        className="mb-0"
                        dangerouslySetInnerHTML={{ __html: line.replace(/ /g, '&nbsp;') }}>
                    </p>)}</code>
                </blockquote>}
            </ModalBody>
            <ModalFooter>
                <button className="btn btn-primary" onClick={this.handleClose}>OK</button>
            </ModalFooter>
        </Modal>)
    }
}
