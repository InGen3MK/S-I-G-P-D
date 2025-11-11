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

  // Helpers de DOM
  const zones = document.querySelectorAll(".zone");

  function getRules(zoneName) {
    return zoneRules[zoneName] || { accepts: "any", max: 12 };
  }

  function canAccept(zoneEl, incomingType) {
    const zoneName = zoneEl.getAttribute("data-zone");
    const rules = getRules(zoneName);
    //si la zona acepta solo iguales
    if (rules.accepts === "same") {
      //obtiene los elementos existentes en la zona que tienen clase data-dino, lo convierte en un array, con el map recorremos el array y obtenemos el atributo data-dino de cada dinosaurio
      const existing = Array.from(zoneEl.querySelectorAll("[data-dino]")).map(
        //el map recorre un array existente y crea uno nuevo con lo que le pidamos, en este caso crea un array con la data-dino de cada elemento
        // obtiene los tipos de dinosaurios existentes en la zona
        (d) => d.getAttribute("data-dino")
      );
      //sirve para saber si hay dinosaurios distintos en la zona
      // crea un set con los tipos existentes para eliminar duplicados
      const distinct = Array.from(new Set(existing)); //set es una estructura de datos que no permite duplicados
      //si ya hay un dinosaurio en la zona y no es del mismo tipo que el que queremos colocar ahi +
      if (distinct.length > 0 && distinct[0] !== incomingType)
        //+ devuelve que error porque no se puede colocar esa nueva especie ya que ya hay otra
        return {
          ok: false,
          reason: `La zona ${zoneName} solo permite dinosaurios de la misma especie (ya contiene ${distinct[0]}).`,
        };
      //si la regla no es iguales y en su lugar es distintos
    } else if (rules.accepts === "distinct") {
      //obtiene los elementos existentes en la zona que tienen clase data-dino, lo convierte en un array, con el map recorremos el array y obtenemos el atributo data-dino de cada dinosaurio
      const existing = Array.from(zoneEl.querySelectorAll("[data-dino]")).map(
        (d) => d.getAttribute("data-dino")
      );
      //si existing ya contiene incoming type +
      if (existing.includes(incomingType))
        //+ devuelve error porque la zona solo permite distintos dinos
        return {
          ok: false,
          reason: `La zona ${zoneName} no permite duplicados de ${incomingType}.`,
        };
    } else if (
      //si rules.accepts es un array y el incoming type no esta incluido en ese array devuelve un error porque en esa zona no se aceptan dinosaurios de ese tipo
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

  function updateScores() {
    let total = 0;
    zones.forEach((zone) => {
      const zoneName = zone.getAttribute("data-zone");
      const rules = getRules(zoneName);
      const dinos = Array.from(zone.querySelectorAll("[data-dino]"));
      const count = dinos.length;
      let zoneScore = 0;

      //si la zona se llama rey empezamos con 0 puntos
      if (zoneName === "rey") {
        zoneScore = 0;
        //verifica que solo haya un dinosaurio en la zona
        if (count === 1) {
          //placed es el dinosaurio que esta
          const placed = dinos[0];
          //placedtype pregunta si existe placed, es decir si hay un dino en la zona, si existe ? devuelve su tipo de lo contrario: devuelve null
          const placedType = placed ? placed.getAttribute("data-dino") : null;

          // si existe placedtype
          if (placedType) {
            //crea un array con todos los dinosaurios colocados en todas las zonas
            const allPlaced = Array.from(
              document.querySelectorAll(".zone [data-dino]")
            );
            //  allPlaced es el array de arriba que contiene todos los dinosaurios colocados en el tablero
            //counts es un objeto que va a contener la cantidad de cada especie de dinosaurio
            const counts = allPlaced.reduce((acc, d) => {
              //reduce recorre cada dino que hay en allPlaced, acc es donde se van acumulando los resultados, es decir los dinosaurios y d es el dinosaurio actual que se esta procesando
              // t obtiene el tipo de dinosaurio
              const t = d.getAttribute("data-dino");
              //acc[t] busca en acc si existe una propiedad con el nombre del dino que obtuvimos arriba
              //si existe una propiedad con ese nombre le suma 1, si no existe le asigna el 1
              acc[t] = (acc[t] || 0) + 1;
              // devuelve el acumulador para el siguiente ciclo
              return acc;
            }, {});

            let maxCount = 0; //cuantos dinos tiene la especie mas repetida
            let maxSpecies = null; //el nombre de esa especie
            let maxCountOccurrences = 0; //cuantas especies empatan en repeticiones

            // este for recorre cada especie en counts y verifica si su cantidad es mayor que maxCount
            for (const s in counts) {
              //s representa cada especie en counts
              //si la cantidad de dinos de esa especie (counts[s]) es mayor que la especie mas repetida hasta ahora (maxCount)
              if (counts[s] > maxCount) {
                //counts[s] es la cantidad de dinos de cada especie (s)
                //actualiza la especie mas repetida, igualandola a counts(s)
                maxCount = counts[s];
                //guarda el nombre de la nueva especie mas repetida (s)
                maxSpecies = s;
                //como encontramos una nueva especie mas repetida, reiniciamos las repeticiones a 1
                maxCountOccurrences = 1;
                //de lo contrario, si counts(s) es igual a maxCount
              } else if (counts[s] === maxCount) {
                //aumenta el contador de especies que empatan en repeticiones
                maxCountOccurrences += 1;
              }
            }
            if (
              //verifica que rey no este vacio
              maxCount > 0 &&
              //comprueba que solo haya una especie con la mayor cantidad de repeticiones
              maxCountOccurrences === 1 &&
              //verifica que la especie mas repetida sea la misma que la que esta en la zona rey
              maxSpecies === placedType
            )
              //si todo eso es verdadero asigna 7 puntos a zoneScore
              zoneScore = 7;
          }
        }
        //si el nombre es trio en vez de rey
      } else if (zoneName === "trio") {
        //define zoneScore
        zoneScore =
          //pregunta si rules.max es un numero, si es asi usa ese valor, si no usa 3. Si la condicion se cumple se le asignan 7 puntos, si no 0
          count === (typeof rules.max === "number" ? rules.max : 3) ? 7 : 0;
        //si el nombre de la zona es amor y no trio ni rey
      } else if (zoneName === "amor") {
        // reduce recorre el array de dinos en la zona amor y cuenta cuantos pares hay de cada especie
        const counts = dinos.reduce((acc, d) => {
          //acc es el acumulador donde se van guardando los resultados, d es el dinosaurio actual que se esta procesando
          //obtenemos la data-dino de d
          const t = d.getAttribute("data-dino");
          //si acc ya tiene una propiedad con el nombre del dino le suma 1, si no existe le asigna 1
          acc[t] = (acc[t] || 0) + 1;
          //devuelve el acumulador para el siguiente ciclo
          return acc;
        }, {});
        //este for recorre cada especie en counts
        for (const k in counts) {
          //k representa cada especie en counts
          //pairs calcula cuantas parejas hay al dividir la cantidad de dinos de esa especie entre 2 y redondeando hacia abajo por si hay un numero impar
          const pairs = Math.floor(counts[k] / 2);
          //suma 5 puntos por pareja
          zoneScore += pairs * 5;
        }
        //si el nombre de la zona es isla y no ningun otro
      } else if (zoneName === "isla") {
        //empezamos con 0 puntos
        zoneScore = 0;
        //si hay un dinosaurio en la zona
        if (count === 1) {
          //placed es el dinosaurio colocado
          const placed = dinos[0];
          //si placed existe obtiene su tipo, si no devuelve null
          const placedType = placed ? placed.getAttribute("data-dino") : null;
          //si existe placedType
          if (placedType) {
            //crea un array con todos los dinosaurios colocados en todas las zonas
            const allPlaced = Array.from(
              document.querySelectorAll(".zone [data-dino]")
            );
            //counts contiene el reduce que lo que hace es recorrer allPlaced y contar cuantas veces aparece cada especie
            const counts = allPlaced.reduce((acc, d) => {
              //d es el dinosaurio actual que se esta procesando y t obtiene su data-dino
              const t = d.getAttribute("data-dino");
              //si acc ya tiene una propiedad con el nombre del dino le suma 1, si no existe le asigna 1
              acc[t] = (acc[t] || 0) + 1;
              return acc;
            }, {});
            //si la cantidad de dinos de la especie colocada en isla es 1 asigna 7 puntos
            if ((counts[placedType] || 0) === 1) zoneScore = 7;
          }
        }
        //si existe scoring table
      } else if (rules.scoringTable) {
        //si existe asigna zoneScore segun la tabla de puntuacion si no otorga 0 puntos
        zoneScore = rules.scoringTable[count] || 0;
      } else {
        // si no hay tabla de puntuacion asigna zoneScore igual al numero de dinos en la zona
        zoneScore = count;
      }
      //actualiza la puntuacion correspondiente a la zona
      const span = document.getElementById("score-" + zoneName); //busca el lugar en la tabla de puntuacion donde se muestran los puntos de esta zona
      // si existe span actualizamos su contenido al valor de zoneScore, es decir a la puntuacion
      if (span) span.textContent = zoneScore;
      // sumamos la puntuacion de esta zona al total
      total += zoneScore;
    });
    // buscamos score-total en el documento
    const totalSpan = document.getElementById("score-total");
    // si existe actualizamos su contenido al valor total de puntuacion
    if (totalSpan) totalSpan.textContent = Math.round(total);
    //llama a la funcion updateZoneCounts
    updateZoneCounts();
  }

  function updateZoneCounts() {
    //recorre todas las zonas
    zones.forEach((zone) => {
      //obtiene el nombre de la zona
      const zoneName = zone.getAttribute("data-zone");
      //obtiene las reglas de esa zona
      const rules = getRules(zoneName) || {};
      //establece el maximo de dinosaurios permitidos en esa zona, si no hay un maximo definido usa 12
      const max = typeof rules.max === "number" ? rules.max : 12;
      //cuenta cuantos dinosaurios hay en esa zona
      const count = zone.querySelectorAll("[data-dino]").length;
      //busca el label de la zona
      let label = zone.querySelector(".zone-label");
      // si no existe el label lo crea
      if (!label) {
        label = document.createElement("span");
        label.className = "zone-label";
        label.textContent = zoneName;
        //esta linea inserta el label al inicio del elemento zone
        zone.insertBefore(label, zone.firstChild);
      }
      //agrega el badge que muestra el conteo de dinosaurios en la zona
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
    //recorre todas las zonas
    zones.forEach((zone) => {
      //obtiene el nombre de la zona
      const zoneName = zone.getAttribute("data-zone");
      //obtiene las reglas de esa zona
      const rules = getRules(zoneName) || {};
      //si la zona acepta solo distintos
      if (rules.accepts === "distinct") {
        //obtiene todos los dinosaurios en esa zona
        const dinos = Array.from(zone.querySelectorAll("[data-dino]"));
        // crea un set para rastrear los tipos ya colocados
        const seen = new Set();
        // contador de eliminados
        let removed = 0;
        //recorre todos los dinos en la zona
        dinos.forEach((d) => {
          //t contiene el tipo de dinosaurio
          const t = d.getAttribute("data-dino");
          //si el set ya tiene ese tipo
          if (seen.has(t)) {
            //remueve el dinosaurio duplicado
            d.remove();
            //aumenta el contador de eliminados
            removed += 1;
            //si no existe en el set lo agrega
          } else seen.add(t);
        });
        //si se eliminaron duplicados muestra un mensaje
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
    //recorre todas las zonas
    zones.forEach((zone) => {
      //obtiene el nombre de la zona
      const zoneName = zone.getAttribute("data-zone");
      //obtiene las reglas de esa zona
      const rules = getRules(zoneName) || {};
      //si la zona se llama trio
      if (zoneName === "trio") {
        //si max es un numero devuelve max, si no devuelve 3
        const max = typeof rules.max === "number" ? rules.max : 3;
        //obtiene todos los dinosaurios en esa zona
        const dinos = Array.from(zone.querySelectorAll("[data-dino]"));
        //si la cantidad de dinosaurios es mayor que el maximo permitido
        if (dinos.length > max) {
          //obtiene los dinosaurios que exceden el maximo
          const toRemove = dinos.slice(max); //el slice obtiene todos los elementos a partir del indice maximo en este caso 3 y los corta
          //remueve los dinosaurios excedentes
          toRemove.forEach((d) => d.remove());
          //muestra un mensaje indicando cuantos se eliminaron
          showMessage(
            `Zona ${zoneName}: eliminados ${toRemove.length} dinosaurios para respetar el límite de ${max}.`,
            "warn",
            3500
          );
        }
      }
    });
  }

  function sanitizeReyZone() {
    //recorre todas las zonas
    zones.forEach((zone) => {
      //obtiene el nombre de la zona
      const zoneName = zone.getAttribute("data-zone");
      //si la zona es rey
      if (zoneName === "rey") {
        //obtiene todos los dinosaurios en esa zona y los convierte en un array
        const dinos = Array.from(zone.querySelectorAll("[data-dino]"));
        //si hay mas de un dinosaurio
        if (dinos.length > 1) {
          //obtiene todos los dinosaurios excepto el primero
          const toRemove = dinos.slice(1);
          //remueve los dinosaurios excedentes
          toRemove.forEach((d) => d.remove());
          //muestra un mensaje indicando cuantos se eliminaron
          showMessage(
            `Zona ${zoneName}: eliminados ${toRemove.length} dinosaurios para respetar el límite de 1.`,
            "warn",
            3500
          );
        }
      }
    });
  }

  function sanitizeIslaZone() {
    //recorre todas las zonas
    zones.forEach((zone) => {
      //obtiene el nombre de la zona
      const zoneName = zone.getAttribute("data-zone");
      //si la zona es isla
      if (zoneName === "isla") {
        //crea un array con todos los dinosaurios en esa zona
        const dinos = Array.from(zone.querySelectorAll("[data-dino]"));
        //si hay mas de un dinosaurio
        if (dinos.length > 1) {
          //obtiene todos los dinosaurios excepto el primero
          const toRemove = dinos.slice(1);
          //remueve los dinosaurios excedentes
          toRemove.forEach((d) => d.remove());
          //muestra un mensaje indicando cuantos se eliminaron
          showMessage(
            `Zona ${zoneName}: eliminados ${toRemove.length} dinosaurios para respetar el límite de 1.`,
            "warn",
            3500
          );
        }
      }
    });
  }
  //funcion que ejecuta todas las sanitizaciones
  function sanitizeAll() {
    try {
      sanitizeDistinctZones();
      sanitizeTrioZones();
      sanitizeReyZone();
      sanitizeIslaZone();
    } catch (e) {}
  }

  window.Recintos = {
    zoneRules,
    getRules,
    canAccept,
    updateScores,
    updateZoneCounts,
    sanitizeAll,
  };
})();
