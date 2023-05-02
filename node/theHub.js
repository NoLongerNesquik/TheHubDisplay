/*
	node.js (https://nodejs.org/)
*/
const fs = require('fs');
const env=require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const un=process.env.un;
const pw=process.env.pw;
const uri = "mongodb+srv://"+un+":"+pw+"@cluster0.nwpxtlg.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const database = client.db("theHub");
const people = database.collection("people");
const socialEvents = database.collection("socialEvents");
const roles = database.collection("roles");
const permissions = database.collection("permissions");
const http=require('http');
const port=8081;
let reqNumber=0;

const options={// SSL for production server. Comment out if testing local
	/*key:fs.readFileSync("/var/www/reStonk/.ssl/.private/httpd.key"),
	cert:fs.readFileSync("/var/www/reStonk/.ssl/.certs/httpd.crt"),
	ca:fs.readFileSync('/usr/share/pki/ca-trust-source/anchors/restonk_com.ca-bundle')*/
};

const server=http.createServer(options);

server.on('request',(request,response) => { //requests must be delivered via POST method
	response.setHeader("Access-Control-Allow-Origin", "*"); //CORS system needs this
	let data;
	let chunks=[];
	request.on('data',(chunk)=>{ //chunks of data recieved through the http stream are added to an array
		chunks.push(chunk);
	}).on('end',async ()=>{ //process data array from the http header after the http request stream has ended
		data=JSON.parse(Buffer.concat(chunks).toString());
		reqNumber++;
		console.log(reqNumber,data); //see request data from the http POST header
		const tResponse=new Object;
		response.writeHead(200,{'Content-Type':'text/plain'});
		if(data.ca){
			let result = people.updateOne(
				{$or:[{uname:data.un},{email:data.em}]}, //query both email and username to find a match
				{"$setOnInsert": {email: data.em,uname: data.un, pword: data.pw, fname: data.fn, lname: data.ln}},
				{upsert: true}
			).then(r=>{
				let findPerson=people.findOne(
					{"_id": r.upsertedId},
					{"uname":1,"fname":1,"lname":1,"email":1}
				).then(f=>{
					if(f){
						f.pid=f._id;
						delete f["_id"];
						response.write(JSON.stringify(f),"utf8");
						response.end();
					}
					else{
						response.write(JSON.stringify(r),"utf8");
						response.end();
					}
				});
			});
		}
		else if(data.log) {
			let result = people.findOne(
				{"uname": data.un},
				{"uname":1,"pword":1,"fname":1,"lname":1,"email":1}
			).then(r=>{
				if(data.pw == r.pword) {
					delete r["pword"];
					r.pid=r._id;
					delete r["_id"];
					response.write(JSON.stringify(r),"utf8");
					response.end();
				}
				else {

				}
			})
		}else if(data.ce){
			let result = socialEvents.insertOne(
				{title: data.et,date: data.ed, time: data.eti, repeat: data.er, scope: data.es, people: data.ep, place: data.el, description: data.ede, owner: data.eoi}
			).then(r=>{
				response.write(JSON.stringify(r),"utf8");
				response.end();
			});
		}
		else if(data.sh){
			if(data.ts) {
				let result = socialEvents.find({"title" : {$regex : data.ts}}).toArray().then(r=>{
					response.write(JSON.stringify(r),"utf8");
					response.end();
				})
			}
			else {
				let result = await socialEvents.find().toArray().then(r=>{
					response.write(JSON.stringify(r),"utf8");
					response.end();
				})
			}
		}
		else if(data.ep){
			let query = {};
			if(data.un) query.uname = data.un;
			if(data.fn) query.fname = data.fn;
			if(data.ln) query.lname = data.ln;
			if(data.em) query.email = data.em;
			if(data.pw) query.pword = data.pw;
			let ObjectId = require('mongodb').ObjectId;
			let result = people.updateOne({"_id":new ObjectId(data.id)},{$set:query}).then(r=>{
				let findPerson=people.findOne(
					{"_id": new ObjectId(data.id)},
					{"uname":1,"fname":1,"lname":1,"email":1}
				).then(f=>{
					if(f){
						f.pid=f._id;
						delete f["_id"];
						response.write(JSON.stringify(f),"utf8");
						response.end();
					}
					else{
						response.write(JSON.stringify(r),"utf8");
						response.end();
					}
				});
			});
		}
		else{
			response.write(JSON.stringify(tResponse),"utf8");
			response.end();
		}
	});
});

server.listen(port,()=>{console.log("Waiting for http requests on port "+port)}); //start listening for http connections



