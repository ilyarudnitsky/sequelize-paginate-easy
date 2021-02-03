const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = function (model, defaultValues = {}) {
  const def = {
    limit: defaultValues.limit || 10,
    page: defaultValues.page || 1,
    order: defaultValues.order,
    likeOperatorSearch: defaultValues.likeOperatorSearch || "%value%",
    caseInsensitive: defaultValues.caseInsensitive
  };

  model._addScope = model.addScope;
  model.paginateScopes = {};

  model.addScope = function (name, scope) {
    model._addScope(name, scope);
    model.paginateScopes[name] = scope;
  };

  model.paginate = async function (params = {}, scope, additionalParams) {
    const limit = params.limit || def.limit;
    const page = params.page || def.page;
    const order = params.order || def.order;
    const where = model.paginateScopes[scope](additionalParams).where;
    const include = model.paginateScopes[scope](additionalParams).include;
    const filters = getFilters(params.filter);

    return model
      .findAndCountAll({
        limit,
        order,
        include,
        offset: limit * (page - 1),
        where: { ...filters.where, ...where },
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

        if (def.caseInsensitive) {
          where[Op.and][Op.or].push(
            Sequelize.where(Sequelize.fn("lower", Sequelize.col(by)), {
              $like: def.likeOperatorSearch.replace(
                "value",
                search.query.toLowerCase()
              )
            })
          );
        } else {
          where[Op.and][Op.or].push({
            [by]: {
              $like: def.likeOperatorSearch.replace("value", search.query)
            }
          });
        }
      }
    }

    if (fields) {
      for (let field of fields) {
        if (field.name.indexOf(".") !== -1) {
          field.name = `$${field.name}$`;
          subQuery = false;
        }

        where[Op.and][field.name] =
          field.value.length === 0 ? null : field.value;
      }
    }

    return {
      where,
      subQuery
    };
  }

  return model;
};
