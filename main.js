const mapInstance = createMap();

let mainSource = null;
let tmpSource = null;
let geoJson = null;
let tmpGeoJson = null;
let currentFeatureId = null;
let previousLngLat = null;


const getFeatureIdByMouseEvent = (event) => {
  const features = mapInstance.queryRenderedFeatures(event.point);
  if (features.length) {
    return features[0].properties.id;
  }

  return null;
};

const getLngLatDiff = (startLngLat, endLngLat) => ({
  lng: startLngLat.lng - endLngLat.lng,
  lat: startLngLat.lat - endLngLat.lat,
});

const moveGeoJson = (geoJson, diff) => {
  turf.coordEach(geoJson, (currentCoord) => {
    currentCoord[0] += diff.lng;
    currentCoord[1] += diff.lat;
  }, true);
};

const moveFeatureToTmpSource = (featureId) => {
  const feature = geoJson.features[featureId];

  delete geoJson.features[featureId];
  mainSource.updateData({ remove: [currentFeatureId] });

  tmpGeoJson.features[featureId] = feature;
  tmpSource.updateData({ add: [feature] });
};

const moveFeatureToMainSource = (featureId) => {
  const feature = tmpGeoJson.features[featureId];

  delete tmpGeoJson.features[featureId];
  tmpSource.updateData({ remove: [currentFeatureId] });

  geoJson.features[featureId] = feature;
  mainSource.updateData({ add: [feature] });
};

mapInstance.on('load', () => {
  // mainSource = loadStressTestFeatureCollection(mapInstance, 3, 50);
  // mainSource = loadStressTestFeatureCollection(mapInstance, 0.2, 6);
  mainSource = loadStressTestFeatureCollection(mapInstance, 0.1, 3);

  geoJson = mainSource.serialize().data;
  tmpSource = getTmpSource(mapInstance);
  tmpGeoJson = tmpSource.serialize().data;
  console.log('loaded', mainSource, geoJson, tmpSource);
});

mapInstance.on('mousedown', (event) => {
  currentFeatureId = getFeatureIdByMouseEvent(event);

  if (currentFeatureId) {
    moveFeatureToTmpSource(currentFeatureId);
    previousLngLat = event.lngLat;
    mapInstance.dragPan.disable();
  }
});

mapInstance.on('mousemove', _.throttle((event) => {
  if (!previousLngLat || !geoJson) {
    return;
  }

  const diff = getLngLatDiff(event.lngLat, previousLngLat);
  const shapeGeoJson = tmpGeoJson.features[currentFeatureId];
  moveGeoJson(shapeGeoJson, diff);

  tmpSource.updateData({
    update: [{
      id: currentFeatureId,
      newGeometry: shapeGeoJson.geometry,
    }],
  });
  previousLngLat = event.lngLat;
}, 10));

mapInstance.on('mouseup', (event) => {
  if (currentFeatureId) {
    moveFeatureToMainSource(currentFeatureId);
    mapInstance.dragPan.enable();
  }

  currentFeatureId = null;
  previousLngLat = null;
});
