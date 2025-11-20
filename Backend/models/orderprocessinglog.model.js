"use strict";
module.exports = (sequelize, DataTypes) => {
  const OrderProcessingLog = sequelize.define(
    "OrderProcessingLog",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
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
