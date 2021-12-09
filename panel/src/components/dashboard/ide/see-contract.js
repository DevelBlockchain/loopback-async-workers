import React, { Component } from "react";
import BywiseAPI from "../../../api/api";
import ExecContract from "../../common/contracts/exec-contract";
import DialogModal from '../../common/dialog-modal';

export default class SeeContract extends Component {

    constructor(props) {
        super(props);
        this.state = {
            load: false,
            contract: {
                address: '',
                bytecode: '',
                functions: [],
                nonce: 0,
            },
            ctx: {},
            functions: [],
            accounts: [],
            address: '',
            form: {
                amount: '0',
                account: ''
            }
        }
    }

    componentDidMount() {
        let contract = this.props.contract;
        let ctx = this.props.ctx;
        let accounts = this.props.simulateAccounts;
        let address = contract.address;
        let functions = contract.publicFunctions
        let form = this.state.form;
        form.account = accounts[0].address
        this.setState({
            contract,
            ctx,
            accounts,
            address,
            functions,
            form,
        });
    }

    handleChange = (event) => {
        let form = this.state.form
        let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
        form[event.target.name] = value
        this.setState({ form })
    }

    trySend = async (data, isPaid) => {
        let logs = [];
        let from = this.state.form.account
        let amount = this.state.form.amount.replace(',', '.');
        if (!/^[0-9]\.*[0-9]*$/.test(amount)) {
            this.dialog.show('Error', <>
                <div>Invalid amount</div>
            </>)
            return;
        }
        let tx = {
            ctx: this.state.ctx,
            from: from,
            to: this.state.address,
            amount: isPaid ? amount : '0',
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
            if (isPaid) {
                this.setState({
                    ctx,
                    accounts,
                });
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
                    <h5>Simulate Your Smartcontract</h5>
                </div>
                <div className="card-body">
                    <div>
                        <label className="mt-2">Simulate accounts:</label>
                        <div className="box-log">
                            {this.state.accounts.map((account, i) => <div key={`account-${i}`}>
                                <span><strong>{account.address}:</strong> {account.balance}</span>
                            </div>)}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Account</label>
                        <select className="form-control digits"
                            name="account"
                            value={this.state.form.account}
                            onChange={this.handleChange}>
                            {this.state.accounts.map(account => <option key={account.address}>{`${account.address}`}</option>)}
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