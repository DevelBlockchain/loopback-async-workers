import React from "react"

class OverlayLoading extends React.Component {

    render() {
        if (this.props.show) {
            return (<div style={{
                position: 'fixed',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0,0,0,0.3)',
                zIndex: 100,
                transition: 'background-color 0.5s',
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
            }}>
                <div className="whirly-loader"></div>
            </div>)
        } else {
            return (<div></div>)
        }
    }
}

export default OverlayLoading