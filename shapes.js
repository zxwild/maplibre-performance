const getTmpSource = (mapInstance) => {
  const geoJson = {
    type: 'FeatureCollection',
    features: [],
  };

  const layers = [
    {
      id: 'tmp-fill-layer',
      type: 'fill',
      source: 'tmp-polygon-source',
      paint: {
        'fill-color': '#ff4949',
        'fill-opacity': 0.5,
      },
      filter: [
        'in',
        ['get', 'shape'],
        ['literal', ['circle']],
      ],
    },
    {
      id: 'tmp-line-layer',
      type: 'line',
      source: 'tmp-polygon-source',
      paint: {
        'line-color': '#079c00',
        'line-width': 2,
      },
      filter: [
        'in',
        ['get', 'shape'],
        ['literal', ['circle']],
      ],
    },
  ];

  mapInstance.addSource('tmp-polygon-source', { type: 'geojson', data: geoJson });
  mapInstance.addLayer(layers[0]);
  mapInstance.addLayer(layers[1]);

  return mapInstance.getSource('tmp-polygon-source');
};

const loadStressTestFeatureCollection = (mapInstance, step, size) => {
  const geoJson = {
    type: 'FeatureCollection',
    features: [],
  };

  const layers = [
    {
      id: 'fill-layer',
      type: 'fill',
      source: 'polygon-source',
      paint: {
        'fill-color': 'orange',
        'fill-opacity': 0.5,
      },
      filter: [
        'in',
        ['get', 'shape'],
        ['literal', ['circle']],
      ],
    },
    {
      id: 'line-layer',
      type: 'line',
      source: 'polygon-source',
      paint: {
        'line-color': '#0091b7',
        'line-width': 2,
      },
      filter: [
        'in',
        ['get', 'shape'],
        ['literal', ['circle']],
      ],
    },
  ];

  const createCircleFeature = (id, coords) => {
    const circleFeature = turf.circle(coords, size, { steps: 60, units: 'kilometers' });
    return {
      id,
      ...circleFeature,
      properties: {
        id,
        shape: 'circle'
      },
    };
  };

  let counter = 0;

  for (let lng = -10; lng < 10; lng += step) {
    for (let lat = 56; lat > 46; lat -= step) {
      const feature = createCircleFeature(counter, [lng, lat]);
      geoJson.features.push(feature);
      counter += 1;
    }
  }

  console.log('total features count', geoJson.features.length, geoJson);

  mapInstance.addSource('polygon-source', { type: 'geojson', data: geoJson });
  mapInstance.addLayer(layers[0]);
  mapInstance.addLayer(layers[1]);

  return mapInstance.getSource('polygon-source');
};
