import React from "react";
import {withStyles} from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 400
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2
    },
});

class TransactionForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            id: '',
            accountId: '',
            categoryId: '',
            subCategoryId: '',
            amount: '',
            note: '',
            type: 0
        };
    }

    handleClose = () => {
        this.props.close();
    };

    handleChange = (event, name) => {
        let obj = {};
        obj[name] = event.target.value;
        this.setState(obj);
    };

    updateState = () => {
        this.setState({
            institutionId: this.props.institutionId,
            id: this.props.id
        });
    };

    handleSave = () => {
        if (this.state.id === '') {
            this.createNew();
        } else {
            this.update(this.state.id);
        }
        this.props.close();
    };

    createNew() {
        fetch('http://localhost:3001/transactions?type=0', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                accountId: this.state.accountId,
                categoryId: this.state.categoryId,
                subCategoryId: this.state.subCategoryId,
                note: this.state.note,
                amount: this.state.amount,
            })
        }).then((res) => res.json())
            .then(() => this.props.close())
            .catch((err) => console.log(err));
    }

    update(id) {
        fetch('http://localhost:3001/transactions/' + id + '?type=0', {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                accountId: this.state.accountId,
                categoryId: this.state.categoryId,
                subCategoryId: this.state.subCategoryId,
                note: this.state.note,
                amount: this.state.amount,
            })
        }).then((res) => res.json())
            .then(() => this.props.close())
            .catch((err) => console.log(err));
    }

    render() {
        const props = this.props;

        return (
            <Dialog onClose={this.handleClose} onEntered={this.updateState} aria-labelledby="institution-dialog"
                    open={this.props.open}>
                <DialogTitle id="institution-dialog-title">Add A New Account</DialogTitle>
                <form className={props.container} noValidate autoComplete="off">
                    <DialogContent>
                        <TextField
                            select
                            fullWidth
                            id="type"
                            label="Type"
                            className={props.selectEmpty}
                            value={this.state.type}
                            onChange={e => this.handleChange(e,'type')}
                            margin="normal"
                        >
                            <MenuItem key="0" value="0">Debit</MenuItem>
                            <MenuItem key="1" value="1">Credit</MenuItem>
                        </TextField>
                        <TextField
                            autoFocus
                            fullWidth
                            id="amount"
                            label="Amount"
                            className={props.selectEmpty}
                            value={this.state.amount}
                            onChange={e => this.handleChange(e, 'amount')}
                            margin="normal" />
                        <TextField
                            select
                            fullWidth
                            id="account"
                            label="Account"
                            className={props.selectEmpty}
                            value={this.state.accountId}
                            onChange={e => this.handleChange(e,'accountId')}
                            margin="normal"
                        >
                            {props.accounts.map(option => (
                                <MenuItem key={option.id} value={option.id}>
                                    {option.institution.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            fullWidth
                            id="category"
                            label="Category"
                            className={props.selectEmpty}
                            value={this.state.categoryId}
                            onChange={e => this.handleChange(e,'categoryId')}
                            margin="normal"
                        >
                            {props.categories.map(option => (
                                <MenuItem key={option.name} value={option.id}>
                                    {option.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            fullWidth
                            id="sub-category"
                            label="Sub-category"
                            className={props.selectEmpty}
                            value={this.state.subCategoryId}
                            onChange={e => this.handleChange(e,'subCategoryId')}
                            margin="normal"
                        >
                            {props.categories.map(option => (
                                <MenuItem key={option.name} value={option.id}>
                                    {option.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            id="notes"
                            label="Notes"
                            className={props.selectEmpty}
                            value={this.state.note}
                            onChange={e => this.handleChange(e, 'note')}
                            margin="normal" />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="secondary">
                            Cancel
                        </Button>
                        <Button variant="contained" color="primary" className={props.button} onClick={this.handleSave}>
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }
}
export default withStyles(styles)(TransactionForm);