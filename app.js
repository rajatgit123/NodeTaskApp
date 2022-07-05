var express = require('express');
var app = express();

var mysql = require('mysql')

var connection = mysql.createConnection({
    host:'database-2.chi9au2endly.us-east-2.rds.amazonaws.com',
    user:'rajat',
    password:'rajatglobant'
})

// Connecting to database
connection.connect(function(err) {
    if(err){
      console.log("Error in the connection")
      console.log(err)
    }
    else{
      console.log(`Database Connected`)
      connection.query(`SHOW DATABASES`,
      function (err, result) {
        if(err)
          console.log(`Error executing the query - ${err}`)
        else
          console.log("Result: ",result)
      })
    }
})

app.use('/node_modules',  express.static(__dirname + '/node_modules'));
app.use('/style',  express.static(__dirname + '/style'));
app.use('/script',  express.static(__dirname + '/script'));

app.get('/',function(req,res){
	res.sendFile('home.html',{'root': __dirname + '/templates'});
})

app.get('/showSignInPage',function(req,res){
	res.sendFile('signin.html',{'root': __dirname + '/templates'});
})

app.get('/showSignUpPage',function(req,res){
  res.sendFile('signup.html',{'root':__dirname + '/templates'})
})

app.listen(80,function(){
    console.log('Node server running @ http://localhost:80')
});
