// esto en C se conoce como #define, dado que JS no tiene esto uso valores const para hacer el código más legible
const INVALID = 0;
const VALID = 1;

/* la estructura que voy a analizar del array de JSON contiene los siguientes datos sobre el estado de escaleras/ascensores de las estaciones del subterráneo de buenos aires:
* LÍNEA: Línea A, Línea B...
* ESTACIÓN: San Pedrito, Flores, Carabobo...
* MEDIO DE ELEVACIÓN: Escalera 1, Ascensor 2...
* ESTADO: OK, FALLA, NO SUPERVISADO
*/ 

//Estas estructuras se llamarán elementos, y armando arrays de estos elementos en serie estaremos "suponiendo" que tenemos un JSON parseado en un array de strings.

//Ejemplo de elementos a analizar: tienen 4 componentes
const validElement1 = ["Línea A","San Pedrito","Ascensor 2","OK",];
const validElement2 = ["Línea A","Carabobo","Escalera 1"," OK",];

//El siguiente tiene un elemento que no existe: ascensor 4
const invalidElement1 =["Línea A","San Pedrito","Ascensor 4","FALLA",];
//el siguiente tiene un elemento que no existe: Juan Manuel de Rosas
const invalidElement2 =["Línea B","Juan Manuel de Rosas","Ascensor 1","FALLA",];
//El siguiente tiene un elemento que no existe: FALLA INTERMITENTE
const invalidElement3 =["Línea A","San Pedrito","Ascensor 1","FALLA INTERMITENTE",];
//el siguiente tiene un elemento que no existe: Línea F 
const invalidElement4 =["Línea F","San Pedrito","Ascensor 1","FALLA",];
//como decía anteriormente: los elementos están uno atrás de otro en un array, pues hay que recibir y validar ~415 escaleras/ascensores de todas las estaciones de todas las líneas.

//Ejemplo de array válido: tiene 4 tuplas (elementos multicomponente)
const validArray = validElement1.concat(validElement2,validElement1,validElement2);

//ejemplos de arrays inválidos: distintas posiciones para el elemento que no es válido
const invalidArray1 = invalidElement1.concat(validElement1,validElement2);
const invalidArray2 = validElement1.concat(validElement2,invalidElement3);
const invalidArray3 = validElement1.concat(invalidElement4);
const invalidArray4 = validElement1.concat(validElement2,validElement1,invalidElement4);
//estas variables se utilizarán como ejemplo para debuggear el código que hay aquí debajo:

//Función que utiliza un ciclo:
function checkJSONData (JSONArray)
{
  // JSONArray es solamente el JSON parseado en un array de strings.
  var validArray = VALID;
  // Lo primero que tiene que hacer mi función es chequear de a 4 datos, y tiene que hacerlo para la lista de ~415 elementos, así que acá uso un ciclo
  // voy a iterar con la variable i, incrementándola de a uno, pero sabiendo que voy a consultar de a 4 elementos juntos, así que itero hasta n/4 (= ~415 )
  for (let i=0 ; i<(JSONArray.length)/4 ; i++)
    {
      // idealmente me gustaría dejar afuera sólo los elementos no-válidos, haciendo que la var validArray sea un array, y preguntando por los válidos
      // como todavía no vimos arrays en clases, voy a dejarlo así, sabiendo que hay una mejor opción para no perder todo el JSON por un solo elemento inválido.
      // con el método slice() estoy quedándome sólo con 4 elementos del array total.
      validArray *= checkJSONArrayElement(JSONArray.slice(4*i,4*i+4));
      // checkJSONArrayElement devuelve 1 o 0 (valid o invalid) al multiplicar el resultado por el nuevo return, si alguno es invalid(0) el total se vuelve 0.
      // DEBIDO A ESTA FORMA DE VALIDAR EL ARRAY (multiplicando por la validez de cada elemento) tengo que empezar con la variable en VALID, de todas formas si alguno es inválido todos serán inválidos.
      // así es como detecto un elemento inválido, sin poder identificarlo (posible mejora) y desechando todo el array
    }
  // Si bien ya usé un ciclo, ahora tengo que usar un condicional para preguntar por el resultado del checkeo
  if (validArray==INVALID)
    {
      // primero pregunto por los casos de error.
      return INVALID;
    }
  else return VALID;
  // este es el caso deseable, a partir de acá salgo de esta función y digo que JSONArray es un array que tiene todos datos válidos, y puedo usarlo en mi programa.
}

//Función que usa un condicional ... aunque ya usé uno recién
function checkJSONArrayElement (arrayElement)
{
  // arrayElement sigue siendo un array!!
  var validElement = INVALID;
  // aclaración: acá estoy llamando "elemento" a un conjunto de 4 elementos
  validElement = esLinea(arrayElement[0]); // acá también soluciono el tema de darle como primer valor VALID a validElement
  validElement *= esEstacion(arrayElement[1]);
  validElement *= esMedio(arrayElement[2]);
  validElement *= esEstado(arrayElement[3]);
  // Esta forma de checkear elementos no tiene en cuenta que quizás se estén mezclando estaciones correctas con líneas correctas pero a las que no pertenecen
  // Por ejemplo este algoritmo da como válido la combinación "línea B" y estación "San Pedrito", lo cual no es correcto.
  // Hay muchas formas de solucionar este inconveniente, pero para esta entrega no me pareció que haga falta entrar en eso, aunque sí dejarlo asentado (TODO:)
  
  if (validElement == INVALID) return INVALID;
  else return VALID;
}

// A partir de acá estas funciones son solamente para que el código funcione

// Hay 4 funciones que son básicamente buscar un string en un array de strings... sólo cambia la lista en la cual busco así que:
function esLinea (text)
{
  return searchTextInArray(text,arrayLineas);
}

function esEstacion(text)
{
  return searchTextInArray(text,arrayEstaciones);
}

function esMedio(text)
{
  return searchTextInArray(text,arrayMedios);
}

function esEstado(text)
{
  return searchTextInArray(text,arrayEstados);
}

// esta función es una forma de resolver este problema de buscar un string en un array, pero hay muchas mejores técnicas
function searchTextInArray(text,array)
{
  var totalResult = INVALID;
  var result = INVALID;
  for(let i=0;i<array.length;i++)
    {
      result = INVALID;
      if (text==array[i])
        {
          result = VALID;
          return result;
        }
      totalResult = totalResult + result;
    }
  return totalResult;
}

// Estos son los arrays de los cuales buscaré los strings:

const arrayLineas = ["Línea A", "Línea B","Línea C","Línea D","Línea E","Línea H"];
const arrayEstaciones =["San Pedrito","Flores","Carabobo","Puán"];
const arrayMedios = ["Escalera 1", "Escalera 2","Escalera 3"];
const arrayEstados = ["OK","FALLA","NO SUPERVISADO"];

// Gracias por haber leído todos los comentarios, espero que hayan servido para entender el propósito de este código.