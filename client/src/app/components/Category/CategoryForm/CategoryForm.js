import React from 'react';
import './CategoryForm.css';
import TextField from "@material-ui/core/TextField/TextField";
import Button from "@material-ui/core/Button/Button";
import Dialog from "@material-ui/core/Dialog/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";

class CategoryForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            id: '',
            name: ''
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
        fetch('http://localhost:3001/categories', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name: this.state.name})
        }).then((res) => res.json())
            .then(() => this.props.close())
            .catch((err) => console.log(err));
    }

    update(id) {
        fetch('http://localhost:3001/categories/' + id, {
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
            id: this.props.categoryId
        });
    };

    render() {
        const props = this.props;

        return (
            <Dialog onClose={this.handleClose} onEntered={this.updateState} aria-labelledby="category-dialog"
                    open={this.props.open}>
                <DialogTitle id="category-dialog-title">Add A New Category</DialogTitle>
                <form className={props.container} noValidate autoComplete="off">
                    <DialogContent>
                        <TextField
                            autoFocus
                            fullWidth
                            id="standard-uncontrolled"
                            label="Category Name"
                            value={this.state.name}
                            onChange={e => this.handleChange(e, 'name')}
                            margin="dense" />
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

export default CategoryForm;
