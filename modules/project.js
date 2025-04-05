require('dotenv').config();
require('pg');
const Sequelize = require('sequelize');

let sequelize = new Sequelize(
    process.env.PGDATABASE,
    process.env.PGUSER,
    process.env.PGPASSWORD,
    {
        host: process.env.PGHOST,
        dialect: 'postgres',
        port: process.env.PGPORT,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    }
);

const Sector = sequelize.define('Sector', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sector_name: {
        type: Sequelize.STRING
    }
}, {
    createdAt: false,
    updatedAt: false
});

const Project = sequelize.define('Project', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: Sequelize.STRING
    },
    feature_img_url: {
        type: Sequelize.STRING
    },
    summary_short: {
        type: Sequelize.TEXT
    },
    intro_short: {
        type: Sequelize.TEXT
    },
    impact: {
        type: Sequelize.TEXT
    },
    original_source_url: {
        type: Sequelize.STRING
    }
}, {
    createdAt: false,
    updatedAt: false
});

Project.belongsTo(Sector, { foreignKey: 'sector_id' });

function initialize() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve())
            .catch(err => reject(err));
    });
}

function getAllProjects() {
    return new Promise((resolve, reject) => {
        Project.findAll({ include: [Sector] })
            .then(data => resolve(data))
            .catch(err => reject("Unable to retrieve projects"));
    });
}

function getProjectById(projectId) {
    return new Promise((resolve, reject) => {
        Project.findAll({
            where: { id: projectId },
            include: [Sector]
        })
        .then(data => {
            if (data.length > 0) resolve(data[0]);
            else reject("Unable to find requested project");
        })
        .catch(err => reject("Unable to retrieve project"));
    });
}

function getProjectsBySector(sector) {
    return new Promise((resolve, reject) => {
        Project.findAll({
            include: [Sector],
            where: {
                '$Sector.sector_name$': {
                    [Sequelize.Op.iLike]: `%${sector}%`
                }
            }
        })
        .then(data => {
            if (data.length > 0) resolve(data);
            else reject("Unable to find requested projects");
        })
        .catch(err => reject("Unable to retrieve projects"));
    });
}

function addProject(projectData) {
    return Project.create(projectData)
      .then(() => Promise.resolve())
      .catch(err => Promise.reject(err.errors[0].message));
  }
  
  function getAllSectors() {
    return Sector.findAll()
      .then(sectors => Promise.resolve(sectors))
      .catch(err => Promise.reject("Unable to fetch sectors: " + err.message));
  }

  function editProject(id, updatedData) {
    return new Promise((resolve, reject) => {
      Project.update(updatedData, {
        where: { id: id }
      })
      .then(([rowsUpdated]) => {
        if (rowsUpdated === 0) {
          reject("No project found to update.");
        } else {
          resolve();
        }
      })
      .catch((err) => {
        reject(err.errors?.[0]?.message || err.message);
      });
    });
  }

  function deleteProject(id) {
    return new Promise((resolve, reject) => {
        Project.destroy({
            where: { id: id }
        })
        .then(() => resolve())
        .catch(err => reject(err.errors[0].message));
    });
}

  module.exports = {
    initialize,
    getAllProjects,
    getProjectById,
    getProjectsBySector,
    getAllSectors,
    editProject,
    deleteProject,
    addProject
  };
  