require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const corsOrigin = require('cors');
const bodyParser = require('body-parser');
const { loginQuery, signUpQuery, getEvents, getOneEvent, addEvent, enrollEvent, getUser } = require("./util");
const {auth} = require('./connections/firebaseCon');
const { onAuthStateChanged } = require('firebase/auth');
const app = express();

const corsOptions = {
    origin: "*",
    credentials: true, 
    optionSuccessStatus: 200
}

app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static('public'));
app.set('view engine', 'ejs')
app.use(corsOrigin(corsOptions));

async function isLoggedIn() {
    return new Promise((resolve,reject)=>{
        onAuthStateChanged(auth, async (user)=>{
            if (user){
                const userData =  await getUser(user.uid)
                resolve({id : user.uid, userData});
            } else {
                resolve(null);
            } 
        });
    })
}

app.get('/',async (req,res)=>{
    const userStatus = await  isLoggedIn();
    res.render('index', {userStatus});
});

app.get('/login',(req,res)=>{
    res.render('login');
});

app.get('/logout', (req,res)=>{

});

app.post('/login' ,async (req,res)=>{
    try {
        const {email,password} = req.body;
        console.log(email,password)
        const result = await loginQuery(email,password);
        if(result.auth) {
            res.redirect('/events');
        } else {
            res.status(401).json({res:true,auth:false, msg: "Login Failed/Invalid Credentials"});
        }
    } catch(err) {
        console.error(err)
        return res.status(501).json({msg:"Something went wrong!"});
    }   
});

app.get("/signup",(req,res)=> {
    res.render("signup");
});

app.post('/signup',async (req,res)=>{
    try {
        const {email,password} = req.body;
        const userData = {
            username : req.body.name,
            department : req.body.dept
        }
        const result = await signUpQuery(email,password,userData);
        if(result.auth) {
            res.redirect('/events');
        } else {
            res.status(401).json({res:true,auth : false, msg:result.msg});
        }
    } catch(err) {
        return res.status(501).json({res:false,msg:"Something went wrong!"});
    } 
});

app.get('/events', async (req,res)=>{
    try {
        const eventsList = await getEvents();
        const userStatus = await isLoggedIn();
        res.render('events', {eventsList : eventsList, userStatus : userStatus});
    } catch (err) {
        console.log("Error in All Event Page Show:", err);
        res.send("Error In All Event pages server error ");
    }
});

app.post('/registerEvent',async(req,res)=>{
    onAuthStateChanged(auth, async(user)=>{
        if(user){
            try {
                const eventDetails = {
                    id : user.uid,
                    eventName : req.body.name,
                    eventUrl : req.body.url,
                    eventDepartment : req.body.department,
                    eventDate : req.body.date
                }
                const result = await addEvent(eventDetails);
                if(result) {
                    res.redirect('/events');
                } else {
                    res.send("Unable to add the event");
                }
            } catch (err) {
                console.log("Error in Event Page Show:", err);
            }
        } else {
            res.redirect('/login');
        }
    })
});

app.post("/enrollEvent",(req,res)=>{
    onAuthStateChanged(auth, async (user)=>{
        if(user) {
            try {
                const result = await enrollEvent(req.body.id,req.user.email);
                if(result){
                    res.send("Enrolled Successfully");
                } else {
                    res.send("Something Went Wrong..")
                }
            } catch (err) {
                console.log("Error in Event Page Show:", err);
            }
        } else {
            res.redirect('/login')
        }
    });
});

app.get('/verify',async (req,res)=>{
    const userStatus = await isLoggedIn();
    res.send(userStatus);
});

app.listen(process.env.PORT,(err)=>{
    if(err) {
        console.log("Server Error : ", err);
    } else {
        console.log(`Server Initiated with port ${process.env.PORT}`);
    }
});



