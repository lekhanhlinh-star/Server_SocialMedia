class APIFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filtering() {
    const queryObj = { ...this.queryString }; // tạo ra bản sao của req.query
    const excludeFields = [
      'sort',
      'fields',
      'page',
      'limit',
      'searchUser',
      'searchPost'
    ];
    excludeFields.forEach((el) => delete queryObj[el]); // xóa các key có tên là sort, filter, page

    this.query = this.query.find(queryObj);
    return this;
  }

  searching() {
    if (this.queryString.searchUser) {
      const keyword = this.queryString.searchUser
        ? {
            $or: [
              { name: { $regex: req.query.searchUser, $options: 'i' } },
              { email: { $regex: req.query.searchUser, $options: 'i' } }
            ]
          }
        : {};
      this.query.find(keyword).find({ _id: { $ne: req.user._id } });
    } else if (this.queryString.searchPost) {
      const keyword = this.queryString.searchPost
        ? {
            $or: [{ content: { $regex: req.query.searchPost, $options: 'i' } }]
          }
        : {};
      this.query.find(keyword).find({ postedBy: { $ne: req.user._id } });
    }
    return this;
  }

  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.replace(/,/g, ' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limiting() {
    if (this.queryString.fields) {
      const fieldBy = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fieldBy);
    } else {
      this.query = this.query.select('-__v'); // -__v là khi migration thì nó tự tạo nên khi hiện thông tin ra thì không cần hiện nó nên ta dùng - để loại bỏ
    }
    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeature;
