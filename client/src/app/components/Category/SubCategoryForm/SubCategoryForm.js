import React from 'react';
import './SubCategoryForm.css';
import TextField from "@material-ui/core/TextField/TextField";
import Button from "@material-ui/core/Button/Button";
import Dialog from "@material-ui/core/Dialog/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import Typography from "@material-ui/core/Typography";

class SubCategoryForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            categoryId: props.categoryId,
            id: '',
            name: '',
            subCategoryId: ''
        };
    }

    handleClose = () => {
        this.props.close();
    };

    handleSave = () => {
        if(this.state.subCategoryId === '') {
            this.createNew();
        } else {
            this.update(this.state.subCategoryId);
        }
        this.props.close();
    };

    createNew() {
        fetch('http://localhost:3001/subcategories', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({categoryId: this.props.categoryId, name: this.state.name})
        }).then((res) => res.json())
            .then(() => this.props.close())
            .catch((err) => console.log(err));
    }

    update(id) {
        fetch('http://localhost:3001/subcategories/' + id, {
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
            subCategoryId: this.props.subCategoryId
        });
    };

    render() {
        const props = this.props;

        return (
            <Dialog onClose={this.handleClose} onEntered={this.updateState} aria-labelledby="sub-category-dialog" open={this.props.open}>
                <DialogTitle id="sub-category-dialog-title">Add A New Sub-Category</DialogTitle>
                <form className={props.container} noValidate autoComplete="off">
                    <DialogContent>
                        <Typography variant="subheading" gutterBottom>
                            Parent Category: {props.parent}
                        </Typography>
                        <div>
                            <TextField
                                autoFocus
                                fullWidth
                                id="sub-category-name"
                                label="Sub-category Name"
                                value={this.state.name}
                                onChange={e => this.handleChange(e, 'name')}
                                margin="dense"/>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="secondary">Cancel</Button>
                        <Button variant="contained" color="primary" className={props.button} onClick={this.handleSave}>
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }
}

export default SubCategoryForm;
