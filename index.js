//START MYSQL
var mysql = require("mysql");

var con = mysql.createConnection({
  host: "67.207.84.174",
  user: "conn",
  password: "hubHBHFU2839?!",
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("USE accounts", function (err, result) {
    if (err) throw err;
    console.log("accounts database selected");
  });
});


const express = require("express"); //represents the actual api, value is import of express package(function)
const { type } = require("express/lib/response");
const app = express();
const PORT = 8080;

app.use(express.json()); //middleware, converts body to json

app.post("/post/:id", (request, response) => {
  const { id } = request.params; //The id of the user making the request
  const { password } = request.body;
  const { title } = request.body;
  const { author } = request.body;
  const { body } = request.body; //Will be a JSON object

  if (!password || !title || !author || !body) {
    response.status(400).send({
      "status": "-1",
      "message":
        "A post request must include password(str), title(str), author(str), body(JSON). Please include all fields.",
    });
  } else {
    let user;
    try {
    con.query(
      "SELECT * FROM users WHERE id = ?;",
      [id],
      function (err, rows, fields) {
        if (!err) {
            if(rows.length<1){
                response.status(400).send(
                    {"status" : -1,
                    "message":`Unable to authenticate the user. No user matching id: ${id} was found/.`,
                    });
            }
          user = rows[0];
          console.log(rows);
          console.log(user["password"]);
          if (user["password"] !== password) {
            
            response.status(400).send(
                {"status" : -1,
                "message":"Unable to authenticate the user. Invalid credentials.",
                });
          }
          console.log("passwords match");
          if (user["can_post"] === 0) {
            response.status(400).send(
                {"status" : -1,
                "message":"Unable to authenticate the user. The user has been banned.",
                });
          }
          //Verify post
          if (title.length > 255 || author.length > 255) {
            response.status(400).send(
                {"status" : -1,
                "message":"Unable to verify post. The title or author field is more than 255 chars.",
                });
          }
          if (title.length < 3 || author.length <3) {
            response.status(400).send(
                {"status" : -1,
                "message":"Unable to verify post. The title or author field is less than 3 chars.",
                });
          }
          if (body.length > 16000000) {
            response.status(400).send(
                {"status" : -1,
                "message":"Unable to verify post. The body is more than 16 million chars.",
                });
          }
          con.query(
            "INSERT INTO news (post_id, id, title, author, date, body) VALUES (NULL, ?, ?, ?, CURRENT_TIMESTAMP, ?)",
            [id, title, author, body],
            function (err, rows, fields) {
                console.log("queried");
              if (!err) {
                  console.log("good")
                response.status(200).send(
                    {"status":"1",
                    "message":"Succesfully posted",
                    "post_id" : rows["insertId"],
                    });
                return;
              } else {
                  console.log(err);
                  console.log(body);
                  response.status(500).send(
                    {"status" : -1,
                    "message":"An error occured when inserting the post to the database.",
                    });
              }
            }
          );

          //User is authenticated
          // return JSON.stringify(rows);
        } 
      }
    );
  } catch (err) {
    response.status(500).send(
        {"status" : -1,
        "message":"Unknown server error in attemptPostInsert(), index.js: " + err.message,
        });
  }
  }
});

app.listen(PORT,"0.0.0.0");
//END EXPRESS
