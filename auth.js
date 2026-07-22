/* ===== LearnHub simple access gate =====
   NOTE: This is a lightweight client-side gate to keep casual visitors out.
   It is NOT strong security — the check runs in the browser, so a technical
   user could bypass it. Do not use it to protect anything sensitive.
*/
(function () {
  "use strict";
  var PASS_HASH = 5681299; // hash of the access password
  var KEY = "lh_auth";

  function hash(s) {
    var x = 5381;
    for (var i = 0; i < s.length; i++) {
      x = ((x << 5) + x) + s.charCodeAt(i);
      x |= 0;
    }
    return x >>> 0;
  }

  window.LH_AUTH = {
    isLoggedIn: function () {
      try { return localStorage.getItem(KEY) === "1"; }
      catch (e) { return false; }
    },
    login: function (pw) {
      if (hash(pw) === PASS_HASH) {
        try { localStorage.setItem(KEY, "1"); } catch (e) {}
        return true;
      }
      return false;
    },
    logout: function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      location.href = "login.html";
    },
    // Called at the top of every protected page.
    guard: function () {
      if (!this.isLoggedIn()) {
        location.replace("login.html");
      }
    }
  };
})();
