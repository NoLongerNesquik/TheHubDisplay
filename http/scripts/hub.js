const API="http://127.0.0.1:8081";

const dataElement=document.getElementById("_data_");


var targetuname=document.getElementById("eusername");
targetuname.addEventListener("beforeinput",inputHandler);
var targetfirst=document.getElementById("efirstname");
targetfirst.addEventListener("beforeinput",inputHandler);
var targetlast=document.getElementById("elastname");
targetlast.addEventListener("beforeinput",inputHandler);
var targetemail=document.getElementById("eemail");
targetemail.addEventListener("beforeinput",inputHandler);
var targetpass=document.getElementById("epassword");
targetpass.addEventListener("beforeinput",inputHandler);
var targetcpass=document.getElementById("ecpassword");
targetcpass.addEventListener("beforeinput",inputHandler);
	
async function sd(server,data){
	let options={
		method:'POST',
		body:JSON.stringify(data)
	}
	//console.log(options); //see http header before request is sent
	return await fetch(server,options).then(response=>{
		let isJson=response.headers.get('content-type')?.includes('application/json');
		let tError=(isJson?response.json():null);
		if(!response.ok){
			let error=(tError && tError.message)||response.status;
			return Promise.reject(error);
		}
		else{
			return response.text().then(reply=>{
				return JSON.parse(reply);
			});
		}
	}).catch(e=>console.log("Error: "+e));
}
function cp(target,nohide){
	let requiresLogin=document.getElementById(target).classList.contains("loginRequired");
	if(!isLoggedIn()&&requiresLogin) {
		console.log("Must Login to access functions.")
		target="_login_";
		nohide=true
	}
	if(target=="_profile_") {
		display(target,{pf:true});
	}
	else if(target == "_events_") {
		display(target,{ev:true});
	}
	else if(target=="_calendar_") {
		display(target,{cd:true});
	}
	else if(target=="_search_"){
		search();
		display(target);
	}
	else display(target);
	
	/*
	trgt is the id property of the target that you want to display.
	updateDataRequest is a JSON object that contains the instructions for the API server.
	use updateDataRequest if you need some data to be current before displaying the new content.
	*/
	function display(trgt,updateDataRequest){
		if(updateDataRequest) sd(API,updateDataRequest).then(r=>{if(r) updateDataElement(r);});
		if(!document.getElementById(trgt)) return;
		if(!nohide) document.querySelectorAll(".dynamic").forEach(e=>{e.setAttributeNS(null,"style","display:none;visibility:hidden;")});
		document.getElementById(trgt).setAttributeNS(null,"style","display:flex;visibility:visible;");
	}
}
function ca() {
	let targetFirst = document.getElementById("fname");
	let targetUser = document.getElementById("signin_uname");
	let targetLast = document.getElementById("lname");
	let targetPass = document.getElementById("signin_password");
	let targetEmail = document.getElementById("email");
	if(!targetFirst.value){
		console.log("Must have a first name.");
		return;
	}
	else if(!targetLast.value){
		console.log("Must have a last name.");
		return;
	}
	else if(!targetUser.value){
		console.log("Must have a username.");
		return;
	}
	else if(targetFirst.value.length > 30){
		console.log("First name is too long");
		return;
	}
	else if(targetLast.value.length > 30){
		console.log("Last name is too long");
		return;
	}
	else if(/[^A-Za-z\'\-4]+/g.test(targetFirst.value)){
		console.log("First name is too weird");
		return;
	}
	else if(/[^A-Za-z\'\-4]+/g.test(targetLast.value)){
		console.log("Last name is too weird");
		return;
	}
	else if(targetUser.value.length > 30){
		console.log("Too long");
		return;
	}
	else if(/[^A-Za-z0-9\_\-\.]+/g.test(targetUser.value)){
		console.log("Username is too weird");
		return;
	}
	else if(targetPass.value.length > 512){
		console.log("Too long");
		return;
	}
	else if(targetPass.value.length < 9){
		console.log("Too short");
		return;
	}
	else if(/[^\!-\~]+/g.test(targetPass.value)){
		console.log("Too weird");
		return;
	}
	else if(document.getElementById("confirm_password").value!==targetPass.value){
		console.log("Passwords do not match");
		return;
	}
	else if(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(targetEmail.value)==false){
		console.log("Invalid Email Adress");
		return;
	}
	let mydata={};
	mydata.fn=targetFirst.value;
	mydata.ln=targetLast.value;
	mydata.em=targetEmail.value;
	mydata.un=targetUser.value;
	mydata.pw=targetPass.value;
	mydata.ca=true;
	let jsonObj=sd(API,mydata).then(r=>{
		if(r.matchedCount > 0) {
			console.log("An account with that username or email address already exists."); // the server checks both for existing accounts now but i does not return which one matched.
		}
		else{
			if(r) updateDataElement(r);
			cp("_profile_");
		}
	});
}
function ce() {
	let targetTitle = DOMPurify.sanitize(document.getElementById("etitle").value);
	let targetDate = DOMPurify.sanitize(document.getElementById("edate").value);
	let targetTime = DOMPurify.sanitize(document.getElementById("etime").value);
	let targetRepeat = DOMPurify.sanitize(document.getElementById("erepeat").value);
	let targetScope = DOMPurify.sanitize(document.getElementById("escope").value);
	let targetPeople = DOMPurify.sanitize(document.getElementById("epeople").value);
	let targetLocation = DOMPurify.sanitize(document.getElementById("elocation").value);
	let targetDescription = DOMPurify.sanitize(document.getElementById("edescription").value);
	if(!targetTitle) console.log("Event must have a Title.");
	let mydata={};
	mydata.et=targetTitle;
	mydata.ed=targetDate;
	mydata.eti=targetTime;
	mydata.er=targetRepeat;
	mydata.es=targetScope;
	mydata.ep=targetPeople;
	mydata.el=targetLocation;
	mydata.ede=targetDescription;
	mydata.eoi=dataElement.dataset["pid"];
	mydata.ce=true;
	let jsonObj=sd(API,mydata).then(r=>{
		cp("_events_");
	});
}
function login() {
	let targetUser = document.getElementById("uname").value;
	let targetPass = document.getElementById("password").value;
	if(!targetUser){
		console.log("Must have a username.");
		return;
	}
	else if(!targetPass) {
		console.log("Must have a password");
		return;
	}
	else if(targetUser.length > 30){
		console.log("Too long");
		return;
	}
	else if(/[^A-Za-z0-9\_\-\.]+/g.test(targetUser)){
		console.log("Username is too weird");
		return;
	}
	else if(targetPass.length > 512){
		console.log("Too long");
		return;
	}
	else if(targetPass.length < 9){
		console.log("Too short");
		return;
	}
	else if(/[^\!-\~]+/g.test(targetPass)){
		console.log("Too weird");
		return;
	}
	let mydata={};
	mydata.un = targetUser;
	mydata.pw = targetPass;
	mydata.log = true;
	let jsonObj=sd(API,mydata).then(r=>{
			if(r) updateDataElement(r);
			cp("_profile_");
		});
}
function updateDataElement(serverResponse){
	for(let key in serverResponse){
		dataElement.setAttribute("data-"+key,serverResponse[key]);
	}
}
function search() {
	console.log("input",document.getElementById("search").value);
	let targetSearch = document.getElementById('search').value;
	targetSearch = DOMPurify.sanitize(targetSearch).replace(/url\(.*\)/g,"");
	let mydata={};
	mydata.ts = targetSearch;
	mydata.sh = true;
	let jsonObj=sd(API,mydata).then(r=>{
		console.log("r",r);
		let teb=document.getElementById("eventhere");
		teb.childNodes.forEach(e=>{
			teb.removeChild(e);
		})
		let tab=document.createElement("table");
		tab.setAttribute("class","event list");
		teb.appendChild(tab);
		let head=document.createElement("tr");
		tab.appendChild(head);
		let r1=document.createElement("td");
		head.appendChild(r1);
		r1.innerHTML="Title";
		let r2=document.createElement("td");
		head.appendChild(r2);
		r2.innerHTML="Date";
		let r3=document.createElement("td");
		head.appendChild(r3);
		r3.innerHTML="Time";
		let r4=document.createElement("td");
		head.appendChild(r4);
		r4.innerHTML="Place";
		for(let i in r) {
			row=document.createElement("tr");
			tab.appendChild(row);
			let e1=document.createElement("td");
			row.appendChild(e1);
			e1.innerHTML=r[i].title;
			let e2=document.createElement("td");
			row.appendChild(e2);
			e2.innerHTML=r[i].date;
			let e3=document.createElement("td");
			row.appendChild(e3);
			e3.innerHTML=r[i].time;
			let e4=document.createElement("td");
			row.appendChild(e4);
			e4.innerHTML=r[i].place;
		}
		if(r) updateDataElement(r);
		console.log(JSON.stringify(document.getElementById("_data_").dataset["0"]));
	});
}
function isLoggedIn() {
	if (!dataElement.dataset["pid"]) {
		return false;
	}
	return true;
}
function enterLogin(e) {
	let key=e.keycode || e.which;
	if (key==13) {
		login();
	}
}
function enterSignUp(e) {
	let key=e.keycode || e.which;
	if (key==13) {
		ca();
	}
}
const callback = (mutationList, observer) => {
	for(const mutation of mutationList) {
		//console.log("mutation",mutation);
		//console.log("type:",typeof mutation.target.dataset,"value:",mutation.target.dataset);
		for(let key in mutation.target.dataset){
			//console.log("key",key);
			let val=mutation.target.dataset[key];
			let classSelector=".cn_"+key+"_";
			let t=document.querySelectorAll(classSelector);
			if(t){
				t.forEach(e=>{
					e.innerHTML="";
					e.insertAdjacentHTML("afterbegin",val);
				})
			}
		}	
	}
};

const observer = new MutationObserver(callback);
observer.observe(dataElement,{attributes: true});

function maliciousInput(input) {
	if(/[^A-Za-z0-9\_\-\.\ \!\?\@\#\$\%\&\(\)]+/g.test(input)) {
		return true;
	}
	return false;
}
function ep(){
	targetuname=document.getElementById("eusername");
	targetfirst=document.getElementById("efirstname");
	targetlast=document.getElementById("elastname");
	targetemail=document.getElementById("eemail");
	targetpass=document.getElementById("epassword");
	targetcpass=document.getElementById("ecpassword");
	let mydata={};
	mydata.id=dataElement.dataset["pid"];
	if(targetuname.value){
		mydata.un=targetuname.value;
	}
	if(targetfirst.value){
		mydata.fn=targetfirst.value;
	}
	if(targetlast.value){
		mydata.ln=targetlast.value;
	}
	if(targetemail.value){
		if(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(targetemail.value)==false) return;
		mydata.em=targetemail.value;
	}
	if(targetpass.value && targetcpass.value){
		if(targetpass.value==targetcpass.value) mydata.pw = targetpass.value;
		else return;
	}
	mydata.ep=true;
	console.log(JSON.stringify(mydata));
	let jsonObj=sd(API,mydata).then(r=>{
		updateDataElement(r);
		cp("_profile_");
	})
}
function inputHandler(e){
	console.log("target",e);
	if(maliciousInput(e.data)) e.preventDefault();
}