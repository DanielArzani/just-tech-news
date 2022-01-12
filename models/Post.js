const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Post extends Model {
  static upvote(body, models) {
    return models.Vote.create({
      user_id: body.user_id,
      post_id: body.post_id,
    }).then(() => {
      return Post.findOne({
        where: {
          id: body.post_id,
        },
        attributes: [
          "id",
          "post_url",
          "title",
          "created_at",
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)"
            ),
            "vote_count",
          ],
        ],
      });
    });
  }
}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    post_url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    // user_id will be the same value as User.id
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "user",
        key: "id",
      },
    },
  },
  // Meta data
  {
    sequelize,
    freezeTableName: true,
    underscored: true,
    modelName: "post",
  }
);

module.exports = Post;
