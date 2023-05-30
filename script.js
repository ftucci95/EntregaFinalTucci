/* Mi proyecto consiste en un código que decodifica un JSON y muestra la información en unas tablas.
* la estructura que voy a analizar del array de JSON contiene los siguientes datos sobre el estado de escaleras/ascensores de las estaciones del subterráneo de buenos aires:
* LÍNEA: Línea A, Línea B...
* ESTACIÓN: San Pedrito, Flores, Carabobo...
* MEDIO DE ELEVACIÓN: Escalera 1, Ascensor 2...
* ESTADO: OK, FALLA, NO SUPERVISADO
*/ 

import fs from "fs";
// esto en C se conoce como #define, dado que JS no tiene esto uso valores const para hacer el código más legible
const INVALID = 0;
const VALID = 1;
// Este es el array que valida los estados de los medios de elevación:
const arrayEstados = ["OK","FALLA","NO SUPERVISADO"];
// cuántas veces voy a intentar parsear el mismo json antes de descartarlo por erróneo?
const MaxJsonTries = 3;
// un par de const para legibilidad 
const YES = 1;
const NO = 0;
const ERROR = -1;
const OK = 1;
const INCOMPLETE = 0;
const ESCALERA=0;
const ASCENSOR=1;
// como voy a cargar una lista pre-armada desde un archivo obvio que indicaré el path
const STATUS_FILE_PATH = "./list.txt";
// Una variable global? claro, estas sí o sí se declaran con VAR (aunque suele beneficiar a river y perjudicar a boquita)
// y sí, será una lista de objetos.
var todosLosMedios = [];

//Estas estructuras estarán representadas por objetos, y armando arrays de estos objetos en serie estaremos tenemos el estado de todos los medios de elevación (escaleros/ascensores).
// Definición de clases:
class MedioDeElevación{
  // La clase medio de elevación contiene la información por ejemplo de una escalera mecánica cualquiera, dónde está situada, cómo se llama y su estado actual.
  constructor(linea,estacion,escalera,nombre,estado)
  {
    this.linea=String(linea);
    this.estacion=String(estacion);
    this.escalera=String(escalera); //0 para escaleras, 1 para ascensores
    this.nombre=String(nombre);
    this.estado=String(estado);
  }

  // función para actualizar el estado del medio de elevación, luego de leer el JSON
  actualizarEstado(new_estado)
  {
    this.estado = new_estado;
  }

  //funcion que devuelve una concatenación de linea, estación, escalera o ascensor(0 o 1), y el nombre
  quienSoy()
  {
    let aux_string = String(this.linea)+String(this.estacion)+String(this.escalera)+String(this.nombre)
    return aux_string;
  }

  //función para comparar el nombre propio con una cadena externa... útil
  acasoSoy(supposedName)
  {
    if (String(supposedName) === this.quienSoy())
    {
      return YES;
    }
    return NO;
  }
}

//Ejemplo de elementos a analizar: tienen 4 componentes
const validElement1 = new MedioDeElevación("Línea A","San Pedrito",ASCENSOR,"2","OK");
const validElement2 = new MedioDeElevación("Línea A","Carabobo",ESCALERA,"1","OK");

//El siguiente tiene un elemento que no existe: ascensor 4
const invalidElement1 =new MedioDeElevación("Línea A","San Pedrito",ASCENSOR,"4","FALLA");
//el siguiente tiene un elemento que no existe: Juan Manuel de Rosas
const invalidElement2 =new MedioDeElevación("Línea B","Juan Manuel de Rosas",ASCENSOR, "1","FALLA");
//El siguiente tiene un elemento que no existe: FALLA INTERMITENTE
const invalidElement3 =new MedioDeElevación("Línea A","San Pedrito",ASCENSOR,"1","FALLA INTERMITENTE");
//el siguiente tiene un elemento que no existe: Línea F 
const invalidElement4 =new MedioDeElevación("Línea F","San Pedrito",ASCENSOR,"1","FALLA");
//como decía anteriormente: los elementos están uno atrás de otro en un array, pues hay que recibir y validar ~415 escaleras/ascensores de todas las estaciones de todas las líneas.

