var express = require("express");
var router = express.Router();
var authentication_mdl = require("../middlewares/authentication");
var session_store;
/* GET Customer page. */

router.get("/", authentication_mdl.is_login, function (req, res, next) {
  req.getConnection(function (err, connection) {
    var query = connection.query("SELECT * FROM rentals", function (err, rows) {
      if (err) var errornya = ("Error Selecting : %s ", err);
      req.flash("msg_error", errornya);
      res.render("customer/list", {
        title: "Customers",
        data: rows,
        session_store: req.session,
      });
    });
    //console.log(query.sql);
  });
});

router.delete(
  "/delete/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var customer = {
        id: req.params.id,
      };

      var delete_sql = "delete from rentals where ?";
      req.getConnection(function (err, connection) {
        var query = connection.query(
          delete_sql,
          customer,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Delete : %s ", err);
              req.flash("msg_error", errors_detail);
              res.redirect("/customers");
            } else {
              req.flash("msg_info", "Delete Customer Success");
              res.redirect("/customers");
            }
          }
        );
      });
    });
  }
);
router.get(
  "/edit/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var query = connection.query(
        "SELECT * FROM rentals where id=" + req.params.id,
        function (err, rows) {
          if (err) {
            var errornya = ("Error Selecting : %s ", err);
            req.flash("msg_error", errors_detail);
            res.redirect("/customers");
          } else {
            if (rows.length <= 0) {
              req.flash("msg_error", "Customer can't be find!");
              res.redirect("/customers");
            } else {
              console.log(rows);
              res.render("customer/edit", {
                title: "Edit ",
                data: rows[0],
                session_store: req.session,
              });
            }
          }
        }
      );
    });
  }
);
router.put(
  "/edit/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.assert("user_perental", "Please fill the user_perental").notEmpty();
    var errors = req.validationErrors();
    if (!errors) {
      v_user_perental = req.sanitize("user_perental").escape().trim();
      v_no_hp = req.sanitize("no_hp").escape();
      v_nik = req.sanitize("nik").escape().trim();
      v_jenis = req.sanitize("jenis").escape().trim();
      v_status = req.sanitize("status").escape().trim();
      v_tanggal = req.sanitize("tanggal").escape();

      var customer = {
        user_perental: v_user_perental,
        no_hp: v_no_hp,
        nik: v_nik,
        jenis: v_jenis,
        status: v_status,
        tanggal: v_tanggal,
      };

      var update_sql = "update rentals SET ? where id = " + req.params.id;
      req.getConnection(function (err, connection) {
        var query = connection.query(
          update_sql,
          customer,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Update : %s ", err);
              req.flash("msg_error", errors_detail);
              res.render("customer/edit", {
                user_perental: req.param("user_perental"),
                no_hp: req.param("no_hp"),
                nik: req.param("nik"),
                jenis: req.param("jenis"),
                status: req.param("status"),
                tanggal: req.param("tanggal"),
              });
            } else {
              req.flash("msg_info", "Update rentals success");
              res.redirect("/customers/edit/" + req.params.id);
            }
          }
        );
      });
    } else {
      console.log(errors);
      errors_detail = "<p>Sory there are error</p><ul>";
      for (i in errors) {
        error = errors[i];
        errors_detail += "<li>" + error.msg + "</li>";
      }
      errors_detail += "</ul>";
      req.flash("msg_error", errors_detail);
      res.redirect("/customers/edit/" + req.params.id);
    }
  }
);

router.post("/add", authentication_mdl.is_login, function (req, res, next) {
  req.assert("user_perental", "Please fill the user_perental").notEmpty();
  var errors = req.validationErrors();
  if (!errors) {
    v_user_perental = req.sanitize("user_perental").escape().trim();
    v_no_hp = req.sanitize("no_hp").escape();
    v_nik = req.sanitize("nik").escape().trim();
    v_jenis = req.sanitize("jenis").escape().trim();
    v_status = req.sanitize("status").escape().trim();
    v_tanggal = req.sanitize("tanggal").escape();

    var customer = {
      user_perental: req.param("user_perental"),
      no_hp: req.param("no_hp"),
      nik: req.param("nik"),
      jenis: req.param("jenis"),
      status: req.param("status"),
      tanggal: req.param("tanggal"),
    };

    var insert_sql = "INSERT INTO rentals SET ?";
    req.getConnection(function (err, connection) {
      var query = connection.query(
        insert_sql,
        customer,
        function (err, result) {
          if (err) {
            var errors_detail = ("Error Insert : %s ", err);
            req.flash("msg_error", errors_detail);
            res.render("customer/add-customer", {
              user_perental: req.param("user_perental"),
              no_hp: req.param("no_hp"),
              nik: req.param("nik"),
              jenis: req.param("jenis"),
              status: req.param("status"),
              tanggal: req.param("tanggal"),
              session_store: req.session,
            });
          } else {
            req.flash("msg_info", "Create rentals success");
            res.redirect("/customers");
          }
        }
      );
    });
  } else {
    console.log(errors);
    errors_detail = "<p>Sory there are error</p><ul>";
    for (i in errors) {
      error = errors[i];
      errors_detail += "<li>" + error.msg + "</li>";
    }
    errors_detail += "</ul>";
    req.flash("msg_error", errors_detail);
    res.render("customer/add-customer", {
      user_perental: req.param("user_perental"),
      tanggal: req.param("tanggal"),
      session_store: req.session,
    });
  }
});

router.get("/add", authentication_mdl.is_login, function (req, res, next) {
  res.render("customer/add-customer", {
    title: "Add New Rentals",
    user_perental: "",
    no_hp: "",
    nik: "",
    jenis: "",
    status: "",
    tanggal: "",
    session_store: req.session,
  });
});

module.exports = router;
