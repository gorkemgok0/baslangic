export const sortOrders = (orders) => {
    return orders.sort((a, b) => {
      if (a.deadline === b.deadline) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return new Date(a.deadline) - new Date(b.deadline);
    });
  };
  