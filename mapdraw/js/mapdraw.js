var map, clipboard;	
var CRLF = "\n";

function init() {
    
    // weird FF behaviour - textarea does not refresh when you press F5
    var area = document.getElementById('resultsContentArea');
    area.value = "";
    
    map = L.map("mapDiv", {
        center: [0,0],
        zoom: 3
    });

    var basemap = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	   attribution: 'OpenStreetMap'
    }).addTo(map);

    var drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    var drawControl = new L.Control.Draw({
        edit: {
            featureGroup: drawnItems
        }
    });
    map.addControl(drawControl);

    map.on('draw:created', function (e) {
        var type = e.layerType,
            layer = e.layer;
        
        switch(type) {
            case 'marker':
                displayMarkerCode(layer);  
                break;
            case 'polyline':
                displayPolylineCode(layer);  
                break;
            case 'polygon':
                displayPolygonCode(layer);  
                break;
            case 'circle':
                displayCircleCode(layer);  
                break;   
            case 'rectangle':
                displayRectangleCode(layer);  
                break;
            default:
                alert('Input geometry not recognized!');
        }
        drawnItems.addLayer(layer);
    });
    
    map.on('draw:started', function () {
        clearResults();
    });   
    
    initClipboard();
}

function initClipboard() {
    clipboard = new Clipboard('.copyButton');
    clipboard.on('success', function(e) {
        console.log("Clip copied: " + e.text);
    });
    clipboard.on('error', function(e) {
        console.log("Clip error");        
    });   
}

function displayMarkerCode(layer) {
    var lat = layer.getLatLng().lat.toFixed(3);
    var lng = layer.getLatLng().lng.toFixed(3);
    var str = "var myMarker = L.marker([" + lng + ", " + lat + "]).addTo(map);" + CRLF;
    showResults(str);        
}

function displayPolylineCode(layer) {
    var latlngs = layer.getLatLngs();
    var str="var myPolyline = L.polyline([" + CRLF;
    var numPoints = latlngs.length;
    for(var i=0; i < numPoints; i++) {
        var lat = latlngs[i].lat.toFixed(3);
        var lng = latlngs[i].lng.toFixed(3);
        
        if (i < (numPoints-1)) {
            str += "\t[" + lng + ", " + lat + "]," + CRLF;
        } else {
            str += "\t[" + lng + ", " + lat + "]]" + CRLF;
        }              
    }
    str+= ").addTo(map);\n"
    showResults(str);        
}

function displayPolygonCode(layer) {
    var latlngs = layer.getLatLngs();
    var str="var myPolygon = L.polygon([" + CRLF;
    var numPoints = latlngs.length;
    for(var i=0; i < numPoints; i++) {
        var lat = latlngs[i].lat.toFixed(3);
        var lng = latlngs[i].lng.toFixed(3);
        
        if (i < (numPoints-1)) {
            str += "\t\t[" + lng + ", " + lat + "]," + CRLF;
        } else {
            str += "\t\t[" + lng + ", " + lat + "]]" + CRLF;
        }              
    }
    str += ").addTo(map);\n"
    showResults(str);
}

function displayCircleCode(layer) {
    var lat = layer.getLatLng().lat.toFixed(3);
    var lng = layer.getLatLng().lng.toFixed(3);
    var radius = layer.getRadius().toFixed(0);
    var str = "var myCircle = L.circle([" + lng + ", " + lat + "], " + radius + ").addTo(map);" + CRLF;
    showResults(str);    
}

function displayRectangleCode(layer) {
    var bounds = layer.getBounds();
    var latSW = bounds.getSouthWest().lat.toFixed(3);
    var lngSW = bounds.getSouthWest().lng.toFixed(3);
    var latNE = bounds.getNorthEast().lat.toFixed(3);
    var lngNE = bounds.getNorthEast().lng.toFixed(3);    
    var str = "var myRectangle = L.rectangle([" + lngSW + ", " + latSW + "], [" + lngNE + ", " + latNE + "]).addTo(map);" + CRLF;
    showResults(str);
}

function showResults(results) {
    var resultsContentArea = document.getElementById('resultsContentArea')
    resultsContentArea.value += results;
}

function clearResults() {
    var resultsContentArea = document.getElementById('resultsContentArea');
    resultsContentArea.value = "";
    map.eachLayer(function(layer) {
        if (!(layer instanceof L.TileLayer)) {
            map.removeLayer(layer);
        }
    });                  
}
