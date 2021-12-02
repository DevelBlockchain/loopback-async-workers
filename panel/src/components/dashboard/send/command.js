import React, { Component } from "react";
import { Form } from "react-bootstrap";

export default class SendCommand extends Component {

    constructor(props) {
        super(props);
        this.state = {
            name: 'setInfo',
            inputs: [],
            text: '',
        };
    }

    formChange = (event) => {
        const state = this.state;
        if (event.target.type === 'checkbox') {
            state[event.target.name] = event.target.checked;
        } else {
            state[event.target.name] = event.target.value;
        }
        this.setState({ ...state });
        this.props.setData({
            name: state.name,
            input: state.inputs,
        })
    }

    addInput = (e) => {
        if (e.key === 'Enter') {
            const state = this.state;
            state.inputs.push(this.state.text);
            this.setState({ ...state });
            this.props.setData({
                name: state.name,
                input: state.inputs,
            })
        }
    }
    
    removeInput = (text) => {
        const state = this.state;
        state.inputs = state.inputs.filter(input => text !== input);
        this.setState({ ...state });
        this.props.setData({
            name: state.name,
            input: state.inputs,
        })
    }

    render = () => {
        return (<>
            <Form.Group>
                <Form.Label className="mr-3">Command</Form.Label>
                <select onChange={this.formChange} name="name">
                    <option>setInfo</option>
                    <option>setBalance</option>
                    <option>setConfig</option>
                </select>
            </Form.Group>
            {this.state.inputs.map((input, i) => <p
                key={`input-${i}`}
                className="text-muted"
                style={{ cursor: 'pointer' }}
                onClick={() => this.removeInput(input)}
            >-&gt; {input}</p>)}
            <Form.Group className="mt-3 mb-5">
                <Form.Label>New Input</Form.Label>
                <Form.Control
                    onChange={this.formChange}
                    onKeyDown={this.addInput}
                    name="text"
                    value={this.state.text}
                    type="text" />
            </Form.Group>
        </>);
    }
}