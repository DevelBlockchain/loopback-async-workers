import React from 'react';
import { withRouter } from "react-router";
import { translate } from 'react-switch-lang';
import OverlayLoading from '../components/common/overlay-loading';
import Api from '../api/api';
import Auth from '../api/auth';

class Login extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            form: {
                username: '',
                password: '',
                code: '',
                save: false,
            },
            need2fa: false,
            loading: false,
        }
    }

    componentDidMount = async () => {
        let savedUser = localStorage.getItem('user');
        if (savedUser) {
            savedUser = JSON.parse(savedUser);
            let form = this.state.form;
            form.username = savedUser.user;
            form.password = savedUser.pass;
            form.save = true;
            this.setState({ form })
        }
    }

    updateForm = (event) => {
        let form = this.state.form
        let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
        form[event.target.name] = value
        this.setState({ form: form })
    }

    loginAuth = async (event) => {
        event.preventDefault();
        await this.setState({ loading: true });
        if (this.state.form.save) {
            let savedUser = {
                user: this.state.form.username,
                pass: this.state.form.password
            }
            localStorage.setItem('user', JSON.stringify(savedUser))
        } else {
            localStorage.removeItem('user')
        }
        let req = await Api.get(`/auth/2fa/has/${this.state.form.username}`);
        if (req.error) {
            await this.setState({ loading: false });
            return;
        }
        if (req.data.value && !this.state.need2fa) {
            await this.setState({ loading: false, need2fa: true });
            return;
        } else {
            req = await Api.post('/auth/signin', {
                username: this.state.form.username,
                password: this.state.form.password,
                code: this.state.form.code,
            });
            if (req.error) {
                await this.setState({ loading: false });
                return;
            }
            Auth.saveToken(req.data.token);
            req = await Api.get('/auth/me');
            if (!req.error) {
                Auth.saveUser(req.data);
                this.props.history.push('/dashboard');
                return;
            }
        }
        await this.setState({ loading: false });
    }

    render() {
        return (
            <div>
                <OverlayLoading show={this.state.loading} />
                <div className="page-wrapper">
                    <div className="container-fluid p-0">
                        {/* <!-- login page start--> */}
                        <div className="authentication-main">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="auth-innerright">
                                        <div className="authentication-box">
                                            <div className="card mt-4">
                                                <div className="card-body">
                                                    <div className="text-center">
                                                        <h4>{this.props.t('Authentication')}</h4>
                                                        <h6>{"Enter your Username and Password"}</h6>
                                                    </div>
                                                    {!this.state.need2fa && <form className="theme-form">
                                                        <div className="form-group">
                                                            <label className="col-form-label pt-0">User</label>
                                                            <input className="form-control"
                                                                type="text"
                                                                name="username"
                                                                value={this.state.form.username}
                                                                onChange={this.updateForm}
                                                                required />
                                                        </div>
                                                        <div className="form-group">
                                                            <label className="col-form-label">Password</label>
                                                            <input className="form-control"
                                                                type="password"
                                                                name="password"
                                                                value={this.state.form.password}
                                                                onChange={this.updateForm}
                                                                required />
                                                        </div>
                                                        <div className="checkbox p-0">
                                                            <input id="checkbox1"
                                                                type="checkbox"
                                                                name="save"
                                                                checked={this.state.form.save}
                                                                onChange={this.updateForm} />
                                                            <label htmlFor="checkbox1">RememberMe</label>
                                                        </div>
                                                        <div className="form-group form-row mt-3 mb-0">
                                                            <button className="btn btn-primary btn-block" type="button" onClick={this.loginAuth}>Login</button>
                                                        </div>
                                                    </form>}
                                                    {this.state.need2fa && <form className="theme-form">
                                                        <div className="form-group">
                                                            <label className="col-form-label pt-0">2FA Code</label>
                                                            <input className="form-control"
                                                                type="text"
                                                                name="code"
                                                                value={this.state.form.code}
                                                                onChange={this.updateForm}
                                                                required />
                                                        </div>
                                                        <div className="form-group form-row mt-3 mb-0">
                                                            <button className="btn btn-mute btn-block" type="button" onClick={() => this.setState({ need2fa: false })}>Voltar</button>
                                                            <button className="btn btn-primary btn-block" type="button" onClick={this.loginAuth}>Login</button>
                                                        </div>
                                                    </form>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* <!-- login page end--> */}
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(translate(Login));