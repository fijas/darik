import React from "react";
import './Expense.css';
import {withStyles} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import TableBody from "@material-ui/core/TableBody";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import Fab from "@material-ui/core/Fab/Fab";
import ExpenseForm from "./ExpenseForm";

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

class Expense extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            isLoading: true,
            accounts: [],
            categories: []
        };
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.getExpenses();
        this.getAccounts();
        this.getCategories();
    }

    getExpenses() {
        this.setState({isLoading: true});
        fetch('http://localhost:3001/transactions?type=0')
            .then(response => response.json())
            .then(data => this.setState({data: data, isLoading: false}));
    }

    getAccounts() {
        this.setState({isLoading: true});
        fetch('http://localhost:3001/accounts')
            .then(response => response.json())
            .then(accounts => this.setState({accounts: accounts, isLoading: false}));
    }

    getCategories() {
        this.setState({isLoading: true});
        fetch('http://localhost:3001/categories')
            .then(response => response.json())
            .then(categories => this.setState({categories: categories, isLoading: false}));
    }

    newExpense = () => {
        this.setState({
            showExpenseForm: true,
            type: '',
            institutionId: '',
            id: ''
        });
    };

    closeExpenseForm() {
        this.getExpenses();
        this.setState({
            showExpenseForm: false
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
                <ExpenseForm open={this.state.showExpenseForm} close={this.closeExpenseForm.bind(this)}
                             accounts={this.state.accounts} categories={this.state.categories} id={this.state.id}
                             subcategories={this.state.subcategories} />
                <Typography variant="display1" gutterBottom>
                    Expenses
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
                    </Table>
                </Paper>
                <Fab color="primary" className={classes.fab} onClick={this.newExpense}>
                    <AddIcon/>
                </Fab>
            </div>
        );
    }
}

export default withStyles(styles)(Expense);