/* Line drawings of civil engineering works, drawn for this site (no photos, nothing to license).
   Each is a small inline SVG that takes the theme colours, so it works in light and dark mode. */
(function () {
  var G = 'fill="none" stroke-linecap="round" stroke-linejoin="round"';
  function hangers(x0, x1, step, yTop, yDeck) { var s = ""; for (var x = x0; x <= x1; x += step) s += "M" + x + " " + yTop(x) + "V" + yDeck; return s; }
  function cable(x) { var a = 70, b = 170; if (x < a) return 45 - (x - 10) / (a - 10) * 30 + 0; if (x > b) return 15 + (x - b) / (230 - b) * 30; var t = (x - a) / (b - a); return 15 + 4 * 22 * t * (1 - t); }
  var ART = {
    bridge: '<path d="M0 50H240M0 70H240" stroke="var(--line)" stroke-width="2"/><path d="M70 70V12M170 70V12" stroke="var(--accent)" stroke-width="4"/>' +
      '<path d="M10 45Q50 40 70 15Q120 59 170 15Q190 40 230 45" stroke="var(--accent)" stroke-width="2"/><path d="' + hangers(80, 160, 10, function (x) { return Math.round(cable(x)); }, 50) + '" stroke="var(--accent)" stroke-width="1"/>' +
      '<path d="M100 47h14M140 47h10" stroke="var(--accent-2)" stroke-width="4"/>',
    dam: '<path d="M0 70H240" stroke="var(--line)" stroke-width="2"/><path d="M96 70L112 14H132L170 70" stroke="var(--accent)" stroke-width="3"/><path d="M104 40H150" stroke="var(--accent)" stroke-width="1"/>' +
      '<path d="M10 28q8-4 16 0t16 0t16 0t16 0t16 0M14 40q8-4 16 0t16 0t16 0t16 0t16 0M18 52q8-4 16 0t16 0t16 0t16 0" stroke="var(--accent)" stroke-width="1.5" opacity=".7"/>' +
      '<path d="M170 62q10 2 20-2t20 0t24 0" stroke="var(--accent-2)" stroke-width="2"/><path d="M112 14h20" stroke="var(--accent-2)" stroke-width="4"/>',
    crane: '<path d="M0 70H240" stroke="var(--line)" stroke-width="2"/><path d="M60 70V14M68 70V14M60 22l8 8M68 30l-8 8M60 38l8 8M68 46l-8 8M60 54l8 8" stroke="var(--accent)" stroke-width="1.5"/>' +
      '<path d="M24 14H210M64 14V4M64 4L24 14M64 4L210 14" stroke="var(--accent)" stroke-width="1.5"/><path d="M26 14v8h14v-8" stroke="var(--accent)" stroke-width="1.5"/><path d="M172 14V36" stroke="var(--accent)" stroke-width="1"/>' +
      '<path d="M166 36h12v8h-12z" stroke="var(--accent-2)" stroke-width="2"/><path d="M130 70V44H220V70M130 57H220M160 44V70M190 44V70" stroke="var(--accent)" stroke-width="1.5"/>',
    tunnel: '<path d="M0 70H240" stroke="var(--line)" stroke-width="2"/><path d="M20 70V40Q20 12 60 12Q100 12 100 40V70" stroke="var(--accent)" stroke-width="3"/><path d="M8 70V36Q8 2 60 2Q112 2 112 36V70" stroke="var(--accent)" stroke-width="1" opacity=".6"/>' +
      '<path d="M40 66L236 66M30 70L240 70" stroke="var(--accent)" stroke-width="1.5"/><path d="M60 62h3M80 62h3M100 62h3M120 62h3M140 62h3M160 62h3M180 62h3M200 62h3M220 62h3" stroke="var(--accent)" stroke-width="3"/>' +
      '<path d="M120 60V36Q120 30 128 30H220V60Z" stroke="var(--accent-2)" stroke-width="2"/><path d="M134 38h14v10h-14zM158 38h14v10h-14zM182 38h14v10h-14z" stroke="var(--accent-2)" stroke-width="1.5"/>',
    road: '<path d="M0 70H240" stroke="var(--line)" stroke-width="2"/><path d="M40 70L112 20M200 70L128 20M120 66V60M120 52V46M120 39V35M120 29V27" stroke="var(--accent)" stroke-width="2"/>' +
      '<path d="M60 56V38M60 38h12l-3 4l3 4H60M170 46V30M170 30h10l-2.5 3.5l2.5 3.5H170M208 62V40M208 40h14l-3 4l3 4H208" stroke="var(--accent-2)" stroke-width="2"/><path d="M104 20H136" stroke="var(--line)" stroke-width="2"/>',
    viaduct: '<path d="M0 70H240" stroke="var(--line)" stroke-width="2"/><path d="M0 26H240M0 32H240" stroke="var(--accent)" stroke-width="2"/>' +
      '<path d="M0 70V32M40 70V32M80 70V32M120 70V32M160 70V32M200 70V32M240 70V32" stroke="var(--accent)" stroke-width="2"/>' +
      '<path d="M0 50Q20 34 40 50M40 50Q60 34 80 50M80 50Q100 34 120 50M120 50Q140 34 160 50M160 50Q180 34 200 50M200 50Q220 34 240 50" stroke="var(--accent)" stroke-width="1.5"/>' +
      '<path d="M140 24V14Q140 10 146 10H214V24" stroke="var(--accent-2)" stroke-width="2"/>'
  };
  var FOR = { route: "road", planner: "road", careers: "crane", resources: "bridge", attributes: "viaduct", news: "tunnel", review: "dam", presentation: "bridge", flashcards: "viaduct", questions: "dam", "cheat-sheet": "crane", community: "viaduct", check: "tunnel", learning: "viaduct", nec4: "road", cdm: "crane", "learn-theory": "bridge" };
  function svg(name, cls) { return '<svg class="' + cls + '" viewBox="0 0 240 72" ' + G + ' aria-hidden="true" focusable="false">' + ART[name] + "</svg>"; }
  Object.keys(FOR).forEach(function (v) {
    var h = document.querySelector("#view-" + v + " .view-head"); if (h && !h.querySelector(".vh-art")) h.insertAdjacentHTML("afterbegin", svg(FOR[v], "vh-art"));
  });
  var hero = document.querySelector(".hero"); if (hero && !hero.querySelector(".hero-art"))
    hero.insertAdjacentHTML("beforeend", '<div class="hero-art" aria-hidden="true">' + svg("viaduct", "") + svg("bridge", "") + svg("crane", "") + svg("dam", "") + "</div>");
})();
