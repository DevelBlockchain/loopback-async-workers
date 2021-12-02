import React from 'react';
import Header from './common/header-component/header';
import Sidebar from './common/sidebar-component/sidebar';
import Footer from './common/footer';
import Loader from './common/loader';


const AppLayout = (props) => {
    return (
        <div>
            <Loader />
            <div className="page-wrapper">
                <div className="page-body-wrapper">
                    <Header />
                    <Sidebar />
                    <div className="page-body">
                        {props.children}
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    );
}

export default AppLayout;