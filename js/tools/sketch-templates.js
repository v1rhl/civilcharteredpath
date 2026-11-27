/* Typical details for the sketch pad. Each one is a generic, not-to-scale schematic drawn from first principles,
   with plain descriptive labels and no values taken from any published standard or manual. They are a starting
   point for a sketch; the user must check every detail against the standard and specification that govern the job.
   build(T) draws in local units (about 4 units per mm on an A4 sheet); the sketch pad centres it on the sheet.
   T.L line, T.PL polyline, T.R rectangle points, T.H hatch, T.C circle, T.X text, T.N leader note (right=true for
   text ending at x), T.D dimension, T.B member, T.S support, T.F point load, T.U distributed load, T.M moment. */
(function () {
  var NOTE = "Indicative sketch, not to scale. Check against the governing standard and project specification.";
  function head(T, title, y) { T.X(0, y == null ? -50 : y, title, 20, true); }
  function foot(T, y) { T.X(0, y, NOTE, 12, false, "#5a6677"); }
  function ground(T, x1, x2, y) { T.L(x1, y, x2, y, { w: 2 }); for (var x = x1 + 6; x < x2; x += 14) T.L(x, y, x - 8, y + 8, { w: 1 }); }

  var TPL = [
    { group: "Drainage", name: "Manhole, typical section", build: function (T) {
      head(T, "Manhole: typical section");
      ground(T, 0, 150, 60); ground(T, 350, 500, 60);
      T.H(T.R(196, 48, 304, 60), "steel");                                   /* cover and frame */
      T.H(T.R(204, 60, 296, 90), "diag");                                    /* adjustment units */
      T.H(T.R(150, 90, 204, 115), "concrete"); T.H(T.R(296, 90, 350, 115), "concrete"); /* cover slab */
      T.H(T.R(160, 115, 180, 380), "concrete"); T.H(T.R(320, 115, 340, 380), "concrete"); /* chamber rings */
      [205, 295].forEach(function (y) { T.L(160, y, 180, y, { w: 1.2 }); T.L(320, y, 340, y, { w: 1.2 }); });
      T.H(T.R(140, 380, 360, 420), "concrete");                              /* base */
      T.H([[180, 340], [226, 352], [226, 380], [180, 380]], "concrete"); T.H([[274, 352], [320, 340], [320, 380], [274, 380]], "concrete"); /* benching */
      var ch = []; for (var i = 0; i <= 12; i++) { var a = Math.PI * i / 12; ch.push([+(250 + 24 * Math.cos(a)).toFixed(1), +(352 + 24 * Math.sin(a)).toFixed(1)]); } T.PL(ch, { w: 2 });
      T.L(20, 330, 160, 330); T.L(20, 376, 160, 376); T.L(340, 330, 480, 330); T.L(340, 376, 480, 376); /* pipes */
      T.L(10, 353, 490, 353, { w: 1, ls: "centre" });
      for (var y = 140; y <= 320; y += 30) T.L(180, y, 194, y, { w: 2.5 });  /* step irons */
      T.N(298, 54, 540, 30, "Cover and frame"); T.N(294, 76, 540, 70, "Adjustment units"); T.N(340, 104, 540, 110, "Cover slab");
      T.N(330, 160, 540, 160, "Precast chamber rings"); T.N(190, 230, 540, 230, "Step irons or ladder\n(as specified)"); T.N(300, 350, 540, 290, "Benching");
      T.N(258, 374, 540, 330, "Main channel"); T.N(450, 376, 540, 375, "Outgoing pipe"); T.N(350, 410, 540, 418, "Base slab");
      T.N(70, 330, 20, 300, "Incoming pipe");
      T.D(180, 250, 320, 250, 0, "Internal dia."); T.D(-40, 60, -40, 376, 0, "Depth to invert");
      foot(T, 470);
    } },
    { group: "Drainage", name: "Filter drain, cross-section", build: function (T) {
      head(T, "Filter drain: typical cross-section");
      ground(T, 0, 140, 60); ground(T, 300, 440, 60);
      T.L(140, 60, 140, 400); T.L(300, 60, 300, 400); T.L(140, 400, 300, 400);
      T.H(T.R(140, 60, 300, 90), "earth");
      T.H(T.R(140, 90, 300, 400), "concrete", { outline: false });
      T.PL([[146, 92], [146, 394], [294, 394], [294, 92]], { w: 1.6, ls: "dashed", c: "#0d6b78" });
      T.C(220, 350, 30, "solid"); T.C(220, 350, 22, "solid", { outline: true, ls: "dotted" });
      T.N(300, 75, 470, 75, "Cover layer, topsoil or\nexposed stone (as designed)"); T.N(240, 200, 470, 180, "Filter material\n(free-draining aggregate)");
      T.N(294, 260, 470, 270, "Geotextile (where specified)"); T.N(248, 345, 470, 340, "Perforated or slotted\ncarrier pipe"); T.N(220, 390, 470, 400, "Bed of filter material");
      T.D(140, 60, 300, 60, 40, "Trench width"); T.D(140, 60, 140, 400, 40, "Depth to invert");
      foot(T, 450);
    } },
    { group: "Drainage", name: "Road gully and connection", build: function (T) {
      head(T, "Road gully and connection: typical section");
      T.L(0, 80, 226, 80, { w: 2.5 }); T.H(T.R(226, 74, 300, 84), "steel");
      T.H([[300, 160], [300, 60], [310, 40], [334, 40], [334, 160]], "concrete"); T.L(334, 40, 500, 40, { w: 2.5 });
      T.H(T.R(216, 90, 236, 350), "concrete"); T.H(T.R(290, 90, 310, 350), "concrete"); T.H(T.R(216, 330, 310, 350), "concrete");
      T.L(236, 84, 236, 330); T.L(290, 84, 290, 330); T.L(236, 330, 290, 330);
      T.L(236, 205, 290, 205, { w: 1.2, ls: "dashed", c: "#3f6fd1" });
      T.L(250, 160, 250, 240, { w: 2 }); T.L(216, 230, 250, 230); T.L(216, 260, 250, 260); T.L(250, 240, 250, 260, { w: 0 });
      T.L(216, 230, 70, 280); T.L(216, 260, 70, 310);
      T.C(40, 300, 38, "solid");
      T.N(264, 78, 420, 110, "Gully grating and frame"); T.N(320, 60, 420, 5, "Kerb"); T.N(290, 290, 420, 290, "Gully pot (trapped)");
      T.N(270, 205, 420, 200, "Water seal level"); T.N(310, 340, 420, 360, "Surround (as specified)"); T.N(140, 262, 120, 190, "Gully connection pipe", true);
      T.N(40, 338, 60, 400, "Carrier drain or sewer");
      foot(T, 440);
    } },
    { group: "Highways", name: "Pavement build-up", build: function (T) {
      head(T, "Pavement build-up: typical layers");
      var L = [["Surface course", 40, 60, "steel"], ["Binder course", 60, 90, "diag"], ["Base", 90, 140, "cross"], ["Sub-base", 140, 210, "concrete"], ["Capping (where required)", 210, 270, "diag"]];
      L.forEach(function (l) { T.H(T.R(80, l[1], 420, l[2]), l[3]); T.N(420, (l[1] + l[2]) / 2, 460, (l[1] + l[2]) / 2, l[0] + ", ___ mm"); });
      ground(T, 80, 420, 270); T.N(420, 272, 460, 300, "Formation / subgrade\n(design CBR ___ %)");
      foot(T, 340);
    } },
    { group: "Highways", name: "Kerb and footway edge", build: function (T) {
      head(T, "Kerb detail: typical section");
      T.H(T.R(0, 80, 200, 100), "steel"); T.H(T.R(0, 100, 200, 140), "diag"); T.H(T.R(0, 140, 200, 200), "concrete");
      T.H(T.R(180, 160, 270, 195), "concrete"); T.H([[234, 70], [270, 160], [234, 160]], "concrete");
      T.H([[200, 160], [200, 60], [210, 40], [234, 40], [234, 160]], "diag", { c: "#15233a" });
      T.H(T.R(234, 40, 420, 56), "steel"); T.H([[262, 56], [420, 56], [420, 110], [282, 110]], "concrete");
      T.N(222, 100, 470, 100, "Precast kerb"); T.N(250, 180, 470, 180, "Concrete bed and backing\n(as specified)");
      T.N(340, 48, 470, 30, "Footway surfacing"); T.N(380, 90, 470, 70, "Footway sub-base");
      T.N(100, 120, 40, 260, "Carriageway layers", false);
      T.D(200, 40, 200, 80, -60, "Upstand");
      foot(T, 300);
    } },
    { group: "Drainage", name: "Headwall and outfall", build: function (T) {
      head(T, "Headwall and outfall: typical section");
      T.PL([[0, 60], [300, 60]], { w: 2 }); T.PL([[300, 60], [300, 40], [330, 40], [330, 285]], { w: 0 });
      T.H([[300, 40], [330, 40], [330, 300], [300, 300]], "concrete"); T.H(T.R(260, 300, 380, 330), "concrete");
      T.H(T.R(330, 285, 480, 300), "concrete"); T.H([[480, 282], [600, 290], [600, 306], [480, 304]], "earth");
      T.L(0, 210, 330, 210); T.L(0, 260, 330, 260); T.L(0, 235, 345, 235, { w: 1, ls: "centre" });
      T.L(338, 200, 338, 285, { w: 1.6, ls: "dashed" });
      T.L(360, 250, 600, 250, { w: 1.2, ls: "dashed", c: "#3f6fd1" });
      T.N(315, 90, 420, 90, "Headwall"); T.N(320, 320, 420, 380, "Footing (as designed)"); T.N(400, 292, 520, 340, "Apron");
      T.N(560, 292, 640, 250, "Erosion protection"); T.N(338, 220, 420, 160, "Safety grille or flap valve\n(where required)");
      T.N(120, 235, 140, 140, "Outfall pipe", true); T.N(500, 250, 640, 210, "Normal water level");
      T.D(30, 210, 30, 260, 30, "Pipe dia.");
      foot(T, 420);
    } },
    { group: "Drainage", name: "Pipe trench, bedding and surround", build: function (T) {
      head(T, "Pipe trench: typical section");
      ground(T, 0, 100, 60); ground(T, 340, 440, 60);
      T.L(100, 60, 100, 400); T.L(340, 60, 340, 400); T.L(100, 400, 340, 400);
      T.H(T.R(100, 60, 340, 90), "steel"); T.H(T.R(100, 90, 340, 250), "earth"); T.H(T.R(100, 250, 340, 400), "concrete");
      T.C(220, 320, 50, "solid");
      T.N(300, 75, 380, 110, "Surface reinstatement"); T.N(300, 170, 380, 170, "Selected backfill"); T.N(300, 280, 380, 260, "Granular bed and surround\n(as specified)"); T.N(240, 340, 380, 360, "Pipe");
      T.D(100, 400, 340, 400, -30, "Trench width"); T.D(100, 370, 100, 400, 30, "Bed"); T.D(100, 250, 100, 270, 30, "Surround");
      T.D(60, 60, 60, 270, 0, "Cover to crown");
      foot(T, 470);
    } },
    { group: "Drainage", name: "Pipe bedding arrangements (generic)", build: function (T) {
      head(T, "Pipe bedding arrangements: generic");
      [["Granular bed only", false, "concrete"], ["Granular bed and surround", true, "concrete"], ["Concrete bed and surround", true, "cross"]].forEach(function (b, i) {
        var x = i * 200, top = 60, bot = 260;
        T.L(x, top, x, bot); T.L(x + 150, top, x + 150, bot); T.L(x, bot, x + 150, bot);
        T.H(T.R(x, top, x + 150, b[1] ? 150 : 190), "earth", { outline: false });
        T.H(T.R(x, b[1] ? 150 : 190, x + 150, bot), b[2], { outline: false });
        T.C(x + 75, 200, 34, "solid");
        T.X(x, 280, b[0], 14, true);
      });
      T.X(0, 310, "Choose the bedding from the pipe and loading design, and the standard that applies. No class names given here.", 12, false, "#5a6677");
      foot(T, 330);
    } },
    { group: "Drainage", name: "Soakaway, cross-section", build: function (T) {
      head(T, "Soakaway: typical cross-section");
      ground(T, 0, 120, 60); ground(T, 360, 480, 60);
      T.L(120, 60, 120, 380); T.L(360, 60, 360, 380); T.L(120, 380, 360, 380);
      T.H(T.R(120, 60, 360, 100), "earth");
      T.H(T.R(126, 104, 354, 374), "concrete", { outline: false });
      T.PL([[126, 102], [126, 374], [354, 374], [354, 102], [126, 102]], { w: 1.6, ls: "dashed", c: "#0d6b78" });
      T.L(0, 140, 126, 140); T.L(0, 170, 126, 170);
      T.L(320, 40, 320, 374, { w: 1.6 }); T.L(340, 40, 340, 374, { w: 1.6 });
      T.L(0, 440, 480, 440, { w: 1.2, ls: "dashed", c: "#3f6fd1" });
      T.N(60, 140, 0, 110, "Inlet pipe"); T.N(240, 85, 400, 30, "Topsoil and cover"); T.N(240, 240, 400, 240, "Granular fill or\nsoakage crates");
      T.N(354, 320, 400, 320, "Geotextile wrap"); T.N(330, 50, 400, 110, "Inspection tube"); T.N(200, 440, 400, 470, "Highest groundwater level (check)");
      T.D(120, 380, 360, 380, -30, "Width"); T.D(360, 100, 360, 380, -70, "Effective depth");
      foot(T, 510);
    } },
    { group: "Drainage", name: "Swale, cross-section", build: function (T) {
      head(T, "Swale: typical cross-section");
      T.PL([[0, 80], [120, 80], [180, 200], [300, 200], [360, 80], [500, 80]], { w: 2.5 });
      T.H([[0, 80], [120, 80], [180, 200], [300, 200], [360, 80], [500, 80], [500, 100], [370, 100], [310, 220], [170, 220], [110, 100], [0, 100]], "earth", { outline: false });
      T.L(160, 160, 320, 160, { w: 1.4, ls: "dashed", c: "#3f6fd1" });
      T.N(240, 160, 560, 160, "Design water level"); T.N(330, 140, 560, 120, "Side slope 1 in ___"); T.N(420, 90, 560, 70, "Grass or vegetation over topsoil");
      T.N(240, 212, 560, 220, "Subsoil (check infiltration)");
      T.D(180, 200, 300, 200, -50, "Base width"); T.D(320, 80, 320, 160, -90, "Freeboard");
      foot(T, 290);
    } },
    { group: "Drainage", name: "Attenuation tank (geocellular)", build: function (T) {
      head(T, "Attenuation tank: typical section");
      ground(T, 0, 80, 60); ground(T, 420, 520, 60);
      T.L(80, 60, 80, 370); T.L(420, 60, 420, 370); T.L(80, 370, 420, 370);
      T.H(T.R(80, 60, 420, 140), "earth"); T.H(T.R(80, 140, 420, 370), "concrete", { outline: false });
      T.H(T.R(120, 160, 380, 330), "solid", { c: "#ffffff" });
      for (var x = 120; x <= 380; x += 52) T.L(x, 160, x, 330, { w: 1.2 }); T.L(120, 245, 380, 245, { w: 1.2 });
      T.PL([[114, 154], [386, 154], [386, 336], [114, 336], [114, 154]], { w: 1.6, ls: "dashed", c: "#0d6b78" });
      T.L(0, 280, 120, 280); T.L(0, 306, 120, 306); T.L(380, 300, 520, 300); T.L(380, 326, 520, 326);
      T.L(360, 30, 360, 160); T.L(372, 30, 372, 160);
      T.N(40, 280, 0, 240, "Inlet"); T.N(470, 313, 560, 360, "Outlet to flow control"); T.N(366, 60, 560, 30, "Vent or access (as required)");
      T.N(250, 100, 560, 100, "Cover (to supplier's guidance)"); T.N(300, 200, 560, 200, "Geocellular units"); T.N(386, 260, 560, 260, "Membrane or geotextile wrap");
      T.N(250, 355, 560, 400, "Granular bed and surround");
      T.D(80, 60, 80, 154, -40, "Cover depth");
      foot(T, 440);
    } },
    { group: "Structures", name: "Cantilever retaining wall section", build: function (T) {
      head(T, "Cantilever retaining wall: typical section");
      T.H([[240, 60], [272, 60], [282, 340], [240, 340]], "concrete"); T.H(T.R(160, 340, 440, 390), "concrete");
      T.H([[282, 80], [310, 80], [310, 340], [282, 340]], "concrete", { outline: false });
      ground(T, 282, 560, 60); ground(T, 0, 240, 300);
      T.C(298, 326, 10, "solid");
      [200, 260].forEach(function (y) { T.L(238, y, 278, y + 4, { w: 2, ls: "dashed" }); });
      T.N(258, 140, 120, 140, "RC stem", true); T.N(200, 365, 120, 420, "Toe", true); T.N(400, 365, 470, 420, "Heel");
      T.N(296, 200, 470, 200, "Free-draining backfill\nor drainage layer"); T.N(304, 330, 470, 300, "Drain to outfall"); T.N(250, 230, 120, 230, "Weep holes (if used)", true);
      T.D(560, 60, 560, 340, -110, "Retained height"); T.D(160, 390, 440, 390, -40, "Base width");
      foot(T, 480);
    } },
    { group: "Beam and frame diagrams", name: "Simply supported beam, UDL", build: function (T) {
      head(T, "Simply supported beam with UDL", -110);
      T.B(0, 0, 480, 0); T.S("pin", 0, 0); T.S("roller", 480, 0); T.U(0, 0, 480, 0, "w kN/m");
      T.D(0, 0, 480, 0, -70, "L");
    } },
    { group: "Beam and frame diagrams", name: "Cantilever, point load", build: function (T) {
      head(T, "Cantilever with end point load", -110);
      T.B(0, 0, 400, 0); T.S("fixed", 0, 0, 90); T.F(400, 0, 90, "P kN");
      T.D(0, 0, 400, 0, -60, "L");
    } },
    { group: "Beam and frame diagrams", name: "Propped cantilever", build: function (T) {
      head(T, "Propped cantilever with UDL", -110);
      T.B(0, 0, 480, 0); T.S("fixed", 0, 0, 90); T.S("roller", 480, 0); T.U(0, 0, 480, 0, "w kN/m");
      T.D(0, 0, 480, 0, -70, "L");
    } },
    { group: "Beam and frame diagrams", name: "Beam with overhang", build: function (T) {
      head(T, "Beam with overhang", -110);
      T.B(0, 0, 560, 0); T.S("pin", 0, 0); T.S("roller", 400, 0); T.U(0, 0, 400, 0, "w kN/m"); T.F(560, 0, 90, "P kN");
      T.D(0, 0, 400, 0, -70, "L"); T.D(400, 0, 560, 0, -70, "a");
    } },
    { group: "Beam and frame diagrams", name: "Portal frame", build: function (T) {
      head(T, "Portal frame", -150);
      T.B(0, 300, 0, 0); T.B(0, 0, 480, 0); T.B(480, 0, 480, 300);
      T.S("fixed", 0, 300); T.S("fixed", 480, 300); T.U(0, 0, 480, 0, "w kN/m"); T.F(0, 0, 0, "H kN");
      T.D(0, 300, 480, 300, -60, "Span"); T.D(480, 0, 480, 300, 70, "Height");
    } }
  ];
  window.CPSketchTemplates = TPL;
})();
