// Map initialization
let map = L.map('map').setView([-3.06522, 114.6454817], 9);


// Layer Map Hybrid
let hybridLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    maxZoom: 25,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
});

// Add OpenStreetMap layer to map by default
hybridLayer.addTo(map);

// Layer control
let baseLayers = {
    "Hybrid" : hybridLayer
    
};


// Initial selected pangan
let selectedPangan = "PADI";

// Get color depending on production value
function getColor(d) {
    return d > 40000 ? '#00441b' : // Hijau sangat gelap
           d > 30000 ? '#238823' : // Hijau gelap
           d > 20000 ? '#41ab5d' : // Hijau tua
           d > 10000 ? '#78c679' : // Hijau
           d > 5000  ? '#addd8e' : // Hijau muda
           d > 1000  ? '#d9f0a3' : // Hijau terang
                      '#FFEDA0';   // Krim
}

// Style function
function style(feature) {
    return {
        fillColor: getColor(feature.properties.PANGAN[selectedPangan]),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

// Highlight feature
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

// Reset highlight
function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

// Zoom to feature
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

// onEachFeature function
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

map.attributionControl.addAttribution('Produksi Pangan &copy; <a href="https://baritokualakab.bps.go.id/">BPS Batola</a>');

// GeoJSON layer
let geojson;

function updateMap() {
    if (geojson) {
        map.removeLayer(geojson);
    }

    geojson = L.geoJson(batola, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);
}

// Info control
let info = L.control();

info.onAdd = function (_map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

// Method to update info control based on feature properties
info.update = function (props) {
    this._div.innerHTML = '<h4>Produksi Pangan di Kab. Batola 🌾</h4>' +  (props ?
        '<b>' + props.KECAMATAN + '</b><br />' + selectedPangan + ': ' + props.PANGAN[selectedPangan] + ' /ton'
        : 'Arahkan kursor ke Kecamatan');
};

// ADD to map info 
info.addTo(map);

// ADD to map Layer Control
L.control.layers(baseLayers).addTo(map);

// Legend control
let legend = L.control({position: 'bottomright'});

legend.onAdd = function (_map) {
    let div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1000, 5000, 10000, 20000, 30000, 40000],
        labels = [],
        from, to;

    for (let i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(
            '<i style="background:' + getColor(from + 1) + '"></i> ' +
            from + (to ? '&ndash;' + to : '+'));
    }

    div.innerHTML = labels.join('<br>');
    return div;
};

legend.addTo(map);

// Function to handle the dropdown change
document.getElementById('panganSelect').addEventListener('change', function() {
    selectedPangan = this.value;
    updateMap();
});

// Initial map update
updateMap();

L.easyPrint({
    title: 'Cetak Peta Kabupaten',
    position: 'topleft',
    sizeModes: ['A4Portrait', 'A4Landscape']
}).addTo(map);
