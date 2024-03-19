const express = require("express");
const app = express();
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
const axios = require('axios');

app.use(express.urlencoded({ extended: true }));



app.get("/", (req, res) => {
    axios.get("http://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?shows").then(results => {
        let showsdata = results.data;
        res.render('index', {showsdata});
        })
        .catch(err => {
            console.log("Error: ", err.message);
    });
});




// // old code
// app.get("/show", (req, res) => {
//     let idvalue = req.query.tvid;
//     let getshow = `http://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?id=${idvalue}`;
//     console.log(getshow);
    
//     axios.get(getshow).then(results => {
        
//         // The  let singledata = results.data.show
//         // stores the key called 'show' within the returned JSON object. 
//         let singledata = results.data.show;
//         res.render('details', {singledata});

//         }).catch(err => {
//             console.log("Error: ", err.message);
//     });

// });


// NEW code / experiment
app.get("/show", async (req, res) => {
    let idvalue = req.query.tvid;
    let getshow = `http://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?id=${idvalue}`;
    
    try {
        const response = await axios.get(getshow);
        const singledata = response.data.show;

        // Extract actor IDs from the show data
        const actorIds = singledata.actors;

        // Fetch details of each actor using their IDs
        const actorPromises = actorIds.map(async actorId => {
            const actorResponse = await axios.get(`http://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?actor=${actorId}`);
            return actorResponse.data.actorname; // Assuming the API returns actor name
        });

        // Wait for all actor details requests to resolve
        const actors = await Promise.all(actorPromises);

        res.render('details', { singledata, actors });
    } catch (error) {
        console.log("Error: ", error.message);
        res.status(500).send("An error occurred while fetching show details.");
    }
});





app.get("/create", (req, res) => {
    res.render('add');
});

app.post("/create", (req, res) => {

    let senttitle = req.body.fieldTitle;
    let sentimg = req.body.fieldImg;
    let sentdes = req.body.fieldDescr;
    
    const showData = { 
        title: senttitle,
        img: sentimg,
        description: sentdes,
    };

    const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
    }

    let epoint="http://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?create&apikey=51714569";

     axios.post(epoint, showData, config).then((response) => {
           console.log(response.data);
           res.render('add', {showData});
        }).catch((err)=>{
           console.log(err.message);
     });
});

app.get("/top", async (req, res) => {
    
    let topshows = await axios.get("http://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?topshows");
    let topactors = await axios.get("http://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?topactors");
   
    let showsdata = topshows.data;
    let actorsdata = topactors.data;

    res.render("topdata", {shows : showsdata , actors: actorsdata});
    
});


app.listen(3000, () => {
    console.log("Server is running at port 3000");
});