//Ejemplo de array válido:
const validArray = validElement1.push(validElement2,validElement1,validElement2);

//ejemplos de arrays inválidos: distintas posiciones para el elemento que no es válido
const invalidArray1 = invalidElement1.push(validElement1,validElement2);
const invalidArray2 = validElement1.push(validElement2,invalidElement3);
const invalidArray3 = validElement1.push(invalidElement4);
const invalidArray4 = validElement1.push(validElement2,validElement1,invalidElement4);
//estas variables se utilizarán como ejemplo para debuggear el código que hay aquí debajo:

//Función que utiliza un ciclo:
function checkJSONData (JSONArray)
{
  // JSONArray es solamente el JSON parseado en un array de objetos.
  let validArray = [];
  //hago una copia del JSONArray pues utilizaré la función POP, así que ahora uso MAP
  let auxJSONArray = JSONArray.map((x) => x);
  // Lo primero que tiene que hacer mi función es chequear la validez de los objetos, y tiene que hacerlo para la lista de ~415 elementos, así que acá uso un ciclo
  // voy a iterar con la variable i, incrementándola de a uno
  while(auxJSONArray.length>0)
    {
      // idealmente me gustaría dejar afuera sólo los elementos no-válidos, haciendo que la var validArray sea un array, y preguntando por los válidos
      validArray.push(checkJSONArrayElement(auxJSONArray[auxJSONArray.length-1]));
      // como pop saca al último, al válidArray pusheo desde el último elemento de auxJSONArray
      auxJSONArray.pop()
      // checkJSONArrayElement devuelve 1 o 0 (valid o invalid)
      // así es como detecto un elemento inválido, pudiendo identificarlo y desechándolo en la siguiente parte de la función
    }
  // cuando toda esta secuencia terminó quiero tener para cada objeto una validez asociada... pero ahora el array de validez está invertido, porque pop saca al último elemento...
  // entonces invierto el array de validez: funciona esta línea? testear
  validArray=validArray.reverse();
  //Ahora actualizaré sólo los válidos: armo una lista filtrada
  filteredJSONArray = [];
  for (let i=0;i<validArray.length;i++)
  {
    // Si bien ya usé un ciclo, ahora tengo que usar un condicional para preguntar por el resultado del checkeo
    if (validArray[i]==INVALID)
      {
        // primero pregunto por los casos de error: no pusheo, no hago nada, no me interesa popear
      }
    else
    {
      // este es el caso deseable, meto los válidos en el array  y puedo usarlo en mi programa.
      filteredJSONArray.push(JSONArray[i]);
    }
  }
  return filteredJSONArray;
}

//Función que usa un condicional ... aunque ya usé uno recién
function checkJSONArrayElement (arrayElement)
{
  // arrayElement ahora es un objeto!!
  let validElement = INVALID;
  // aclaración: acá estoy llamando "elemento" a un conjunto de 4 elementos
  let found = NO;
  let index = 0;
  while(found!=SI || index>=todosLosMedios.length)
  {
    found = todosLosMedios[index].acasoSoy(arrayElement.quienSoy());
    if (found==SI)
    {
      validELement = VALID; //por ahora...
    }
    index++;
  }
  //y el estado que me están mandando es posible?
  validElement *= esEstado(arrayElement.estado);
  // Ahora está completo: los medios de elevación están validados.
  
  if (validElement == INVALID) return INVALID;
  else return VALID;
}

// A partir de acá estas funciones son solamente para que el código funcione

// Hay 4 funciones que son básicamente buscar un string en un array de strings... sólo cambia la lista en la cual busco así que:
/* Deprecated:
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
*/
function esEstado(text)
{
  return searchTextInArray(text,arrayEstados);
}

