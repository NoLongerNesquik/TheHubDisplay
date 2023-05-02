function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}


class role{
	/*
		Becuase we are using a database to store our instantiated objects we must take care to never modify our object data directly.
		ALWAYS use one of the methods to manipulate the object. This is nessary becuase we must write changes to our object to a database whenever changes are made.
		Hashtag is used to make variables private. Private variables cannot be directly accessed by outside of class.
	*/
	#name;
	#description;
	#people;
	constructor(name,description){
		this.#name=name;
		this.#description=description;sd
	}

}

class person{
	/*
		Becuase we are using a database to store our instantiated objects we must take care to never modify our object data directly.
		ALWAYS use one of the methods to manipulate the object. This is nessary becuase we must write changes to our object to a database whenever changes are made.
		Hashtag is used to make variables private. Private variables cannot be directly accessed by outside of class.
	*/
	#firstName;
	#lastName;
	#address;
	#emailAddress;
	#pw;
	#age;
	#gender;
	#ethnicity;
	#phoneNumber;
	#picture;
	#biography;
	#roles;
	constructor(firstName,lastName,emailAddress){
		this.#firstName=firstName;
		this.#lastName=lastName;
		this.#emailAddress=emailAddress;
	}
}

class socialEvent{
	/*
		Becuase we are using a database to store our instantiated objects we must take care to never modify our object data directly.
		ALWAYS use one of the methods to manipulate the object. This is nessary becuase we must write changes to our object to a database whenever changes are made.
		Hashtag is used to make variables private. Private variables cannot be directly accessed by outside of class.
	*/
	#owner;
	#name;
	#description;
	#address;
	#contactInformation;
	#people;
	#calendar;
	constructor(name,owner){
		this.#name=name;
		this.#owner=owner;
	}
	getOwner(){
		return this.#owner;
	}
	setOwner(person){
		this.#owner=person;
	}
}

async function search() {
  try {
    const movies = database.collection("movies");

    // Query for a movie that has the title 'The Room'
    const query = { title: "Blacksmith Scene" };

    const options = {
      // sort matched documents in descending order by rating
      sort: { "imdb.rating": -1 },
      // Include only the `title` and `imdb` fields in the returned document
      projection: { _id: 0, title: 1, imdb: 1 },
    };

    const movie = await movies.findOne(query, options);

    // since this method returns the matched document, not a cursor, print it directly
    console.log(movie);
  } finally {
    await client.close();
  }
}


async function searchdb(input,type) {
  try {
	if(type == "ev") {
		const socialevents = database.collection("socialEvents");

		// Query for an event that has the title 'The Room'
		const query = { name: "Joe's 19th birthday" };

		const options = {
		  // sort matched documents in descending order by rating
		  sort: { "tag": -1 },
		  // Include only the `title` and `imdb` fields in the returned document
		  projection: { _id: 0, name: 1, tag: 1 },
		};

		const socialevent = await socialevents.findOne(query, options);

		// since this method returns the matched document, not a cursor, print it directly
		console.log(socialevents);
	}
	if(type == "em") {
		const emailIn = database.collection("people");
		const query = {email: input};
		const options = {
			projection: {email: 1},
		};
		return await emailIn.findOne(query, options).then(r=>{
			return r;
		});
	}
  } finally {
    await client.close();
  }
}


async function addRecords() {
  try {
    const people = database.collection("people");
    // create an array of documents to insert
    const docs = [
      { email:"anemail@gmail.com"}
    ];
    // this option prevents additional documents from being inserted if one fails
    const options = { ordered: true };
    const result = await people.insertMany(docs, options);
    console.log(`${result.insertedCount} documents were inserted`);
  } finally {
    await client.close();
  }
}

async function addEvents() {
  try {
    const socialEvents = database.collection("socialEvents");
    // create an array of documents to insert
    const docs = [
      { name: "Lightswitch", tag: "Electronic"},
    ];
    // this option prevents additional documents from being inserted if one fails
    const options = { ordered: true };
    const result = await socialEvents.insertMany(docs, options);
    console.log(`${result.insertedCount} documents were inserted`);
  } finally {
    await client.close();
  }
}

async function updateEvent() {
  try {
    const socialEvents = database.collection("socialEvents");
    // create a filter for a movie to update
    const filter = { name: "Joe's 19th birthday" };
    // this option instructs the method to create a document if no documents match the filter
    const options = { upsert: true };
    // create a document that sets the plot of the movie
    const updateDoc = {
      $set: {
        tag: "AAAAAA"
      },
    };
    const result = await socialEvents.updateOne(filter, updateDoc, options);
    console.log(
      `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
    );
  } finally {
    await client.close();
  }
}

async function replaceEvent() {
  try {
    const socialEvents = database.collection("socialEvents");
    // create a query for a movie to update
    const query = { name: { $regex: "The Cat from" } };
    // create a new document that will be used to replace the existing document
    const replacement = {
      title: `The Cat from Sector ${Math.floor(Math.random() * 1000) + 1}`,
    };
    const result = await movies.replaceOne(query, replacement);
    console.log(`Modified ${result.modifiedCount} document(s)`);
  } finally {
    await client.close();
  }
}

async function updateRecord() {
  try {
    const movies = database.collection("movies");
    // create a filter for a movie to update
    const filter = { title: "Random Harvest" };
    // this option instructs the method to create a document if no documents match the filter
    const options = { upsert: true };
    // create a document that sets the plot of the movie
    const updateDoc = {
      $set: {
        plot: `A harvest of random numbers, such as: ${Math.random()}`
      },
    };
    const result = await movies.updateOne(filter, updateDoc, options);
    console.log(
      `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
    );
  } finally {
    await client.close();
  }
}

async function updateRecords() {
  try {
    const movies = database.collection("movies");
    // create a filter to update all movies with a 'G' rating
    const filter = { rated: "G" };
    // increment every document matching the filter with 2 more comments
    const updateDoc = {
      $set: {
        random_review: `After viewing I am ${
          100 * Math.random()
        }% more satisfied with life.`,
      },
    };
    const result = await movies.updateMany(filter, updateDoc);
    console.log(`Updated ${result.modifiedCount} documents`);
  } finally {
    await client.close();
  }
}

async function replaceRecord() {
  try {
    const movies = database.collection("movies");
    // create a query for a movie to update
    const query = { title: { $regex: "The Cat from" } };
    // create a new document that will be used to replace the existing document
    const replacement = {
      title: `The Cat from Sector ${Math.floor(Math.random() * 1000) + 1}`,
    };
    const result = await movies.replaceOne(query, replacement);
    console.log(`Modified ${result.modifiedCount} document(s)`);
  } finally {
    await client.close();
  }
}

/*
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});
*/

//replaceRecord().catch(console.dir);


/*
let test=new socialEvent();
test.setOwner("A person");
console.log(test.getOwner());
*/

//searchdb("ane@gmail.com","em").then(r=>console.log(r));