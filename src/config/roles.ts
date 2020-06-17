export const permissions = {
  public: {
    routes: [{ path: '/login', method: 'get' }],
  },
  admin: {
    routes: [],
  },
};

export const roles = Object.keys(permissions);
