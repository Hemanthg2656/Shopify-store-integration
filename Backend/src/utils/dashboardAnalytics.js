

export const buildMonthlyRevenue = (orders) => {
  const revenueMap = new Map();

  orders.forEach(({ node }) => {
    const month = new Date(node.createdAt).toLocaleString("en-US", {
      month: "short",
    });

    const revenue = Number(node.currentTotalPriceSet.shopMoney.amount);

    revenueMap.set(month, (revenueMap.get(month) || 0) + revenue);
  });

  return [...revenueMap.entries()].map(([month, revenue]) => ({
    month,
    revenue: Number(revenue.toFixed(2)),
  }));
};

export const buildMonthlyOrders = (orders) => {
  const orderMap = new Map();

  orders.forEach(({ node }) => {
    const month = new Date(node.createdAt).toLocaleString("en-US", {
      month: "short",
    });

    orderMap.set(month, (orderMap.get(month) || 0) + 1);
  });

  return [...orderMap.entries()].map(([month, orders]) => ({
    month,
    orders,
  }));
};

export const buildOrderSummary = (orders) => {
  let totalRevenue = 0;

  let paidOrders = 0;
  let pendingOrders = 0;

  let fulfilledOrders = 0;
  let unfulfilledOrders = 0;

  orders.forEach(({ node }) => {
    const amount = Number(node.currentTotalPriceSet.shopMoney.amount);

    totalRevenue += amount;

    if (node.displayFinancialStatus === "PAID")
      paidOrders++;

    if (node.displayFinancialStatus === "PENDING")
      pendingOrders++;

    if (node.displayFulfillmentStatus === "FULFILLED")
      fulfilledOrders++;

    if (node.displayFulfillmentStatus === "UNFULFILLED")
      unfulfilledOrders++;
  });

  return {
    averageOrderValue:
      orders.length === 0
        ? 0
        : Number((totalRevenue / orders.length).toFixed(2)),

    totalRevenue: Number(totalRevenue.toFixed(2)),

    paidOrders,

    pendingOrders,

    fulfilledOrders,

    unfulfilledOrders,
  };
};

export const buildProductStatus = (products) => {
  const status = {
    active: 0,
    draft: 0,
    archived: 0,
  };

  products.forEach(({ node }) => {
    switch (node.status) {
      case "ACTIVE":
        status.active++;
        break;

      case "DRAFT":
        status.draft++;
        break;

      case "ARCHIVED":
        status.archived++;
        break;
    }
  });

  return status;
};