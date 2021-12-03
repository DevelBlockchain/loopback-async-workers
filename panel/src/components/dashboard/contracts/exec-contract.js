import React, { Component } from "react";
import BywiseAPI from "../../../api/api";

const sleep = async function sleep(ms) {
    await new Promise((resolve) => {
        setTimeout(resolve, ms + 10);
    });
}

export default class ExecContract extends Component {

    constructor(props) {
        super(props);
        this.state = {
            load: false,
            logs: [],
            name: "functionName",
            isPaid: true,
            description: "Description",
            inputs: [
                {
                    type: "string",
                    name: "newName",
                    value: "",
                }, {
                    type: "string",
                    name: "newName",
                    value: "",
                }
            ],
            outputs: [
                {
                    type: "string",
                    name: "newName",
                    value: "",
                }, {
                    type: "string",
                    name: "newName",
                    value: "",
                },
            ]
        }
    }

    componentDidMount = () => {
        let func = this.props.func;
        console.log(func)
        this.setState({
            name: func.name,
            isPaid: func.isPaid,
            description: func.description,
            inputs: func.inputs ? func.inputs.map(item => ({ ...item, value: '' })) : [],
            outputs: func.outputs ? func.outputs.map(item => ({ ...item, value: '' })) : [],
        })
    }

    handleChange = (event, index) => {
        let inputs = this.state.inputs
        let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
        inputs[index].value = value;
        this.setState({ inputs })
    }

    exeContract = async () => {
        await this.setState({ load: true });
        await sleep(1000);
        let logs = [];
        let tx = {
            from: this.props.account.split(' - ')[1],
            to: this.props.address,
            amount: "0",
            type: 'contract-exe',
            data: JSON.stringify({
                name: this.state.name,
                input: this.state.inputs.map(input => input.value)
            }),
        };
        if (this.state.isPaid) {
            let req = await BywiseAPI.post(`/users-transactions`, tx);
            if (req.error) {
                logs.push(<span className="text-danger">{req.error}</span>)
            } else {
                let tx = req.data;
                logs.push(<span><strong>TxId:</strong> <a target="_blank" rel="noopener noreferrer" href={`${process.env.REACT_APP_EXPLORER_HOST}/tx/${tx.hash}`} >{tx.hash}</a></span>)
                logs.push(<span><strong>Computational cost:</strong> {tx.output.cost}</span>)
                logs.push(<span><strong>Data transaction size:</strong> {tx.output.size}</span>)
                logs.push(<span><strong>Fee:</strong> {tx.output.fee}</span>)
                if (tx.output.logs) tx.output.logs.forEach(log => {
                    logs.push(<span><strong>LOG:</strong> {log}</span>)
                })
                if (tx.output.output) tx.output.output.forEach(out => {
                    logs.push(<span><strong>OUTPUT:</strong> {out}</span>)
                })
            }
        } else {
            let req = await BywiseAPI.post(`/users-transactions/simulate`, tx);
            if (req.error) {
                logs.push(<span className="text-danger">{req.error}</span>)
            } else {
                logs.push(<span><strong>Computational cost:</strong> {req.data.cost}</span>)
                logs.push(<span><strong>Data transaction size:</strong> {req.data.size}</span>)
                logs.push(<span><strong>Fee:</strong> {req.data.fee}</span>)
                if (req.data.logs) req.data.logs.forEach(log => {
                    logs.push(<span><strong>LOG:</strong> {log}</span>)
                })
                if (req.data.output) {
                    for (let i = 0; i < this.state.outputs.length; i++) {
                        let name = this.state.outputs[i].name;
                        let type = this.state.outputs[i].type;
                        let value = req.data.output[i].value;
                        logs.push(<span><strong>OUTPUT: </strong>{JSON.stringify({ type, name, value })}</span>)
                    }
                }
            }
        }
        await this.setState({ load: false, logs });
    }

    render = () => {
        return (<>
            <div className="card card-absolute bg-dark">
                <div className={"card-header border-none " + (this.state.isPaid ? "bg-warning" : "bg-secondary")}>
                    <h5>{this.state.name}</h5>
                </div>
                <div className="card-body">
                    <h6 className="mt-2 mb-3">{this.state.description}</h6>
                    <div className="form-group">
                        {this.state.inputs.map((input, index) => <div key={`input-${index}`} className="input-group mt-1">
                            <div className="input-group-prepend">
                                <span className="input-group-text">{input.name}</span>
                            </div>
                            <input className="form-control"
                                type="text"
                                placeholder={input.type}
                                value={input.value}
                                onChange={e => this.handleChange(e, index)} />
                        </div>)}
                    </div>
                    <button className="btn btn-primary mt-3" disabled={this.state.load} onClick={this.exeContract}>{this.state.load ? 'Loading...' : 'Send'}</button>
                    <div>
                        <label className="mt-2">Log:</label>
                        <div className="box-log">
                            {this.state.logs.map((item, i) => <div key={`log-${i}`}>{item}</div>)}
                        </div>
                    </div>
                </div>
            </div>
        </>);
    }
}