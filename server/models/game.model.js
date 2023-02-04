import Sequelize from 'sequelize';

export default (sequelize) =>
    sequelize.define('game', {
        game_number: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        }, game_id: {
            type: Sequelize.CHAR(32),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }, game_size: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }, game_seed: {
            type: Sequelize.STRING(256),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }, game_easyMode: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }, game_isWon: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            validate: {
                notEmpty: true
            }
        }, game_score: {
            type: Sequelize.INTEGER
        }, game_player_name: {
            type: Sequelize.STRING(32)
        }, game_move_count: {
            type: Sequelize.INTEGER
        }, game_isSeedCustom: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }, game_time: {
            type: Sequelize.INTEGER
        }, game_moves: {
            type: Sequelize.TEXT
        }, game_start_time: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
            validate: {
                notEmpty: true
            }
        }, game_end_time: {
            type: Sequelize.DATE
        }
    },
        { freezeTableName: true }
    );
