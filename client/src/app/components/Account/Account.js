import React from 'react';
import './Account.css';
import Paper from "@material-ui/core/Paper/Paper";
import Table from "@material-ui/core/Table/Table";
import TableHead from "@material-ui/core/TableHead/TableHead";
import TableRow from "@material-ui/core/TableRow/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import TableBody from "@material-ui/core/TableBody/TableBody";
import Typography from "@material-ui/core/Typography/Typography";
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import {withStyles} from '@material-ui/core/styles';
import Fab from "@material-ui/core/Fab/Fab";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import AccountForm from "./AccountForm";

const styles = theme => ({
    fab: {
        margin: 0,
        top: 'auto',
        right: 20,
        bottom: 20,
        left: 'auto',
        position: 'fixed'
    }
});

const types = [{id: 0, name: 'Savings'}, {id: 1, name: 'Current'}, {id: 2, name: 'Fixed'}, {id: 3, name: 'Mutual Fund'},
    {id: 4, name: 'Employer'}, {id: 5, name: 'Client'}, {id: 6, name: 'Loan'}, {id: 7, name: 'Borrower'}];

class Account extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            isLoading: true,
            showAccountForm: false,
            id: '',
            institutionId: '',
            type: '',
            institutions: []
        };
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.getInstitutions()
            .then(() => this.getAccounts());
    }

    getInstitutions() {
        return fetch('http://localhost:3001/institutions')
            .then(response => response.json())
            .then(data => this.setState({institutions: data}));
    }

    getAccounts() {
        this.setState({isLoading: true});
        fetch('http://localhost:3001/accounts')
            .then(response => response.json())
            .then(data => this.setState({data: data, isLoading: false}));
    }

    newAccount = () => {
        this.setState({
            showAccountForm: true,
            name: '',
            institutionId: '',
            id: ''
        });
    };

    editAccount = (account) => {
        this.setState({
            showAccountForm: true,
            name: account.name,
            institutionId: account.institutionId,
            id: account.id
        });
    };

    deleteAccount = (id) => {
        if(window.confirm('Are you sure you want to delete this institution?')) {
            fetch('http://localhost:3001/institutions/' + id, {
                method: 'DELETE'
            }).then((res) => res.json())
                .then(() => this.getAccounts())
                .catch((err) => console.log(err));
        }
    };

    closeAccountForm() {
        this.getAccounts();
        this.setState({
            showAccountForm: false
        });
    }

    render() {
        const {classes} = this.props;
        const {data, isLoading} = this.state;

        if (isLoading) {
            return <p>Loading ...</p>;
        }

        return (
            <div>
                <AccountForm open={this.state.showAccountForm} close={this.closeAccountForm.bind(this)}
                                 types={types} institutions={this.state.institutions} id={this.state.id}
                                 name={this.state.name} type={this.state.type} />
                <Typography variant="display1" gutterBottom>
                    Accounts
                </Typography>
                <hr/>
                <Paper className={classes.root}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Institution</TableCell>
                                <TableCell align="right">Options</TableCell>
                            </TableRow>
                        </TableHead>
                        {data.map(account => {
                            return (
                                <TableBody key={account.id}>
                                    <TableRow>
                                        <TableCell>{account.id}</TableCell>
                                        <TableCell component="th" scope="row">
                                            {types.find(x => x.id === account.institutionId).name}
                                        </TableCell>
                                        <TableCell>{this.state.institutions.find(x => x.id === account.institutionId).name}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Edit" aria-label="Edit">
                                                <Button component="span" className={classes.button}
                                                        onClick={() => this.editAccount(account)}>
                                                    <EditIcon/>
                                                </Button>
                                            </Tooltip>
                                            <Tooltip title="Delete" aria-label="Delete">
                                                <Button component="span" className={classes.button}
                                                        onClick={() => this.deleteAccount(account.id)}>
                                                    <DeleteIcon/>
                                                </Button>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            )
                        })}
                    </Table>
                </Paper>
                <Fab color="primary" className={classes.fab} onClick={this.newAccount}>
                    <AddIcon/>
                </Fab>
            </div>
        );
    }
}

export default withStyles(styles)(Account);
