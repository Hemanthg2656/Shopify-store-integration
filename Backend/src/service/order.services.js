import * as orderRepository from "../repositories/order.repository.js";
export const getOrders = async (userData, queryParams) => {
  const { rows, total } = await orderRepository.findOrders(
    userData.storeId,
    queryParams,
  );

  const page = Number(queryParams.page || 1);
  const limit = Number(queryParams.limit || 10);
  const totalPages = Math.ceil(total / limit);
  const orders = rows.map((order) => ({
    id: order.id,
    shopifyOrderId: order.shopify_order_id,
    orderNumber: order.order_number,

    shopifyLink: getOrderShopifyLink(userData, order.shopify_order_id),
    customerName: order.customer_name,
    customerEmail: order.customer_email,  

    financialStatus: order.financial_status,
    fulfillmentStatus: order.fulfillment_status,

    currency: order.currency,
    totalAmount: order.total_price,

    createdAt: order.created_at_shopify,
    updatedAt: order.updated_at_shopify,
  }));

  return {
    orders,
    pageInfo: {
      page,
      limit,
      total,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  };
};

export const getOrderShopifyLink = (userData, orderId) => {
   const numericId = orderId.split("/").pop();
  return `https://${userData.shop}/admin/orders/${numericId}`;
};
