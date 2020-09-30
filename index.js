const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = function (model, defaultValues = {}) {
  const def = {
    limit: defaultValues.limit || 10,
    page: defaultValues.page || 1,
    order: defaultValues.order,
    likeOperatorSearch: "%value%" || defaultValues.likeOperatorSearch
  };

  model._addScope = model.addScope;
  model.paginateScopes = {};

  model.addScope = function (name, scope) {
    model._addScope(name, scope);
    model.paginateScopes[name] = scope;
  };

  model.paginate = async function (params = {}, scope) {
    const limit = params.limit || def.limit;
    const page = params.page || def.page;
    const order = params.order || def.order;
    const filters = getFilters(params.filter);
    const include =
      model.paginateScopes[scope] && model.paginateScopes[scope].include;

    return model
      .findAndCountAll({
        limit,
        order,
        include,
        offset: limit * (page - 1),
        where: filters.where,
        subQuery: filters.subQuery,
        distinct: true
      })
      .then(data => {
        const pages = Math.ceil(data.count / limit);

        return {
          items: data.rows,
          meta: {
            pages,
            all: data.count,
            hasNext: pages > page,
            hasPrevious: page > 1,
            currentPage: page,
            limit
          }
        };
      });
  };

  function getFilters(filter) {
    let where = {};
    let subQuery = undefined;

    if (!filter) {
      return where;
    }

    where[Op.and] = {};

    const search = filter.search;
    const fields = filter.fields;

    if (search) {
      where[Op.and][Op.or] = [];

      for (let by of search.by) {
        if (by.indexOf(".") !== -1) {
          by = `$${by}$`;
          subQuery = false;
        }

        where[Op.and][Op.or].push({
          [by]: {
            $like: likeOperatorSearch.replace("value", search.query)
          }
        });
      }
    }

    if (fields) {
      for (let field of fields) {
        if (field.name.indexOf(".") !== -1) {
          field.name = `$${field.name}$`;
          subQuery = false;
        }

        where[Op.and][field.name] = field.value;
      }
    }

    return {
      where,
      subQuery
    };
  }

  return model;
};