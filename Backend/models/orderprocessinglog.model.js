"use strict";
module.exports = (sequelize, DataTypes) => {
  const OrderProcessingLog = sequelize.define(
    "OrderProcessingLog",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Orders", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      step: DataTypes.STRING,
      status: DataTypes.STRING,
      logMessage: DataTypes.TEXT,
    },
    {
      updatedAt: false,
    }
  );

  OrderProcessingLog.associate = (models) => {
    OrderProcessingLog.belongsTo(models.Order, { foreignKey: "orderId" });
  };

  return OrderProcessingLog;
};
