const port = 3000;
const HOST = '18.139.222.43'

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var fs = require('fs');

var AWS = require("aws-sdk");



AWS.config.update({
  region: "ap-southeast-1",
  endpoint: "http://dynamodb.ap-southeast-1.amazonaws.com",
});
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();


app.set("view engine","ejs");
app.set("views","./views");
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

/*************************************** findAll*/




let save = function (ho,ten,sdt,email,pass,gioiTinh,dc,trangThai) {

    var input = {
            phoneNum: sdt,
            password: pass,
            ho:ho,
            ten:ten,
            email:email,
            gioiTinh:gioiTinh,
            Dc:dc,
            TT : trangThai
         };
    var params = {
        TableName: "UserAccounts",
        Item: input
    };
    docClient.put(params, function (err, data) {
        if (err) {
            console.log("UserAccounts::save::error - " + JSON.stringify(err, null, 2));
        } else {
            console.log("UserAccounts::save::success" );
            //socket.emit('IsRegSuccess',true);
        }
    });
}
function findUser (res) {
    let params = {
        TableName: "UserAccounts"
    };
    docClient.scan(params, function (err, data) {
        if (err) {
           // res.writeHead(500,{'Content-Type' : 'application/json'});
            console.log(JSON.stringify(err, null, 2));
        } else {
           // socket.emit('IsLoginSuccess',true)
            //res.writeHead(200,{'Content-Type' : 'application/json'});
           if(data.Items.length === 0){
               res.end(JSON.stringify({message :'Table rỗng '}));
           }
            res.render('DanhSachTK.ejs',{
                data : data.Items
            });
        }
    });

}
/*************************************** admin Thêm Tài Khoản User */
app.get('/', (req, res) => {
    res.render('index.ejs');
});
app.get('/ThemTK', (req, res) => {
    res.render('ThemTK.ejs');
});

app.post('/ThemTK', (req, res) => {
    var ho = req.body.txtHo;
    var ten = req.body.txtTen;
    var sdt = req.body.txtSdt;
    var email = req.body.txtEmail;
    var gioiTinh = req.body.GioiTinh;
    var diaChi = req.body.txtDC;
    var pass = req.body.txtpassword;
    var TT = true;
    save(ho,ten,sdt,email,pass,gioiTinh,diaChi,TT);
    res.redirect('/DanhSachTK');
});
app.get('/DKemail.html', (req, res) => {
    res.render('DKemail.html');

    // console.log('phone :'+ __dirname);
});
app.post('/DKemail.html', (req, res) => {
   //res.send('<h1>hello</h1>');
   // console.log('phone :'+ req.body.phone);
    var phone = req.body.phone;
    var pass = req.body.pass;
    //save(phone,pass);
});


 app.get('/DanhSachTK',(req, res) =>{
     findUser(res);
});
 function updateUser(res,phoneNum,glag){
     var check = glag === 'false' ? false : true;
     var params = {
         TableName : "UserAccounts",
         Key :{
             "phoneNum" : phoneNum
         },
         UpdateExpression : "set TT = :r",
         ExpressionAttributeValues:{
             ":r": check
         }
     };
     docClient.update(params, function(err, data) {
         if (err) {
             console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
         } else {
             console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
             res.redirect('/DanhSachTK');
         }
     });

 }

let post = app.post('/DanhSachTK',(req, res) =>{
    updateUser(res,req.body.phoneNum,req.body.flag);
});

/*************************************** */
server.listen(process.env.PORT || port);
console.log(`Server run on http://${HOST}:${port}`);



