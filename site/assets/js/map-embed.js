/* Minimal self-hosted GPX viewer with Mapbox GL JS
   Query params:
   - file: URL to GPX file
   - lat, lng, zoom, bearing, pitch: initial camera
   Requires window.MAPBOX_TOKEN set before load.
*/
(function() {
  function getParam(name, fallback) {
    const url = new URL(window.location.href);
    const v = url.searchParams.get(name);
    if (v === null || v === undefined || v === '') return fallback;
    return v;
  }

  const gpxUrl = getParam('file');
  if (!gpxUrl) {
    document.body.innerHTML = '<div style="padding:16px;font-family:Inter,system-ui,sans-serif">Missing ?file=… parameter</div>';
    return;
  }

  const lat = parseFloat(getParam('lat', '6.87504'));
  const lng = parseFloat(getParam('lng', '80.54264'));
  const zoom = parseFloat(getParam('zoom', '11.3'));
  const bearing = parseFloat(getParam('bearing', '-12'));
  const pitch = parseFloat(getParam('pitch', '61'));

  mapboxgl.accessToken = window.MAPBOX_TOKEN;

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: [lng, lat],
    zoom: zoom,
    bearing: bearing,
    pitch: pitch,
    attributionControl: true,
    hash: false,
    preserveDrawingBuffer: false,
    antialias: true
  });

  map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

  map.on('style.load', () => {
    // Enable 3D terrain and sky
    map.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512,
      maxzoom: 14
    });
    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.2 });
    map.addLayer({
      id: 'sky',
      type: 'sky',
      paint: { 'sky-type': 'atmosphere', 'sky-atmosphere-sun-intensity': 8 }
    });
  });

  async function loadGpx(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch GPX');
    const text = await res.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'application/xml');
    const trkpts = Array.from(xml.getElementsByTagName('trkpt'));
    const coords = trkpts.map(pt => [
      parseFloat(pt.getAttribute('lon')),
      parseFloat(pt.getAttribute('lat')),
      // elevation optional
      pt.getElementsByTagName('ele')[0] ? parseFloat(pt.getElementsByTagName('ele')[0].textContent) : 0
    ]);
    return coords;
  }

  function computeBounds(coords) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    coords.forEach(c => { const x = c[0], y = c[1]; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; });
    return [[minX, minY], [maxX, maxY]];
  }

  loadGpx(gpxUrl).then(coords => {
    const geojson = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } }
      ]
    };

    map.on('load', () => {
      // Add route source and styled layer (blue, similar to gpx.studio)
      map.addSource('route', { type: 'geojson', data: geojson });
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#1565D8', 'line-width': 4, 'line-opacity': 0.95 }
      });

      // Fit bounds with padding while preserving current pitch/bearing
      const b = computeBounds(coords);
      try {
        map.fitBounds(b, { padding: 40, duration: 800, pitch, bearing });
      } catch(e) {}
    });
  }).catch(err => {
    console.error(err);
    const el = document.getElementById('map');
    if (el) el.insertAdjacentHTML('afterend', '<div style="padding:12px;color:#b91c1c">Failed to load GPX.</div>');
  });
})();


