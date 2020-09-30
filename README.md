<h1 align="center">Sequelize Paginate Easy</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/sequelize-paginate-easy" target="_blank"><img src="https://img.shields.io/badge/Packages-NPM-%23CB3837.svg?logo=npm&link=https://www.npmjs.com"></a>
  <a href="https://reactjs.org/" target="_blank"><img src="https://img.shields.io/badge/sequelize-paginate-green"></a>
  <a href="https://reactjs.org/" target="_blank"><img src="https://img.shields.io/badge/version-0.1.0-blue"></a>
    <a href="https://reactjs.org/" target="_blank"><img src="https://img.shields.io/badge/sequelize%20version-^6.3.5-blue"></a>
</p>

## Description

Sequelize helper for add method of pagination.

## Install

```bash
npm install --save sequelize-paginate-easy
```

## Requirements

- Sequilize version must be 6.3.5 and above

## How to use?

1. Firstly you need connect model to easy sequelize pagination:

```js
const ePagination = "sequelize-paginate-easy";
const models = require("./path/to/models");

const defaultParams = {
  order: [["id", "DESC"]],
  likeOperatorSearch: "%value%",
  limit: 25,
  page: 3
};

const user = ePagination(models.user, defaultParams);
```

2. Then on some method/endpoint use `paginate` function:

```js
const getUsers = async query => {
  const res = await models.user.paginate(query);

  return res;
};

getUsers(shapeOfQuery);

/*
  Result object

  {
    items,
    meta: {
      pages,
      all,
      hasNext,
      hasPrevious,
      currentPage,
      limit
    }
  }
*/
```

## How to use with scope?

1. Firstly you need connect model to easy sequelize pagination:

```js
const ePagination = "sequelize-paginate-easy";
const models = require("./path/to/models");

const defaultParams = {
  order: [["id", "DESC"]],
  limit: 25,
  likeOperatorSearch: "%value%",
  page: 3
};

const user = ePagination(models.user, defaultParams);

/*
  Important!

  Use addScope method of sequeilze after connecting ePagination
*/

user.addScope("nameOfScope", {
  include: [
    {
      model: models.role,
      as: "userRoles",
      through: models.user_role,
      required: false
    },
    {
      model: models.location,
      as: "location",
      required: false
    }
  ]
});

/*
  At this moment scope works only with include shape
*/
```

2. Then on some method/endpoint use `paginate` function:

```js
const getUsers = async query => {
  const res = await models.user.paginate(query, "nameOfScope");

  return res;
};

getUsers(shapeOfQuery);

/*
  Result object

  {
    items,
    meta: {
      pages,
      all,
      hasNext,
      hasPrevious,
      currentPage,
      limit
    }
  }
*/
```

## What is shape of query?

Example:

```js
const query = {
  page: 1,
  limit: 10,
  order: [["userRoles", "id", "DESC"]],
  filter: {
    fields: [
      {
        name: "discountRoles.id",
        value: "3a4df7f2-7afd-4af0-9631-ba19401d3ebe"
      },
      {
        name: "location.id",
        value: "08c44256-af88-474e-885a-72245247e945"
      }
    ],
    search: {
      by: ["email"],
      query: "d"
    }
  }
};
```

Description:

| Props    | Type       | Required | Default Value | Description                                                     |
| -------- | ---------- | -------- | ------------- | --------------------------------------------------------------- |
| `page`   | **number** | `no`     | 1             | Number of page                                                  |
| `limit`  | **number** | `no`     | 10            | Items per page                                                  |
| `order`  | **array**  | `no`     | null          | Sorting like in sequelize version 6.3.5 and above               |
| `filter` | **object** | `no`     | null          | This special params for searchin and filtering. See table below |

Description of `filter`:

| Props    | Type       | Required | Default Value | Description                                                                                             |
| -------- | ---------- | -------- | ------------- | ------------------------------------------------------------------------------------------------------- |
| `fields` | **array**  | `no`     | null          | Fields property need for filtering by one or several fields. More information in table `field`          |
| `search` | **object** | `no`     | null          | Search property need for flexible searching by one or several field. More information in table `search` |

Description of `field`:

| Props   | Type       | Required | Default Value | Description                                                                                                |
| ------- | ---------- | -------- | ------------- | ---------------------------------------------------------------------------------------------------------- |
| `name`  | **string** | `yes`    | null          | Name of column in table. If you need to filter by inner fields use `.` for nesting. Example `userRoles.id` |
| `value` | **any**    | `yes`    | null          | Value which need to find                                                                                   |

Description of `search`:

| Props   | Type       | Required | Default Value | Description                                                                                                  |
| ------- | ---------- | -------- | ------------- | ------------------------------------------------------------------------------------------------------------ |
| `by`    | **array**  | `yes`    | null          | Array of columns in table. If you need to filter by inner fields use `.` for nesting. Example `userRoles.id` |
| `query` | **string** | `yes`    | null          | Value which need to find                                                                                     |

## What is `likeOperatorSearch` property?

This property has by default `%value%` value. For customysing you can pass another like condition.

For example: `value__%`

### Important!

This string must contain `value` word. Instead of this `value` will be substituted with the search query.
