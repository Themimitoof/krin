'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('users', {
            uuid: {
                type: Sequelize.UUID,
                primaryKey: true
            },
            api_key: {
                type: Sequelize.TEXT,
                allowNull: false,
                unique: true
            },
            admin: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            blocked: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('users');
    }
};
