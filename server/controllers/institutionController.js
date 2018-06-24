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

// Display list of all Authors.
exports.update = (req, res) => {
    models.institution.findById(req.params.id).then(institution => {
        if(institution !== null) {
            institution.update(req.body).then(updatedInstitution => {
                return res.json(updatedInstitution);
            });
        } else {
            return res.sendStatus(404);
        }
    });
};

// Display list of all Authors.
exports.delete = (req, res) => {
    models.institution.findById(req.params.id).then(institution => {
        if(institution !== null) {
            return institution.destroy();
        } else {
            return res.sendStatus(404);
        }
    });
};
