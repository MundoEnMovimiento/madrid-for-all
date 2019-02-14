// global variables
var selectedLanguage = 'ES';
var dbName = 'madrid4all.db';
var db = new PouchDB(dbName);
var map;
var originalArrayOfLocations = [];
var arrayOfLocations = [];
var markersOnMap = [];
var selectedCategories = [];
var selectedServices = [];
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
      db.bulkDocs(arrayOfLocations).then(function (result) {
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
  var innerHtmlCode = "";
  // load categories and services
  if (loadedCategories != null && loadedCategories.length > 0){
    for (var i = 0; i < loadedCategories.length; i++) {
      var arrayOfServices = loadedCategories[i].services;
      // TODO: replace second call to originalArrayOfLocations[i].categories by originalArrayOfLocations[i].categories.getLabel(language);
      innerHtmlCode += "<button id=\"" + loadedCategories[i].key + "\" onclick=\"onCategoryClick(event, '" + loadedCategories[i].key + "')\" class=\"w3-button w3-block w3-left-align w3-medium\">" + loadedCategories[i][selectedLanguage] + "</button>";
      innerHtmlCode += "<div id=\"" + loadedCategories[i].key + "-child\" class=\"w3-hide\"></div>";
    }
    // add the generated code to div = 'categories'
    document.getElementById('categories').innerHTML = innerHtmlCode;
    // load services
    w3.getHttpObject("./data/services.json", function(loadedServices){
      if (loadedServices != null && loadedServices.length > 0) {
        for (var i = 0; i < loadedServices.length; i++) {
          // console.log("category: " + loadedServices[i].category + ", service: " + loadedServices[i].key);
          var div = document.createElement('div');
          innerHtmlCode = "<a id=\"" + loadedServices[i].key + "\" href=\"javascript:void(0)\" onclick=\"onServiceClick(event, '" + loadedServices[i].key + "')\" class=\"w3-bar-item w3-button w3-hover-blue w3-small\">" + loadedServices[i][selectedLanguage] + "</a>";
          innerHtmlCode += "<div id=\"" + loadedServices[i].key + "-child\" class=\"w3-hide\"></div>";
          div.innerHTML = innerHtmlCode;
          document.getElementById(loadedServices[i].category + "-child").appendChild(div);
        }
        // load specialities
        w3.getHttpObject("./data/specialities.json", function(loadedSpecialities){
          if (loadedSpecialities != null && loadedSpecialities.length > 0) {
            for (var i = 0; i < loadedSpecialities.length; i++) {
              console.log("service: " + loadedSpecialities[i].service + ", speciality: " + loadedSpecialities[i].key);
              var div = document.createElement('div');
              div.innerHTML = "<a id=\"" + loadedSpecialities[i].key + "\" href=\"javascript:void(0)\"  onclick=\"onSpecialityClick(event, this.id)\" class=\"w3-bar-item w3-button w3-hover-green w3-tiny\">" + loadedSpecialities[i][selectedLanguage] + "</a>";
              document.getElementById(loadedSpecialities[i].service + "-child").appendChild(div);
            }
          } else {
            console.log("No services found in services.json")
          }
    });
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
  updateResultTable(arrayOfLocations);
}
// function to update the resultTable
function updateResultTable(arrayOfLocations) {
  w3.displayObject("resultTable", { "records": arrayOfLocations });
  w3.sortHTML('#resultTable', '.item', 'td:nth-child(1')
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
  infoWindowCode += "<a href=\"javascript:void(0)\" onClick=\"showLocationDetails('loc-details-" + markerData.ID + "')\">Show more details</a><br>";
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
function showLocationDetails(locationId){
  console.log("showLocationDetails: " + locationId);
  document.getElementById(locationId).scrollIntoView();
  document.getElementById(locationId).focus();
}
// highlight marker in map
function showLocationMarker(locationId){
  console.log("showLocationMarker: " + locationId);
  for (var i=0; i < markersOnMap.length; i++) 
  {
      var currMarker = markersOnMap[i];
      if(currMarker.get('id') == locationId){
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
function onCategoryClick(event, selectedCategory) {
  console.log("Clicked on category " + selectedCategory);
  if (selectedCategories.includes(selectedCategory)) {
    // unselect category and search again
    selectedCategories.pop(selectedCategory);
    findLocationsInDatabase();
  } else {
    // select category and search again
    selectedCategories.push(selectedCategory);
    findLocationsInDatabase();
  }
  // update the UI
  toggleChildElements(selectedCategory);
}
// calback for the click on service
function onServiceClick(event, selectedService){
  console.log("Clicked on service " + selectedService);
  if (selectedServices.includes(selectedService)) {
    // unselect service and search again
    selectedServices.pop(selectedService);
    findLocationsInDatabase();
  } else {
    // select service and search again
    selectedServices.push(selectedService);
    findLocationsInDatabase();
  }
  // update the UI
  toggleChildElements(selectedService);
}
//
function onSpecialityClick(event, selectedSpeciality) {
  event.stopPropagation();
  console.log("onSpecialityClick: " + selectedSpeciality);
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
  // filter by categories
  if(selectedCategories.length > 0) {
    searchCriterias.categories = { $elemMatch: { $in: selectedCategories } };
  }
  // filter by services
  if(selectedServices.length > 0) {
    searchCriterias.services = { $elemMatch: { $in: selectedServices } };
  }
  // TODO: Add more filters
  // perform the find in the DB
  db.find({
    selector: searchCriterias,
    fields: ['_id', 'ID', 'orgName', 'district', 'postalCode', 'languages', 'fullAddress', 'geocode', 'orgWeb'],
  }).then(function (result) {
    // clear previous results
    clearPreviousResults();
    // TODO: Fix me! This 'arrayOfLocations' must contain gmaps.Locations(), not "markerData"
    arrayOfLocations = result["docs"];
    console.log(arrayOfLocations.length + " markers found for " + JSON.stringify(searchCriterias) + ".");
    // show found locations in the map
    addLocationsToMap(arrayOfLocations);
    // update result table with the found locations
    updateResultTable(arrayOfLocations);
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
  w3.toggleClass('.yyy', 'yyy', 'xxx');
  w3.toggleClass('.w3-show', 'w3-show', 'w3-hide');
  // clear previous results
  clearPreviousResults();
  initPageContent(originalArrayOfLocations);
}
// show / hide  child elements
function toggleChildElements(id) {
  w3.toggleClass('#' + id + "-child", 'w3-hide', 'w3-show');
  //w3.addClass('#' + id);
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