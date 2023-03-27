import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    Sequelize,
    CreationOptional,
} from 'sequelize';

export interface GameAttributes {
    game_number: number;
    game_id: string;
    game_size: number;
    game_seed: string;
    game_easyMode: boolean;
    game_isWon: boolean;
    game_score?: number;
    game_player_name?: string;
    game_move_count?: number;
    game_isSeedCustom: boolean;
    game_time?: number;
    game_moves?: string;
    game_start_time: Date;
    game_end_time?: Date;
}

class Game extends Model<InferAttributes<Game>, InferCreationAttributes<Game>> {
    declare game_number: CreationOptional<number>;
    declare game_id: string;
    declare game_size: number;
    declare game_seed: string;
    declare game_easyMode: boolean;
    declare game_isWon: boolean;
    declare game_score: CreationOptional<number>;
    declare game_player_name: CreationOptional<string>;
    declare game_move_count: CreationOptional<number>;
    declare game_isSeedCustom: boolean;
    declare game_time: CreationOptional<number>;
    declare game_moves: CreationOptional<string>;
    declare game_start_time: CreationOptional<Date>;
    declare game_end_time: CreationOptional<Date>;
}

export const initGame = (sequelize: Sequelize): typeof Game => {
    Game.init(
        {
            game_number: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            game_id: {
                type: DataTypes.STRING(32),
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            game_size: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            game_seed: {
                type: DataTypes.STRING(256),
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            game_easyMode: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            game_isWon: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                validate: {
                    notEmpty: true,
                },
            },
            game_score: {
                type: DataTypes.INTEGER,
            },
            game_player_name: {
                type: DataTypes.STRING(32),
            },
            game_move_count: {
                type: DataTypes.INTEGER,
            },
            game_isSeedCustom: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            game_time: {
                type: DataTypes.INTEGER,
            },
            game_moves: {
                type: DataTypes.TEXT,
            },
            game_start_time: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
                validate: {
                    notEmpty: true,
                },
            },
            game_end_time: {
                type: DataTypes.DATE,
            },
        },
        {
            sequelize,
            tableName: 'game',
            freezeTableName: true,
        },
    );

    return Game;
};
