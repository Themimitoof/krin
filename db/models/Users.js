module.exports = function(sequelize, DataTypes) {
    
    return sequelize.define('users', {
        uuid: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        api_key: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true
        },
        admin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        blocked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });
}
