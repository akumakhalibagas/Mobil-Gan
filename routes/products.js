var express = require("express");
var router = express.Router();
var http = require("http");
var fs = require("fs");
var fileUpload = require("express-fileupload");
var path = require("path");
const check = require("express-validator/check").check;
const validationResult = require("express-validator/check").validationResult;
var mv = require("mv");
var authentication_mdl = require("../middlewares/authentication");
var session_store;
/* GET product page. */

router.get("/", authentication_mdl.is_login, function (req, res, next) {
  req.getConnection(function (err, connection) {
    var query = connection.query(
      "SELECT * FROM jenis_mobil",
      function (err, rows) {
        if (err) var errornya = ("Error Selecting : %s ", err);
        req.flash("msg_error", errornya);
        res.render("product/list", {
          title: "jenis_mobil",
          data: rows,
          session_store: req.session,
        });
      }
    );
    //console.log(query.sql);
  });
});

router.delete(
  "/delete/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var jenis_mobil = {
        id: req.params.id,
      };
      var delete_sql = "DELETE from jenis_mobil where ?";
      req.getConnection(function (err, connection) {
        var query = connection.query(
          delete_sql,
          jenis_mobil,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Delete : %s ", err);
              req.flash("msg_error", errors_detail);
              res.redirect("/products");
            } else {
              req.flash("msg_info", "Delete Product Success");
              res.redirect("/products");
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
        "SELECT * FROM jenis_mobil where id=" + req.params.id,
        function (err, rows) {
          if (err) {
            var errors_detail = ("Error Selecting : %s ", err);
            req.flash("msg_error", errors_detail);
            res.redirect("/products");
          } else {
            if (rows.length <= 0) {
              req.flash("msg_error", "Product tidak ditemukan!");
              res.redirect("/products");
            } else {
              console.log(rows);
              res.render("product/edit", {
                title: "Edit",
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
    req.assert("nama_jenis_mobil", "Nama tidak boleh kosong ya!").notEmpty();
    var errors = req.validationErrors();
    if (!errors) {
      v_nama_jenis_mobil = req.sanitize("nama_jenis_mobil").escape().trim();
      v_plat_nomor = req.sanitize("plat_nomor").escape().trim();

      if (!req.files) {
        var jenis_mobil = {
          nama_jenis_mobil: v_nama_jenis_mobil,
          plat_nomor: v_plat_nomor,
        };
      } else {
        var file = req.files.gambar;
        file.mimetype == "image/jpg";
        file.mv("public/images/upload/" + file.name);

        var jenis_mobil = {
          nama_jenis_mobil: v_nama_jenis_mobil,
          plat_nomor: v_plat_nomor,
          gambar: file.name,
        };
      }

      var update_sql = "update jenis_mobil SET ? where id = " + req.params.id;
      req.getConnection(function (err, connection) {
        var query = connection.query(
          update_sql,
          jenis_mobil,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Update : %s ", err);
              req.flash("msg_error", errors_detail);
              res.render("product/edit", {
                nama_jenis_mobil: req.param("nama_jenis_mobil"),
                plat_nomor: req.param("plat_nomor"),
              });
            } else {
              req.flash("msg_info", "Update product success");
              res.redirect("/products/edit/" + req.params.id);
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
      res.redirect("/products/edit/" + req.params.id);
    }
  }
);

router.post("/add", authentication_mdl.is_login, function (req, res, next) {
  req.assert("nama_jenis_mobil", "Please fill the nama_jenis_mobil").notEmpty();
  var errors = req.validationErrors();
  if (!errors) {
    v_nama_jenis_mobil = req.sanitize("nama_jenis_mobil").escape().trim();
    v_plat_nomor = req.sanitize("plat_nomor").escape().trim();

    var file = req.files.gambar;
    file.mimetype == "image/jpg";
    file.mv("public/images/upload/" + file.name);

    var jenis_mobil = {
      nama_jenis_mobil: v_nama_jenis_mobil,
      plat_nomor: v_plat_nomor,
      gambar: file.name,
    };

    var insert_sql = "INSERT INTO jenis_mobil SET ?";
    req.getConnection(function (err, connection) {
      var query = connection.query(
        insert_sql,
        jenis_mobil,
        function (err, result) {
          if (err) {
            var errors_detail = ("Error Insert : %s ", err);
            req.flash("msg_error", errors_detail);
            res.render("product/add-product", {
              nama_jenis_mobil: req.param("nama_jenis_mobil"),
              plat_nomor: req.param("plat_nomor"),
              session_store: req.session,
            });
          } else {
            req.flash("msg_info", "Create product success");
            res.redirect("/products");
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
    res.render("product/add-product", {
      nama_jenis_mobil: req.param("nama_jenis_mobil"),
      plat_nomor: req.param("plat_nomor"),
      session_store: req.session,
    });
  }
});

router.get("/add", authentication_mdl.is_login, function (req, res, next) {
  res.render("product/add-product", {
    title: "Add New Product",
    nama_jenis_mobil: "",
    plat_nomor: "",
    session_store: req.session,
  });
});

module.exports = router;
