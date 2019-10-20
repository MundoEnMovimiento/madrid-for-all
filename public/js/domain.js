// global variables
var dbName = 'madrid4all.db';
var db = new PouchDB(dbName);
var map;
var originalLocations = [];
var originalServices = [];
var originalLocationServices = [];
var originalWaysOfContact = [];
var arrayOfLocations = [];
var markersOnMap = [];
var selectedServices = [];
var selectedLanguage = 'ES'
var valueLists = [];
var targetWomen = false;
var targetChildren = false;
var targetOrigin = false;
var targetLGTBIQ = false;
// lat and lng of the "main" city used to center the map
var mainCityGeoCode = {
  "lat": 40.4168,
  "lng": -3.7038
}
// callback to load menu content: categories, services, etc.
function initValueLists(loadedValueLists) {
  console.log("initValue Lists...");
  valueLists = loadedValueLists;
  loadStaticLabels();
}
// 
function loadStaticLabels(){
  document.getElementById("targetChildrenLabel").innerHTML = getTranslatedLabel("target-children");
  document.getElementById("targetWomenLabel").innerHTML = getTranslatedLabel("target-women");
  document.getElementById("targetOriginLabel").innerHTML = getTranslatedLabel("target-origin");
  document.getElementById("targetLGTBIQLabel").innerHTML = getTranslatedLabel("target-lgtbi");
  document.getElementById("resetSearchLabel").innerHTML = getTranslatedLabel("clean-filters");
  document.getElementById("introText").innerHTML = getTranslatedLabel("intro-text");
}
// method to initialize the DB content
function initDBContent() {
  // check if the db is empty. In that case, load the arrayOfLocations in it
  db.info().then(function (result) {
    if (result.doc_count === 0) {
      console.log('DB empty! Lets add locations to it...');
      console.log("But first, let's link to the services to each location...");
      originalLocationServices.forEach(function (curLocSrv) {
        // console.log("curLocSvc: " + curLocSrv.locationID);
        var curLocDetails = originalLocations.find(function (curLoc) {
          return curLoc.ID == curLocSrv.locationID
        });
        if (curLocDetails != null) {
          // create a new property 'services' with the content from curLocSvc
          curLocDetails.services = [];
          Object.keys(curLocSrv).forEach(function (key) {
            if (key != "locationID") {
              // we create one array element per key : value (value is an array of values too)
              curLocSrv[key].forEach(function (curVal) {
                curLocDetails.services.push(key + ":" + curVal);
              });
            }
          });
        } else {
          console.error("No services found location with ID " + curLocSrv.locationID);
        }
      });
      // insert all of the elements in the DB
      db.bulkDocs(originalLocations).then(function () {
        console.log("LocationsServices added successfully to DB. ");
        createDBIndexes();
      }).catch(function (err) {
        console.log("Error while adding LocationServices to DB: " + err);
      });
    } else {
      console.log('DB not empty. It contains already ' + result.doc_count + ' records. No extra content is loaded from data.js.')
    }
  });
}

// function to create search indexed on the database
function createDBIndexes() {
  // create the necessary db indexes
  db.createIndex({
    index: {
      fields: ['orgName', 'services']
    }
  }).then(function (result) {
    console.log("Successfully created index over orgName and services");
    // once the DB is ready, we perform the default search including all the services
    onResetClick();
  }).catch(function (err) {
    console.log("Error creating index over the ID and services: " + err);
  });
}

// function to update the list of results after a change in the search form
function findLocationsInDatabase(searchType, serviceKey) {
  // compose selector based on the user input
  var searchCriterias = new Object();
  var processedServices = [];
  if (searchType == "CATEGORY") { // clicked on a "category" node
      // if a category is selected, then its children too
      processedServices.push(serviceKey);
      processedServices = processedServices.concat(getChildServiceIDs(serviceKey));
  } else if (searchType == "SERVICE") { // clicked on a "service" under a "category" 
      processedServices.push(serviceKey);
  } else {
    processedServices = selectedServices;;
    console.log("Filters to be applied to the previous selection");
  }
  // keep current selection for the next search in case some filters are applied
  selectedServices = processedServices;
  // process the filters to apply if any
  // console.log("processedServices before filters: " + processedServices);
  if (targetWomen) {
    processedServices = processedServices.map(function (curService) {
      return curService + ":WOMEN"
    });
  } else if (targetChildren) {
    processedServices = processedServices.map(function (curService) {
      return curService + ":CHILD"
    });
  } else if (targetOrigin) {
    // TODO: Try to implement a more generic way of treating origin filters
    var afServices = processedServices.slice(0);
    var afsServices = processedServices.slice(0);
    afServices = afServices.map(function (curService) {
      return curService + ":AF";
    });
    afsServices = afsServices.map(function (curService) {
      return curService + ":AFS";
    });
    processedServices = processedServices.concat(afServices);
    processedServices = processedServices.concat(afsServices);
  } else if (targetLGTBIQ) {
    processedServices = processedServices.map(function (curService) {
      return curService + ":LGTBIQ"
    });
  } else {
    // we need to include all of the possible combinations
    processedServices = processedServices.map(function (curService) {
      return curService + ":OPEN"
    });
    var womenServices = processedServices.slice(0);
    womenServices = womenServices.map(function (curService) {
      return curService.replace("OPEN", "WOMEN");
    });
    var childServices = processedServices.slice(0);
    childServices = childServices.map(function (curService) {
      return curService.replace("OPEN", "CHILD");
    });
    var afServices = processedServices.slice(0);
    afServices = afServices.map(function (curService) {
      return curService.replace("OPEN", "AF");
    });
    var afsServices = processedServices.slice(0);
    afsServices = afsServices.map(function (curService) {
      return curService.replace("OPEN", "AFS");
    });
    var lgtbiqServices = processedServices.slice(0);
    lgtbiServices = lgtbiqServices.map(function (curService) {
      return curService.replace("OPEN", "LGTBIQ");
    });

    processedServices = processedServices.concat(womenServices);
    processedServices = processedServices.concat(childServices);
    processedServices = processedServices.concat(afServices);
    processedServices = processedServices.concat(afsServices);
    processedServices = processedServices.concat(lgtbiqServices);
  }
  // console.log("processedServices after filters: " + processedServices);
  // compose the searcCriterias
  if (processedServices.length > 0) {
    searchCriterias.services = { $elemMatch: { $in: processedServices } };
  }
  // add orgName to the criteria so the "sort" operation works
  searchCriterias.orgName = {$gt: null};
  // perform the find in the DB
  db.find({
    selector: searchCriterias,
    sort: [ {'orgName' : 'asc' } ]
  }).then(function (result) {
    // clear previous results
    clearPreviousResults();
    arrayOfLocations = result["docs"];
    // console.log(arrayOfLocations.length + " markers found for " + JSON.stringify(searchCriterias) + ".");
    // show found locations in the map
    updateResultsAndMap(arrayOfLocations);
  }).catch(function (err) {
    console.log(err);
  });
}
// function to handle the different static message
function getTranslatedLabel(code) {
  var label = valueLists.find(itm => itm.code === code)[selectedLanguage];
  if(!label){
    console.log("Unknown labelId: " + labelId);
    label = "";
  }
  return label;
}