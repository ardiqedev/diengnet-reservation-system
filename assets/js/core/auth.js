/* =========================================
   QEDEV AUTH
========================================= */

const Auth = {};

/* =========================================
   CONFIG
========================================= */

Auth.config = {
  tokenKey: "token",
  userKey: "user",
};

/* =========================================
   INIT
========================================= */

Auth.init = function () {
  const token = Storage.get(this.config.tokenKey);

  const user = Storage.get(this.config.userKey);

  if (token) {
    State.set("token", token);
  }

  if (user) {
    State.set("user", user);
  }
};

/* =========================================
   LOGIN
========================================= */

Auth.login = async function (username, password, expectedRole = "") {
  const response = await API.post("auth.login", {
    username,
    password,
    expectedRole,
  });

  if (!response.success) {
    return response;
  }

  this.setToken(response.data.token);

  this.setUser(response.data.user);

  return response;
};

/* =========================================
   LOGOUT
========================================= */

Auth.logout = async function () {
  const token = this.getToken();

  try {
    if (token) {
      await API.post("auth.logout", { token });
    }
  } finally {
    this.destroy();
  }
};

/* =========================================
   CHECK LOCAL
========================================= */

Auth.check = function () {
  return this.isLoggedIn();
};

/* =========================================
   VALIDATE SESSION
========================================= */

Auth.validate = async function () {
  const token = this.getToken();

  if (!token) {
    return false;
  }

  try {
    const response = await API.post("auth.check", { token });

    if (!response.success) {
      this.destroy();
      return false;
    }

    if (response.data?.user) {
      this.setUser(response.data.user);
    }

    return true;
  } catch (error) {
    console.error("[AUTH] SESSION VALIDATION ERROR:", error);

    this.destroy();

    return false;
  }
};

/* =========================================
   IS LOGGED IN
========================================= */

Auth.isLoggedIn = function () {
  return this.getToken() !== null;
};

/* =========================================
   USER
========================================= */

Auth.user = function () {
  return State.get("user");
};

/* =========================================
   SET USER
========================================= */

Auth.setUser = function (user) {
  Storage.set(this.config.userKey, user);

  State.set("user", user);
};

/* =========================================
   CLEAR USER
========================================= */

Auth.clearUser = function () {
  Storage.remove(this.config.userKey);

  State.remove("user");
};

/* =========================================
   GET TOKEN
========================================= */

Auth.getToken = function () {
  return State.get("token");
};

/* =========================================
   SET TOKEN
========================================= */

Auth.setToken = function (token) {
  Storage.set(this.config.tokenKey, token);

  State.set("token", token);
};

/* =========================================
   CLEAR TOKEN
========================================= */

Auth.clearToken = function () {
  Storage.remove(this.config.tokenKey);

  State.remove("token");
};

/* =========================================
   DESTROY
========================================= */

Auth.destroy = function () {
  this.clearToken();

  this.clearUser();

  State.clear();
};
