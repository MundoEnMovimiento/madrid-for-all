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
var targetWomen = false;
var targetChildren = false;
var targetOrigin = false;
var targetLGTBIQ = false;
// lat and lng of the "main" city used to center the map
var mainCityGeoCode = {
  "lat": 40.4168,
  "lng": -3.7038
}

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
      fields: ['ID', 'services', 'orgName']
    }
  }).then(function (result) {
    console.log("Successfully created index over ID and services");
  }).catch(function (err) {
    console.log("Error creating index over the ID and services: " + err);
  });
}

// function to update the list of results after a change in the search form
function findLocationsInDatabase(searchType, serviceKey) {
  // compose selector based on the user input
  var searchCriterias = new Object();
  var processedServices = selectedServices.slice(0);
  if (searchType == "CATEGORY") { // clicked on a "category" node
    var childServiceIDs = getChildServiceIDs(serviceKey);  
    var childrenIncluded = childServiceIDs.reduce((previouslyIncluded, curChildId) => previouslyIncluded || processedServices.includes(curChildId), false);
    if (processedServices.includes(serviceKey) && childrenIncluded) {
      // if previously selected, means this is an 'un-selection'
      processedServices.splice(processedServices.indexOf(serviceKey), 1);
      // if the current service has children, remove them from the search too
      if (childServiceIDs != null) {
        childServiceIDs.forEach(function (curChildID) {
          processedServices.splice(processedServices.indexOf(curChildID), 1);
        });
      }
    } else if(!processedServices.includes(serviceKey) && !childrenIncluded){
      // if a category is selected, then its children too
      processedServices.push(serviceKey);
      processedServices = processedServices.concat(getChildServiceIDs(serviceKey));
    } else if(!processedServices.includes(serviceKey) && childrenIncluded){
      // this is an unselection of the parent when some children were still selected
      if (childServiceIDs != null) {
        childServiceIDs.forEach(function (curChildID) {
          if(processedServices.includes(curChildID)){
            processedServices.splice(processedServices.indexOf(curChildID), 1);
          }
        });
      }
    } else {
      console.error("Invalid situation. If a category is selected, its children must be present in the search");
    }
  } else if (searchType == "SERVICE") { // clicked on a "service" under a "category" 
    var curServiceCat = serviceKey.substring(0, serviceKey.indexOf("s"));
    var parentServiceID = curServiceCat + "s0";
    var childServiceIDs = getChildServiceIDs(parentServiceID);

    if (!processedServices.includes(parentServiceID) && processedServices.includes(serviceKey)) {
      // if previously present, this is an 'un-selection', remove it
      processedServices.splice(processedServices.indexOf(serviceKey), 1);
      // if no more siblings, add again all of services in the category
      var childrenIncluded = childServiceIDs.reduce((previouslyIncluded, curChildId) => previouslyIncluded || processedServices.includes(curChildId), false);
      if(!childrenIncluded) {
        processedServices.push(parentServiceID);
        processedServices = processedServices.concat(childServiceIDs);       
      }
    } else if (processedServices.includes(parentServiceID) && processedServices.includes(serviceKey)) {
      // if the parent category was previously pressed, remove the parent all its children
      var curServiceCat = serviceKey.substring(0, serviceKey.indexOf("s"));
      var parentServiceID = curServiceCat + "s0";
      if (processedServices.includes(parentServiceID)) {
        processedServices.splice(processedServices.indexOf(parentServiceID), 1);
        if (childServiceIDs != null) {
          childServiceIDs.forEach(function (curChildID) {
            processedServices.splice(processedServices.indexOf(curChildID), 1);
          });
        }
      }
      processedServices.push(serviceKey);
    } else if (processedServices.includes(parentServiceID) && !processedServices.includes(serviceKey)) {
      console.error("Invalid situation. If a category is selected, all its children must be present in the search");
    } else {
      processedServices.push(serviceKey);
    }
  }

  // keep a copy for the next search action
  selectedServices = processedServices;
  console.log("processedServices before filters: " + processedServices);
  // process the filters to apply if any

  if (targetWomen) {
    processedServices = processedServices.map(function (curService) {
      return curService + ":WOMEN"
    });
  } else if (targetChildren) {
    processedServices = processedServices.map(function (curService) {
      return curService + ":CHILD"
    });
  } else if (targetOrigin) {
    
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
  console.log("processedServices after filters: " + processedServices);
  // compose the searcCriterias
  if (processedServices.length > 0) {
    searchCriterias.services = { $elemMatch: { $in: processedServices } };
  }
  // perform the find in the DB
  db.find({
    selector: searchCriterias
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