// esta función es una forma de resolver este problema de buscar un string en un array, pero hay muchas mejores técnicas
function searchTextInArray(text,array)
{
  let totalResult = INVALID;
  let result = INVALID;
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

// Antes que nada le tengo que dar una condición inicial a todo este sistemita, así que voy a inicializar la lista con una función que cargue todos los medios de elevación desde un archivo de texto
function load(file)
{
  let file_strings=[];
  let ME_list = [];
  //path del archivo

  //abro el archivo, lo leo todo en un string y cierro el archivo
  let text = fs.readFileSync(file, "utf-8");
  file_strings = text.split("\n");
  //parseo el string, cargando los valores separados por coma en un objeto ME
  for (let i=0;i<file_strings.length;i++)
  {
    let new_ME = new MedioDeElevación(file_strings[i].split(","));
    ME_list.push(new_ME);
  }
  // hago esto para todos los ME

  // devuelvo una lista con el estado actual (cargada desde un archivo)
  return ME_list;
}

// Primero necesito una función que se llame al abrir la tabla, su misión es leer el JSON (que tiene información nueva) y actualice los valores de la tabla:
// Al haber una tabla para cada línea de subte, todas las tablas llaman a la misma función:
function onTableOpen ()
{
  // esto es lo que considero mi función main, cuando se abre la tabla pide un nuevo JSON
  // esto sería el equivalente a cargar el estado de los medios de elevación desde el servidor:
  todosLosMedios = load(STATUS_FILE_PATH);

  let PROCESS_STATUS = OK;
  // Ahora leo el JSON nuevo: está incompleto así que alertará sobre que tiene errores
  let validJSON = readJSON();
  if (PROCESS_STATUS == ERROR)
  {
    alert("El proceso ha sido erróneo y no se actualizará la tabla.");
  }
  else if ( PROCESS_STATUS == INCOMPLETE)
  {
    //tiene que entrar en esta condición
    alert ("El JSON no tiene todos los ME, se actualizará una porción de la tabla");
    //
    updateTable(validJSON);
  }
  else
  {
    updateTable(validJSON);
    alert("El proceso ha sido exitoso y se actualizó la tabla.");
  }
}

// readJSON es llamada, el JSON es leído, luego parseado y corroborado:
function readJSON()
{
  // intentaré una cantidad MaxJsonTries de veces de hacer la lectura de un JSON
  let tries = 0;
  while (tries < MaxJsonTries)
  {
    let newJSON = getJSONData();
    let validPortion = checkJSONData(newJSON);
    if (validPortion.length != newJSON.length)
    {
      // Caso de error, tengo que decir que la trama está corrupta y la descarto
      alert("La lectura del JSON ha devuelto un error y se descartará la trama.");
    }
    else
    {
      // Caso exitoso, lo devuelvo
      return newJSON;
    }
    ++tries;
  }
  // estar en esta parte de la función significa que ya intenté 3 veces y aún no he conseguido un JSON entero válido, así que devuelvo la porción válida.
  PROCESS_STATUS = INCOMPLETE; 
  return validPortion;
}

function getJSONData()
{
  // como todavía no vimos JSON acá simplemente voy a cargar otro archivo de texto como si fuera un JSON: está incompleto así que va a salir que tiene errores
  let newJSON = load("./SpoofJSON.txt");
  return newJSON;
}

function updateTable(validJSON)
{
  //todosLosMedios = Table2List();
  for (let i =0;i<validJSON.length;i++)
  {
    //busco cada medio en la tabla y lo guardo
    for (let j=0;j<todosLosMedios.length;j++)
    {
      if (document.getElementById(Medio2Id(validJSON[i]))!=NULL)
        {
          document.getElementById(Medio2Id(validJSON[i])).innerHTML =validJSON[i].estado;
        }
      else
        {
          alert("Not found... couldn't update table!");
        }
    }
  }
}

function Table2List()
{
  // Esta es la función que en teoría debe cargar la tabla desde el servidor y ponerla en una lista
  // por ahora lo soluciono así
  return load(STATUS_FILE_PATH);
}

function Medio2Id(medioDeElevacion)
{
  let id = String(medioDeElevacion.linea)+String(medioDeElevacion.estacion)+String(medioDeElevacion.ascensor)+String("-")+String(medioDeElevacion.nombre);
  return id;
}