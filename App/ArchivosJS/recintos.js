/*
  Módulo: recintos.js
  Contiene la lógica de reglas por zona, tablas de puntuación y funciones
  para sanitizar estado inicial. Exporta una API global `Recintos`.
*/

(function () {
  const zoneRules = {
    semejanza: {
      accepts: "same",
      max: 6,
      scoringTable: { 0: 0, 1: 2, 2: 4, 3: 8, 4: 12, 5: 18, 6: 24 },
    },
    diferencia: {
      accepts: "distinct",
      max: 6,
      scoringTable: { 0: 0, 1: 1, 2: 3, 3: 6, 4: 10, 5: 15, 6: 21 },
    },
    amor: { accepts: "any", max: 12 },
    trio: { accepts: "any", max: 3 },
    rey: { accepts: "any", max: 1 },
    isla: { accepts: "any", max: 1 },
    rio: { accepts: "any", max: 12 },
  };

  // Handlers por zona (puntos de extensión). Se puede ampliar con más zonas.
  const zoneHandlers = {
    diferencia: {
      onAdd(zoneEl, dinoType, placedEl) {
        showMessage(
          `Dino ${dinoType} agregado a ${zoneEl.getAttribute("data-zone")}`,
          "info",
          1500
        );
      },
      onRemove(zoneEl, dinoType) {
        showMessage(
          `Dino ${dinoType} removido de ${zoneEl.getAttribute("data-zone")}`,
          "info",
          1200
        );
      },
    },
  };

  // Helpers de DOM
  const zones = document.querySelectorAll(".zone");

  function getRules(zoneName) {
    return zoneRules[zoneName] || { accepts: "any", max: 12 };
  }

  function canAccept(zoneEl, incomingType) {
    const zoneName = zoneEl.getAttribute("data-zone");
    const rules = getRules(zoneName);
    // capacity is handled by caller
    if (rules.accepts === "same") {
      const existing = Array.from(zoneEl.querySelectorAll("[data-dino]")).map(
        (d) => d.getAttribute("data-dino")
      );
      const distinct = Array.from(new Set(existing));
      if (distinct.length > 0 && distinct[0] !== incomingType)
        return {
          ok: false,
          reason: `La zona ${zoneName} solo permite dinosaurios de la misma especie (ya contiene ${distinct[0]}).`,
        };
    } else if (rules.accepts === "distinct") {
      const existing = Array.from(zoneEl.querySelectorAll("[data-dino]")).map(
        (d) => d.getAttribute("data-dino")
      );
      if (existing.includes(incomingType))
        return {
          ok: false,
          reason: `La zona ${zoneName} no permite duplicados de ${incomingType}.`,
        };
    } else if (
      Array.isArray(rules.accepts) &&
      !rules.accepts.includes(incomingType)
    ) {
      return {
        ok: false,
        reason: `La zona ${zoneName} no acepta dinosaurios del tipo ${incomingType}.`,
      };
    }
    return { ok: true };
  }

  // updateScores: similar a la versión anterior, centraliza el cálculo
  function updateScores() {
    let total = 0;
    zones.forEach((zone) => {
      const zoneName = zone.getAttribute("data-zone");
      const rules = getRules(zoneName);
      const dinos = Array.from(zone.querySelectorAll("[data-dino]"));
      const count = dinos.length;
      let zoneScore = 0;

      if (zoneName === "rey") {
        zoneScore = 0;
        if (count === 1) {
          const placed = dinos[0];
          const placedType = placed ? placed.getAttribute("data-dino") : null;
          if (placedType) {
            const allPlaced = Array.from(
              document.querySelectorAll(".zone [data-dino]")
            );
            const counts = allPlaced.reduce((acc, d) => {
              const t = d.getAttribute("data-dino");
              acc[t] = (acc[t] || 0) + 1;
              return acc;
            }, {});
            let maxCount = 0;
            let maxSpecies = null;
            let maxCountOccurrences = 0;
            for (const s in counts) {
              if (counts[s] > maxCount) {
                maxCount = counts[s];
                maxSpecies = s;
                maxCountOccurrences = 1;
              } else if (counts[s] === maxCount) {
                maxCountOccurrences += 1;
              }
            }
            if (
              maxCount > 0 &&
              maxCountOccurrences === 1 &&
              maxSpecies === placedType
            )
              zoneScore = 7;
          }
        }
      } else if (zoneName === "trio") {
        zoneScore =
          count === (typeof rules.max === "number" ? rules.max : 3) ? 7 : 0;
      } else if (zoneName === "amor") {
        const counts = dinos.reduce((acc, d) => {
          const t = d.getAttribute("data-dino");
          acc[t] = (acc[t] || 0) + 1;
          return acc;
        }, {});
        for (const k in counts) {
          const pairs = Math.floor(counts[k] / 2);
          zoneScore += pairs * 5;
        }
      } else if (zoneName === "isla") {
        zoneScore = 0;
        if (count === 1) {
          const placed = dinos[0];
          const placedType = placed ? placed.getAttribute("data-dino") : null;
          if (placedType) {
            const allPlaced = Array.from(
              document.querySelectorAll(".zone [data-dino]")
            );
            const counts = allPlaced.reduce((acc, d) => {
              const t = d.getAttribute("data-dino");
              acc[t] = (acc[t] || 0) + 1;
              return acc;
            }, {});
            if ((counts[placedType] || 0) === 1) zoneScore = 7;
          }
        }
      } else if (rules.scoringTable) {
        zoneScore = rules.scoringTable[count] || 0;
      } else {
        zoneScore = count;
      }

      const span = document.getElementById("score-" + zoneName);
      if (span) span.textContent = zoneScore;
      total += zoneScore;
    });
    const totalSpan = document.getElementById("score-total");
    if (totalSpan) totalSpan.textContent = Math.round(total);
    updateZoneCounts();
  }

  function updateZoneCounts() {
    zones.forEach((zone) => {
      const zoneName = zone.getAttribute("data-zone");
      const rules = getRules(zoneName) || {};
      const max = typeof rules.max === "number" ? rules.max : 12;
      const count = zone.querySelectorAll("[data-dino]").length;
      let label = zone.querySelector(".zone-label");
      if (!label) {
        label = document.createElement("span");
        label.className = "zone-label";
        label.textContent = zoneName;
        zone.insertBefore(label, zone.firstChild);
      }
      const id = "count-" + zoneName;
      let badge = document.getElementById(id);
      if (!badge) {
        badge = document.createElement("span");
        badge.id = id;
        badge.className = "zone-count";
        badge.setAttribute(
          "style",
          "margin-left:8px;background:rgba(255,255,255,0.95);padding:2px 6px;border-radius:8px;font-size:0.85rem;font-weight:600;"
        );
        label.appendChild(badge);
      }
      badge.textContent = count + "/" + max;
    });
  }

  // Sanitizaciones al cargar
  function sanitizeDistinctZones() {
    zones.forEach((zone) => {
      const zoneName = zone.getAttribute("data-zone");
      const rules = getRules(zoneName) || {};
      if (rules.accepts === "distinct") {
        const dinos = Array.from(zone.querySelectorAll("[data-dino]"));
        const seen = new Set();
        let removed = 0;
        dinos.forEach((d) => {
          const t = d.getAttribute("data-dino");
          if (seen.has(t)) {
            d.remove();
            removed += 1;
          } else seen.add(t);
        });
        if (removed > 0)
          showMessage(
            `Zona ${zoneName}: eliminados ${removed} duplicados para cumplir regla 'diferencia'.`,
            "warn",
            4000
          );
      }
    });
  }

  function sanitizeTrioZones() {
    zones.forEach((zone) => {
      const zoneName = zone.getAttribute("data-zone");
      const rules = getRules(zoneName) || {};
      if (zoneName === "trio") {
        const max = typeof rules.max === "number" ? rules.max : 3;
        const dinos = Array.from(zone.querySelectorAll("[data-dino]"));
        if (dinos.length > max) {
          const toRemove = dinos.slice(max);
          toRemove.forEach((d) => d.remove());
          showMessage(
            `Zona ${zoneName}: eliminados ${toRemove.length} animales para respetar el límite de ${max}.`,
            "warn",
            3500
          );
        }
      }
    });
  }

  function sanitizeReyZone() {
    zones.forEach((zone) => {
      const zoneName = zone.getAttribute("data-zone");
      if (zoneName === "rey") {
        const dinos = Array.from(zone.querySelectorAll("[data-dino]"));
        if (dinos.length > 1) {
          const toRemove = dinos.slice(1);
          toRemove.forEach((d) => d.remove());
          showMessage(
            `Zona ${zoneName}: eliminados ${toRemove.length} animales para respetar el límite de 1.`,
            "warn",
            3500
          );
        }
      }
    });
  }

  function sanitizeIslaZone() {
    zones.forEach((zone) => {
      const zoneName = zone.getAttribute("data-zone");
      if (zoneName === "isla") {
        const dinos = Array.from(zone.querySelectorAll("[data-dino]"));
        if (dinos.length > 1) {
          const toRemove = dinos.slice(1);
          toRemove.forEach((d) => d.remove());
          showMessage(
            `Zona ${zoneName}: eliminados ${toRemove.length} animales para respetar el límite de 1.`,
            "warn",
            3500
          );
        }
      }
    });
  }

  function sanitizeAll() {
    try {
      sanitizeDistinctZones();
      sanitizeTrioZones();
      sanitizeReyZone();
      sanitizeIslaZone();
    } catch (e) {}
  }

  // Exponer API global
  window.Recintos = {
    zoneRules,
    zoneHandlers,
    getRules,
    canAccept,
    updateScores,
    updateZoneCounts,
    sanitizeAll,
  };
})();
