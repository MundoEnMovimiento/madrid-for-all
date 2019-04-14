// global variables
var dbName = 'madrid4all.db';
var db = new PouchDB(dbName);
var map;
var originalArrayOfLocations = [];
var originalArrayOfServices = [];
var originalLocationServices = [];
var arrayOfLocations = [];
var markersOnMap = [];
var selectedServices = [];
var selectedLanguage = 'ES';
var targetWomen = false;
var targetChildren = false;
var targetOrigin = false;
// lat and lng of the "main" city used to center the map
var mainCityGeoCode = {
    "lat": 40.4168,
    "lng": -3.7038
}

function initDBContent() {
    // check if the db is empty. In that case, load the arrayOfLocations in it
    db.info().then(function (result) {
        if (result.doc_count === 0) {
            console.log('DB empty! Lets add loaded locations in it...');
            db.bulkDocs(arrayOfLocations).then(function () {
                console.log("Locations added successfully to DB. ");
                createDBIndexes();
            }).catch(function (err) {
                console.log("Error while adding locations to DB: " + err);
            });
        } else {
            console.log('DB not empty. It contains already ' + result.doc_count + ' records. No extra content is loaded from data.js.')
        }
  });
}

// function to creat search indexed on the database
function createDBIndexes() {
    // create the necessary db indexes
    db.createIndex({
      index: {
        // TODO: Review teh indexes for the search
        fields: ['orgName']
      }
    }).then(function (result) {
      console.log("Successfully created index over the categories");
    }).catch(function (err) {
      console.log("Error creating index on the categories: " + err);
    });
  }

// function to update the list of results after a change in the search form
function findLocationsInDatabase() {
    // TODO: Rename ID in the Json and Excel file to key or something less similar to _id
    // compose selector based on the user input
    /* var searchCriterias = new Object();
    var processedCategories = selectedCategories.slice(0);
    var processedServices = selectedServices.slice(0);
    // remove categories of any of their services are included in the search criteria
    for(var i = 0; i < selectedServices.length; i++){
      var serviceCategory = selectedServices[i].charAt(3);
      // remove the category of this service from the searchCriteria
      if(processedCategories.includes("cat" + serviceCategory)){
          console.log("Removing category 'cat" + serviceCategory + "' from the search criteria as '" + selectedServices[i] + "' is added");
          processedCategories.splice(processedCategories.indexOf(serviceCategory),1);
      }
    }
     // compose the final search criteria
    if(processedCategories.length > 0) {
      searchCriterias.categories = { $elemMatch: { $in: processedCategories } };
    }
    if(processedServices.length > 0) {
      searchCriterias.services = { $elemMatch: { $in: processedServices } };
    }
    if(targetWomen){
      searchCriterias.targettedWomen = { $eq: 1};
    }
    if(targetChildren){
      searchCriterias.targettedChild = { $eq: 1};
    }
    if(targetOrigin){
      searchCriterias.targettedOrigins = { $exists : true};
    }
    // perform the find in the DB
    db.find({
      selector: searchCriterias,
      fields: ['_id', 'ID', 'orgName', 'categories', 'services', 'district', 'languages', 'fullAddress', 'geocode', 'orgWeb', 'targettedChild', 'targettedWomen', 'targettedOrigins', 'waysOfContact', 'timeTable', 'additionalInfo'],
    }).then(function (result) {
      // clear previous results
      clearPreviousResults();
      arrayOfLocations = result["docs"];
      console.log(arrayOfLocations.length + " markers found for " + JSON.stringify(searchCriterias) + ".");
      // show found locations in the map
      addLocationsToMap(arrayOfLocations);
      // update result table with the found locations
      updateResults(arrayOfLocations);
    }).catch(function (err) {
      console.log(err);
    }); */
  }
