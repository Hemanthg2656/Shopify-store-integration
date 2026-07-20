import * as customerRepository from "../repositories/customer.repository.js";

export const getCustomers = async (userData, queryParams) => {
  const page = Number(queryParams.page || 1);
  const limit = Number(queryParams.limit || 10);

  const { rows, total } = await customerRepository.findCustomers(
    userData.storeId,
    queryParams,
  );

  const totalPages = Math.ceil(total / limit);

  if (rows.length === 0) {
    return {
      customers: [],
      pageInfo: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  }

  const customers = rows.map((customer) => ({
    id: customer.id,
    shopifyCustomerId: customer.shopify_customer_id.split("/").pop(),

    firstName: customer.first_name,
    lastName: customer.last_name,

    email: customer.email,
    phone: customer.phone,

    ordersCount: customer.orders_count,
    totalSpent: customer.total_spent,

    state: customer.state,

    createdAt: customer.created_at_shopify,
    updatedAt: customer.updated_at_shopify,

    shopifyLink: getCustomerShopifyLink(userData, customer.shopify_customer_id),
  }));

  return {
    customers,
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

export const getCustomerShopifyLink = (userData, customerId) => {
  const numericId = customerId.split("/").pop();
  return `https://${userData.shop}/admin/customers/${numericId}`;
};
