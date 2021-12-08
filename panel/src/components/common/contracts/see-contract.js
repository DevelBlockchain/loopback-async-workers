import React, { Component } from "react";
import BywiseAPI from "../../../api/api";
import ExecContract from "./exec-contract";

export default class SeeContract extends Component {

    constructor(props) {
        super(props);
        this.state = {
            load: false,
            functions: [],
            accounts: [],
            form: {
                account: '',
                address: 'BWS1TCE7EFAAFBE85CB91FC0E79AB09F35559BB26D867F'
            }
        }
    }

    componentDidMount() {
        this.updateTable();
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

    render = () => {
        return (<>
            <div className="card">
                <div className="card-header border-none">
                    <h5>Deploy Your Smartcontract</h5>
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
                                <button className="btn btn-primary" disabled={this.state.load} onClick={this.loadContract}>{this.state.load ? 'Loading...' : 'Load'}</button>
                            </div>
                        </div>
                    </div>
                    <hr className="mb-5" />
                    {this.state.functions.map((func, i) => <ExecContract
                        key={`func-${i}`}
                        func={func}
                        address={this.state.form.address}
                        account={this.state.form.account}
                    />)}

                </div>
            </div>
        </>);
    }
}