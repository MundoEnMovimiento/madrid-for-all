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
  // function to update the resultTable
  function updateResultTable(arrayOfMarkers) {
    w3.displayObject("resultTable", { "records": arrayOfMarkers });
    w3.sortHTML('#resultTable', '.item', 'td:nth-child(1')
  }
  // adds a marker to the map.
  function addMarkerToMap(markerData) {
    // initialize variables
    var address = markerData.fullAddress;
    var markerPosition = new google.maps.LatLng(markerData.geocode);
    var marker = new google.maps.Marker({
      map: map,
      position: markerPosition,
      title: markerData.orgName + ". Click for more details"
    });
    // create an infoWindow to be linked to the marker
    var infowindow = new google.maps.InfoWindow({
      content: "<strong>" + markerData.orgName + "</strong><br><em>" + address + "</em><br><a href=\"" + markerData.orgWeb + "\">" + markerData.orgWeb + "</a>" // HTML contents of the InfoWindow
    });
    // add a Click Listener to our marker
    google.maps.event.addListener(marker, 'click', function () {
      infowindow.open(map, marker); // Open our InfoWindow
    });
  }
  // callback for the search by text
  function onTextSearchInput(inputValue) {
    w3.filterHTML('#resultTable', '.item', inputValue);
  }
  // callback for the search by text
  function onCategoryClick(selectedCategory) {
    console.log("Clicked on category " + selectedCategory);
    if (listOfSelectedCategories.includes(selectedCategory)) {
      // unselect category and search again
      listOfSelectedCategories.pop(selectedCategory);
      var element = document.getElementById(selectedCategory);
      element.classList.remove("w3-light-grey");
      findMarkersInDatabase();
    } else {
      // select category and search again
      listOfSelectedCategories.push(selectedCategory);
      var element = document.getElementById(selectedCategory);
      element.classList.add("w3-grey");
      findMarkersInDatabase();
    }
  }
  // function to update the list of results after a change in the search form
  function findMarkersInDatabase() {
    db.find({
      selector: { categories: { $elemMatch: { $in: listOfSelectedCategories } } },
      fields: ['_id', 'orgName', 'district', 'postalCode', 'languages'],
    }).then(function (result) {
      var arrayOfMarkers = result["docs"];
      console.log(arrayOfMarkers.length + " markers found for category '" + listOfSelectedCategories.toString() + "'.");
      // show table with the markers
      updateResultTable(arrayOfMarkers);
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
  function onResetClick(){
      console.log("Clicked on reset.")
      //document.getElementById("searchText").textContent = "";
      w3.toggleClass('.w3-grey','w3-grey','w3-light-grey')
      w3.toggleClass('.w3-show','w3-show','w3-hide')
  }
  // script to open and close sidebar
  function w3_open() {
    document.getElementById("mySidebar").style.display = "block";
    document.getElementById("myOverlay").style.display = "block";
  }
  function w3_close() {
    document.getElementById("mySidebar").style.display = "none";
    document.getElementById("myOverlay").style.display = "none";
  }
  // script to open or close an accordion in the left menu
  function toggleAccordionSection(id) {
    var x = document.getElementById(id);
    if (x.className.indexOf("w3-show") == -1) {
      x.className += " w3-show";
      x.previousElementSibling.className =
        x.previousElementSibling.className.replace("w3-light-grey", "w3-grey");
    } else {
      x.className = x.className.replace(" w3-show", "");
      x.previousElementSibling.className =
        x.previousElementSibling.className.replace("w3-grey", "w3-light-grey");
    }
  }