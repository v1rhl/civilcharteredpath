/* Catchment runoff tool (view "catchment").
   Indicative peak flow and runoff volume for one or more sub-catchments, with an optional
   LiDAR step that delineates a catchment from a terrain grid in the browser.
   Pure calculations are on window.Runoff (also usable from Node for testing);
   the page UI is built below and only runs in a browser. */
(function (root) {
  "use strict";

  /* ---------- Calculation core ---------- */
  var R = {};

  /* Rainfall depth (mm) for duration t (min) from a user depth-duration table,
     interpolated on log-log axes. Durations outside the table are clamped to its ends. */
  R.depthAt = function (table, t) {
    var rows = (table || []).filter(function (r) { return r && r.d > 0 && r.mm > 0; })
      .slice().sort(function (a, b) { return a.d - b.d; });
    if (!rows.length || !(t > 0)) return { mm: NaN, clamped: false, t: t };
    if (t <= rows[0].d) return { mm: rows[0].mm, clamped: t < rows[0].d, t: rows[0].d };
    var last = rows[rows.length - 1];
    if (t >= last.d) return { mm: last.mm, clamped: t > last.d, t: last.d };
    for (var k = 0; k < rows.length - 1; k++) {
      var a = rows[k], b = rows[k + 1];
      if (t >= a.d && t <= b.d) {
        var f = (Math.log(t) - Math.log(a.d)) / (Math.log(b.d) - Math.log(a.d));
        return { mm: Math.exp(Math.log(a.mm) + f * (Math.log(b.mm) - Math.log(a.mm))), clamped: false, t: t };
      }
    }
    return { mm: NaN, clamped: false, t: t };
  };

  /* Kirpich time of travel (min): L in metres, S in m/m. */
  R.kirpich = function (L, S) {
    if (!(L > 0) || !(S > 0)) return NaN;
    return 0.0195 * Math.pow(L, 0.77) * Math.pow(S, -0.385);
  };

  /* IH124-style mean annual flood (m3/s). Area in km2, SAAR in mm, SOIL as a fraction (SPR/100
     for a single soil class). Below 0.5 km2 it is worked out for 0.5 km2 and scaled by area. */
  R.qbar = function (areaKm2, saar, soil) {
    if (!(areaKm2 > 0) || !(saar > 0) || !(soil > 0)) return NaN;
    var a = Math.max(areaKm2, 0.5);
    var q = 0.00108 * Math.pow(a, 0.89) * Math.pow(saar, 1.17) * Math.pow(soil, 2.17);
    return areaKm2 < 0.5 ? q * areaKm2 / 0.5 : q;
  };

  /* One sub-catchment. p = project settings, s = sub-catchment inputs. */
  R.calcSub = function (p, s) {
    var A = +s.area, fi = Math.min(Math.max((+s.imp || 0) / 100, 0), 1);
    var L = +s.length, S = (+s.slope || 0) / 100;
    var cc = (+p.cc || 0) / 100;
    var cvol = fi * p.cImp + (1 - fi) * p.cPerv;           /* volumetric coefficient */
    var cPeak = cvol * (p.cr > 0 ? p.cr : 1);               /* with routing factor */
    var travel = s.tcOverride > 0 ? +s.tcOverride : R.kirpich(L, S);
    var tc = (+p.entry || 0) + travel;
    var dTc = R.depthAt(p.rain, tc);
    var i = dTc.mm / (dTc.t / 60) * (1 + cc);               /* mm/h at the duration used */
    var Q = 2.78 * cPeak * i * A;                           /* l/s */
    var qb = R.qbar(A / 100, p.saar, p.spr / 100) * 1000;   /* l/s */
    var qg = qb * (p.growth > 0 ? p.growth : 1);
    var dV = R.depthAt(p.rain, p.volDur);
    var depthV = dV.mm * (1 + cc);
    var Vdev = cvol * depthV / 1000 * A * 10000;            /* m3 */
    var Vgf = (p.spr / 100) * depthV / 1000 * A * 10000;    /* m3 */
    return { name: s.name, A: A, fi: fi, L: L, S: S, cvol: cvol, cPeak: cPeak, travel: travel, tc: tc,
      tUsed: dTc.t, depthTc: dTc.mm, tcClamped: dTc.clamped, i: i, Q: Q, qbar: qb, qg: qg,
      depthV: depthV, volClamped: dV.clamped, Vdev: Vdev, Vgf: Vgf, dVol: Vdev - Vgf,
      tcFromUser: s.tcOverride > 0 };
  };

  /* All sub-catchments plus two ways of combining them at one outlet. */
  R.calcAll = function (p, subs) {
    var rows = subs.filter(function (s) { return +s.area > 0; }).map(function (s) { return R.calcSub(p, s); });
    var tot = { A: 0, Q: 0, Vdev: 0, Vgf: 0, qg: 0, qbar: 0 };
    rows.forEach(function (r) { tot.A += r.A; tot.Q += r.Q; tot.Vdev += r.Vdev; tot.Vgf += r.Vgf; });
    var comb = null;
    if (rows.length) {
      var cw = 0, tcMax = 0;
      rows.forEach(function (r) { cw += r.cPeak * r.A; if (r.tc > tcMax) tcMax = r.tc; });
      var cBar = cw / tot.A, d = R.depthAt(p.rain, tcMax);
      var i = d.mm / (d.t / 60) * (1 + (+p.cc || 0) / 100);
      comb = { cBar: cBar, tc: tcMax, tUsed: d.t, i: i, Q: 2.78 * cBar * i * tot.A, clamped: d.clamped };
      tot.qbar = R.qbar(tot.A / 100, p.saar, p.spr / 100) * 1000;
      tot.qg = tot.qbar * (p.growth > 0 ? p.growth : 1);
    }
    return { rows: rows, tot: tot, comb: comb };
  };

  /* ---------- Coordinates (WGS84 <-> British National Grid, roughly 5 m accuracy) ---------- */
  var DEG = Math.PI / 180;
  function toCart(lat, lon, a, b) {
    var e2 = 1 - b * b / (a * a), s = Math.sin(lat), nu = a / Math.sqrt(1 - e2 * s * s);
    return [nu * Math.cos(lat) * Math.cos(lon), nu * Math.cos(lat) * Math.sin(lon), (1 - e2) * nu * s];
  }
  function fromCart(x, y, z, a, b) {
    var e2 = 1 - b * b / (a * a), p = Math.sqrt(x * x + y * y), lat = Math.atan2(z, p * (1 - e2)), prev = 2 * Math.PI;
    while (Math.abs(lat - prev) > 1e-12) { var nu = a / Math.sqrt(1 - e2 * Math.pow(Math.sin(lat), 2)); prev = lat; lat = Math.atan2(z + e2 * nu * Math.sin(lat), p); }
    return [lat, Math.atan2(y, x)];
  }
  function helmert(c, t) {
    var s = t.s * 1e-6, rx = t.rx / 3600 * DEG, ry = t.ry / 3600 * DEG, rz = t.rz / 3600 * DEG;
    return [t.tx + (1 + s) * c[0] - rz * c[1] + ry * c[2], t.ty + rz * c[0] + (1 + s) * c[1] - rx * c[2], t.tz - ry * c[0] + rx * c[1] + (1 + s) * c[2]];
  }
  var WGS = [6378137, 6356752.3142], AIRY = [6377563.396, 6356256.909];
  var TO_OSGB = { tx: -446.448, ty: 125.157, tz: -542.060, s: 20.4894, rx: -0.1502, ry: -0.2470, rz: -0.8421 };
  var TO_WGS = { tx: 446.448, ty: -125.157, tz: 542.060, s: -20.4894, rx: 0.1502, ry: 0.2470, rz: 0.8421 };
  var F0 = 0.9996012717, LAT0 = 49 * DEG, LON0 = -2 * DEG, N0 = -100000, E0 = 400000;
  function meridian(lat, a, b) {
    var n = (a - b) / (a + b), n2 = n * n, n3 = n2 * n, d = lat - LAT0, s = lat + LAT0;
    return b * F0 * ((1 + n + 1.25 * n2 + 1.25 * n3) * d - (3 * n + 3 * n2 + 21 / 8 * n3) * Math.sin(d) * Math.cos(s)
      + (15 / 8 * n2 + 15 / 8 * n3) * Math.sin(2 * d) * Math.cos(2 * s) - 35 / 24 * n3 * Math.sin(3 * d) * Math.cos(3 * s));
  }
  R.wgsToBng = function (latDeg, lonDeg) {
    var c = helmert(toCart(latDeg * DEG, lonDeg * DEG, WGS[0], WGS[1]), TO_OSGB);
    var ll = fromCart(c[0], c[1], c[2], AIRY[0], AIRY[1]), lat = ll[0], lon = ll[1];
    var a = AIRY[0], b = AIRY[1], e2 = 1 - b * b / (a * a), sn = Math.sin(lat), cs = Math.cos(lat), tn = Math.tan(lat);
    var nu = a * F0 / Math.sqrt(1 - e2 * sn * sn), rho = a * F0 * (1 - e2) / Math.pow(1 - e2 * sn * sn, 1.5), eta2 = nu / rho - 1;
    var M = meridian(lat, a, b), I = M + N0, II = nu / 2 * sn * cs, III = nu / 24 * sn * Math.pow(cs, 3) * (5 - tn * tn + 9 * eta2);
    var IIIA = nu / 720 * sn * Math.pow(cs, 5) * (61 - 58 * tn * tn + Math.pow(tn, 4)), IV = nu * cs;
    var V = nu / 6 * Math.pow(cs, 3) * (nu / rho - tn * tn), VI = nu / 120 * Math.pow(cs, 5) * (5 - 18 * tn * tn + Math.pow(tn, 4) + 14 * eta2 - 58 * tn * tn * eta2);
    var dl = lon - LON0;
    return { e: E0 + IV * dl + V * Math.pow(dl, 3) + VI * Math.pow(dl, 5), n: I + II * dl * dl + III * Math.pow(dl, 4) + IIIA * Math.pow(dl, 6) };
  };
  R.bngToWgs = function (E, N) {
    var a = AIRY[0], b = AIRY[1], e2 = 1 - b * b / (a * a), lat = LAT0, M = 0;
    do { lat = (N - N0 - M) / (a * F0) + lat; M = meridian(lat, a, b); } while (Math.abs(N - N0 - M) >= 0.00001);
    var sn = Math.sin(lat), cs = Math.cos(lat), tn = Math.tan(lat);
    var nu = a * F0 / Math.sqrt(1 - e2 * sn * sn), rho = a * F0 * (1 - e2) / Math.pow(1 - e2 * sn * sn, 1.5), eta2 = nu / rho - 1;
    var VII = tn / (2 * rho * nu), VIII = tn / (24 * rho * Math.pow(nu, 3)) * (5 + 3 * tn * tn + eta2 - 9 * tn * tn * eta2), IX = tn / (720 * rho * Math.pow(nu, 5)) * (61 + 90 * tn * tn + 45 * Math.pow(tn, 4));
    var X = 1 / (cs * nu), XI = 1 / (cs * 6 * Math.pow(nu, 3)) * (nu / rho + 2 * tn * tn), XII = 1 / (cs * 120 * Math.pow(nu, 5)) * (5 + 28 * tn * tn + 24 * Math.pow(tn, 4));
    var XIIA = 1 / (cs * 5040 * Math.pow(nu, 7)) * (61 + 662 * tn * tn + 1320 * Math.pow(tn, 4) + 720 * Math.pow(tn, 6));
    var dE = E - E0;
    var la = lat - VII * dE * dE + VIII * Math.pow(dE, 4) - IX * Math.pow(dE, 6);
    var lo = LON0 + X * dE - XI * Math.pow(dE, 3) + XII * Math.pow(dE, 5) - XIIA * Math.pow(dE, 7);
    var c = helmert(toCart(la, lo, AIRY[0], AIRY[1]), TO_WGS), ll = fromCart(c[0], c[1], c[2], WGS[0], WGS[1]);
    return { lat: ll[0] / DEG, lon: ll[1] / DEG };
  };

  /* "SK 012 813", "SK0120081300", or "401200, 381300" -> {e, n}; null if not understood. */
  R.parseLocation = function (txt) {
    var s = String(txt || "").trim().toUpperCase();
    var m = /^(\d{5,6}(?:\.\d+)?)\s*[, ]\s*(\d{5,7}(?:\.\d+)?)$/.exec(s);
    if (m) return { e: +m[1], n: +m[2] };
    m = /^([HJNOST])([A-HJ-Z])\s*([\d\s]*)$/.exec(s);
    if (!m) return null;
    var digits = m[3].replace(/\s+/g, "");
    if (digits.length % 2 || digits.length > 10) return null;
    var l1 = m[1].charCodeAt(0) - 65, l2 = m[2].charCodeAt(0) - 65;
    if (l1 > 7) l1--; if (l2 > 7) l2--;
    var e100 = ((l1 - 2) % 5) * 5 + (l2 % 5), n100 = (19 - Math.floor(l1 / 5) * 5) - Math.floor(l2 / 5);
    var h = digits.length / 2, unit = Math.pow(10, 5 - h);
    var e = h ? +digits.slice(0, h) * unit : 0, n = h ? +digits.slice(h) * unit : 0;
    return { e: e100 * 100000 + e + unit / 2 * (h ? 1 : 0), n: n100 * 100000 + n + unit / 2 * (h ? 1 : 0) };
  };

  /* ---------- Terrain grids ---------- */
  /* Grid object: { nx, ny, x0, y0 (lower-left corner), cell, z: Float32Array row-major from the top row, nodata } */
  R.parseAsc = function (text) {
    var lines = text.split(/\r?\n/), hdr = {}, k = 0;
    for (; k < lines.length; k++) {
      var m = /^\s*([a-zA-Z_]+)\s+(-?[\d.eE+-]+)\s*$/.exec(lines[k]);
      if (!m) break;
      hdr[m[1].toLowerCase()] = +m[2];
    }
    var nx = hdr.ncols, ny = hdr.nrows, cell = hdr.cellsize;
    if (!(nx > 0 && ny > 0 && cell > 0)) throw new Error("This doesn't look like an ESRI ASCII grid (.asc): the ncols, nrows and cellsize lines are missing.");
    var x0 = hdr.xllcorner != null ? hdr.xllcorner : hdr.xllcenter - cell / 2;
    var y0 = hdr.yllcorner != null ? hdr.yllcorner : hdr.yllcenter - cell / 2;
    var nod = hdr.nodata_value != null ? hdr.nodata_value : -9999;
    var z = new Float32Array(nx * ny), c = 0;
    var body = lines.slice(k).join(" ").trim().split(/\s+/);
    for (var j = 0; j < body.length && c < z.length; j++) { var v = +body[j]; z[c++] = (v === nod || !isFinite(v)) ? NaN : v; }
    if (c < z.length) throw new Error("The grid has fewer values than its header says (" + c + " of " + z.length + ").");
    return { nx: nx, ny: ny, x0: x0, y0: y0, cell: cell, z: z };
  };

  /* The Environment Agency WCS "text/plain" output: a GeoServer header then rows of values. */
  R.parseWcsText = function (text) {
    var g = /Grid range:\s*GridEnvelope2D\[0\.\.(\d+),\s*0\.\.(\d+)\]/.exec(text);
    var p = function (k) { var m = new RegExp('"' + k + '",\\s*(-?[\\d.eE+-]+)').exec(text); return m ? +m[1] : NaN; };
    if (!g) throw new Error("The terrain service sent something unexpected.");
    var nx = +g[1] + 1, ny = +g[2] + 1, dx = p("elt_0_0"), dy = p("elt_1_1"), cx = p("elt_0_2"), cy = p("elt_1_2");
    var cell = Math.abs(dx);
    var lines = text.split("\n"), z = new Float32Array(nx * ny), c = 0;
    for (var k = 0; k < lines.length && c < z.length; k++) {
      var ln = lines[k].trim();
      if (!/^-?[\d.]/.test(ln) || /[A-Za-z\[]/.test(ln.replace(/[eE][+-]?\d+/g, ""))) continue;
      var parts = ln.split(/\s+/);
      for (var j = 0; j < parts.length && c < z.length; j++) { var v = +parts[j]; z[c++] = (!isFinite(v) || v < -1000 || v > 5000) ? NaN : v; }
    }
    if (c < z.length) throw new Error("The terrain service sent fewer values than expected.");
    /* elt_0_2 / elt_1_2 are the centre of the top-left cell when the affine is pixel-centred */
    return { nx: nx, ny: ny, x0: cx - cell / 2, y0: cy + cell / 2 - ny * cell, cell: cell, z: z };
  };

  R.EA_WCS = "https://environment.data.gov.uk/spatialdata/lidar-composite-digital-terrain-model-dtm-1m/wcs";
  R.EA_COVERAGE = "13787b9a-26a4-4775-8523-806d13af58fc__Lidar_Composite_Elevation_DTM_1m";
  R.eaUrl = function (x0, y0, size, n) {
    return R.EA_WCS + "?service=WCS&version=2.0.1&request=GetCoverage&coverageId=" + R.EA_COVERAGE +
      "&subset=E(" + x0 + "," + (x0 + size) + ")&subset=N(" + y0 + "," + (y0 + size) + ")" +
      "&scaleSize=i(" + n + "),j(" + n + ")&format=text%2Fplain";
  };

  var DX = [1, 1, 0, -1, -1, -1, 0, 1], DY = [0, 1, 1, 1, 0, -1, -1, -1];  /* E, SE, S, SW, W, NW, N, NE (rows go down) */

  /* Priority-flood depression filling with a tiny gradient, D8 directions and flow accumulation. */
  R.analyse = function (g) {
    var nx = g.nx, ny = g.ny, n = nx * ny, z = g.z, zf = new Float64Array(n), done = new Uint8Array(n);
    var hi = new Int32Array(n), hk = new Float64Array(n), hn = 0;
    function push(i, k) { var c = hn++; while (c > 0) { var p = (c - 1) >> 1; if (hk[p] <= k) break; hi[c] = hi[p]; hk[c] = hk[p]; c = p; } hi[c] = i; hk[c] = k; }
    function pop() { var top = hi[0], li = hi[--hn], lk = hk[hn], c = 0; for (;;) { var l = 2 * c + 1; if (l >= hn) break; var r = l + 1, m = (r < hn && hk[r] < hk[l]) ? r : l; if (hk[m] >= lk) break; hi[c] = hi[m]; hk[c] = hk[m]; c = m; } hi[c] = li; hk[c] = lk; return top; }
    var valid = 0;
    for (var i = 0; i < n; i++) {
      if (isNaN(z[i])) { done[i] = 1; zf[i] = NaN; continue; }
      valid++;
      var x = i % nx, y = (i / nx) | 0, edge = x === 0 || y === 0 || x === nx - 1 || y === ny - 1;
      if (!edge) for (var d = 0; d < 8; d++) if (isNaN(z[i + DX[d] + DY[d] * nx])) { edge = true; break; }
      if (edge) { done[i] = 1; zf[i] = z[i]; push(i, z[i]); }
    }
    var eps = 1e-5;
    while (hn) {
      var c = pop(), cx = c % nx, cy = (c / nx) | 0;
      for (var d2 = 0; d2 < 8; d2++) {
        var xx = cx + DX[d2], yy = cy + DY[d2];
        if (xx < 0 || yy < 0 || xx >= nx || yy >= ny) continue;
        var j = xx + yy * nx; if (done[j]) continue;
        done[j] = 1; zf[j] = Math.max(z[j], zf[c] + eps); push(j, zf[j]);
      }
    }
    var dir = new Int8Array(n).fill(-1);
    for (var k = 0; k < n; k++) {
      if (isNaN(zf[k])) continue;
      var kx = k % nx, ky = (k / nx) | 0, best = 0, bd = -1;
      for (var e = 0; e < 8; e++) {
        var ex = kx + DX[e], ey = ky + DY[e];
        if (ex < 0 || ey < 0 || ex >= nx || ey >= ny) continue;
        var m = ex + ey * nx; if (isNaN(zf[m])) continue;
        var drop = (zf[k] - zf[m]) / (e % 2 ? Math.SQRT2 : 1);
        if (drop > best) { best = drop; bd = e; }
      }
      dir[k] = bd;
    }
    var indeg = new Int32Array(n), acc = new Float32Array(n), q = new Int32Array(n), qh = 0, qt = 0;
    for (var a = 0; a < n; a++) if (dir[a] >= 0) indeg[a + DX[dir[a]] + DY[dir[a]] * nx]++;
    for (var b = 0; b < n; b++) if (!isNaN(zf[b]) && indeg[b] === 0) q[qt++] = b;
    while (qh < qt) { var u = q[qh++]; acc[u] += 1; if (dir[u] >= 0) { var v = u + DX[dir[u]] + DY[dir[u]] * nx; acc[v] += acc[u]; if (--indeg[v] === 0) q[qt++] = v; } }
    var maxAcc = 0; for (var t = 0; t < n; t++) if (acc[t] > maxAcc) maxAcc = acc[t];
    return { zf: zf, dir: dir, acc: acc, valid: valid, maxAcc: maxAcc };
  };

  /* Move a clicked cell to the highest-accumulation cell within r cells, so clicks land on the flow line. */
  R.snap = function (g, an, i, r) {
    var nx = g.nx, cx = i % nx, cy = (i / nx) | 0, best = i;
    for (var y = Math.max(0, cy - r); y <= Math.min(g.ny - 1, cy + r); y++)
      for (var x = Math.max(0, cx - r); x <= Math.min(nx - 1, cx + r); x++) {
        var j = x + y * nx; if (an.acc[j] > an.acc[best]) best = j;
      }
    return best;
  };

  /* Upstream area of an outlet cell, longest D8 flow path and slopes along it. */
  R.catchment = function (g, an, outlet) {
    var nx = g.nx, ny = g.ny, n = nx * ny, mask = new Uint8Array(n), dist = new Float64Array(n), q = new Int32Array(n), qh = 0, qt = 0;
    mask[outlet] = 1; q[qt++] = outlet;
    while (qh < qt) {
      var c = q[qh++], cx = c % nx, cy = (c / nx) | 0;
      for (var d = 0; d < 8; d++) {
        var x = cx + DX[d], y = cy + DY[d]; if (x < 0 || y < 0 || x >= nx || y >= ny) continue;
        var j = x + y * nx; if (mask[j] || an.dir[j] < 0) continue;
        if (j + DX[an.dir[j]] + DY[an.dir[j]] * nx === c) { mask[j] = 1; dist[j] = dist[c] + g.cell * (an.dir[j] % 2 ? Math.SQRT2 : 1); q[qt++] = j; }
      }
    }
    var far = outlet; for (var k = 0; k < qt; k++) if (dist[q[k]] > dist[far]) far = q[k];
    var path = [far], p = far;
    while (p !== outlet && an.dir[p] >= 0) { p = p + DX[an.dir[p]] + DY[an.dir[p]] * nx; path.push(p); }
    var L = dist[far], zTop = g.z[far], zOut = g.z[outlet];
    function zAt(frac) { /* elevation at a fraction of the path length measured up from the outlet */
      var target = L * frac, best = outlet; for (var m = 0; m < path.length; m++) if (Math.abs(dist[path[m]] - target) < Math.abs(dist[best] - target)) best = path[m];
      return g.z[best];
    }
    var t, s1085 = L > 0 ? (zAt(0.85) - zAt(0.10)) / (0.75 * L) : NaN;
    return { mask: mask, cells: qt, area: qt * g.cell * g.cell, path: path, L: L, zTop: zTop, zOut: zOut,
      slope: L > 0 ? (zTop - zOut) / L : NaN, slope1085: s1085, touchesEdge: (mask[outlet] = 0, t = edgeTouch(mask, nx, ny), mask[outlet] = 1, t) };
  };
  function edgeTouch(mask, nx, ny) {
    for (var x = 0; x < nx; x++) if (mask[x] || mask[x + (ny - 1) * nx]) return true;
    for (var y = 0; y < ny; y++) if (mask[y * nx] || mask[nx - 1 + y * nx]) return true;
    return false;
  }

  root.Runoff = R;
  if (typeof module !== "undefined" && module.exports) module.exports = R;
  root.CP_TOOLS = (root.CP_TOOLS || []).concat([{ id: "catchment", label: "Catchment runoff", blurb: "Peak flow and runoff volume for sub-catchments, with an optional LiDAR step that finds the catchment for you (England)." }]);

  if (typeof document === "undefined") return;

  /* ---------- Page ---------- */
  var mount = document.getElementById("catchment-app");
  if (!mount) return;
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function f(x, dp) { return isFinite(x) ? (+x).toLocaleString("en-GB", { minimumFractionDigits: dp, maximumFractionDigits: dp }) : "–"; }
  function load() { try { return JSON.parse(localStorage.getItem("cp-catchment") || "null"); } catch (e) { return null; } }
  function save() { try { localStorage.setItem("cp-catchment", JSON.stringify(state)); } catch (e) {} }

  function example() {
    return {
      p: { label: "1 in 100 year", cc: 40, cImp: 0.9, cPerv: 0.3, cr: 1.0, entry: 5, saar: 700, spr: 30, growth: 3.2, volDur: 360,
        rain: [{ d: 5, mm: 9 }, { d: 10, mm: 13.5 }, { d: 15, mm: 17 }, { d: 30, mm: 22 }, { d: 60, mm: 28 }, { d: 120, mm: 35 }, { d: 360, mm: 49 }, { d: 1440, mm: 75 }] },
      subs: [
        { name: "Car park and roofs", area: 0.8, imp: 95, length: 120, slope: 1.5, tcOverride: "" },
        { name: "Landscaped area", area: 0.6, imp: 10, length: 90, slope: 4, tcOverride: "" },
        { name: "Upstream field", area: 2.5, imp: 0, length: 260, slope: 3, tcOverride: "" }
      ],
      sel: 0
    };
  }
  var state = load() || example();

  var css = [
    "#view-catchment .ct-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); }",
    "#view-catchment .ct-fields { display: grid; gap: 10px 12px; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }",
    "#view-catchment .ct-fields .field { justify-content: flex-end; }",
    "#view-catchment .ct-fields .field span { font-size: 0.8rem; color: var(--muted); min-height: 3.6em; }",
    "#view-catchment .ct-rain td { padding-top: 3px; padding-bottom: 3px; }",
    "#view-catchment input[type=number], #view-catchment input[type=text] { width: 100%; min-width: 0; }",
    "#view-catchment table.ct-t { min-width: 640px; }",
    "#view-catchment table.ct-t th { text-align: left; font: 600 0.8rem var(--font-body); color: var(--muted); padding: 6px 8px 6px 0; vertical-align: bottom; }",
    "#view-catchment table.ct-t td { width: auto; font-weight: 400; color: var(--ink); padding: 6px 8px 6px 0; vertical-align: middle; }",
    "#view-catchment table.ct-t td.num, #view-catchment table.ct-t th.num { text-align: right; font-family: var(--font-mono); font-variant-numeric: tabular-nums; }",
    "#view-catchment table.ct-t tr.tot td { font-weight: 700; border-top: 2px solid var(--line); }",
    "#view-catchment table.ct-t tr.sel td { background: var(--accent-soft); }",
    "#view-catchment table.ct-in input { padding: 6px 8px; }",
    "#view-catchment .ct-rain td input { max-width: 110px; }",
    "#view-catchment .ct-row-btn { background: none; border: 1px solid var(--line); border-radius: var(--radius); color: var(--muted); cursor: pointer; padding: 4px 8px; font: 600 0.8rem var(--font-body); }",
    "#view-catchment .ct-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }",
    "#view-catchment .ct-work { font: 500 0.86rem/1.7 var(--font-mono); white-space: pre-wrap; overflow-x: auto; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 12px; margin: 0; }",
    "#view-catchment .ct-flag { color: var(--flag); font-weight: 600; }",
    "#view-catchment .ct-big { display: flex; gap: 10px; flex-wrap: wrap; }",
    "#view-catchment .ct-big div { flex: 1 1 150px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 10px 12px; }",
    "#view-catchment .ct-big b { display: block; font: 700 1.35rem var(--font-display); }",
    "#view-catchment .ct-big span { font-size: 0.8rem; color: var(--muted); }",
    "#view-catchment .ct-terrain { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr); align-items: start; }",
    "@media (max-width: 820px) { #view-catchment .ct-terrain { grid-template-columns: minmax(0, 1fr); } }",
    "#view-catchment #ct-map { height: 320px; border: 1px solid var(--line); border-radius: var(--radius); }",
    "#view-catchment canvas#ct-dem { width: 100%; height: auto; display: block; border: 1px solid var(--line); border-radius: var(--radius); cursor: crosshair; background: var(--surface); touch-action: manipulation; }",
    "#view-catchment .ct-legend { display: flex; gap: 12px; flex-wrap: wrap; font-size: 0.8rem; color: var(--muted); }",
    "#view-catchment .ct-legend i { display: inline-block; width: 12px; height: 12px; border-radius: 2px; margin-right: 4px; vertical-align: -1px; }",
    "#view-catchment details.ct-more > summary { cursor: pointer; font-weight: 600; color: var(--accent); }"
  ].join("\n");
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  var P_FIELDS = [
    ["label", "Return period (label)", "text", "Shown on results and the CSV only."],
    ["cc", "Climate change allowance (%)", "number", "Uplift on rainfall. Use the allowance that applies to your site."],
    ["cImp", "Runoff coefficient, impermeable", "number", "Fraction of rain that runs off hard surfaces."],
    ["cPerv", "Runoff coefficient, permeable", "number", "Fraction that runs off grass, soil and planting."],
    ["cr", "Routing factor", "number", "1.0 for the plain rational method. Raise it if your method applies one."],
    ["entry", "Time of entry (min)", "number", "Added to the travel time in every sub-catchment."],
    ["saar", "SAAR (mm)", "number", "Standard average annual rainfall for the site."],
    ["spr", "SPR, standard percentage runoff (%)", "number", "From the soil type. Also used for greenfield volume."],
    ["growth", "Growth factor (QT / QBAR)", "number", "From the growth curve for your region and return period."],
    ["volDur", "Storm duration for volume (min)", "number", "Volumes are worked out for this one storm."]
  ];

  mount.innerHTML =
    '<div class="notice"><div><strong>Indicative only.</strong> <p>Use this for early sizing, checking a consultant\'s numbers or revising methods. It does not reproduce or claim compliance with any standard. Check every input and result against the governing documents for your project (for example the SuDS Manual, the FEH and the local authority\'s requirements) before relying on it.</p></div></div>' +
    '<div class="panel tool"><div class="ct-actions" style="justify-content:space-between"><h3>1. Design rainfall</h3><button type="button" class="btn ghost" id="ct-example">Reset to worked example</button></div>' +
    '<p class="small">Enter rainfall depths for your site and return period, for example from the FEH web service or your client\'s data. <b>The example depths are made up</b> to show how the tool works; they are not real rainfall for anywhere. Intensity at any duration is read off this table on log-log axes.</p>' +
    '<div class="table-wrap"><table class="ct-t ct-in ct-rain" style="min-width:0;max-width:420px"><thead><tr><th>Duration (min)</th><th>Depth (mm)</th><th class="num">Intensity (mm/h)</th><th></th></tr></thead><tbody id="ct-rain"></tbody></table></div>' +
    '<div class="ct-actions"><button type="button" class="ct-row-btn" id="ct-rain-add">Add duration</button></div></div>' +
    '<div class="panel tool"><h3>2. Assumptions</h3><div class="ct-fields" id="ct-pfields"></div></div>' +
    '<div class="panel tool"><h3>3. Sub-catchments</h3><p class="small">One row per area draining to the outlet. Length and slope are along the longest flow path. Leave the travel time blank to use Kirpich, or type your own. Tap a row\'s name in the results to see its working.</p>' +
    '<div class="table-wrap"><table class="ct-t ct-in"><thead><tr><th>Name</th><th>Area (ha)</th><th>Impermeable (%)</th><th>Flow path length (m)</th><th>Slope (%)</th><th>Travel time override (min)</th><th></th></tr></thead><tbody id="ct-subs"></tbody></table></div>' +
    '<div class="ct-actions"><button type="button" class="ct-row-btn" id="ct-sub-add">Add sub-catchment</button></div>' +
    '<details class="ct-more" id="ct-lidar-box"><summary>Find a catchment from LiDAR (England)</summary><div id="ct-lidar" style="display:flex;flex-direction:column;gap:12px;margin-top:12px"></div></details></div>' +
    '<div class="panel"><div class="ct-actions" style="justify-content:space-between"><h3>4. Results</h3><div class="ct-actions"><a class="btn ghost" id="ct-pipe" href="#pipeflow">Size a pipe for this flow</a><a class="btn ghost" id="ct-culvert" href="#culvert">Check a culvert for this flow</a><button type="button" class="btn" id="ct-csv">Download CSV</button></div></div>' +
    '<div class="ct-big" id="ct-big"></div><div class="table-wrap"><table class="ct-t"><thead><tr><th>Sub-catchment</th><th class="num">Area (ha)</th><th class="num">C</th><th class="num">Tc (min)</th><th class="num">i (mm/h)</th><th class="num">Peak Q (l/s)</th><th class="num">Greenfield Q (l/s)</th><th class="num">Runoff vol (m³)</th><th class="num">Greenfield vol (m³)</th><th class="num">Extra vol (m³)</th></tr></thead><tbody id="ct-res"></tbody></table></div>' +
    '<p class="small" id="ct-flags"></p></div>' +
    '<div class="panel ref"><h3>Working and equations</h3><pre class="ct-work" id="ct-work"></pre>' +
    '<h3>Assumptions and limits</h3><ul class="small" style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px">' +
    '<li>Peak flow uses the rational method, Q = 2.78 C i A (Q in l/s, i in mm/h, A in ha). It suits small catchments, roughly up to a few hundred hectares, and assumes rain falls evenly over the whole area for at least the time of concentration.</li>' +
    '<li>C is an area-weighted mix of the impermeable and permeable coefficients, times the routing factor. Volumes use the same mix without the routing factor.</li>' +
    '<li>Time of concentration is the time of entry plus a travel time. Kirpich (t = 0.0195 L^0.77 S^-0.385, t in min, L in m, S in m/m) was fitted to small rural catchments; for piped or urban areas, enter a travel time from pipe velocities instead.</li>' +
    '<li>Rainfall depths outside your table are not extrapolated: the nearest duration is used and flagged.</li>' +
    '<li>Greenfield peak uses the IH124 regression for QBAR with SOIL taken as SPR/100 (one soil class), times your growth factor. Below 50 ha it is worked out for 50 ha and scaled by area, as is common practice. Greenfield volume is SPR × rainfall depth × area.</li>' +
    '<li>Combined outlet flow: the sum of sub-catchment peaks is conservative because each peaks at a different time. The combined row uses the area-weighted C and the longest Tc.</li>' +
    '<li>Nothing here models storage, infiltration, pipe surcharge or exceedance routes.</li></ul></div>';

  /* ----- Inputs ----- */
  function renderRain() {
    $("ct-rain").innerHTML = state.p.rain.map(function (r, k) {
      var i = r.mm / (r.d / 60) * (1 + state.p.cc / 100);
      return '<tr><td><input type="number" min="1" step="any" data-rain="' + k + '" data-k="d" value="' + esc(r.d) + '" aria-label="Duration in minutes"></td>' +
        '<td><input type="number" min="0" step="any" data-rain="' + k + '" data-k="mm" value="' + esc(r.mm) + '" aria-label="Depth in mm"></td>' +
        '<td class="num">' + f(i, 1) + '</td><td><button type="button" class="ct-row-btn" data-rain-del="' + k + '" aria-label="Remove duration">Remove</button></td></tr>';
    }).join("");
  }
  function renderP() {
    $("ct-pfields").innerHTML = P_FIELDS.map(function (x) {
      return '<div class="field"><label for="ct-p-' + x[0] + '">' + x[1] + '</label><input id="ct-p-' + x[0] + '" type="' + x[2] + '"' + (x[2] === "number" ? ' step="any"' : "") + ' data-p="' + x[0] + '" value="' + esc(state.p[x[0]]) + '"><span>' + x[3] + "</span></div>";
    }).join("");
  }
  function renderSubs() {
    $("ct-subs").innerHTML = state.subs.map(function (s, k) {
      function inp(key, type, label) { return '<td><input type="' + type + '"' + (type === "number" ? ' step="any" min="0"' : "") + ' data-sub="' + k + '" data-k="' + key + '" value="' + esc(s[key]) + '" aria-label="' + label + '"></td>'; }
      return "<tr>" + inp("name", "text", "Name") + inp("area", "number", "Area in hectares") + inp("imp", "number", "Impermeable percentage") + inp("length", "number", "Flow path length in metres") +
        inp("slope", "number", "Slope in percent") + inp("tcOverride", "number", "Travel time override in minutes") +
        '<td><button type="button" class="ct-row-btn" data-sub-del="' + k + '" aria-label="Remove sub-catchment">Remove</button></td></tr>';
    }).join("");
  }
  function num(v) { return v === "" || v == null ? "" : +v; }
  function params() {
    var p = {}; Object.keys(state.p).forEach(function (k) { p[k] = k === "label" || k === "rain" ? state.p[k] : +state.p[k]; });
    p.rain = state.p.rain.map(function (r) { return { d: +r.d, mm: +r.mm }; });
    return p;
  }

  /* ----- Results ----- */
  var last = null;
  function calc() {
    var p = params(), subs = state.subs.map(function (s) { return { name: s.name, area: +s.area, imp: +s.imp, length: +s.length, slope: +s.slope, tcOverride: s.tcOverride === "" ? 0 : +s.tcOverride }; });
    var res = R.calcAll(p, subs); last = { p: p, res: res };
    var rows = res.rows, tot = res.tot, c = res.comb;
    if (state.sel >= rows.length) state.sel = 0;
    $("ct-res").innerHTML = rows.map(function (r, k) {
      return '<tr' + (k === state.sel ? ' class="sel"' : "") + '><td><a href="#catchment" data-sel="' + k + '">' + esc(r.name || "Sub-catchment " + (k + 1)) + "</a></td>" +
        '<td class="num">' + f(r.A, 2) + '</td><td class="num">' + f(r.cPeak, 2) + '</td><td class="num">' + f(r.tc, 1) + (r.tcClamped ? '<span class="ct-flag">*</span>' : "") + '</td><td class="num">' + f(r.i, 1) +
        '</td><td class="num">' + f(r.Q, 1) + '</td><td class="num">' + f(r.qg, 1) + '</td><td class="num">' + f(r.Vdev, 0) + '</td><td class="num">' + f(r.Vgf, 0) + '</td><td class="num">' + f(r.dVol, 0) + "</td></tr>";
    }).join("") + (rows.length ? '<tr class="tot"><td>Total (sum of peaks)</td><td class="num">' + f(tot.A, 2) + '</td><td></td><td></td><td></td><td class="num">' + f(tot.Q, 1) + '</td><td class="num">' + f(tot.qg, 1) + '</td><td class="num">' + f(tot.Vdev, 0) + '</td><td class="num">' + f(tot.Vgf, 0) + '</td><td class="num">' + f(tot.Vdev - tot.Vgf, 0) + "</td></tr>" +
      '<tr><td>Combined at outlet</td><td class="num">' + f(tot.A, 2) + '</td><td class="num">' + f(c.cBar, 2) + '</td><td class="num">' + f(c.tc, 1) + (c.clamped ? '<span class="ct-flag">*</span>' : "") + '</td><td class="num">' + f(c.i, 1) + '</td><td class="num">' + f(c.Q, 1) + "</td><td></td><td></td><td></td><td></td></tr>" : '<tr><td colspan="10" class="small">Add a sub-catchment with an area to see results.</td></tr>');
    $("ct-big").innerHTML = rows.length ?
      '<div><span>Peak flow, combined at outlet</span><b>' + f(c.Q, 0) + ' l/s</b><span>' + esc(p.label) + " + " + f(p.cc, 0) + "% climate change</span></div>" +
      '<div><span>Greenfield peak, same area</span><b>' + f(tot.qg, 1) + ' l/s</b><span>QBAR ' + f(tot.qbar, 1) + " l/s × " + f(p.growth, 2) + "</span></div>" +
      '<div><span>Runoff volume, ' + f(p.volDur, 0) + ' min storm</span><b>' + f(tot.Vdev, 0) + ' m³</b><span>' + f(tot.Vdev - tot.Vgf, 0) + " m³ more than greenfield</span></div>" : "";
    var flags = [];
    if (rows.some(function (r) { return r.tcClamped; }) || (c && c.clamped)) flags.push('<span class="ct-flag">*</span> Tc is outside your rainfall table, so the nearest duration was used. Add a shorter or longer duration.');
    if (rows.some(function (r) { return r.volClamped; })) flags.push("The volume storm duration is outside your rainfall table; the nearest duration was used.");
    if (tot.A > 200) flags.push("The total area is large for the rational method. Consider a hydrograph method.");
    $("ct-flags").innerHTML = flags.join(" ");
    var pipe = $("ct-pipe"); if (c) pipe.href = "#pipeflow?Q=" + Math.round(c.Q);
    var culv = $("ct-culvert"); if (culv && c) culv.href = "#culvert?Qls=" + Math.round(c.Q);
    window.CPCatchment = { peakLs: function () { return c ? c.Q : null; } }; /* read by the culvert tool */
    renderWork();
    save();
  }
  function renderWork() {
    var p = last.p, rows = last.res.rows, r = rows[state.sel];
    if (!r) { $("ct-work").textContent = "No sub-catchment selected."; return; }
    var lines = [
      "Sub-catchment: " + (r.name || "Sub-catchment " + (state.sel + 1)) + "    (" + p.label + ", +" + f(p.cc, 0) + "% climate change)",
      "",
      "Runoff coefficient",
      "  C_vol = f_imp × C_imp + (1 − f_imp) × C_perm = " + f(r.fi, 2) + " × " + f(p.cImp, 2) + " + " + f(1 - r.fi, 2) + " × " + f(p.cPerv, 2) + " = " + f(r.cvol, 3),
      "  C     = C_vol × routing factor = " + f(r.cvol, 3) + " × " + f(p.cr, 2) + " = " + f(r.cPeak, 3),
      "",
      "Time of concentration",
      r.tcFromUser ? "  travel time = " + f(r.travel, 1) + " min (entered)" :
        "  travel time (Kirpich) = 0.0195 × L^0.77 × S^−0.385 = 0.0195 × " + f(r.L, 0) + "^0.77 × " + f(r.S, 4) + "^−0.385 = " + f(r.travel, 1) + " min",
      "  Tc = time of entry + travel time = " + f(p.entry, 1) + " + " + f(r.travel, 1) + " = " + f(r.tc, 1) + " min",
      "",
      "Rainfall intensity",
      "  depth at " + f(r.tUsed, 1) + " min (log-log from your table) = " + f(r.depthTc, 1) + " mm" + (r.tcClamped ? "   * Tc outside table, nearest duration used" : ""),
      "  i = depth ÷ duration × (1 + CC) = " + f(r.depthTc, 1) + " ÷ " + f(r.tUsed / 60, 3) + " h × " + f(1 + p.cc / 100, 2) + " = " + f(r.i, 1) + " mm/h",
      "",
      "Peak flow (rational method)",
      "  Q = 2.78 × C × i × A = 2.78 × " + f(r.cPeak, 3) + " × " + f(r.i, 1) + " × " + f(r.A, 3) + " = " + f(r.Q, 1) + " l/s",
      "",
      "Greenfield peak (IH124 regression)",
      "  QBAR = 0.00108 × AREA^0.89 × SAAR^1.17 × SOIL^2.17, AREA in km², worked at max(AREA, 0.5 km²) then scaled by area",
      "       = " + f(r.qbar, 2) + " l/s   (AREA " + f(r.A / 100, 4) + " km², SAAR " + f(p.saar, 0) + " mm, SOIL " + f(p.spr / 100, 2) + ")",
      "  Q_T = QBAR × growth factor = " + f(r.qbar, 2) + " × " + f(p.growth, 2) + " = " + f(r.qg, 2) + " l/s",
      "",
      "Runoff volume, " + f(p.volDur, 0) + " min storm",
      "  depth = " + f(r.depthV, 1) + " mm including climate change",
      "  V = C_vol × depth × A = " + f(r.cvol, 3) + " × " + f(r.depthV / 1000, 4) + " m × " + f(r.A * 10000, 0) + " m² = " + f(r.Vdev, 0) + " m³",
      "  V_greenfield = SPR × depth × A = " + f(p.spr / 100, 2) + " × " + f(r.depthV / 1000, 4) + " × " + f(r.A * 10000, 0) + " = " + f(r.Vgf, 0) + " m³",
      "  Extra volume = " + f(r.dVol, 0) + " m³"
    ];
    $("ct-work").textContent = lines.join("\n");
  }

  /* ----- CSV ----- */
  function csvCell(v) { var s = String(v == null ? "" : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
  function exportCsv() {
    var p = last.p, res = last.res, rows = [];
    rows.push(["Catchment runoff (indicative only, check against the governing documents)"]);
    rows.push(["Exported", new Date().toISOString().slice(0, 16).replace("T", " ")]);
    rows.push([]);
    P_FIELDS.forEach(function (x) { rows.push([x[1], p[x[0]]]); });
    rows.push([]); rows.push(["Rainfall duration (min)", "Depth (mm)"]);
    p.rain.forEach(function (r) { rows.push([r.d, r.mm]); });
    rows.push([]);
    rows.push(["Sub-catchment", "Area (ha)", "Impermeable (%)", "Flow path length (m)", "Slope (%)", "C_vol", "C", "Travel time (min)", "Tc (min)", "Duration used (min)", "Depth at Tc (mm)", "i incl CC (mm/h)", "Peak Q (l/s)", "QBAR (l/s)", "Greenfield Q (l/s)", "Volume storm depth incl CC (mm)", "Runoff volume (m3)", "Greenfield volume (m3)", "Extra volume (m3)"]);
    res.rows.forEach(function (r) {
      rows.push([r.name, r.A, r.fi * 100, r.L, r.S * 100, r.cvol.toFixed(3), r.cPeak.toFixed(3), r.travel.toFixed(2), r.tc.toFixed(2), r.tUsed.toFixed(2), r.depthTc.toFixed(2), r.i.toFixed(2), r.Q.toFixed(2), r.qbar.toFixed(3), r.qg.toFixed(3), r.depthV.toFixed(2), r.Vdev.toFixed(1), r.Vgf.toFixed(1), r.dVol.toFixed(1)]);
    });
    if (res.comb) {
      rows.push(["Total (sum of peaks)", res.tot.A, "", "", "", "", "", "", "", "", "", "", res.tot.Q.toFixed(2), res.tot.qbar.toFixed(3), res.tot.qg.toFixed(3), "", res.tot.Vdev.toFixed(1), res.tot.Vgf.toFixed(1), (res.tot.Vdev - res.tot.Vgf).toFixed(1)]);
      rows.push(["Combined at outlet", res.tot.A, "", "", "", "", res.comb.cBar.toFixed(3), "", res.comb.tc.toFixed(2), res.comb.tUsed.toFixed(2), "", res.comb.i.toFixed(2), res.comb.Q.toFixed(2)]);
    }
    rows.push([]);
    rows.push(["Peak flow: Q = 2.78 C i A (rational method). Tc = time of entry + travel time (Kirpich unless entered). QBAR: IH124 regression with SOIL = SPR/100; worked at 50 ha and scaled below that."]);
    if (window.CPExport && typeof window.CPExport.csv === "function") { window.CPExport.csv("catchment-runoff.csv", rows); return; }
    var text = rows.map(function (r) { return r.map(csvCell).join(","); }).join("\r\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + text], { type: "text/csv;charset=utf-8" }));
    a.download = "catchment-runoff.csv"; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  /* ----- Events ----- */
  mount.addEventListener("input", function (e) {
    var t = e.target, d = t.dataset;
    if (d.p) { state.p[d.p] = t.type === "number" ? num(t.value) : t.value; if (d.p === "cc") renderRainIntensities(); }
    else if (d.rain != null) { state.p.rain[+d.rain][d.k] = num(t.value); renderRainIntensities(); }
    else if (d.sub != null) { state.subs[+d.sub][d.k] = t.type === "number" ? num(t.value) : t.value; }
    else return;
    calc();
  });
  function renderRainIntensities() {
    Array.prototype.forEach.call($("ct-rain").rows, function (tr, k) { var r = state.p.rain[k]; tr.cells[2].textContent = f(r.mm / (r.d / 60) * (1 + state.p.cc / 100), 1); });
  }
  mount.addEventListener("click", function (e) {
    var t = e.target.closest("button, a"); if (!t) return;
    if (t.dataset.rainDel != null) { state.p.rain.splice(+t.dataset.rainDel, 1); renderRain(); calc(); }
    else if (t.dataset.subDel != null) { state.subs.splice(+t.dataset.subDel, 1); renderSubs(); calc(); }
    else if (t.dataset.sel != null) { e.preventDefault(); state.sel = +t.dataset.sel; calc(); }
    else if (t.id === "ct-rain-add") { var lastR = state.p.rain[state.p.rain.length - 1]; state.p.rain.push({ d: lastR ? lastR.d * 2 : 60, mm: "" }); renderRain(); }
    else if (t.id === "ct-sub-add") { state.subs.push({ name: "Sub-catchment " + (state.subs.length + 1), area: "", imp: 0, length: "", slope: "", tcOverride: "" }); renderSubs(); }
    else if (t.id === "ct-example") { state = example(); renderAll(); }
    else if (t.id === "ct-csv") exportCsv();
  });
  function renderAll() { renderRain(); renderP(); renderSubs(); calc(); }
  renderAll();

  /* ---------- LiDAR step ---------- */
  var SIZES = [[500, 1], [1000, 2], [2000, 4], [4000, 8]];
  $("ct-lidar").innerHTML =
    '<p class="small">Fetches the Environment Agency\'s open 1 m LiDAR terrain model (DTM, Open Government Licence) for a square around a point in England, finds where water flows, and works out the area draining to the point you tap, its longest flow path and slope. Or load your own terrain grid as an ESRI ASCII .asc file (the format the EA\'s download portal offers), from anywhere. Everything runs in your browser; the only thing sent anywhere is the square\'s coordinates, to the EA.</p>' +
    '<div class="ct-terrain"><div style="display:flex;flex-direction:column;gap:10px">' +
    '<div class="field"><label for="ct-loc">Centre: grid reference or easting, northing</label><input type="text" id="ct-loc" placeholder="SK 012 813 or 401200, 381300"></div>' +
    '<div class="ct-actions"><button type="button" class="ct-row-btn" id="ct-map-btn">Pick on a map</button><span class="small" id="ct-loc-note"></span></div>' +
    '<div id="ct-map" hidden></div>' +
    '<div class="field"><label for="ct-size">Square to fetch</label><select id="ct-size">' + SIZES.map(function (s, k) { return '<option value="' + k + '"' + (k === 1 ? " selected" : "") + ">" + (s[0] >= 1000 ? s[0] / 1000 + " km" : s[0] + " m") + " square, " + s[1] + " m cells</option>"; }).join("") + "</select></div>" +
    '<div class="ct-actions"><button type="button" class="btn" id="ct-fetch">Fetch EA LiDAR</button><label class="ct-row-btn" style="cursor:pointer">Load .asc file<input type="file" id="ct-file" accept=".asc,.txt" hidden></label></div>' +
    '<p class="small" id="ct-status" aria-live="polite"></p></div>' +
    '<div style="display:flex;flex-direction:column;gap:8px"><canvas id="ct-dem" width="10" height="10" hidden aria-label="Terrain with flow lines; tap to set the catchment outlet"></canvas>' +
    '<div class="ct-legend" id="ct-legend" hidden><span><i style="background:#2f7fd6"></i>Flow lines</span><span><i style="background:rgba(13,107,120,.45)"></i>Catchment</span><span><i style="background:#d6452f"></i>Longest flow path</span><span><i style="background:#f2b705"></i>Outlet</span></div>' +
    '<div id="ct-catch" style="display:flex;flex-direction:column;gap:8px"></div></div></div>' +
    '<p class="small">Limits: a bare-earth model doesn\'t know about pipes, culverts, kerbs, walls or ditches smaller than a cell, so urban catchments in particular need checking against drainage records and a site walk. Depressions are filled so all water reaches an edge. If the catchment touches the edge of the square it is cut off: fetch a bigger square. Impermeable area isn\'t found from LiDAR; enter it yourself.</p>';

  var grid = null, an = null, cat = null, outlet = -1, centre = null;
  function status(msg) { $("ct-status").textContent = msg; }
  function setCentre(e, n, fromMap) {
    centre = { e: Math.round(e), n: Math.round(n) };
    $("ct-loc-note").textContent = "E " + centre.e + ", N " + centre.n;
    if (!fromMap) $("ct-loc").value = centre.e + ", " + centre.n;
    drawMapSquare();
  }
  $("ct-loc").addEventListener("change", function () {
    var c = R.parseLocation(this.value);
    if (!c) { $("ct-loc-note").textContent = "Not recognised. Try SK 012 813 or 401200, 381300."; return; }
    setCentre(c.e, c.n, true);
    if (map) { var ll = R.bngToWgs(c.e, c.n); map.setView([ll.lat, ll.lon], 14); }
  });
  $("ct-size").addEventListener("change", drawMapSquare);

  var map = null, mapSq = null;
  function loadLeaflet(cb) {
    if (window.L) return cb();
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"; document.head.appendChild(l);
    var s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"; s.onload = cb; s.onerror = function () { status("The map couldn't load. Type a grid reference instead."); };
    document.head.appendChild(s);
  }
  $("ct-map-btn").addEventListener("click", function () {
    var box = $("ct-map"); box.hidden = !box.hidden; if (box.hidden || map) { if (map) map.invalidateSize(); return; }
    loadLeaflet(function () {
      var start = centre ? R.bngToWgs(centre.e, centre.n) : { lat: 52.8, lon: -1.6 };
      map = window.L.map(box).setView([start.lat, start.lon], centre ? 14 : 6);
      window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
      map.on("click", function (ev) { var en = R.wgsToBng(ev.latlng.lat, ev.latlng.lng); setCentre(en.e, en.n); });
      drawMapSquare();
    });
  });
  function drawMapSquare() {
    if (!map || !centre) return;
    var half = SIZES[+$("ct-size").value][0] / 2, pts = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (c) { var ll = R.bngToWgs(centre.e + c[0] * half, centre.n + c[1] * half); return [ll.lat, ll.lon]; });
    if (mapSq) mapSq.remove();
    mapSq = window.L.polygon(pts, { color: "#0b4f6c", weight: 2, fillOpacity: 0.08 }).addTo(map);
  }

  $("ct-fetch").addEventListener("click", function () {
    if (!centre) { var c = R.parseLocation($("ct-loc").value); if (c) setCentre(c.e, c.n, true); }
    if (!centre) { status("Enter a grid reference or pick a point on the map first."); return; }
    var s = SIZES[+$("ct-size").value], x0 = Math.round(centre.e - s[0] / 2), y0 = Math.round(centre.n - s[0] / 2), n = s[0] / s[1];
    var btn = this; btn.disabled = true; status("Fetching " + n + " × " + n + " cells from the Environment Agency…");
    fetch(R.eaUrl(x0, y0, s[0], n)).then(function (r) { if (!r.ok) throw new Error("The EA service answered " + r.status + "."); return r.text(); })
      .then(function (t) { useGrid(R.parseWcsText(t), "EA LiDAR composite DTM, " + s[1] + " m cells, © Environment Agency, Open Government Licence"); })
      .catch(function (err) { status("Couldn't fetch terrain: " + err.message + " The EA service may be busy; try again, or download a tile from the EA portal and load the .asc."); })
      .then(function () { btn.disabled = false; });
  });
  $("ct-file").addEventListener("change", function () {
    var file = this.files[0]; if (!file) return;
    if (file.size > 60e6) { status("That file is too big to work with in a browser. Crop it to the area you need."); return; }
    status("Reading " + file.name + "…");
    file.text().then(function (t) { var g = R.parseAsc(t); if (g.nx * g.ny > 2.5e6) throw new Error("The grid has " + (g.nx * g.ny).toLocaleString() + " cells; please crop or resample it to under 2.5 million."); useGrid(g, file.name + ", " + g.cell + " m cells"); })
      .catch(function (err) { status(err.message); });
  });

  function useGrid(g, source) {
    var t0 = Date.now(); grid = g; an = R.analyse(g); cat = null; outlet = -1;
    if (an.valid < g.nx * g.ny * 0.05) { status("There's almost no LiDAR data in this square. EA coverage is England only, and a few areas are missing."); $("ct-dem").hidden = true; return; }
    status(source + ". " + g.nx + " × " + g.ny + " cells analysed in " + Math.max(1, Date.now() - t0) + " ms. Tap the map below on a flow line to set the outlet.");
    $("ct-dem").hidden = false; $("ct-legend").hidden = false; $("ct-catch").innerHTML = "";
    draw();
  }
  var base = null;
  function draw() {
    var g = grid, cv = $("ct-dem"), nx = g.nx, ny = g.ny;
    cv.width = nx; cv.height = ny;
    var ctx = cv.getContext("2d");
    if (!base) base = {};
    if (base.g !== g) { /* hillshade from the north-west, 45° sun */
      var img = ctx.createImageData(nx, ny), d = img.data, zmin = Infinity, zmax = -Infinity, k;
      for (k = 0; k < nx * ny; k++) if (!isNaN(g.z[k])) { if (g.z[k] < zmin) zmin = g.z[k]; if (g.z[k] > zmax) zmax = g.z[k]; }
      var az = 315 * DEG, alt = 45 * DEG, zf = Math.max(1, 3 * g.cell / Math.max(1, (zmax - zmin) / 50));
      for (var y = 0; y < ny; y++) for (var x = 0; x < nx; x++) {
        k = x + y * nx; var o = k * 4;
        if (isNaN(g.z[k])) { d[o] = d[o + 1] = d[o + 2] = 200; d[o + 3] = 255; continue; }
        var zl = g.z[x > 0 ? k - 1 : k], zr = g.z[x < nx - 1 ? k + 1 : k], zu = g.z[y > 0 ? k - nx : k], zd = g.z[y < ny - 1 ? k + nx : k];
        if (isNaN(zl)) zl = g.z[k]; if (isNaN(zr)) zr = g.z[k]; if (isNaN(zu)) zu = g.z[k]; if (isNaN(zd)) zd = g.z[k];
        var dzdx = (zr - zl) / (2 * g.cell) * zf / 3, dzdy = (zd - zu) / (2 * g.cell) * zf / 3;
        var slope = Math.atan(Math.sqrt(dzdx * dzdx + dzdy * dzdy)), aspect = Math.atan2(dzdy, -dzdx);
        var h = Math.cos(alt) * Math.cos(slope) + Math.sin(alt) * Math.sin(slope) * Math.cos(az - Math.PI / 2 - aspect);
        var tint = (g.z[k] - zmin) / Math.max(1e-6, zmax - zmin), v = Math.max(0, Math.min(1, h)) * 190 + 50;
        d[o] = v * (0.88 + 0.12 * tint); d[o + 1] = v * (0.95 - 0.05 * tint); d[o + 2] = v * (0.85 + 0.05 * (1 - tint)); d[o + 3] = 255;
      }
      base = { g: g, img: img };
    }
    var out = ctx.createImageData(nx, ny); out.data.set(base.img.data);
    var od = out.data, thr = Math.max(40, an.maxAcc / 150);
    for (var i = 0; i < nx * ny; i++) {
      var p = i * 4;
      if (cat && cat.mask[i]) { od[p] = od[p] * 0.55 + 13 * 0.45; od[p + 1] = od[p + 1] * 0.55 + 107 * 0.45; od[p + 2] = od[p + 2] * 0.55 + 120 * 0.45; }
      if (an.acc[i] >= thr) { var w = Math.min(1, 0.35 + Math.log(an.acc[i] / thr) / 6); od[p] = od[p] * (1 - w) + 47 * w; od[p + 1] = od[p + 1] * (1 - w) + 127 * w; od[p + 2] = od[p + 2] * (1 - w) + 214 * w; }
    }
    if (cat) cat.path.forEach(function (j) { var p2 = j * 4; od[p2] = 214; od[p2 + 1] = 69; od[p2 + 2] = 47; });
    ctx.putImageData(out, 0, 0);
    if (outlet >= 0) {
      var r = Math.max(3, nx / 80); ctx.beginPath(); ctx.arc(outlet % nx + 0.5, Math.floor(outlet / nx) + 0.5, r, 0, 2 * Math.PI);
      ctx.fillStyle = "#f2b705"; ctx.strokeStyle = "#15233a"; ctx.lineWidth = Math.max(1, r / 3); ctx.fill(); ctx.stroke();
    }
  }
  $("ct-dem").addEventListener("click", function (e) {
    if (!grid) return;
    var rc = this.getBoundingClientRect(), x = Math.floor((e.clientX - rc.left) / rc.width * grid.nx), y = Math.floor((e.clientY - rc.top) / rc.height * grid.ny);
    if (x < 0 || y < 0 || x >= grid.nx || y >= grid.ny) return;
    outlet = R.snap(grid, an, x + y * grid.nx, Math.max(3, Math.round(grid.nx / 60)));
    cat = R.catchment(grid, an, outlet); draw(); showCatch();
  });
  function showCatch() {
    var g = grid, ox = g.x0 + (outlet % g.nx + 0.5) * g.cell, oy = g.y0 + (g.ny - Math.floor(outlet / g.nx) - 0.5) * g.cell;
    var useSlope = isFinite(cat.slope1085) && cat.slope1085 > 0 ? cat.slope1085 : cat.slope;
    $("ct-catch").innerHTML =
      '<div class="ct-big"><div><span>Catchment area</span><b>' + f(cat.area / 10000, 2) + ' ha</b><span>' + cat.cells.toLocaleString() + " cells</span></div>" +
      "<div><span>Longest flow path</span><b>" + f(cat.L, 0) + ' m</b><span>' + f(cat.zTop, 1) + " m to " + f(cat.zOut, 1) + " m</span></div>" +
      "<div><span>Slope along path</span><b>" + f(useSlope * 100, 2) + ' %</b><span>10–85% points; end to end ' + f(cat.slope * 100, 2) + " %</span></div></div>" +
      '<p class="small">Outlet at E ' + Math.round(ox) + ", N " + Math.round(oy) + "." + (cat.touchesEdge ? ' <span class="ct-flag">The catchment reaches the edge of the square, so it is probably cut off. Fetch a bigger square centred further upstream.</span>' : "") +
      (cat.cells < 20 ? ' <span class="ct-flag">Very small: tap closer to a blue flow line.</span>' : "") + "</p>" +
      '<div class="ct-actions"><button type="button" class="btn" id="ct-add-catch">Add as a sub-catchment</button></div>';
    $("ct-add-catch").addEventListener("click", function () {
      state.subs.push({ name: "LiDAR catchment E" + Math.round(ox) + " N" + Math.round(oy), area: +(cat.area / 10000).toFixed(3), imp: 0, length: Math.round(cat.L), slope: +(useSlope * 100).toFixed(2), tcOverride: "" });
      renderSubs(); calc(); status("Added. Set its impermeable percentage in the table above.");
    });
  }
})(typeof window !== "undefined" ? window : globalThis);
