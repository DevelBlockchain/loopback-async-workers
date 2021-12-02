import React from 'react';

export default class DinamicTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            cols: [],
            rows: [],
            filteredRows: [],
            page: 0,
            pages: 0,
        }
    }

    getSize = () => {
        return this.props.size ? parseInt(this.props.size) : 10;
    }

    updateTable = async (cols, rows) => {
        this.setState({
            cols,
            rows,
            filteredRows: rows.slice(0, this.getSize()),
            page: 0,
            pages: Math.floor(rows.length / this.getSize()),
        });
    }

    setPage = (page) => {
        page = this.state.page + page;
        if (page < 0) {
            page = 0;
        } else if (page > this.state.pages) {
            page = this.state.pages;
        }
        this.setState({
            page: page,
            filteredRows: this.state.rows.slice(page * this.getSize(), page * this.getSize() + this.getSize()),
        });
    }

    render() {
        let defaultKey = this.props.name ? this.props.name : '';
        return (
            <div className="table-responsive">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th scope="col">N°</th>
                            {this.state.cols.map((col, i) => <th key={`${defaultKey}-col-name-${i}`}>{col.replace('See-', '')}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.filteredRows.map((row, rowIndex) => <tr key={`${defaultKey}-row-${rowIndex}`}>
                            <td>{this.state.page * this.getSize() + rowIndex + 1}</td>
                            {row.map((col, i) => {
                                if (this.state.cols[i] === 'See' || this.state.cols[i].startsWith('See-')) {
                                    return <td key={`${defaultKey}-col-${i}-${rowIndex}`}><button className="btn btn-primary" onClick={() => this.props.openRow(col)}>Open</button></td>
                                } else if (this.state.cols[i] === 'Del') {
                                    return <td key={`${defaultKey}-col-${i}-${rowIndex}`}><button className="btn btn-danger" onClick={() => this.props.deleteRow(col)}><i className="fas fa-trash"></i></button></td>
                                } else {
                                    return <td key={`${defaultKey}-col-${i}-${rowIndex}`}>{col}</td>
                                }
                            })}
                        </tr>)}
                    </tbody>
                </table>
                <div className="d-flex align-items-center mb-4">
                    <button className="btn ml-auto" onClick={() => this.setPage(-10000)}>{'<<'}</button>
                    <button className="btn" onClick={() => this.setPage(-1)}>{'<'}</button>
                    <span>page {this.state.page + 1} of {this.state.pages + 1}</span>
                    <button className="btn" onClick={() => this.setPage(1)}>{'>'}</button>
                    <button className="btn mr-auto" onClick={() => this.setPage(10000)}>{'>>'}</button>
                </div>
            </div>
        );
    }
}