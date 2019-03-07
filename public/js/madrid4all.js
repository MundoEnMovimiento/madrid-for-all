// global variables
var selectedLanguage = 'ES';
var dbName = 'madrid4all.db';
var db = new PouchDB(dbName);
var map;
var originalArrayOfLocations = [];
var originalArrayOfCategories = [];
var originalArrayOfServices = [];
var arrayOfLocations = [];
var markersOnMap = [];
var selectedCategories = [];
var selectedServices = [];
var targetWomen = false;
var targetChildren = false;
var targetOrigin = false;
// lat and lng of the "main" city used to center the map
var mainCityGeoCode = {
  "lat": 40.4168,
  "lng": -3.7038
}
// list of functions
// Function to Show Map of Services
function loadMap() {
  var mapPosition = mainCityGeoCode;
  var mapCanvas = document.getElementById("servicesMap");
  var mapOptions = {
    // create map centered in 'mainCity'
    center: mapPosition,
    zoom: 12 // bigger number = closer map
  };
  // create new map and center it in 'mainCity'
  map = new google.maps.Map(mapCanvas, mapOptions);
}
/// callback to load the page content
function initPageContent(loadedLocations) {
  console.log("initPageContent...")
  originalArrayOfLocations = loadedLocations;
  arrayOfLocations = originalArrayOfLocations;
  // check if the db is empty. In that case, load the content of data.js file
  db.info().then(function (result) {
    if (result.doc_count === 0) {
      console.log('DB empty! Lets add data.json into it...');
      db.bulkDocs(arrayOfLocations).then(function (innerResult) {
        console.log("Locations added successfully to DB. ");
        createDBIndexes();
      }).catch(function (err) {
        console.log("Error while adding locations to DB: " + err);
      });
    } else {
      console.log('DB not empty. It contains already ' + result.doc_count + ' records. No extra content is loaded from data.js.')
    }
    addLocationsToMap(arrayOfLocations);
  });
}
// callback to load menu content: categories, services, etc.
function initMenuContent(loadedCategories) {
  console.log("initMenuContent...");
  originalArrayOfCategories = loadedCategories;
  var innerHtmlCode = "";
  // load categories and services
  if (loadedCategories != null && loadedCategories.length > 0) {
    for (var i = 0; i < loadedCategories.length; i++) {
      // TODO: replace second call to originalArrayOfLocations[i].categories by originalArrayOfLocations[i].categories.getLabel(language);
      innerHtmlCode += "<button id=\"" + loadedCategories[i].key + "\" onclick=\"onCategoryClick('" + loadedCategories[i].key + "')\" class=\"w3-button w3-block w3-hover-gray w3-medium w3-left-align\">" + loadedCategories[i][selectedLanguage] + "</button>";
      innerHtmlCode += "<div id=\"" + loadedCategories[i].key + "-child\" class=\"w3-hide\"></div>";
    }
    // add the generated code to div = 'categories'
    document.getElementById('categories').innerHTML = innerHtmlCode;
    // load services
    w3.getHttpObject("./data/services.json", function (loadedServices) {
      originalArrayOfServices = loadedServices;
      if (loadedServices != null && loadedServices.length > 0) {
        for (var i = 0; i < loadedServices.length; i++) {
          console.log("category: " + loadedServices[i].category + ", service: " + loadedServices[i].key);
          var div = document.createElement('div');
          innerHtmlCode = "<button id=\"" + loadedServices[i].key + "\" onclick=\"onServiceClick('" + loadedServices[i].key + "')\" class=\"w3-bar-item w3-button w3-block w3-hover-gray w3-small w3-left-align w3-margin-left\">" + loadedServices[i][selectedLanguage] + "</button>";
          innerHtmlCode += "<div id=\"" + loadedServices[i].key + "-child\" class=\"w3-hide\"></div>";
          div.innerHTML = innerHtmlCode;
          document.getElementById(loadedServices[i].category + "-child").appendChild(div);
        }
      } else {
        console.log("No services found in services.json")
      }
    });
  } else {
    console.log("No categories found in categories.json")
  }
}
// function to creat search indexed on the database
function createDBIndexes() {
  // create the necessary db indexes
  db.createIndex({
    index: {
      fields: ['categories', 'orgName']
    }
  }).then(function (result) {
    console.log("Successfully created index over the categories");
  }).catch(function (err) {
    console.log("Error creating index on the categories: " + err);
  });
}
// display array of markers on the map
function addLocationsToMap(arrayOfLocations) {
  // add the markers to the map
  arrayOfLocations.forEach(markerData => {
    //console.log("Adding marker " + markerData.orgName + ", " + markerData.address + " to the map...");
    addSingleLocationToMap(markerData);
  });
  // show table with the markers
  updateResults(arrayOfLocations);
}
// function to update the resultTable
function updateResults(arrayOfLocations) {  
  // update resultTable
  if(arrayOfLocations.length > 0) {
    // update resultCounter
    document.getElementById("resultCounter").innerHTML = "<p>" + arrayOfLocations.length + " resultado(s) encontrado(s)</p>";
    // update resultTable
    w3.displayObject("resultTable", { "records": arrayOfLocations });
    w3.sortHTML('#resultTable', '.item', 'td:nth-child(1')
  } else {
    // update resultCounter
    document.getElementById("resultCounter").innerHTML = "<p>No se ha encontrado ningún resultado</p>";
    w3.hide('#resultTable');
  }
}
// adds a marker to the map.
function addSingleLocationToMap(markerData) {
  // initialize variables
  var address = markerData.fullAddress;
  var markerPosition = new google.maps.LatLng(markerData.geocode);
  var marker = new google.maps.Marker({
    map: map,
    id: 'loc-marker-' + markerData.ID,
    position: markerPosition,
    title: markerData.orgName + ". Click for more details"
  });
  // create an infoWindow to be linked to the marker
  var infoWindowCode = "<strong>" + markerData.orgName + "</strong><br>";
  infoWindowCode += "<em>" + address + "</em><br><a href=\"" + markerData.orgWeb + "\">" + markerData.orgWeb + "</a><br>";
  infoWindowCode += "<a href=\"javascript:void(0)\" onClick=\"showLocationDetails(event, 'loc-details-" + markerData.ID + "')\">Mostrar más información</a><br>";
  //console.log("infoWindowCode: " + infoWindowCode); 
  var infowindow = new google.maps.InfoWindow({
    content: infoWindowCode
  });
  // add a click listener to our marker
  google.maps.event.addListener(marker, 'click', function () {
    infowindow.open(map, marker); // Open our InfoWindow
    this.setAnimation(null);
  });
  // update the list of displayed markers
  markersOnMap.push(marker);
}
// show location details
function showLocationDetails(event, locationId) {
  console.log("showLocationDetails: " + locationId);
  document.getElementById(locationId).scrollIntoView();
}
// highlight marker in map
function showLocationMarker(locationId) {
  console.log("showLocationMarker: " + locationId);
  for (var i = 0; i < markersOnMap.length; i++) {
    var currMarker = markersOnMap[i];
    if (currMarker.get('id') == locationId) {
      currMarker.setAnimation(google.maps.Animation.BOUNCE);
    } else {
      currMarker.setAnimation(null);
    }
  }
  document.getElementById('servicesMap').scrollIntoView();
}
// callback for the search by text
function onTextSearchInput(inputValue) {
  w3.filterHTML('#resultTable', '.item', inputValue);
}
// callback for the click on a category
function onCategoryClick(selectedCategory) {
  console.log("Clicked on category " + selectedCategory);
  if (selectedCategories.includes(selectedCategory)) {
    // unselect category and search again
    selectedCategories.splice(selectedCategories.indexOf(selectedCategory), 1);
    // remove svc linked to that category from the search criteria too
    selectedServices = selectedServices.filter(function(svcId, index, arr){
      return svcId.charAt(3) != selectedCategory;
    });
  } else {
    // select category and search again
    selectedCategories.push(selectedCategory);
  }
  // trigger the find operation
  findLocationsInDatabase();
  // update the UI
  w3.toggleClass('#' + selectedCategory, 'w3-text-red');
  w3.toggleClass('#' + selectedCategory + "-child", 'w3-hide', 'w3-show');
}
// calback for the click on service
function onServiceClick(selectedService) {
  console.log("Clicked on service " + selectedService);
  if (selectedServices.includes(selectedService)) {
    // unselect service and search again
    selectedServices.splice(selectedServices.indexOf(selectedService),1);
  } else {
    // select service and search again
    selectedServices.push(selectedService);
  }
  // trigger the find operation
  findLocationsInDatabase();
  // update the UI
  w3.toggleClass('#' + selectedService, 'w3-text-red');
}
// callback for the click on targetChild
function onTargetChildrenClick() {
  console.log("Clicked on targetChildren");
  targetChildren = !targetChildren;
  // trigger the find operation
  findLocationsInDatabase();
  // update the UI
  w3.toggleClass('#targetChildren', 'w3-red');
}
// callback for the click on targetWomen
function onTargetWomenClick() {
  console.log("Clicked on targetWomen");
  targetWomen = !targetWomen;
  // trigger the find operation
  findLocationsInDatabase();
  // update the UI
  w3.toggleClass('#targetWomen', 'w3-red');
}
// callback for the click on targetOrigin
function onTargetOriginClick() {
  console.log("Clicked on targetOrigin");
  targetOrigin = !targetOrigin;
  // trigger the find operation
  findLocationsInDatabase();
  // update the UI
  w3.toggleClass('#targetOrigin', 'w3-red');
}
// sets the map on all the displayed markers
function setMapOnAllMarkers(map) {
  for (var i = 0; i < markersOnMap.length; i++) {
    markersOnMap[i].setMap(map);
  }
}
// function to clear all the previous results
function clearPreviousResults() {
  setMapOnAllMarkers(null);
  markersOnMap = [];
  arrayOfLocations = [];
}
// function to update the list of results after a change in the search form
function findLocationsInDatabase() {
  // TODO: Rename ID in the Json and Excel file to key or something less similar to _id
  // compose selector based on the user input
  var searchCriterias = new Object();
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
    fields: ['_id', 'ID', 'orgName', 'district', 'postalCode', 'languages', 'fullAddress', 'geocode', 'orgWeb', 'targettedChild', 'targettedWomen', 'targettedOrigins'],
  }).then(function (result) {
    // clear previous results
    clearPreviousResults();
    // TODO: Fix me! This 'arrayOfLocations' must contain gmaps.Locations(), not "markerData"
    arrayOfLocations = result["docs"];
    console.log(arrayOfLocations.length + " markers found for " + JSON.stringify(searchCriterias) + ".");
    // show found locations in the map
    addLocationsToMap(arrayOfLocations);
    // update result table with the found locations
    updateResults(arrayOfLocations);
  }).catch(function (err) {
    console.log(err);
  });
}
// callback for the click on a row of the result table
function onRowClick(markerId) {
  console.log("Clicked row of marker with id: " + markerId);
  db.get(markerId + "").then(function (doc) {
    console.log("Fetched marker with id '" + doc["_id"] + "' and name '" + doc["orgName"] + "'-");
    // TODO: complete action linked to the selection of a row
  }).catch(function (err) {
    console.log(err);
  });
}
// function to reset the search results
function onResetClick() {
  console.log("Clicked on reset.");
  //document.getElementById("searchText").textContent = "";
  w3.removeClass('.w3-text-red', 'w3-text-red');
  w3.removeClass('.w3-red', 'w3-red');
  w3.toggleClass('.w3-show', 'w3-show', 'w3-hide');
  // clear previous results
  clearPreviousResults();
  initPageContent(originalArrayOfLocations);
  // clean selected criterias
  selectedCategories = [];
  selectedServices = [];
  targetWomen = false;
  targetChildren = false;
  targetOrigin = false;
}
// script to open sidebar
function w3_open() {
  document.getElementById("mySidebar").style.display = "block";
  document.getElementById("myOverlay").style.display = "block";
}
// script to close sidebar
function w3_close() {
  document.getElementById("mySidebar").style.display = "none";
  document.getElementById("myOverlay").style.display = "none";
}