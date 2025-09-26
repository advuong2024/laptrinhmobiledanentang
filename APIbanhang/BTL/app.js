require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const cors = require('cors');
var app = express();
app.use(cors());

app.use(cors({
  origin: [
    'http://localhost:8081',
    'http://127.0.0.1:8081',
    // 'http://192.168.137.204:8081'
    'http://192.168.1.70:8081' //IPv4 ở nhà
  ],
  credentials: true,
}));
// const multer = require('multer');
// const upload = require('./middlewares/upload');
// ✅ Cho phép JSON lớn (ví dụ 10MB)
app.use(express.json({ limit: '10mb' }));

// ✅ Cho phép form-urlencoded lớn
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Đường dẫn tĩnh để truy cập file đã upload
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
var upload = require("./routes/upload.route");
app.use('/image', upload); 
  
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
// })

var authRouter = require("./routes/auth.route");
app.use("/auth", authRouter);

var cartRouter = require('./routes/cart.route');
app.use('/carts', cartRouter);

var cart_itemRouter = require('./routes/cart_item.route');
app.use('/cart_items', cart_itemRouter);

var categoryRouter = require('./routes/category.route');
app.use('/categorys', categoryRouter);

var customerRouter = require('./routes/customer.route');
app.use('/customers', customerRouter);

var order_itemRouter = require('./routes/order_item.route');
app.use('/order_items', order_itemRouter);

var ordersRouter = require('./routes/orders.route');
app.use('/orders', ordersRouter);

var paymentRouter = require('./routes/payment.route');
app.use('/payments', paymentRouter);

var product_detailsRouter = require('./routes/product_details.route');
app.use('/product_details', product_detailsRouter);

var productRouter = require('./routes/product.route');
app.use('/products', productRouter);

var product_variantRouter = require('./routes/product_variant.route');
app.use('/product_variants', product_variantRouter);

var reviewRouter = require('./routes/review.route');
app.use('/reviews', reviewRouter);

var user_accountRouter = require('./routes/user_account.route');
app.use('/user_accounts', user_accountRouter);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Khởi động server
const port = process.env.PORT || 3000; 
app.listen(port, () => {
  console.log(`Server chạy trên cổng ${port}`);
});

module.exports = app;


