"use strict";
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      customerId: {
        type: DataTypes.INTEGER,
        references: { model: "Customer", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      status: DataTypes.ENUM("pending", "processing", "completed", "failed"),
      orderDetails: DataTypes.JSON,
    },
    {}
  );

  Order.associate = (models) => {
    Order.belongsTo(models.Customer, { foreignKey: "customerId" });
    Order.hasMany(models.OrderProcessingLog, { foreignKey: "orderId" });
  };

  return Order;
};
