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
        await this.props.trySend(JSON.stringify({
            name: this.state.name,
            input: this.state.inputs.map(input => input.value)
        }), this.state.isPaid)
        await this.setState({ load: false });
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
                </div>
            </div>
        </>);
    }
}