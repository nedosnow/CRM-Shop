require("dotenv").config();
const express = require("express");
const path = require("path");
const sessions = require("express-session");
const MongoStore = require("connect-mongo");
const { connect } = require("./src/db/db");
const hbs = require("hbs");
const morgan = require("morgan");
const { DB_CONNECTION_URL, SECRET_KEY } = process.env;
connect();

const { helperCheckAndAdd } = require("./helper-func/helper.js");

const indexRouter = require("./src/routes/indexRouter");
const authRouter = require("./src/routes/authRouter");
const clientsRouter = require("./src/routes/clientsRouter");
const ordersRouter = require("./src/routes/ordersRouter");

const PORT = 3000;

const app = express();


const sessionParser = sessions({
  name: app.get("cookieName"),
  secret: SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: DB_CONNECTION_URL,
  }),
  cookie: {
    // secure: true,
    httpOnly: true,
    maxAge: 100000000,
  },
});

app.set("view engine", "hbs");
hbs.registerHelper("helperCheckAndAdd", helperCheckAndAdd);
hbs.registerPartials(path.join(__dirname, "src", "views", "partials"));
app.set("cookieName", "userCookie");
app.set("views", path.join(process.env.PWD, "src", "views"));
app.use(sessionParser);
app.use(express.static(path.join(__dirname, "src", "public")));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(async(req, res, next) =>{
  // console.log(req);
  await req.session.user
  console.log("in middleware",req.session.user);
  // res.locals.email = req.session.email;
  
  if (req.session?.user) {
    res.locals.id = req.session.user.id;
    res.locals.name = req.session.user.name;
    res.locals.email = req.session.user.email;
    
  }
  console.log('res locals',res.locals);
return next();
  
});

//app.use(morgan('dev'));
app.use("/", indexRouter);
app.use("/auth", authRouter);

app.use("/clients", clientsRouter);
app.use("/orders", ordersRouter);


app.listen(PORT, () => {
  console.log("Server started on PORT", PORT);
});
