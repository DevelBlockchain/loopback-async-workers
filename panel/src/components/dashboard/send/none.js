import React, { Component } from "react";

export default class SendNone extends Component {

    constructor(props) {
        super(props);
        this.state = {
            load: false,
        }
    }

    handleChange = (event) => {
        let form = this.state.form
        let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
        form[event.target.name] = value
        this.setState({ form })
    }

    trySend = async () => {
        await this.setState({ load: true });
        await this.props.trySend('');
        await this.setState({ load: false });
    }

    render = () => {
        return (<>
            <button className="btn btn-primary" disabled={this.state.load} onClick={this.trySend}>{this.state.load ? 'Loading...' : 'Try Send'}</button>
        </>);
    }
}