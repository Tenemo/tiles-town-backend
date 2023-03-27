"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initGame = void 0;
var _sequelize = require("sequelize");
class Game extends _sequelize.Model {}
const initGame = sequelize => {
  Game.init({
    game_number: {
      type: _sequelize.DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    game_id: {
      type: _sequelize.DataTypes.STRING(32),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    game_size: {
      type: _sequelize.DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    game_seed: {
      type: _sequelize.DataTypes.STRING(256),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    game_easyMode: {
      type: _sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    game_isWon: {
      type: _sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        notEmpty: true
      }
    },
    game_score: {
      type: _sequelize.DataTypes.INTEGER
    },
    game_player_name: {
      type: _sequelize.DataTypes.STRING(32)
    },
    game_move_count: {
      type: _sequelize.DataTypes.INTEGER
    },
    game_isSeedCustom: {
      type: _sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    game_time: {
      type: _sequelize.DataTypes.INTEGER
    },
    game_moves: {
      type: _sequelize.DataTypes.TEXT
    },
    game_start_time: {
      type: _sequelize.DataTypes.DATE,
      allowNull: false,
      defaultValue: _sequelize.DataTypes.NOW,
      validate: {
        notEmpty: true
      }
    },
    game_end_time: {
      type: _sequelize.DataTypes.DATE
    }
  }, {
    sequelize,
    tableName: 'game',
    freezeTableName: true
  });
  return Game;
};
exports.initGame = initGame;