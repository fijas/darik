import React from 'react';
import './Category.css';
import Paper from "@material-ui/core/Paper/Paper";
import Table from "@material-ui/core/Table/Table";
import TableHead from "@material-ui/core/TableHead/TableHead";
import TableRow from "@material-ui/core/TableRow/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import TableBody from "@material-ui/core/TableBody/TableBody";
import CategoryForm from "./CategoryForm/CategoryForm";
import Typography from "@material-ui/core/Typography/Typography";
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import {withStyles} from '@material-ui/core/styles';
import Fab from "@material-ui/core/Fab/Fab";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import SubCategoryForm from "./SubCategoryForm/SubCategoryForm";

const styles = theme => ({
    fab: {
        margin: 0,
        top: 'auto',
        right: 20,
        bottom: 20,
        left: 'auto',
        position: 'fixed'
    },
    subcategory: {
        backgroundColor: '#eee',
    }
});

class Category extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            data: null,
            isLoading: true,
            showCategoryForm: false,
            showSubCategoryForm: false,
            parent: null,
            categoryId: ''
        };
    }

    componentDidMount() {
        this.getCategories();
    }

    getCategories() {
        this.setState({isLoading: true});
        fetch('http://localhost:3001/categories')
            .then(response => response.json())
            .then(data => this.setState({data: data, isLoading: false}));
    }

    newCategory = () => {
        this.setState({
            showCategoryForm: true
        });
    };

    newSubCategory = (id, name) => {
        console.log(id);
        console.log(name);
        this.setState({
            showSubCategoryForm: true,
            parent: name,
            categoryId: id
        });
    };

    closeCategoryForm() {
        this.setState({
            showCategoryForm: false
        });
    }

    closeSubCategoryForm() {
        this.setState({
            showSubCategoryForm: false
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
                <CategoryForm open={this.state.showCategoryForm} close={this.closeCategoryForm.bind(this)} />
                <SubCategoryForm open={this.state.showSubCategoryForm} close={this.closeSubCategoryForm.bind(this)}
                              parent={this.state.parent} categoryId={this.state.categoryId}/>
                <Typography variant="display1" gutterBottom>
                    Categories
                </Typography>
                <hr/>
                <Paper className={classes.root}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell align="center">Sub Categories</TableCell>
                                <TableCell align="right">Options</TableCell>
                            </TableRow>
                        </TableHead>
                        {data.map(category => {
                            return (
                                <TableBody key={category.id}>
                                    <TableRow>
                                        <TableCell>{category.id}</TableCell>
                                        <TableCell component="th" scope="row">
                                            {category.name}
                                        </TableCell>
                                        <TableCell align="center">{category.subCategoryCount}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Add Sub-Category" aria-label="Add">
                                                <Button component="span" className={classes.button}
                                                        onClick={() => this.newSubCategory(category.id, category.name)}>
                                                    <AddIcon/>
                                                </Button>
                                            </Tooltip>
                                            <Tooltip title="Edit" aria-label="Add">
                                                <Button component="span" className={classes.button}>
                                                    <EditIcon/>
                                                </Button>
                                            </Tooltip>
                                            <Tooltip title="Delete" aria-label="Add">
                                                <Button component="span" className={classes.button}>
                                                    <DeleteIcon/>
                                                </Button>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                    {category.subcategories.map(subCategory => {
                                        return (
                                            <TableRow key={subCategory.id} className={classes.subcategory}>
                                                <TableCell></TableCell>
                                                <TableCell component="th" scope="row" colSpan={2}>
                                                    {subCategory.name}
                                                </TableCell>
                                                <TableCell align="right"></TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            )
                        })}
                    </Table>
                </Paper>
                <Fab color="primary" className={classes.fab} onClick={this.newCategory}>
                    <AddIcon/>
                </Fab>
            </div>
        );
    }
}

export default withStyles(styles)(Category);
