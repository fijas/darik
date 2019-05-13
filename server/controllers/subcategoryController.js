const models = require("../models");

// Display list of all Authors.
exports.create = (req, res) => {
    models.subcategory.create(req.body).then(subcategory => {
        return res.json(subcategory);
    });
};

// Display list of all Authors.
exports.list = (req, res) => {
    models.subcategory.findAll().then(subcategory => {
        return res.json(subcategory);
    });
};

// Display list of all Authors.
exports.view = (req, res) => {
    models.subcategory.findById(req.params.id).then(subcategory => {
        return res.json(subcategory);
    });
};

// Display list of all Authors.
exports.update = (req, res) => {
    models.subcategory.findById(req.params.id).then(subcategory => {
        if(subcategory !== null) {
            subcategory.update(req.body).then(updatedSubcategory => {
                return res.json(updatedSubcategory);
            });
        } else {
            return res.sendStatus(404);
        }
    });
};

// Display list of all Authors.
exports.delete = (req, res) => {
    models.subcategory.findById(req.params.id).then(subcategory => {
        if(subcategory !== null) {
            subcategory.destroy().then((subcat) => {
                return res.json(subcat);
            });
        } else {
            return res.sendStatus(404);
        }
    });
};
