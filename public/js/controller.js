// global variables
var vueResultCounter = new Vue({
  el: '#resultCounter',
  data: {
    message: '-'
  }
});
var vueResultTable = new Vue({
  el: '#resultTable',
  data: { locations : arrayOfLocations},
  methods : {
    // callback for the click on a row of the result table
    onLocationClick : function(locationId) {
      console.log("Clicked onLocationClick with id: " + locationId);
      // update UI
      locDetailsDiv = document.getElementsByClassName("loc-details");
      for (i = 0; i < locDetailsDiv.length; i++) {
        locDetailsDiv[i].className = locDetailsDiv[i].className.replace(" w3-show", " w3-hide");
      }
      w3.toggleClass('#loc-' + locationId + '-details', 'w3-hide', 'w3-show');
      this.openInfoTab('general-info-' + locationId);
    },
    // callback to handle the tab switch on the table result
    openInfoTab : function(tabName) {
      var i, x, tablinks;
      x = document.getElementsByClassName("infoTab");
      for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
      }
      tablinks = document.getElementsByClassName("tablink");
      for (i = 0; i < x.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" w3-border-red", "");
      }
      document.getElementById(tabName + '-tablink').className += " w3-border-red";
      document.getElementById(tabName).style.display = "block";
    },
    // highlight marker in map
    showLocationMarker : function(locationId) {
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
    },
    printCategories : function(categories) {
      var output = [];
      categories.forEach(function(categoryKey){
        console.log("categoryKey: '" + categoryKey + "'");
        output.push(originalArrayOfCategories.find(function(element) {
          return element.key == categoryKey;
        })[selectedLanguage]);
      });
      return output.join(" - ");
    },
    printServices : function(services) {
      var output = [];
      if(services ==  null) {
        return " - "
      } else {
        services.forEach(function(serviceKey){
          // console.log("serviceKey: '" + serviceKey + "'");
          output.push(originalArrayOfServices.find(function(element) {
            return element.key == serviceKey;
          })[selectedLanguage]);
        });
        return output.join(" - ");
      }
    }
  }
});

// list of functions
// Function to Show Map of Services
function loadMap() {
  var mapPosition = mainCityGeoCode;
  var mapCanvas = document.getElementById("servicesMap");
  var mapOptions = {
    // create map centered in 'mainCity'
    center: mapPosition,
    zoom: 11 // bigger number = closer map
  };
  // create new map and center it in 'mainCity'
  map = new google.maps.Map(mapCanvas, mapOptions);
}
/// callback to load the page content
function initPageContent(loadedLocations) {
  console.log("initPageContent with " + loadedLocations);
  originalArrayOfLocations = loadedLocations;
  arrayOfLocations = originalArrayOfLocations;
  initDBContent();
  addLocationsToMap();
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
      innerHtmlCode += "<div class=\"w3-bar\">";
      innerHtmlCode += "<img class=\"w3-bar-item w3-left w3-padding-small w3-hide-small\" src=\"/assets/" + loadedCategories[i].icon + "\" height=\"42\" width=\"42\">";
      innerHtmlCode += "<button class=\"w3-bar-item w3-button w3-hover-gray w3-medium w3-left-align w3-padding-small w3-mobile\" id=\"" + loadedCategories[i].key + "\" onclick=\"onCategoryClick('" + loadedCategories[i].key + "')\">" + loadedCategories[i][selectedLanguage] + "</button>";
      innerHtmlCode += "</div>"
      innerHtmlCode += "<div id=\"" + loadedCategories[i].key + "-child\" class=\"w3-hide\"></div>";
    }
    // add the generated code to div = 'categories'
    document.getElementById('categories').innerHTML = innerHtmlCode;
    // load services
    w3.getHttpObject("/data/services.json", function (loadedServices) {
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
        // once the menu is ready, we can proceed to load the page content
        w3.getHttpObject("/data/locations.json", initPageContent);
      } else {
        console.log("No services found in services.json")
      }
    });
  } else {
    console.log("No categories found in categories.json")
  }
}
// display array of markers on the map
function addLocationsToMap() {
  // add the markers to the map
  arrayOfLocations.forEach(markerData => {
    //console.log("Adding marker " + markerData.orgName + ", " + markerData.address + " to the map...");
    addSingleLocationToMap(markerData);
  });
  // show table with the markers
  updateResults();
}
// function to update the resultTable
function updateResults() {  
  console.log("updateResults...");
  // update resultCounter and resultTable
  if(arrayOfLocations.length > 0) {
    vueResultCounter.message = arrayOfLocations.length  + " " + getTranslatedLabel("result-found");
    vueResultTable.locations = arrayOfLocations;
    w3.sortHTML('#resultTable', '.item', 'td:nth-child(1')
  } else {
    vueResultCounter.message = getTranslatedLabel("no-result-found");
    vueResultTable.locations = [];
    w3.hide('#resultTable');
  } 
  console.log("vueResultCounter.message: " + vueResultCounter.message);
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
    title: markerData.orgName + ". " + getTranslatedLabel("more-info")
  });
  // create an infoWindow to be linked to the marker
  var infoWindowCode = "<strong>" + markerData.orgName + "</strong><br>";
  infoWindowCode += "<em>" + address + "</em><br><a href=\"" + markerData.orgWeb + "\">" + markerData.orgWeb + "</a><br>";
  infoWindowCode += "<a href=\"javascript:void(0)\" onClick=\"showLocationDetails(event, '" + markerData.ID + "')\">" + getTranslatedLabel("click-for-more-details") + "</a><br>";
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
  vueResultTable.onLocationClick(locationId);
  document.getElementById('loc-' + locationId).scrollIntoView();
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
// function to implement the language change
function onLanguageChange(language) {
  console.log("onLanguageChange: " + language);
  selectedLanguage = language;
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
// function to handle the different static message
function getTranslatedLabel(labelId){
  if("ES" == selectedLanguage) {
      switch(labelId){
        case 'no-result-found':
           return "No se ha encontrado ningún resultado";
        case 'result-found':
          return " resultado(s) encontrados";
        case 'click-for-more-details':
          return 'Pincha aquí para más detalles';
        case 'more-info':
          return 'Más información';
        default:
          console.log("Unknown labelId: " + labelId);
          return "";
      }
  } else if("EN" == selectedLanguage) {
        switch(labelId){
          case 'no-result-found':
            return "No results found";
          case 'result-found':
            return " result(s) found";
          case 'click-for-more-details':
            return 'Click here for more details';  
          case 'more-info':
            return 'More info';
          default:
            console.log("Unknown labelId: " + labelId);
            return "";
        }
  } else if("FR" == selectedLanguage) {
        switch(labelId){
          case 'no-result-found':
            return "Aucun résultat trouvé";
          case 'result-found':
            return " résultat(s) trouvé(s)";
          case 'click-for-more-details':
            return 'Click ici pour plus de détails'; 
          case 'more-info':
            return 'Plus d\'info'; 
          default:
            console.log("Unknown labelId: " + labelId);
            return "";
    }
  } else {
    console.log("Unknown language: " + selectedLanguage);
  }
}
// function to translate categories into labels
function translateArrayOfCategories(arrayOfCategories){
  console.log("translateArrayOfCategories: " + arrayOfCategories);
  return arrayOfCategories.map(x => originalArrayOfCategories[x][selectedLanguage]);
}

