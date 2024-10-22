const express=require('express')
const cors=require('cors')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const path=require('path')
const sqlite3=require('sqlite3').verbose()
const {open}=require('sqlite')
const {v4:uuid}=require('uuid')
const app=express()
app.use(cors())
app.use(express.json())
require('dotenv').config()
let db;
const port=process.env.PORT
const secret_token=process.env.SECRET_TOKEN

// initializing database and server
const initializeDbAndServer=async()=>{

    try {
        db=await open({
            filename:path.join(__dirname,'tracker.db'),
            driver:sqlite3.Database
        })

        await db.exec(`
            CREATE TABLE IF NOT EXISTS users(
                id TEXT PRIMARY KEY ,
                username TEXT NOT NULL ,
                password TEXT NOT NULL 
            );
            
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                type TEXT CHECK(type IN ('income','expense'))
            );
            
            CREATE TABLE IF NOT EXISTS transactions (
                id TEXT PRIMARY KEY ,
                user_id TEXT NOT NULL ,
                type TEXT CHECK(type IN ('income','expense')),
                category INTEGER,
                amount REAL NOT NULL ,
                date TEXT,
                description TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (category) REFERENCES categories(id)
            );

            CREATE INDEX IF NOT EXISTS transaction_id ON transactions(id);
            CREATE INDEX IF NOT EXISTS users_id ON users(id);
        `)
        console.log('database ready..')
    } catch (error) {
        console.error(error)
    }
    
}

// user registration
app.post('/register',async(req,res)=>{
    const {username,password}=req.body
    const hashedPassword=await bcrypt.hash(password,10)
    const id=uuid()
    try {
        await db.run(`INSERT INTO users (id,username,password) VALUES (?,?,?)`,[id,username,hashedPassword])
        res.status(201)
        res.send('user registration done.')
    } catch (error) {
        res.status(400)
        res.send('user already exists')
    }
    
})

// user login
app.post('/login',async(req,res)=>{
    const {username,password}=req.body
    const user=await db.get(`SELECT * FROM users WHERE username = ?`,username)
    if(user){
        const isMatch=await bcrypt.compare(password,user.password)
        if (isMatch){
            const token=jwt.sign({id:user.id},secret_token)
            res.status(201)
            res.send({token})
        }else{
            return res.status(404).send('invalid password')
        }
    }else{
        return res.status(403).send('invalid user.')
    }
    
})

// middleware to check for jwt token
const authenticateToken=(req,res,next)=>{
    const authHeader=req.headers['authorization']
    const token=authHeader && authHeader.split(' ')[1]
    if(!token){
        return res.status(401).json({msg:'token missing.'})
    }
    jwt.verify(token,secret_token,(err,user)=>{
        if(err){
            return res.status(403).json({msg:'invalid token or token expired.'})
        }
        req.user=user
        next();
    })
}

// add a new transaction
app.post('/add-transaction',authenticateToken,async(req,res)=>{
    const {type,category,amount,date,description}=req.body
    const user_id=req.user.id
    const id=uuid()
    try {
        await db.get(`INSERT INTO transactions (user_id,id,type,category,amount,date,description) VALUES(?,?,?,?,?,?,?)`,[user_id,id,type,category,amount,date,description])
        res.status(201)
        res.send('transaction added.')
    } catch (error) {
        res.status(400)
        res.send(error)
    }
})

// all transactions
app.get('/all-transactions',authenticateToken,async(req,res)=>{
    const user_id=req.user.id
    try {
        const transactions=await db.all(`SELECT * FROM transactions WHERE user_id=?`,[user_id])
        res.status(200)
        res.send(transactions)
    } catch (error) {
        res.status(401)
        res.send('error getting transactions',error)
    }
})

// single transaction by id
app.get('/transaction/:id',authenticateToken,async(req,res)=>{
    const transaction_id=req.params.id
    const user_id=req.user.id
    try {
        const transaction=await db.get('SELECT * FROM transactions WHERE id=? AND user_id=?',[transaction_id,user_id])
        res.status(200)
        res.send(transaction)
    } catch (error) {
        res.status(400)
        res.send('error getting transaction',error)
    }
})

// update a transaction by id
app.put('/transaction/:id',authenticateToken,async(req,res)=>{
    const transaction_id=req.params.id
    const user_id=req.user.id
    const {type,category,amount,date,description}=req.body
    try {
        await db.run('UPDATE transactions SET type=?,category=?,amount=?,date=?,description=? WHERE id=? AND user_id=?',[type,category,amount,date,description,transaction_id,user_id])
        res.status(200)
        res.send('transaction updated success.')
    } catch (error) {
        res.status(400)
        res.send('error updating transaction.',error)
    }
})

// delete transaction
app.delete('/transaction/:id',authenticateToken,async(req,res)=>{
    const transaction_id=req.params.id
    const user_id=req.user.id
    try {
        await db.run('DELETE FROM transactions WHERE id=? AND user_id=?',[transaction_id,user_id])
        res.status(200)
        res.send('transaction delete success.')
    } catch (error) {
        res.status(400)
        res.send('error deleting transaction.',error)
    }
})

//summary 
app.get('/summary',authenticateToken,async(req,res)=>{
    const user_id=req.user.id
    const {category,startDate,endDate}=req.query
    let query=`
        SELECT 
            SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS totalIncome,
            SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS totalExpense
        FROM 
            transactions
        WHERE
            user_id=?
    `
    const params=[user_id]
    if(category){
        query+=' AND category=?'
        params.push(category)
    }
    if(startDate && endDate){
        query=' AND date BETWEEN ? AND ?'
        params.push(startDate,endDate)
    }
    try {
        const summary=await db.get(query,params)
        res.status(200)
        res.send({totalIncome:summary.totalIncome,totalExpense:summary.totalExpense,balance:summary.totalIncome-summary.totalExpense})
    } catch (error) {
        res.status(400)
        res.send('error getting summary',error)
    }

})


initializeDbAndServer()
app.listen(port,()=>{
    console.log(`server running on ${port}`)
})