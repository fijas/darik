const models = require("../models");

// Display list of all Authors.
exports.create = (req, res) => {
    models.category.create(req.body).then(category => {
        return res.json(category);
    });
};

// Display list of all Authors.
exports.list = (req, res) => {
    models.category.findAll({
        attributes: ['id', 'name'],
        include: [{
            model: models.subcategory, attributes: ['id', 'name']
        }]
    }).then(categories => {
        return res.json(categories);
    });
};

// Display list of all Authors.
exports.view = (req, res) => {
    models.category.findByPk(req.params.id).then(category => {
        return res.json(category);
    });
};

// Display list of all Authors.
exports.update = (req, res) => {
    models.category.findByPk(req.params.id).then(category => {
        if (category !== null) {
            category.update(req.body).then(updatedCategory => {
                return res.json(updatedCategory);
            });
        } else {
            return res.sendStatus(404);
        }
    });
};

// Display list of all Authors.
exports.delete = (req, res) => {
    models.category.findByPk(req.params.id).then(category => {
        if (category !== null) {
            category.destroy().then((cat) => {
                return res.json(cat);
            });
        } else {
            return res.sendStatus(404);
        }
    });
};
