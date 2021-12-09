import React, { Fragment, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.scss';

import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { ScrollContext } from 'react-router-scroll-4';
import * as serviceWorker from './serviceWorker';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import API
import Auth from './api/auth';

// Pages
import Login from './pages/login'
import Home from './pages/Home'

// ** Import custom components for redux **
import { Provider } from 'react-redux';
import store from './store/index';
import App from "./components/app";

// Import custom Components 
import Wallet from './components/dashboard/wallet';
import Tokens from './components/dashboard/tokens';
import Users from './components/dashboard/users';
import SecondFactor from './components/dashboard/second-factor';
import Send from './components/dashboard/send/index';
import Contracts from './components/dashboard/contracts';
import IDE from './components/dashboard/ide';

//firebase Auth
function Root() {
    useEffect(() => {
        const layout = localStorage.getItem('layout_version')
        const color = localStorage.getItem('color')
        document.body.classList.add(layout);
        document.getElementById("color").setAttribute("href", `${process.env.PUBLIC_URL}/assets/css/${color}.css`);
    }, []);
    return (
        <div className="App">
            <Provider store={store}>
                <BrowserRouter basename={'/panel'} forceRefresh={true}>
                    <ScrollContext>
                        <Switch>
                            <Route path={`${process.env.PUBLIC_URL}/home`} component={Home} />
                            <Route path={`${process.env.PUBLIC_URL}/login`} component={Login} />
                            {Auth.isLogged() ?
                                <Fragment>
                                    <App>
                                        <Route exact path={`${process.env.PUBLIC_URL}/`} component={Wallet} />
                                        <Route exact path={`${process.env.PUBLIC_URL}/dashboard`} component={Wallet} />
                                        <Route exact path={`${process.env.PUBLIC_URL}/dashboard/contracts`} component={Contracts} />
                                        <Route exact path={`${process.env.PUBLIC_URL}/dashboard/ide`} component={IDE} />
                                        <Route exact path={`${process.env.PUBLIC_URL}/dashboard/send`} component={Send} />
                                        <Route exact path={`${process.env.PUBLIC_URL}/dashboard/users`} component={Users} />
                                        <Route exact path={`${process.env.PUBLIC_URL}/dashboard/2fa`} component={SecondFactor} />
                                        <Route exact path={`${process.env.PUBLIC_URL}/dashboard/tokens`} component={Tokens} />
                                        <Route exact path={`${process.env.PUBLIC_URL}/dashboard/wallet`} component={Wallet} />
                                    </App>
                                </Fragment>
                                :
                                <Redirect to={`${process.env.PUBLIC_URL}/home`} />
                            }
                        </Switch>
                    </ScrollContext>
                </BrowserRouter>
            </Provider>
            <ToastContainer style={{
                width: 600
            }}/>
        </div>
    );
}

ReactDOM.render(<Root />, document.getElementById('root'));

serviceWorker.unregister();