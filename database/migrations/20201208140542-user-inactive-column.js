"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        "users",
        "active",
        {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        { transaction }
      );
      await queryInterface.addColumn(
        "users",
        "activationToken",
        {
          type: Sequelize.String,
          defaultValue: true,
        },
        { transaction }
      );
      await transaction.commit();
    } catch (error) {
      console.log("fail");
      await transaction.rollback();
    }

    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn("users", "inactive", { transaction });
      await queryInterface.removeColumn("users", "activationToken", {
        transaction,
      });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
    }

    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
