'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('files', {
            uuid: {
                type: Sequelize.UUID,
                primaryKey: true
            },
            file: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            owner: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'uuid'
                }
            },
            expireAt: Sequelize.DATE,
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE,
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('files');
    }
};
