import React from 'react';
import './AccountForm.css';
import TextField from "@material-ui/core/TextField/TextField";
import Button from "@material-ui/core/Button/Button";
import Dialog from "@material-ui/core/Dialog/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import MenuItem from "@material-ui/core/MenuItem";
import { withStyles } from '@material-ui/core/styles';

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

class AccountForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            id: '',
            institutionId: '',
            type: ''
        };
    }

    handleClose = () => {
        this.props.close();
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
        fetch('http://localhost:3001/accounts', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({institutionId: this.state.institutionId, type: this.state.type})
        }).then((res) => res.json())
            .then(() => this.props.close())
            .catch((err) => console.log(err));
    }

    update(id) {
        fetch('http://localhost:3001/accounts/' + id, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name: this.state.name})
        }).then((res) => res.json())
            .then(() => this.props.close())
            .catch((err) => console.log(err));
    }

    handleChange = (event, name) => {
        let obj = {};
        obj[name] = event.target.value;
        this.setState(obj);
    };

    updateState = () => {
        this.setState({
            name: this.props.name,
            type: this.props.type,
            id: this.props.id
        });
    };

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
                            autoFocus
                            fullWidth
                            id="standard-select-currency"
                            label="Institution Type"
                            className={props.selectEmpty}
                            value={this.state.type}
                            onChange={e => this.handleChange(e,'type')}
                            margin="normal"
                        >
                            {props.types.map(option => (
                                <MenuItem key={option.name} value={option.id}>
                                    {option.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            id="standard-uncontrolled"
                            label="Institution Name"
                            value={this.state.name}
                            onChange={e => this.handleChange(e, 'name')}
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

export default withStyles(styles)(AccountForm);
