const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Image = sequelize.define("Image", {
    id: {
        type: DataTypes.UUID,
        
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}, {
    freezeTableName: true, // Prevent Sequelize from pluralizing table name
    paranoid: true, // Enables soft delete (deletedAt column)
    timestamps: true, // Enables createdAt and updatedAt columns
});

module.exports = Image;
