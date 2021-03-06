const { User } = require('../models');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

function jwtSignUser(user) {
  const FOUR_WEEKS = 60 * 60 * 24 * 7 * 4;
  return jwt.sign(user, config.authentication.jwtSecret, {
    expiresIn: FOUR_WEEKS,
  });
}

module.exports = {
  async signUp(req, res) {
    try {
      const user = await User.create(req.body);
      res.send({
        user: user.toJSON(),
      });
    } catch (err) {
      res.status(400).send({
        error: 'This eMail account is already in use.',
      })
    }
  },
  async login(req, res) {
    try {
      const { email, password} = req.body;
      const user = await User.findOne({
        where: {
          email: email,
        },
      });
      
      if (!user) {
        return res.status(403).send({
          error: 'The login was not successful.',
        });
      }

      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        return res.status(403).send({
          error: 'The login was not successful.',
        });
      }

      res.send({
        user: {
          name: user.name,
          email: user.email,
        },
        token: jwtSignUser(user.toJSON()),
      });
    } catch (err) {
      res.status(500).send({
        error: 'The login was not successful.',
      })
    }
  },
  async index(req, res) {
    try {
      const users = await User.findAll({
        attributes: ['id', 'name', 'email', 'createdAt'],
        limit: 30,
      });
      res.send(users);
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to fetch the users.',
      });
    }
  },
  async delete(req, res) {
    try {
      const user = await User.findOne({
        where: {
          id: req.params.userId,
        },
      });

      user.destroy();

      res.send({
        message: 'User deleted',
      });
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured during user deletion.',
      });
    }
  },
};
