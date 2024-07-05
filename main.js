const mapInstance = createMap();

let source = null;
let geoJson = null;
let currentFeatureId = null;
let previousLngLat = null;


const getFeatureIdByMouseEvent = (event) => {
  const features = mapInstance.queryRenderedFeatures(event.point);
  if (features.length) {
    return features[0].properties.id;
  }

  return null;
};

const getLngLatDiff = (startLngLat,  endLngLat) => ({
  lng: startLngLat.lng - endLngLat.lng,
  lat: startLngLat.lat - endLngLat.lat,
});

const moveGeoJson = (geoJson, diff) => {
  turf.coordEach(geoJson, (currentCoord) => {
    currentCoord[0] += diff.lng;
    currentCoord[1] += diff.lat;
  }, true);
};

mapInstance.on('load', () => {
  // source = loadStressTestFeatureCollection(mapInstance, 3, 50);
  source = loadStressTestFeatureCollection(mapInstance, 0.2, 6);
  // source = loadStressTestFeatureCollection(mapInstance, 0.1, 3);

  geoJson = source.serialize().data;
  console.log('loaded', source, geoJson);
});

mapInstance.on('mousedown', (event) => {
  currentFeatureId = getFeatureIdByMouseEvent(event);

  if (currentFeatureId) {
    previousLngLat = event.lngLat;
    mapInstance.dragPan.disable();
  }
});

mapInstance.on('mousemove', _.throttle((event) => {
  if (!previousLngLat || !geoJson) {
    return;
  }

  const diff = getLngLatDiff(event.lngLat, previousLngLat);
  const shapeGeoJson = geoJson.features[currentFeatureId];
  moveGeoJson(shapeGeoJson, diff);

  source.updateData({
    update: [{
      id: currentFeatureId,
      newGeometry: shapeGeoJson.geometry,
    }],
  });
  previousLngLat = event.lngLat;
}, 30));

mapInstance.on('mouseup', (event) => {
  if (currentFeatureId) {
    mapInstance.dragPan.enable();
  }

  currentFeatureId = null;
  previousLngLat = null;
});
