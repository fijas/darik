const models = require("../models");

// Display list of all Authors.
exports.create = (req, res) => {
    models.institution.create(req.body).then(institution => {
        return res.json(institution);
    });
};

// Display list of all Authors.
exports.list = (req, res) => {
    models.institution.findAll().then(institutions => {
        return res.json(institutions);
    });
};

// Display list of all Authors.
exports.view = (req, res) => {
    models.institution.findById(req.params.id).then(institution => {
        return res.json(institution);
    });
};
