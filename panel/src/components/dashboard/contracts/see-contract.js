import React, { Component } from "react";
import BywiseAPI from "../../../api/api";
import ExecContract from "../../common/contracts/exec-contract";
import DialogModal from '../../common/dialog-modal';

export default class SeeContract extends Component {

    constructor(props) {
        super(props);
        this.state = {
            load: false,
            functions: [],
            accounts: [],
            form: {
                account: '',
                amount: '0',
                address: ''
            }
        }
    }

    componentDidMount = async () => {
        await this.updateTable();
        if (this.props.address) {
            let form = this.state.form;
            form.address = this.props.address
            await this.setState({ form });
            await this.loadContract();
        }
    }

    updateTable = async () => {
        await this.setState({ loading: true });
        let req = await BywiseAPI.get('/my-wallets');
        if (req.error) return;
        let wallets = req.data;
        let accounts = wallets.map(wallet => `${wallet.name} - ${wallet.address}`);
        let form = this.state.form;
        form.account = accounts[0];
        await this.setState({ loading: false, wallets, accounts, form });
    }

    handleChange = (event) => {
        let form = this.state.form
        let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
        form[event.target.name] = value
        this.setState({ form })
    }

    loadContract = async () => {
        await this.setState({ load: true });
        let req = await BywiseAPI.get(`/contracts/${this.state.form.address}/abi`);
        if (req.error) return;
        await this.setState({ load: false, functions: req.data.contract.publicFunctions });
    }

    trySend = async (data, isPaid) => {
        let logs = [];
        let from = this.state.form.account.split(' - ')[1]
        let amount = this.state.form.amount.replace(',', '.');
        if (!from) {
            this.dialog.show('Error', <>
                <div>Invalid Account</div>
            </>)
            return;
        }
        if (!/^[0-9]\.*[0-9]*$/.test(amount)) {
            this.dialog.show('Error', <>
                <div>Invalid amount</div>
            </>)
            return;
        }
        if (isPaid) {
            let tx = {
                from: from,
                to: this.state.form.address,
                type: 'contract-exe',
                amount: amount,
                data,
            };
            let req = await BywiseAPI.post(`/users-transactions`, tx);
            if (req.error) return;
            if (req.data.error) {
                logs.push(<span className="text-danger">{req.data.error}</span>)
            } else {
                let accounts = req.data.simulateAccounts;
                let ctx = req.data.ctx;
                let output = req.data.output;
                logs.push(<span><strong>Computational cost:</strong> {output.cost}</span>)
                logs.push(<span><strong>Data transaction size:</strong> {output.size}</span>)
                logs.push(<span><strong>Fee:</strong> {output.fee}</span>)
                if (output.logs) output.logs.forEach(log => {
                    logs.push(<span><strong>LOG:</strong> {log}</span>)
                })
                if (output.output) {
                    logs.push(<span><strong>OUTPUT:</strong> {JSON.stringify(output.output, null, 2)}</span>)
                }
            }
        } else {
            let tx = {
                from: from,
                to: this.state.form.address,
                amount: '0',
                data,
            };
            let req = await BywiseAPI.post(`/contracts/simulate`, tx);
            if (req.error) return;
            if (req.data.error) {
                logs.push(<span className="text-danger">{req.data.error}</span>)
            } else {
                let accounts = req.data.simulateAccounts;
                let ctx = req.data.ctx;
                let output = req.data.output;
                logs.push(<span><strong>Computational cost:</strong> {output.cost}</span>)
                logs.push(<span><strong>Data transaction size:</strong> {output.size}</span>)
                logs.push(<span><strong>Fee:</strong> {output.fee}</span>)
                if (output.logs) output.logs.forEach(log => {
                    logs.push(<span><strong>LOG:</strong> {log}</span>)
                })
                if (output.output) {
                    logs.push(<span><strong>OUTPUT:</strong> {JSON.stringify(output.output, null, 2)}</span>)
                }
            }
        }
        this.dialog.show('Response', <>
            {logs.map((item, i) => <div key={`log-${i}`}>{item}</div>)}
        </>)
    }

    render = () => {
        return (<>
            <div className="card">
                <div className="card-header border-none">
                    <h5>Interact with the smart contract</h5>
                </div>
                <div className="card-body">
                    <div className="form-group">
                        <label>Account</label>
                        <select className="form-control digits"
                            name="account"
                            value={this.state.form.account}
                            onChange={this.handleChange}>
                            {this.state.accounts.map(account => <option key={account}>{account}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Amount</label>
                        <input className="form-control"
                            type="text"
                            placeholder="0"
                            name="amount"
                            value={this.state.form.amount}
                            onChange={this.handleChange} />
                    </div>
                    <hr className="mb-2" />
                    <div className="form-group mb-4">
                        <label>Contract Address</label>
                        <div className="input-group">
                            <input className="form-control"
                                type="text"
                                placeholder="BWS0000000000000000000000000000000000000000000"
                                name="address"
                                value={this.state.form.address}
                                onChange={this.handleChange} />
                            <div className="input-group-append">
                                <button className="btn btn-primary" disabled={this.state.load || this.props.address} onClick={this.loadContract}>{this.state.load ? 'Loading...' : 'Load'}</button>
                            </div>
                        </div>
                    </div>
                    <hr className="mb-5" />
                    {this.state.functions.map((func, i) => <ExecContract
                        key={`func-${i}`}
                        func={func}
                        trySend={this.trySend}
                    />)}

                </div>
            </div>
            <DialogModal ref={ref => this.dialog = ref} />
        </>);
    }
}