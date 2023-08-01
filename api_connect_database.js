// โค้ดนี้ยังไม่ปรับประสิทธิภาพ แค่ลองคอนเซป

// เรียก config ที่เป็นความลับที่เขียนไว้ในไฟล์ .env
require('dotenv').config()
const { URL_CONNECTION_STRING, DATABASE_NAME, COLLECTION_NAME } = process.env

// ทำการ set ค่าที่จะโหลด database แต่ยังไม่เชื่อมต่อ
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = URL_CONNECTION_STRING;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// เขียนข้อมูลลง database โดยการเชื่อมต่อทำอยู่ภายในโค้ด
async function write__data(data,res) {
    try {
        const datetime = new Date()
        const primaryKey = bcrypt.hashSync(datetime + data, 10)
        const write = { 'primaryKey': primaryKey, 'data': data, 'timestamp': datetime }
        await client.connect()
        await client.db(DATABASE_NAME).collection(COLLECTION_NAME).insertOne(write)
        res.send('เพิ่มข้อมูลเรียบร้อย')
    } finally {
        await client.close()
    }
}
// อ่านข้อมูลทั้งหมดจาก database โดยการเชื่อมต่อทำอยู่ภายในโค้ด
async function read__data(res) {
    try {
        await client.connect()
        const doc = await client.db(DATABASE_NAME).collection(COLLECTION_NAME).find({}).toArray()
        res.send(doc)
    } finally {
        await client.close()
    }
}

// เซตค่าสำหรับเปิด server
const express = require('express')
const app = express()
const port = 8002

// เอาไว้เข้ารหัสข้อความเฉย ๆ
const bcrypt = require('bcrypt')

// ทำการเรียกใช้ฟังก์ชัน read__data() เมื่อมีคนมาที่ '/'
app.get('/', (req, res) => {
    read__data(res)
})

// ทำการเรียกใช้ฟังก์ชัน write__data() เมื่อมีคนมาที่ '/post/:data' โดยที่ :data หมายถึง "ข้อความ" ที่ต้องการเขียนลง database
app.post('/post/:data', (req, res) => {
    write__data(req.params.data,res)
})

// เปิด server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})