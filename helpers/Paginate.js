const paginate = ({ page, pageSize }) => {
  const offset = (page - 1) * pageSize; // Adjusted offset calculation
  const limit = pageSize;

  return {
    offset,
    limit,
  };
};

module.exports = { paginate };
