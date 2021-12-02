import React, { Fragment } from 'react';
import OverlayLoading from '../common/overlay-loading';
import DialogModal from '../common/dialog-modal';
import QRCode from "react-qr-code";
import BywiseAPI from '../../api/api';

export default class SecondFactor extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            enable2FA: false,
            qrcode: '',
            form: {
                code: '',
            }
        }
    }

    componentDidMount = async () => {
        let req = await BywiseAPI.get(`/auth/me`);
        if (!req.error) {
            if (req.data.user.enable2FA) {
                this.setState({
                    loading: false,
                    enable2FA: true,
                    qrcode: '',
                    form: {
                        code: '',
                    }
                })
            } else {
                req = await BywiseAPI.get(`/auth/2fa/generate`);
                this.setState({
                    loading: false,
                    enable2FA: false,
                    qrcode: req.data.value,
                    form: {
                        value: '',
                    }
                })
            }
        }
    }

    handleChange = (event) => {
        let form = this.state.form
        let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
        form[event.target.name] = value
        this.setState({ form })
    }

    submit = async (event) => {
        event.preventDefault();
        let req;
        if(this.state.enable2FA) {
            req = await BywiseAPI.post(`/auth/2fa/disable`);
        } else {
            req = await BywiseAPI.post(`/auth/2fa/enable`, this.state.form);
        }
        if(!req.error) {
            window.location.reload(false);
        }
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
                                    <h5>2FA</h5>
                                    <span className="mb-0 d-block">Activate 2FA</span>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-sm-12">
                                            {this.state.qrcode && <>
                                                <h5>QR Code</h5>
                                                <QRCode value={this.state.qrcode} size={120} />
                                            </>}
                                            <form onSubmit={this.submit}>
                                                <div className="form-group mt-3">
                                                    <div className="form-input">
                                                        <label>Insert generated code</label>
                                                        <input className="form-control"
                                                            type="text"
                                                            name="value"
                                                            placeholder="XXXXXX"
                                                            value={this.state.form.value}
                                                            onChange={this.handleChange} />
                                                    </div>
                                                </div>
                                                <button 
                                                className={this.state.enable2FA ? 'btn btn-danger' : 'btn btn-primary'} 
                                                type="submit">{this.state.enable2FA ? 'Disable 2FA' : 'Activate 2FA'}</button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogModal ref={ref => this.dialog = ref} />
            </Fragment>
        );
    }
}