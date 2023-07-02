/* Mi proyecto consiste en un código que decodifica un JSON y muestra la información en unas tablas.
* la estructura que voy a analizar del array de JSON contiene los siguientes datos sobre el estado de escaleras/ascensores de las estaciones del subterráneo de buenos aires:
* LÍNEA: Línea A, Línea B...
* ESTACIÓN: San Pedrito, Flores, Carabobo...
* MEDIO DE ELEVACIÓN: Escalera 1, Ascensor 2...
* ESTADO: OK, FALLA, NO SUPERVISADO
*/

 

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
    if (String(supposedName) === String(this.linea)+String(this.estacion)+String(this.escalera)+String(this.nombre))
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
const validArray = [validElement1,validElement2,validElement1,validElement2];

//ejemplos de arrays inválidos: distintas posiciones para el elemento que no es válido
const invalidArray1 = [invalidElement1,validElement1,validElement2];
const invalidArray2 = [validElement1,validElement2,invalidElement3];
const invalidArray3 = [validElement1,invalidElement2];
const invalidArray4 = [validElement1,validElement2,validElement1,invalidElement4];
//estas variables se utilizarán como ejemplo para debuggear el código que hay aquí debajo:

//Función que utiliza un ciclo:
function checkJSONData (JSONArray)
{
  // JSONArray es solamente el JSON parseado en un array de objetos.
  let validArray = [];
  //hago una copia del JSONArray pues utilizaré la función POP, así que ahora uso MAP
  let auxJSONArray = [...JSONArray];
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
  console.log("PRINTING VALID ARRAY: checkJSONData:");
  console.log(validArray);
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
  while(found!=YES && index<todosLosMedios.length)
  {
    found = todosLosMedios[index].acasoSoy(arrayElement.quienSoy());
    if (found==YES)
    {
      validElement = VALID; //por ahora...
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

//import fs from "fs";
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
var PROCESS_STATUS = OK;
// Primero necesito una función que se llame al abrir la tabla, su misión es leer el JSON (que tiene información nueva) y actualice los valores de la tabla:
// Al haber una tabla para cada línea de subte, todas las tablas llaman a la misma función:
function onTableOpen ()
{
  // esto es lo que considero mi función main, cuando se abre la tabla pide un nuevo JSON
  // esto sería el equivalente a cargar el estado de los medios de elevación desde el servidor:
  //todosLosMedios = load(STATUS_FILE_PATH);
  //todosLosMedios = getText("https://github.com/ftucci95/PreEntrega2Tucci/blob/master/list.txt")
  todosLosMedios = str2Objects(listtxt);
  
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
    console.log("PROCESS INCOMPLETE:")
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
  let validPortion = [];
  while (tries < MaxJsonTries)
  {
    let newJSON = getJSONData();
    validPortion = checkJSONData(newJSON);
    if (validPortion.length != newJSON.length)
    {
      // Caso de error, tengo que decir que la trama está corrupta y la descarto
      alert("La lectura del JSON ha devuelto un error y se descartará la trama.");
    }
    else
    {
      // Caso exitoso, lo devuelvo
      return validPortion;
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
  //let newJSON = getText("https://github.com/ftucci95/PreEntrega2Tucci/blob/master/SpoofJSON.txt");
  // como tampoco anduvo lo cargué en un array de strings... SpoofJSONtxt se llama
  let newJSON = [];
  for(let i =0;i<SpoofJSONtxt.length;i++)
  {
    let string = SpoofJSONtxt[i].split(',');
    let new_ME = new MedioDeElevación(string[0],string[1],string[2],string[3],string[4]);
    newJSON.push(new_ME);
  }
  return newJSON;
}

function str2Objects(stringME)
{
  let newJSON = [];
  for(let i =0;i<stringME.length;i++)
  {
    let string = stringME[i].split(',');
    let new_ME = new MedioDeElevación(string[0],string[1],string[2],string[3],string[4]);
    newJSON.push(new_ME);
  }
  return newJSON;
}

function updateTable(validJSON)
{
  //todosLosMedios = Table2List();
  for (let i =0;i<validJSON.length;i++)
  {
    console.log("Searching for:" + String(validJSON[i].quienSoy()))
    //busco cada medio en la tabla y lo guardo

    if (document.getElementById(Medio2Id(validJSON[i]))!=null)
      {
        console.log("I found that it's this one: "+ String(Medio2Id(validJSON[i])))
        document.getElementById(Medio2Id(validJSON[i])).innerHTML =validJSON[i].estado;
      }
    else
      {
        console.log("Not found... couldn't update table!");
      }
  }
}

function Table2List()
{
  // Esta es la función que en teoría debe cargar la tabla desde el servidor y ponerla en una lista
  // por ahora lo soluciono así
  //return load(STATUS_FILE_PATH);
}

function Medio2Id(medioDeElevacion)
{
  let id = String(medioDeElevacion.linea)+String(medioDeElevacion.estacion)+String(medioDeElevacion.escalera)+String("-")+String(medioDeElevacion.nombre);
  return id;
}





// Bueno, después de mucho pelear entendí que no puedo leer desde el navegador web archivos locales de mi PC, pero sí puedo leer los que están subidos a github!!
// así que acá abajo hay un código que no es mío, que me afané de stackoverflow pero modifiqué levemente para probar si puedo leerlo desde mi github o no:

let listtxt= ["A,ACOYTE,1,1,NO SUPERVISADO","A,ACOYTE,1,2,NO SUPERVISADO","A,ACOYTE,0,4,NO SUPERVISADO","A,ACOYTE,0,5,NO SUPERVISADO","A,CARABOBO,1,1,NO SUPERVISADO","A,CARABOBO,1,2,NO SUPERVISADO","A,CARABOBO,1,3,NO SUPERVISADO","A,CARABOBO,0,1,NO SUPERVISADO","A,CARABOBO,0,2,NO SUPERVISADO","A,CARABOBO,0,3,NO SUPERVISADO","A,CASTRO BARROS,1,1 (SUR),NO SUPERVISADO","A,CASTRO BARROS,0,1 (EXT),NO SUPERVISADO","A,CONGRESO,1,1 (NORTE),NO SUPERVISADO","A,CONGRESO,1,2 (SUR),NO SUPERVISADO","A,CONGRESO,0,3,NO SUPERVISADO","A,CONGRESO,0,S,NO SUPERVISADO","A,FLORES,1,1,NO SUPERVISADO","A,FLORES,1,2,NO SUPERVISADO","A,FLORES,1,3,NO SUPERVISADO","A,FLORES,0,1,NO SUPERVISADO","A,FLORES,0,2,NO SUPERVISADO","A,FLORES,0,3,NO SUPERVISADO","A,FLORES,0,4,NO SUPERVISADO","A,LIMA,0,1 (EXT),NO SUPERVISADO","A,LORIA,1,1 (N),NO SUPERVISADO","A,LORIA,0,1 (EXT),NO SUPERVISADO","A,PERU,1,1 (NORTE),NO SUPERVISADO","A,PERU,1,2 (SUR),NO SUPERVISADO","A,PERU,0,1,NO SUPERVISADO","A,PERU,0,2 (SUR),NO SUPERVISADO","A,PIEDRAS,0,2,NO SUPERVISADO","A,PLAZA DE MAYO,1,1,NO SUPERVISADO","A,PLAZA MISERERE,0,6,NO SUPERVISADO","A,PLAZA MISERERE,0,7,NO SUPERVISADO","A,PLAZA MISERERE,0,8,NO SUPERVISADO","A,PLAZA MISERERE,0,9,NO SUPERVISADO","A,PLAZA MISERERE,0,QE,NO SUPERVISADO","A,PLAZA MISERERE,0,QO,NO SUPERVISADO","A,PRIMERA JUNTA,1,1 (NORTE),NO SUPERVISADO","A,PRIMERA JUNTA,1,2 (SUR),NO SUPERVISADO","A,PRIMERA JUNTA,0,1 (EXT),NO SUPERVISADO","A,PRIMERA JUNTA,0,2 (SUR),NO SUPERVISADO","A,PRIMERA JUNTA,0,3 (NORTE),NO SUPERVISADO","A,PUAN,1,1 (NORTE),NO SUPERVISADO","A,PUAN,1,2 (SUR),NO SUPERVISADO","A,PUAN,1,3,NO SUPERVISADO","A,PUAN,0,1,NO SUPERVISADO","A,PUAN,0,2,NO SUPERVISADO","A,PUAN,0,3,NO SUPERVISADO","A,SAENZ PEÑA,0,N,NO SUPERVISADO","A,SAENZ PEÑA,0,S,NO SUPERVISADO","A,SAN PEDRITO,1,1 (NORTE),NO SUPERVISADO","A,SAN PEDRITO,1,2 (SUR),NO SUPERVISADO","A,SAN PEDRITO,0,1,NO SUPERVISADO","A,SAN PEDRITO,0,2,NO SUPERVISADO","A,SAN PEDRITO,0,3,NO SUPERVISADO","B,ANGEL GALLARDO,0,EXT,NO SUPERVISADO","B,CALLAO,1,1,NO SUPERVISADO","B,CALLAO,1,2,NO SUPERVISADO","B,CALLAO,1,3,NO SUPERVISADO","B,CALLAO,0,13,NO SUPERVISADO","B,CALLAO,0,14,NO SUPERVISADO","B,CALLAO,0,15,NO SUPERVISADO","B,CALLAO,0,16,NO SUPERVISADO","B,CALLAO,0,EXT,NO SUPERVISADO","B,CARLOS GARDEL,0,1,NO SUPERVISADO","B,CARLOS GARDEL,0,2,NO SUPERVISADO","B,CARLOS GARDEL,0,3,NO SUPERVISADO","B,CARLOS GARDEL,0,4,NO SUPERVISADO","B,CARLOS PELLEGRINI,0,17,NO SUPERVISADO","B,CARLOS PELLEGRINI,0,18,NO SUPERVISADO","B,DORREGO,0,EXT,NO SUPERVISADO","B,ECHEVERRÍA,1,1,NO SUPERVISADO","B,ECHEVERRÍA,1,2,NO SUPERVISADO","B,ECHEVERRÍA,1,3,NO SUPERVISADO","B,ECHEVERRÍA,0,1,NO SUPERVISADO","B,ECHEVERRÍA,0,2,NO SUPERVISADO","B,ECHEVERRÍA,0,3,NO SUPERVISADO","B,ECHEVERRÍA,0,4,NO SUPERVISADO","B,ECHEVERRÍA,0,5,NO SUPERVISADO","B,FEDERICO LACROZE,0,HALL,NO SUPERVISADO","B,FEDERICO LACROZE,0,S.E.,NO SUPERVISADO","B,FEDERICO LACROZE,0,S.O.,NO SUPERVISADO","B,FLORIDA,0,19,NO SUPERVISADO","B,FLORIDA,0,20,NO SUPERVISADO","B,FLORIDA,0,21,NO SUPERVISADO","B,FLORIDA,0,22,NO SUPERVISADO","B,JUAN MANUEL DE ROSAS,1,1,NO SUPERVISADO","B,JUAN MANUEL DE ROSAS,1,2,NO SUPERVISADO","B,JUAN MANUEL DE ROSAS,1,3,NO SUPERVISADO","B,JUAN MANUEL DE ROSAS,1,4,NO SUPERVISADO","B,JUAN MANUEL DE ROSAS,1,5,NO SUPERVISADO","B,JUAN MANUEL DE ROSAS,1,6,NO SUPERVISADO","B,JUAN MANUEL DE ROSAS,0,1,NO SUPERVISADO","B,JUAN MANUEL DE ROSAS,0,2,NO SUPERVISADO","B,JUAN MANUEL DE ROSAS,0,3,NO SUPERVISADO","B,JUAN MANUEL DE ROSAS,0,4,NO SUPERVISADO","B,JUAN MANUEL DE ROSAS,0,5,NO SUPERVISADO","B,JUAN MANUEL DE ROSAS,0,6,NO SUPERVISADO","B,JUAN MANUEL DE ROSAS,0,7,NO SUPERVISADO","B,JUAN MANUEL DE ROSAS,0,8,NO SUPERVISADO","B,JUAN MANUEL DE ROSAS,0,9,NO SUPERVISADO","B,JUAN MANUEL DE ROSAS,0,10,NO SUPERVISADO","B,JUAN MANUEL DE ROSAS,0,11,NO SUPERVISADO","B,LEANDRO N. ALEM,0,EXT,NO SUPERVISADO","B,LEANDRO N. ALEM,0,INT,NO SUPERVISADO","B,LOS INCAS,1,1,NO SUPERVISADO","B,LOS INCAS,1,2,NO SUPERVISADO","B,LOS INCAS,0,1,NO SUPERVISADO","B,LOS INCAS,0,2,NO SUPERVISADO","B,LOS INCAS,0,3,NO SUPERVISADO","B,LOS INCAS,0,4,NO SUPERVISADO","B,MALABIA,0,EXT,NO SUPERVISADO","B,MEDRANO,0,EXT,NO SUPERVISADO","B,PASTEUR,0,9,NO SUPERVISADO","B,PASTEUR,0,10,NO SUPERVISADO","B,PASTEUR,0,11,NO SUPERVISADO","B,PASTEUR,0,12,NO SUPERVISADO","B,PUEYRREDÓN,0,5,NO SUPERVISADO","B,PUEYRREDÓN,0,6,NO SUPERVISADO","B,PUEYRREDÓN,0,7,NO SUPERVISADO","B,PUEYRREDÓN,0,8,NO SUPERVISADO","B,PUEYRREDÓN,0,EXT,NO SUPERVISADO","B,TRONADOR,1,1,NO SUPERVISADO","B,TRONADOR,1,2,NO SUPERVISADO","B,TRONADOR,0,1,NO SUPERVISADO","B,TRONADOR,0,2,NO SUPERVISADO","B,TRONADOR,0,3,NO SUPERVISADO","B,TRONADOR,0,4,NO SUPERVISADO","B,URUGUAY,1,1,NO SUPERVISADO","B,URUGUAY,1,2,NO SUPERVISADO","B,URUGUAY,1,3,NO SUPERVISADO","B,URUGUAY,0,EXT,NO SUPERVISADO","B,URUGUAY,0,INT (ANDÉN),NO SUPERVISADO","C,AVENIDA DE MAYO,0,9,NO SUPERVISADO","C,AVENIDA DE MAYO,0,10,NO SUPERVISADO","C,AVENIDA DE MAYO,0,EXT.,NO SUPERVISADO","C,CONSTITUCIÓN,1,1,NO SUPERVISADO","C,CONSTITUCIÓN,1,2,NO SUPERVISADO","C,CONSTITUCIÓN,1,3,NO SUPERVISADO","C,CONSTITUCIÓN,1,4,NO SUPERVISADO","C,CONSTITUCIÓN,0,1,NO SUPERVISADO","C,CONSTITUCIÓN,0,2,NO SUPERVISADO","C,DIAGONAL NORTE,1,1,NO SUPERVISADO","C,DIAGONAL NORTE,1,2,NO SUPERVISADO","C,DIAGONAL NORTE,1,3,NO SUPERVISADO","C,DIAGONAL NORTE,0,11,NO SUPERVISADO","C,DIAGONAL NORTE,0,12,NO SUPERVISADO","C,DIAGONAL NORTE,0,13,NO SUPERVISADO","C,DIAGONAL NORTE,0,EXT.,NO SUPERVISADO","C,DIAGONAL NORTE PACE,0,20,NO SUPERVISADO","C,DIAGONAL NORTE PACE,0,21,NO SUPERVISADO","C,DIAGONAL NORTE PACE,0,22,NO SUPERVISADO","C,DIAGONAL NORTE PACE,0,23,NO SUPERVISADO","C,GENERAL SAN MARTIN,0,16,NO SUPERVISADO","C,GENERAL SAN MARTIN,0,17,NO SUPERVISADO","C,GENERAL SAN MARTIN,0,EXT.,NO SUPERVISADO","C,INDEPENDENCIA,0,5,NO SUPERVISADO","C,INDEPENDENCIA,0,6,NO SUPERVISADO","C,LAVALLE,0,14,NO SUPERVISADO","C,LAVALLE,0,15,NO SUPERVISADO","C,LAVALLE,0,EXT.,NO SUPERVISADO","C,LAVALLE,0,HALL,NO SUPERVISADO","C,MARIANO MORENO,0,7,NO SUPERVISADO","C,MARIANO MORENO,0,8,NO SUPERVISADO","C,RETIRO,1,3,NO SUPERVISADO","C,RETIRO,1,1 (EXT),NO SUPERVISADO","C,RETIRO,0,18,NO SUPERVISADO","C,RETIRO,0,19,NO SUPERVISADO","C,SAN JUAN,0,3,NO SUPERVISADO","C,SAN JUAN,0,4,NO SUPERVISADO","D,9 DE JULIO,0,2,NO SUPERVISADO","D,AGÜERO,0,12,NO SUPERVISADO","D,AGÜERO,0,11,NO SUPERVISADO","D,AGÜERO,0,EXT,NO SUPERVISADO","D,BULNES,0,EXT,NO SUPERVISADO","D,CALLAO,1,1,NO SUPERVISADO","D,CALLAO,0,EXT,NO SUPERVISADO","D,CATEDRAL,1,1 EXT,NO SUPERVISADO","D,CATEDRAL,1,2 EXT,NO SUPERVISADO","D,CATEDRAL,0,1,NO SUPERVISADO","D,CONGRESO DE TUCUMÁN,1,2,NO SUPERVISADO","D,CONGRESO DE TUCUMÁN,1,1,NO SUPERVISADO","D,CONGRESO DE TUCUMÁN,0,45,NO SUPERVISADO","D,CONGRESO DE TUCUMÁN,0,44,NO SUPERVISADO","D,CONGRESO DE TUCUMÁN,0,42,NO SUPERVISADO","D,CONGRESO DE TUCUMÁN,0,43,NO SUPERVISADO","D,CONGRESO DE TUCUMÁN,0,46,NO SUPERVISADO","D,CONGRESO DE TUCUMÁN,0,47,NO SUPERVISADO","D,FACULTAD DE MEDICINA,1,2,NO SUPERVISADO","D,FACULTAD DE MEDICINA,1,1,NO SUPERVISADO","D,FACULTAD DE MEDICINA,0,8,NO SUPERVISADO","D,FACULTAD DE MEDICINA,0,7,NO SUPERVISADO","D,FACULTAD DE MEDICINA,0,EXT,NO SUPERVISADO","D,JOSE HERNANDEZ,0,34,NO SUPERVISADO","D,JOSE HERNANDEZ,0,32,NO SUPERVISADO","D,JOSE HERNANDEZ,0,33,NO SUPERVISADO","D,JOSE HERNANDEZ,0,31,NO SUPERVISADO","D,JOSE HERNANDEZ,0,35-EXT,NO SUPERVISADO","D,JURAMENTO,1,2,NO SUPERVISADO","D,JURAMENTO,1,3,NO SUPERVISADO","D,JURAMENTO,1,1,NO SUPERVISADO","D,JURAMENTO,0,36,NO SUPERVISADO","D,JURAMENTO,0,37,NO SUPERVISADO","D,JURAMENTO,0,40,NO SUPERVISADO","D,JURAMENTO,0,38,NO SUPERVISADO","D,JURAMENTO,0,39,NO SUPERVISADO","D,JURAMENTO,0,41,NO SUPERVISADO","D,MINISTRO CARRANZA,0,24,NO SUPERVISADO","D,MINISTRO CARRANZA,0,22,NO SUPERVISADO","D,MINISTRO CARRANZA,0,21,NO SUPERVISADO","D,MINISTRO CARRANZA,0,23,NO SUPERVISADO","D,MINISTRO CARRANZA,0,19,NO SUPERVISADO","D,MINISTRO CARRANZA,0,20,NO SUPERVISADO","D,MINISTRO CARRANZA,0,26,NO SUPERVISADO","D,MINISTRO CARRANZA,0,25,NO SUPERVISADO","D,OLLEROS,0,30,NO SUPERVISADO","D,OLLEROS,0,28,NO SUPERVISADO","D,OLLEROS,0,29,NO SUPERVISADO","D,OLLEROS,0,27,NO SUPERVISADO","D,PALERMO,0,18,NO SUPERVISADO","D,PALERMO,0,17,NO SUPERVISADO","D,PALERMO,0,EXT,NO SUPERVISADO","D,PLAZA ITALIA,0,14,NO SUPERVISADO","D,PLAZA ITALIA,0,16,NO SUPERVISADO","D,PLAZA ITALIA,0,13,NO SUPERVISADO","D,PLAZA ITALIA,0,15,NO SUPERVISADO","D,PLAZA ITALIA,0,EXT,NO SUPERVISADO","D,PUEYRREDÓN,0,9,NO SUPERVISADO","D,PUEYRREDÓN,0,10,NO SUPERVISADO","D,PUEYRREDÓN,0,EXT,NO SUPERVISADO","D,TRIBUNALES,1,1,NO SUPERVISADO","D,TRIBUNALES,0,3,NO SUPERVISADO","D,TRIBUNALES,0,4,NO SUPERVISADO","D,TRIBUNALES,0,6,NO SUPERVISADO","D,TRIBUNALES,0,5,NO SUPERVISADO","D,TRIBUNALES,0,EXT,NO SUPERVISADO","E,AV LA PLATA,0,22,NO SUPERVISADO","E,AV LA PLATA,0,23,NO SUPERVISADO","E,BELGRANO,0,5,NO SUPERVISADO","E,BELGRANO,0,6,NO SUPERVISADO","E,BELGRANO,0,8,NO SUPERVISADO","E,BOEDO,0,21,NO SUPERVISADO","E,BOLIVAR,0,1,NO SUPERVISADO","E,BOLIVAR,0,2,NO SUPERVISADO","E,BOLIVAR,0,3,NO SUPERVISADO","E,BOLIVAR,0,4,NO SUPERVISADO","E,BOLIVAR,0,EXT.,NO SUPERVISADO","E,CATALINAS,1,1,NO SUPERVISADO","E,CATALINAS,1,2,NO SUPERVISADO","E,CATALINAS,0,1,NO SUPERVISADO","E,CATALINAS,0,2,NO SUPERVISADO","E,CATALINAS,0,3,NO SUPERVISADO","E,CATALINAS,0,4,NO SUPERVISADO","E,CATALINAS,0,5,NO SUPERVISADO","E,CATALINAS,0,6,NO SUPERVISADO","E,CORREO CENTRAL,1,1,NO SUPERVISADO","E,CORREO CENTRAL,1,2,NO SUPERVISADO","E,CORREO CENTRAL,1,3,NO SUPERVISADO","E,CORREO CENTRAL,1,4,NO SUPERVISADO","E,CORREO CENTRAL,0,1,NO SUPERVISADO","E,CORREO CENTRAL,0,2,NO SUPERVISADO","E,CORREO CENTRAL,0,3,NO SUPERVISADO","E,CORREO CENTRAL,0,4,NO SUPERVISADO","E,CORREO CENTRAL,0,5,NO SUPERVISADO","E,CORREO CENTRAL,0,6,NO SUPERVISADO","E,CORREO CENTRAL,0,7,NO SUPERVISADO","E,CORREO CENTRAL,0,8,NO SUPERVISADO","E,CORREO CENTRAL,0,9,NO SUPERVISADO","E,ENTRE RIOS,0,13,NO SUPERVISADO","E,ENTRE RIOS,0,14,NO SUPERVISADO","E,INDEPENDENCIA,0,9,NO SUPERVISADO","E,INDEPENDENCIA,0,10,NO SUPERVISADO","E,INDEPENDENCIA,0,EXT.,NO SUPERVISADO","E,JUJUY,0,17,NO SUPERVISADO","E,JUJUY,0,18,NO SUPERVISADO","E,MEDALLA,0,1,NO SUPERVISADO","E,MEDALLA,0,2,NO SUPERVISADO","E,MITRE,0,7,NO SUPERVISADO","E,MORENO,0,24,NO SUPERVISADO","E,MORENO,0,25,NO SUPERVISADO","E,PICHINCHA,0,15,NO SUPERVISADO","E,PICHINCHA,0,16,NO SUPERVISADO","E,RETIRO,1,1,NO SUPERVISADO","E,RETIRO,1,2,NO SUPERVISADO","E,RETIRO,0,1,NO SUPERVISADO","E,RETIRO,0,2,NO SUPERVISADO","E,RETIRO,0,3,NO SUPERVISADO","E,RETIRO,0,4,NO SUPERVISADO","E,RETIRO,0,5,NO SUPERVISADO","E,RETIRO,0,6,NO SUPERVISADO","E,RETIRO,0,7,NO SUPERVISADO","E,RETIRO,0,8,NO SUPERVISADO","E,RETIRO,0,9,NO SUPERVISADO","E,RETIRO,0,10,NO SUPERVISADO","E,SAN JOSE,0,11,NO SUPERVISADO","E,SAN JOSE,0,12,NO SUPERVISADO","E,URQUIZA,0,19,NO SUPERVISADO","E,URQUIZA,0,20,NO SUPERVISADO","E,VARELA,0,26,NO SUPERVISADO","H,CASEROS,1,1,NO SUPERVISADO","H,CASEROS,1,2,NO SUPERVISADO","H,CASEROS,1,3,NO SUPERVISADO","H,CASEROS,0,1,NO SUPERVISADO","H,CASEROS,0,2,NO SUPERVISADO","H,CASEROS,0,3,NO SUPERVISADO","H,CASEROS,0,4,NO SUPERVISADO","H,CÓRDOBA,1,1,NO SUPERVISADO","H,CÓRDOBA,1,2,NO SUPERVISADO","H,CÓRDOBA,1,3,NO SUPERVISADO","H,CÓRDOBA,0,1,NO SUPERVISADO","H,CÓRDOBA,0,2,NO SUPERVISADO","H,CÓRDOBA,0,3,NO SUPERVISADO","H,CÓRDOBA,0,4,NO SUPERVISADO","H,CÓRDOBA,0,5,NO SUPERVISADO","H,CÓRDOBA,0,6,NO SUPERVISADO","H,CORRIENTES,1,1,NO SUPERVISADO","H,CORRIENTES,1,2,NO SUPERVISADO","H,CORRIENTES,1,3,NO SUPERVISADO","H,CORRIENTES,1,4,NO SUPERVISADO","H,CORRIENTES,1,5,NO SUPERVISADO","H,CORRIENTES,1,6,NO SUPERVISADO","H,CORRIENTES,0,1,NO SUPERVISADO","H,CORRIENTES,0,2,NO SUPERVISADO","H,CORRIENTES,0,3,NO SUPERVISADO","H,CORRIENTES,0,4,NO SUPERVISADO","H,CORRIENTES,0,5,NO SUPERVISADO","H,CORRIENTES,0,6,NO SUPERVISADO","H,CORRIENTES,0,7,NO SUPERVISADO","H,CORRIENTES,0,8,NO SUPERVISADO","H,CORRIENTES,0,9,NO SUPERVISADO","H,CORRIENTES,0,10,NO SUPERVISADO","H,FACULTAD DE DERECHO,1,1,NO SUPERVISADO","H,FACULTAD DE DERECHO,1,2,NO SUPERVISADO","H,FACULTAD DE DERECHO,1,3,NO SUPERVISADO","H,FACULTAD DE DERECHO,0,1,NO SUPERVISADO","H,FACULTAD DE DERECHO,0,2,NO SUPERVISADO","H,HOSPITALES,1,1,NO SUPERVISADO","H,HOSPITALES,1,2,NO SUPERVISADO","H,HOSPITALES,1,3,NO SUPERVISADO","H,HOSPITALES,0,1,NO SUPERVISADO","H,HOSPITALES,0,2,NO SUPERVISADO","H,HOSPITALES,0,3,NO SUPERVISADO","H,HUMBERTO 1°,1,1,NO SUPERVISADO","H,HUMBERTO 1°,1,2,NO SUPERVISADO","H,HUMBERTO 1°,1,3,NO SUPERVISADO","H,HUMBERTO 1°,1,4,NO SUPERVISADO","H,HUMBERTO 1°,0,1,NO SUPERVISADO","H,HUMBERTO 1°,0,2,NO SUPERVISADO","H,HUMBERTO 1°,0,3,NO SUPERVISADO","H,HUMBERTO 1°,0,4,NO SUPERVISADO","H,HUMBERTO 1°,0,5,NO SUPERVISADO","H,INCLÁN,1,1,NO SUPERVISADO","H,INCLÁN,1,2,NO SUPERVISADO","H,INCLÁN,1,3,NO SUPERVISADO","H,INCLÁN,0,1,NO SUPERVISADO","H,INCLÁN,0,2,NO SUPERVISADO","H,INCLÁN,0,3,NO SUPERVISADO","H,INCLÁN,0,4,NO SUPERVISADO","H,LAS HERAS,1,1,NO SUPERVISADO","H,LAS HERAS,1,2,NO SUPERVISADO","H,LAS HERAS,1,3,NO SUPERVISADO","H,LAS HERAS,1,4,NO SUPERVISADO","H,LAS HERAS,0,1,NO SUPERVISADO","H,LAS HERAS,0,2,NO SUPERVISADO","H,LAS HERAS,0,3,NO SUPERVISADO","H,LAS HERAS,0,4,NO SUPERVISADO","H,LAS HERAS,0,5,NO SUPERVISADO","H,LAS HERAS,0,6,NO SUPERVISADO","H,ONCE,1,1,NO SUPERVISADO","H,ONCE,1,2,NO SUPERVISADO","H,ONCE,1,3,NO SUPERVISADO","H,ONCE,0,1,NO SUPERVISADO","H,ONCE,0,2,NO SUPERVISADO","H,ONCE,0,3,NO SUPERVISADO","H,ONCE,0,4,NO SUPERVISADO","H,ONCE,0,5,NO SUPERVISADO","H,ONCE,0,6,NO SUPERVISADO","H,ONCE,0,7,NO SUPERVISADO","H,ONCE,0,8,NO SUPERVISADO","H,ONCE,0,9,NO SUPERVISADO","H,ONCE,0,10,NO SUPERVISADO","H,PARQUE PATRICIOS,1,1,NO SUPERVISADO","H,PARQUE PATRICIOS,1,2,NO SUPERVISADO","H,PARQUE PATRICIOS,1,3,NO SUPERVISADO","H,PARQUE PATRICIOS,0,1,NO SUPERVISADO","H,PARQUE PATRICIOS,0,2,NO SUPERVISADO","H,PARQUE PATRICIOS,0,3,NO SUPERVISADO","H,PARQUE PATRICIOS,0,4,NO SUPERVISADO","H,SANTA FE,1,5,NO SUPERVISADO","H,SANTA FE,1,7,NO SUPERVISADO","H,SANTA FE,1,6,NO SUPERVISADO","H,SANTA FE,1,4,NO SUPERVISADO","H,SANTA FE,1,2,NO SUPERVISADO","H,SANTA FE,1,3,NO SUPERVISADO","H,SANTA FE,1,1,NO SUPERVISADO","H,SANTA FE,0,1,NO SUPERVISADO","H,SANTA FE,0,2,NO SUPERVISADO","H,SANTA FE,0,3,NO SUPERVISADO","H,SANTA FE,0,4,NO SUPERVISADO","H,SANTA FE,0,5,NO SUPERVISADO","H,SANTA FE,0,6,NO SUPERVISADO","H,SANTA FE,0,7,NO SUPERVISADO","H,SANTA FE,0,8,NO SUPERVISADO","H,SANTA FE,0,9,NO SUPERVISADO","H,VENEZUELA,1,1,NO SUPERVISADO","H,VENEZUELA,1,2,NO SUPERVISADO","H,VENEZUELA,1,3,NO SUPERVISADO","H,VENEZUELA,0,1,NO SUPERVISADO","H,VENEZUELA,0,2,NO SUPERVISADO","H,VENEZUELA,0,3,NO SUPERVISADO","H,VENEZUELA,0,4,NO SUPERVISADO"];
let SpoofJSONtxt=["A,FLORES,1,3,FALLA","A,FLORES,0,1,OK","A,SAN PEDRITO,1,2 (SUR),OK","A,SAN PEDRITO,0,2,FALLA","A,SAN PEDRITO,0,3,OK"];