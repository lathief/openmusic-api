/* eslint-disable object-curly-newline */
/* eslint-disable camelcase */
const albumGetDetail = ({ id, name, year }) => ({
  id,
  name,
  year,
});
const mapGetAll = ({ id, title, performer }) => ({
  id,
  title,
  performer,
});

const mapGetDetail = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  inserted_at,
  updated_at,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  insertedAt: inserted_at,
  updatedAt: updated_at,
});

module.exports = { albumGetDetail, mapGetAll, mapGetDetail };
