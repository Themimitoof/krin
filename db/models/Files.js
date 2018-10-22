module.exports = function(sequelize, DataTypes) {
    const User = sequelize.import('./Users');

    const Files = sequelize.define('files', {
        uuid: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        file: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        owner: {
            type: DataTypes.UUID,
            allowNull: false
        },
        expireAt: DataTypes.DATE
    });

    Files.hasOne(User);

    return Files;
}